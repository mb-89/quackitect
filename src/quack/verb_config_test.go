// The config verb in Go: every key with its value and layer, one key alone,
// the refusal of a key no layer answers, and a write to the local layer.
// [[spec/tickets/config-verbs-port-to-go]]
package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
)

// A root holding the tree's wiring, so the catalog declares every key, and the tracked file the case names. [[spec/tickets/config-verbs-port-to-go]]
func configRoot(t *testing.T, tracked string) string {
	t.Helper()
	wiring, err := os.ReadFile(filepath.Join("..", "..", "spec", "wiring.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	seedFile(t, root, "spec/wiring.yaml", string(wiring))
	seedFile(t, root, "spec/config/level0.json", tracked)
	return root
}

// The verb over the root at a fixed clock, and what it writes to each stream. [[spec/tickets/config-verbs-port-to-go]]
func configRan(root string, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	at := func() time.Time { return time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC) }
	code := configVerb(func() (string, error) { return root, nil }, at)(append([]string{"config"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestConfigPrintsEveryRowAndItsLayer(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{"log": {"level": "warn"}}`)
	code, out, errs := configRan(root)
	if code != 0 || errs != "" {
		t.Fatalf("config answers %d and %q, and wants 0 and no error", code, errs)
	}
	for _, row := range []string{
		"log.level              warn      spec/config/level0.json\n",
		"answer.words           150       built-in\n",
		"stop.enabled           true      built-in\n",
	} {
		if !strings.Contains(out, row) {
			t.Fatalf("config prints no row %q in:\n%s", row, out)
		}
	}
	if !strings.HasSuffix(out, "\n\nWrite one: ./RUNME.sh config <key> <value>, which lands in .se/.runtime/config.json.\n") {
		t.Fatalf("config ends on no write line:\n%s", out)
	}
}

func TestConfigPrintsOneKeyAlone(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{}`)
	seedFile(t, root, ".se/.runtime/config.json", `{"log": {"level": "debug"}}`)
	code, out, _ := configRan(root, "log.level")
	if code != 0 || out != "log.level              debug     .se/.runtime/config.json\n" {
		t.Fatalf("config log.level answers %d and %q, and wants the local row alone", code, out)
	}
}

func TestConfigRefusesAKeyNoLayerAnswers(t *testing.T) {
	t.Parallel()
	code, out, errs := configRan(configRoot(t, `{}`), "no.such")
	if code != exitUsage || out != "" || errs != "No layer answers no.such. Run ./RUNME.sh config to see every key.\n" {
		t.Fatalf("config no.such answers %d, %q and %q, and wants the refusal", code, out, errs)
	}
}

func TestConfigNamesAKeyCarryingTheWrongType(t *testing.T) {
	t.Parallel()
	_, _, errs := configRan(configRoot(t, `{"answer": {"words": "many"}}`))
	if errs != "answer.words carries a string, and the schema says number, and the code reading it finds nothing.\n" {
		t.Fatalf("config names %q, and wants the type fault", errs)
	}
}

func TestCoercedTypesATextAsTheCatalogSays(t *testing.T) {
	t.Parallel()
	for _, row := range []struct{ said, kind, want string }{
		{"5", "number", `5`},
		{"5", "string", `"5"`},
		{"true", "boolean", `true`},
		{"false", "boolean", `false`},
		{"haiku", "number", `"haiku"`},
		{"5", "", `"5"`},
	} {
		if got := coerced(row.said, row.kind); got != row.want {
			t.Errorf("coerced(%q, %q) answers %s, and wants %s", row.said, row.kind, got, row.want)
		}
	}
}

func TestConfigWritesAKeyTheCatalogLeavesOutAsItsText(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{}`)
	if code, out, _ := configRan(root, "later.key", "4"); code != 0 || out != "later.key is \"4\" in .se/.runtime/config.json.\n" {
		t.Fatalf("config later.key 4 answers %d and %q, and wants the text quoted", code, out)
	}
	wrote, err := os.ReadFile(filepath.Join(root, ".se", ".runtime", "config.json"))
	if err != nil || string(wrote) != "{\n  \"later\": {\n    \"key\": \"4\"\n  }\n}\n" {
		t.Fatalf("the local layer reads %q and %v, and wants later.key as the text 4", wrote, err)
	}
	if code, out, _ := configRan(root, "later.key"); code != 0 || out != "later.key              4         .se/.runtime/config.json\n" {
		t.Fatalf("config later.key answers %d and %q, and wants the local row", code, out)
	}
}

func TestTheShippedConfigCarriesNoTypeFaultAndNoJudge(t *testing.T) {
	t.Parallel()
	faults, err := configFaults(treeRoot)
	if err != nil || len(faults) > 0 {
		t.Fatalf("the shipped config names %v and %v, and wants no fault", faults, err)
	}
	for _, path := range []string{"spec/config/level0.json", "spec/config/level0.schema.json"} {
		file := orderedAt(filepath.Join(treeRoot, filepath.FromSlash(path)))
		if _, ok := memberAt(file, []string{"judge"}); ok {
			t.Errorf("%s names a judge section, and the engine holds no model call", path)
		}
		if _, ok := memberAt(file, []string{"properties", "judge"}); ok {
			t.Errorf("%s declares a judge key, and the engine holds no model call", path)
		}
	}
}

func TestEveryShippedKeyNamesAVariableOfItsOwn(t *testing.T) {
	t.Parallel()
	declared, err := declaredAt(treeRoot)
	if err != nil || len(declared) == 0 {
		t.Fatalf("the shipped wiring declares %d keys and answers %v", len(declared), err)
	}
	for dotted, want := range map[string]string{
		"stop.mostInARow":       "SE_STOP_MOST_IN_A_ROW",
		"plan.everyCalls":       "SE_PLAN_EVERY_CALLS",
		"ops.keepFailed":        "SE_OPS_KEEP_FAILED",
		"watchdog.backoffFirst": "SE_WATCHDOG_BACKOFF_FIRST",
	} {
		if _, held := declared[dotted]; !held {
			t.Errorf("the shipped wiring declares no %s", dotted)
		}
		if name := q.EnvOf(dotted); name != want {
			t.Errorf("%s names %s, and wants %s", dotted, name, want)
		}
	}
	owner := map[string]string{}
	for dotted := range declared {
		name := q.EnvOf(dotted)
		if other, held := owner[name]; held {
			t.Errorf("%s and %s both name %s", other, dotted, name)
		}
		owner[name] = dotted
	}
}

func TestConfigWritesTheLocalLayerAndALogRow(t *testing.T) {
	t.Parallel()
	root := configRoot(t, `{}`)
	seedFile(t, root, ".se/.runtime/config.json", "{\n  \"log\": {\n    \"level\": \"debug\"\n  }\n}\n")
	code, out, _ := configRan(root, "answer.words", "200")
	if code != 0 || out != "answer.words is 200 in .se/.runtime/config.json.\n" {
		t.Fatalf("config answer.words 200 answers %d and %q", code, out)
	}
	if _, out, _ = configRan(root, "ask.wanted", "full"); out != "ask.wanted is \"full\" in .se/.runtime/config.json.\n" {
		t.Fatalf("config ask.wanted full answers %q, and wants the string quoted", out)
	}
	if _, out, _ = configRan(root, "stop.enabled", "false"); out != "stop.enabled is false in .se/.runtime/config.json.\n" {
		t.Fatalf("config stop.enabled false answers %q, and wants a boolean", out)
	}
	wrote, _ := os.ReadFile(filepath.Join(root, ".se", ".runtime", "config.json"))
	want := "{\n  \"log\": {\n    \"level\": \"debug\"\n  },\n  \"answer\": {\n    \"words\": 200\n  },\n  \"ask\": {\n    \"wanted\": \"full\"\n  },\n  \"stop\": {\n    \"enabled\": false\n  }\n}\n"
	if string(wrote) != want {
		t.Fatalf("the local layer reads\n%s\nand wants\n%s", wrote, want)
	}
	logged, _ := os.ReadFile(filepath.Join(root, filepath.FromSlash(sessionLog)))
	first := strings.SplitN(string(logged), "\n", 2)[0]
	if first != `{"at":"2026-01-02T03:04:05.000Z","detail":".se/.runtime/config.json","kind":"config","level":"info","said":"answer.words is 200"}` {
		t.Fatalf("the log's first row reads %s", first)
	}
}

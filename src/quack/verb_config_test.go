// The config verb in Go: every key with its value and layer, one key alone,
// the refusal of a key no layer answers, and a write to the local layer.
// [[spec/tickets/config-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
)

// The wiring of the instances whose keys the config cases read. [[spec/tickets/test-walks-move-onto-fakes]]
const hq3Wiring = "instances:\n  log:\n    module: log\n  answer:\n    module: answer\n  ask:\n    module: ask\n  stop:\n    module: stop\nwires:\n  log.session: files/.se/.log/session.jsonl\n"

// The root on the box's own disk holding the tree's wiring and the tracked file the case names, for a verb reading the config past its door. [[spec/tickets/config-verbs-port-to-go]]
func configRoot(t *testing.T, tracked string) string {
	t.Helper()
	wiring, err := realDisk().read(filepath.Join("..", "..", "spec", "wiring.yaml"))
	if err != nil {
		t.Fatal(err)
	}
	root := t.TempDir()
	seedFile(t, root, "spec/wiring.yaml", string(wiring))
	seedFile(t, root, "spec/config/level0.json", tracked)
	return root
}

// A fake disk holding the wiring and the tracked file the case names under /tree. [[spec/tickets/test-walks-move-onto-fakes]]
func hq3ConfigDisk(t *testing.T, tracked string) diskDoors {
	t.Helper()
	disk := newFakeDisk()
	hq1SeedDisk(t, disk, "/tree", map[string]string{"spec/wiring.yaml": hq3Wiring, "spec/config/level0.json": tracked})
	return disk
}

// The verb over the fake disk at a fixed clock, and what it writes to each stream. [[spec/tickets/config-verbs-port-to-go]]
func configRan(disk diskDoors, argv ...string) (int, string, string) {
	var out, errs strings.Builder
	at := func() time.Time { return time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC) }
	code := configVerb(func() (string, error) { return "/tree", nil }, at, disk)(append([]string{"config"}, argv...), false, &out, &errs)
	return code, out.String(), errs.String()
}

func TestConfigPrintsEveryRowAndItsLayer(t *testing.T) {
	t.Parallel()
	code, out, errs := configRan(hq3ConfigDisk(t, `{"log": {"level": "warn"}}`))
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
	if !strings.HasSuffix(out, "\n\nWrite one: ./RUNME.sh config <key> <value>, which lands in .se/.runtime/config.json, or add --tracked to land it in spec/config/level0.json.\n") {
		t.Fatalf("config ends on no write line:\n%s", out)
	}
}

// A write naming --tracked lands in the tracked file, and the local layer stays unwritten. [[spec/tickets/verbs-mint-tickets-and-keys]]
func TestConfigWritesTheTrackedLayerWithTracked(t *testing.T) {
	t.Parallel()
	disk := hq3ConfigDisk(t, `{"log": {"level": "warn"}}`)
	code, out, errs := configRan(disk, "log.level", "debug", "--tracked")
	text := disk.text("/tree/spec/config/level0.json")
	var tracked map[string]map[string]any
	if err := json.Unmarshal([]byte(text), &tracked); err != nil {
		t.Fatal(err)
	}
	local := disk.stands("/tree/.se/.runtime/config.json")
	if code != 0 || errs != "" || tracked["log"]["level"] != "debug" || local || !strings.Contains(out, "spec/config/level0.json") {
		t.Fatalf("config --tracked answers %d, %q, %q, and the tracked file reads %s", code, out, errs, text)
	}
}

func TestConfigPrintsOneKeyAlone(t *testing.T) {
	t.Parallel()
	disk := hq3ConfigDisk(t, `{}`)
	hq1SeedDisk(t, disk, "/tree", map[string]string{".se/.runtime/config.json": `{"log": {"level": "debug"}}`})
	code, out, _ := configRan(disk, "log.level")
	if code != 0 || out != "log.level              debug     .se/.runtime/config.json\n" {
		t.Fatalf("config log.level answers %d and %q, and wants the local row alone", code, out)
	}
}

func TestConfigRefusesAKeyNoLayerAnswers(t *testing.T) {
	t.Parallel()
	code, out, errs := configRan(hq3ConfigDisk(t, `{}`), "no.such")
	if code != exitUsage || out != "" || errs != "No layer answers no.such. Run ./RUNME.sh config to see every key.\n" {
		t.Fatalf("config no.such answers %d, %q and %q, and wants the refusal", code, out, errs)
	}
}

func TestConfigNamesAKeyCarryingTheWrongType(t *testing.T) {
	t.Parallel()
	_, _, errs := configRan(hq3ConfigDisk(t, `{"answer": {"words": "many"}}`))
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
	disk := hq3ConfigDisk(t, `{}`)
	if code, out, _ := configRan(disk, "later.key", "4"); code != 0 || out != "later.key is \"4\" in .se/.runtime/config.json.\n" {
		t.Fatalf("config later.key 4 answers %d and %q, and wants the text quoted", code, out)
	}
	if wrote := disk.text("/tree/.se/.runtime/config.json"); wrote != "{\n  \"later\": {\n    \"key\": \"4\"\n  }\n}\n" {
		t.Fatalf("the local layer reads %q, and wants later.key as the text 4", wrote)
	}
	if code, out, _ := configRan(disk, "later.key"); code != 0 || out != "later.key              4         .se/.runtime/config.json\n" {
		t.Fatalf("config later.key answers %d and %q, and wants the local row", code, out)
	}
}

func TestTheShippedConfigCarriesNoTypeFaultAndNoJudge(t *testing.T) {
	t.Parallel()
	faults, err := configFaults(realDisk(), treeRoot)
	if err != nil || len(faults) > 0 {
		t.Fatalf("the shipped config names %v and %v, and wants no fault", faults, err)
	}
	for _, path := range []string{"spec/config/level0.json", "spec/config/level0.schema.json"} {
		file := orderedAt(realDisk(), filepath.Join(treeRoot, filepath.FromSlash(path)))
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
	declared, err := declaredAt(realDisk(), treeRoot)
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
	disk := hq3ConfigDisk(t, `{}`)
	hq1SeedDisk(t, disk, "/tree", map[string]string{".se/.runtime/config.json": "{\n  \"log\": {\n    \"level\": \"debug\"\n  }\n}\n"})
	code, out, _ := configRan(disk, "answer.words", "200")
	if code != 0 || out != "answer.words is 200 in .se/.runtime/config.json.\n" {
		t.Fatalf("config answer.words 200 answers %d and %q", code, out)
	}
	if _, out, _ = configRan(disk, "ask.wanted", "full"); out != "ask.wanted is \"full\" in .se/.runtime/config.json.\n" {
		t.Fatalf("config ask.wanted full answers %q, and wants the string quoted", out)
	}
	if _, out, _ = configRan(disk, "stop.enabled", "false"); out != "stop.enabled is false in .se/.runtime/config.json.\n" {
		t.Fatalf("config stop.enabled false answers %q, and wants a boolean", out)
	}
	wrote := disk.text("/tree/.se/.runtime/config.json")
	want := "{\n  \"log\": {\n    \"level\": \"debug\"\n  },\n  \"answer\": {\n    \"words\": 200\n  },\n  \"ask\": {\n    \"wanted\": \"full\"\n  },\n  \"stop\": {\n    \"enabled\": false\n  }\n}\n"
	if wrote != want {
		t.Fatalf("the local layer reads\n%s\nand wants\n%s", wrote, want)
	}
	logged := disk.text(filepath.Join("/tree", filepath.FromSlash(sessionLog)))
	first := strings.SplitN(logged, "\n", 2)[0]
	if first != `{"at":"2026-01-02T03:04:05.000Z","detail":".se/.runtime/config.json","kind":"config","level":"info","said":"answer.words is 200"}` {
		t.Fatalf("the log's first row reads %s", first)
	}
}

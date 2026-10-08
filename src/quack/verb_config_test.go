// The config verb in Go: every key with its value and layer, one key alone,
// the refusal of a key no layer answers, and a write to the local layer.
// [[spec/tickets/config-verbs-port-to-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"encoding/json"
	"os" // level0: OutsideInDoors - the case reads the schema and default config the tree holds, as a build check reads source
	"path/filepath"
	"reflect"
	"strings"
	"testing"
	"time"

	oldconfig "quackitect/src/config"
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

// Config refuses a key no layer answers, and names a key carrying the wrong type. [[spec/tickets/config-verbs-port-to-go]]
func TestConfigRefusesAKeyNoLayerAnswers(t *testing.T) {
	t.Parallel()
	code, out, errs := configRan(hq3ConfigDisk(t, `{}`), "no.such")
	if code != exitUsage || out != "" || errs != "No layer answers no.such. Run ./RUNME.sh config to see every key.\n" {
		t.Fatalf("config no.such answers %d, %q and %q, and wants the refusal", code, out, errs)
	}
	if _, _, errs = configRan(hq3ConfigDisk(t, `{"answer": {"words": "many"}}`)); errs != "answer.words carries a string, and the schema says number, and the code reading it finds nothing.\n" {
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

func TestConfigRowsReadEveryLayer(t *testing.T) {
	t.Parallel()
	tracked := []byte(`{"comment": "c", "a": {"comment": "c", "x": 1, "y": {"z": true}}, "m": {"s": "old"}}`)
	local := []byte(`{"a": {"x": 2}, "m": {"s": "new"}}`)
	env := map[string]string{"SE_A_X": "3"}
	declared := sharedOf("m.s")
	declared["d.most-in-a-row"] = q.Key{Name: "d/config/most-in-a-row", Instance: "d", Local: "most-in-a-row", Default: `5`}
	rows, err := configRows(tracked, local, env, declared)
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]configRow{
		"a.x":             {Value: json.RawMessage(`3`), Layer: "SE_A_X"},
		"a.y.z":           {Value: json.RawMessage(`true`), Layer: oldconfig.Tracked},
		"m.s":             {Value: json.RawMessage(`"old"`), Layer: oldconfig.Tracked},
		"d.most-in-a-row": {Value: json.RawMessage(`5`), Layer: oldconfig.BuiltIn},
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %v, and want %v", rows, want)
	}
}

func TestConfigRowsReadALocalFileHoldingNoJSONAsEmpty(t *testing.T) {
	t.Parallel()
	tracked := []byte(`{"stop": {"enabled": true}, "log": {"level": "info"}}`)
	rows, err := configRows(tracked, []byte("{ this is no json"), map[string]string{"SE_LOG_LEVEL": "warn"}, map[string]q.Key{})
	if err != nil {
		t.Fatalf("the rows answer %v, and want the local file read as empty", err)
	}
	want := map[string]configRow{
		"stop.enabled": {Value: json.RawMessage(`true`), Layer: oldconfig.Tracked},
		"log.level":    {Value: json.RawMessage(`"warn"`), Layer: "SE_LOG_LEVEL"},
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %v, and want %v", rows, want)
	}
}

func TestConfigTextHoldsOneKeyALine(t *testing.T) {
	t.Parallel()
	text, err := configText(map[string]configRow{
		"b.y": {Value: json.RawMessage(`"t"`), Layer: "L"},
		"a.x": {Value: json.RawMessage(`1`), Layer: "T"},
	})
	if err != nil {
		t.Fatal(err)
	}
	want := "{\n  \"a.x\": {\"value\":1,\"layer\":\"T\"},\n  \"b.y\": {\"value\":\"t\",\"layer\":\"L\"}\n}\n"
	if string(text) != want {
		t.Fatalf("the text reads %q, and wants %q", text, want)
	}
	var back map[string]configRow
	if err := json.Unmarshal(text, &back); err != nil || len(back) != 2 {
		t.Fatalf("the text reads back as %v, %v", back, err)
	}
}

// Shared keys by their dotted names, with no built-in, as a case declares them. [[spec/tickets/the-config-schema-gets-generated]]
func sharedOf(dotted ...string) map[string]q.Key {
	out := map[string]q.Key{}
	for _, one := range dotted {
		key := keyOfDotted(one)
		key.Shared = true
		out[one] = key
	}
	return out
}

func TestSchemaStandsAsGenerated(t *testing.T) {
	t.Parallel()
	want, err := schemaText(realDisk(), treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	held, err := os.ReadFile(filepath.Join(treeRoot, schemaAt))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Equal(held, want) {
		t.Fatalf("%s stands apart from the declarations, so run go run ./src/quack schema --write", schemaAt)
	}
}

func TestDefaultFileHoldsNoBuiltIn(t *testing.T) {
	t.Parallel()
	keys := declared(t)
	for dotted, literal := range trackedLeaves(t) {
		key, ok := keys[dotted]
		if !ok {
			continue
		}
		if key.Default == "" {
			t.Errorf("%s stands declared with no built-in to weigh", dotted)
			continue
		}
		if literal == normalised(t, key.Default) {
			t.Errorf("%s holds %s at its built-in value %s", oldconfig.Tracked, dotted, literal)
		}
	}
}

func TestEveryTrackedKeyIsDeclared(t *testing.T) {
	t.Parallel()
	keys := declared(t)
	for dotted := range trackedLeaves(t) {
		if _, ok := keys[dotted]; !ok {
			t.Errorf("%s holds %s, and no module declares it", oldconfig.Tracked, dotted)
		}
	}
}

// The sections the drawing names stand first, in its order, so the sidebar meets its groups as it drew them. [[spec/tickets/the-config-schema-gets-generated]]
func TestDrawnSectionsStandFirst(t *testing.T) {
	t.Parallel()
	text, err := schemaText(realDisk(), treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	schema, err := q.JSON.Parse(text)
	if err != nil {
		t.Fatal(err)
	}
	sections := schema.Fields[len(schema.Fields)-1].Keys
	want := []string{"stop", "ask", "bridge", "log", "work", "engine", "answer"}
	for i, name := range want {
		if i >= len(sections) || sections[i] != name {
			t.Fatalf("the sections read %v, and want %v first", sections, want)
		}
	}
}

// Every key the tree declares, by its dotted name. [[spec/tickets/the-config-schema-gets-generated]]
func declared(t *testing.T) map[string]q.Key {
	t.Helper()
	c, err := catalogOf(realDisk(), treeRoot)
	if err != nil {
		t.Fatal(err)
	}
	out := map[string]q.Key{}
	for _, key := range c.Keys() {
		out[dottedOf(key)] = key
	}
	return out
}

// Every leaf the default file holds past its comments, by its dotted name, as a JSON literal. [[spec/tickets/the-config-schema-gets-generated]]
func trackedLeaves(t *testing.T) map[string]string {
	t.Helper()
	text, err := os.ReadFile(filepath.Join(treeRoot, oldconfig.Tracked))
	if err != nil {
		t.Fatal(err)
	}
	var said map[string]any
	if err := json.Unmarshal(text, &said); err != nil {
		t.Fatal(err)
	}
	out := map[string]string{}
	leavesInto(t, said, "", out)
	return out
}

func leavesInto(t *testing.T, said map[string]any, at string, out map[string]string) {
	for name, value := range said {
		if name == explained {
			continue
		}
		under := name
		if at != "" {
			under = at + "." + name
		}
		if inner, ok := value.(map[string]any); ok {
			leavesInto(t, inner, under, out)
			continue
		}
		literal, err := json.Marshal(value)
		if err != nil {
			t.Fatal(err)
		}
		out[under] = string(literal)
	}
}

// A literal written again the way encoding/json writes it, so two spellings of one value compare equal. [[spec/tickets/the-config-schema-gets-generated]]
func normalised(t *testing.T, literal string) string {
	t.Helper()
	var value any
	if json.Unmarshal([]byte(literal), &value) != nil {
		return ""
	}
	out, err := json.Marshal(value)
	if err != nil {
		t.Fatal(err)
	}
	return string(out)
}

// The schema verb's write form holds the program, the verb and the flag, the count main weighs it by. [[spec/design_output/config#the-magic-numbers-take-names]]
func TestTheSchemaWriteFormHoldsItsArgs(t *testing.T) {
	t.Parallel()
	if said := len([]string{"quack", "schema", "--write"}); said != schemaArgs {
		t.Fatalf("the write form holds %d arguments, and main weighs %d", said, schemaArgs)
	}
}

// A shared key carries the mark a reader past the catalog reads, and a key of one box carries none. [[spec/design_output/config#the-go-reader]]
func TestASharedKeyCarriesItsMark(t *testing.T) {
	t.Parallel()
	shared, _ := q.JSON.Serialize(keyEntry(q.Key{Type: "string", Default: `"new"`, Shared: true}))
	if !strings.Contains(string(shared), `"shared": true`) {
		t.Fatalf("a shared key's entry reads %s, with no shared mark", shared)
	}
	local, _ := q.JSON.Serialize(keyEntry(q.Key{Type: "number", Default: "3"}))
	if strings.Contains(string(local), "shared") {
		t.Fatalf("a key of one box reads %s, with a shared mark", local)
	}
}

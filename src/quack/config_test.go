// quack config resolves every key off the config module, and the golden file
// holds what each config reader answers over one fixture: the default file as
// it stood, a local file and a few variables. The Go readers write and compare
// their sections here, and test/level0/config-golden.js the JavaScript ones.
// [[spec/tickets/cfg-topic-holds-one-resolver]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	oldconfig "quackitect/src/config"
)

// The golden file and its fixture, beside the case that reads them. [[spec/tickets/cfg-topic-holds-one-resolver]]
const (
	readersGoldenAt  = "testdata/readers.golden.json"
	readersTracked   = "testdata/readers.tracked.json"
	readersLocal     = "testdata/readers.local.json"
	readersEnv       = "testdata/readers.env.json"
	goReaderOld      = "src/config Where"
	goReaderModule   = "src/modules/config Layered"
	readersSectionOf = "readers"
)

func TestConfigRowsReadEveryLayer(t *testing.T) {
	tracked := []byte(`{"comment": "c", "a": {"comment": "c", "x": 1, "y": {"z": true}}, "m": {"s": "old"}}`)
	local := []byte(`{"a": {"x": 2}, "m": {"s": "new"}}`)
	env := map[string]string{"SE_A_X": "3"}
	rows, err := configRows(tracked, local, env, map[string]bool{"m.s": true})
	if err != nil {
		t.Fatal(err)
	}
	want := map[string]configRow{
		"a.x":   {Value: json.RawMessage(`3`), Layer: "SE_A_X"},
		"a.y.z": {Value: json.RawMessage(`true`), Layer: oldconfig.Tracked},
		"m.s":   {Value: json.RawMessage(`"old"`), Layer: oldconfig.Tracked},
	}
	if !reflect.DeepEqual(rows, want) {
		t.Fatalf("the rows read %v, and want %v", rows, want)
	}
}

func TestConfigTextHoldsOneKeyALine(t *testing.T) {
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

// The wiring this tree loads declares the slice keys shared, so the default file alone answers them. [[spec/tickets/cfg-topic-holds-one-resolver]]
func TestTheSliceKeysStandShared(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", "spec", "wiring.yaml"))
	if err != nil {
		t.Skip("no wiring file stands here")
	}
	shared, err := sharedKeys(string(text))
	if err != nil {
		t.Fatal(err)
	}
	for _, key := range []string{"migration.opentasks", "migration.config"} {
		if !shared[key] {
			t.Fatalf("%s stands unshared in %v", key, shared)
		}
	}
}

// One reader's answer for a key: its value and the layer naming where it comes from. [[spec/tickets/cfg-topic-holds-one-resolver]]
type readerRow struct {
	Value any    `json:"value"`
	Layer string `json:"layer"`
}

// A root holding the fixture's two files, with its variables set for the case. [[spec/tickets/cfg-topic-holds-one-resolver]]
func readersRoot(t *testing.T) (string, []byte, []byte, map[string]string) {
	t.Helper()
	tracked, err := os.ReadFile(readersTracked)
	if err != nil {
		t.Fatal(err)
	}
	local, err := os.ReadFile(readersLocal)
	if err != nil {
		t.Fatal(err)
	}
	var env map[string]string
	body, err := os.ReadFile(readersEnv)
	if err != nil || json.Unmarshal(body, &env) != nil {
		t.Fatalf("the fixture's variables read as no JSON: %v", err)
	}
	root := t.TempDir()
	for path, body := range map[string][]byte{oldconfig.Tracked: tracked, oldconfig.Local: local} {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, body, 0o644); err != nil {
			t.Fatal(err)
		}
	}
	for _, one := range os.Environ() {
		if name, _, ok := strings.Cut(one, "="); ok && strings.HasPrefix(name, "SE_") {
			t.Setenv(name, "")
		}
	}
	for name, value := range env {
		t.Setenv(name, value)
	}
	return root, tracked, local, env
}

// The Go readers' sections: the old reader and the config module, each over every key the fixture holds. [[spec/tickets/cfg-topic-holds-one-resolver]]
func goReaders(t *testing.T) map[string]map[string]readerRow {
	root, tracked, local, env := readersRoot(t)
	shared := map[string]bool{"migration.opentasks": true, "migration.config": true, "migration.log": true, "migration.guidance": true, "migration.check": true, "migration.prose": true}
	rows, err := configRows(tracked, local, env, shared)
	if err != nil {
		t.Fatal(err)
	}
	module := map[string]readerRow{}
	old := map[string]readerRow{}
	for key, row := range rows {
		var value any
		if err := json.Unmarshal(row.Value, &value); err != nil {
			t.Fatal(err)
		}
		module[key] = readerRow{Value: value, Layer: row.Layer}
		if said, layer, held := oldconfig.Where(root, key); held {
			old[key] = readerRow{Value: said, Layer: layer}
		}
	}
	return map[string]map[string]readerRow{goReaderOld: old, goReaderModule: module}
}

// The golden file as JSON, every reader a section. [[spec/tickets/cfg-topic-holds-one-resolver]]
func readGolden(t *testing.T) map[string]map[string]map[string]readerRow {
	t.Helper()
	out := map[string]map[string]map[string]readerRow{readersSectionOf: {}}
	body, err := os.ReadFile(readersGoldenAt)
	if err != nil {
		return out
	}
	if err := json.Unmarshal(body, &out); err != nil {
		t.Fatalf("the golden file reads as no JSON: %v", err)
	}
	if out[readersSectionOf] == nil {
		out[readersSectionOf] = map[string]map[string]readerRow{}
	}
	return out
}

func TestReadersGolden(t *testing.T) {
	said := goReaders(t)
	golden := readGolden(t)
	if *update {
		for name, rows := range said {
			golden[readersSectionOf][name] = rows
		}
		var body bytes.Buffer
		encoder := json.NewEncoder(&body)
		encoder.SetEscapeHTML(false)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(golden); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(readersGoldenAt, body.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
		return
	}
	for name, rows := range said {
		want, held := golden[readersSectionOf][name]
		if !held {
			t.Fatalf("the golden file holds no section for %s: run go test ./src/quack -run TestReadersGolden -update", name)
		}
		if !reflect.DeepEqual(rows, want) {
			for key, row := range rows {
				if !reflect.DeepEqual(row, want[key]) {
					t.Errorf("%s answers %s as %v, and the golden file holds %v", name, key, row, want[key])
				}
			}
			t.Fatalf("%s answers apart from the golden file: run go test ./src/quack -run TestReadersGolden -update, and read the difference at the merge", name)
		}
	}
}

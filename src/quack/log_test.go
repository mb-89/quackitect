// The log golden file holds the rows each reader reads off one fixture
// session log. The Go tests own the module's section here and ParseRecord's
// in src/tui/log, and test/level0/log-golden.js writes the JavaScript ones.
// [[spec/tickets/the-log-topic-lands]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"reflect"
	"testing"
)

// The golden file, its fixture, and the module's section. [[spec/tickets/the-log-topic-lands]]
const (
	logGoldenAt  = "testdata/log.golden.json"
	logFixtureAt = "testdata/session.jsonl"
	logModule    = "src/modules/log"
)

func TestLogGoldenHoldsTheModule(t *testing.T) {
	fixture, err := os.ReadFile(logFixtureAt)
	if err != nil {
		t.Fatal(err)
	}
	rows := logRows(string(fixture))
	if len(rows) == 0 {
		t.Fatal("the module reads no row off the fixture")
	}
	said, err := json.Marshal(rows)
	if err != nil {
		t.Fatal(err)
	}
	golden := map[string]json.RawMessage{}
	if body, err := os.ReadFile(logGoldenAt); err == nil {
		if err := json.Unmarshal(body, &golden); err != nil {
			t.Fatalf("the golden file reads as no JSON: %v", err)
		}
	}
	if *update {
		golden[logModule] = said
		var body bytes.Buffer
		encoder := json.NewEncoder(&body)
		encoder.SetEscapeHTML(false)
		encoder.SetIndent("", "  ")
		if err := encoder.Encode(golden); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(logGoldenAt, body.Bytes(), 0o644); err != nil {
			t.Fatal(err)
		}
		return
	}
	want, held := golden[logModule]
	if !held {
		t.Fatalf("the golden file holds no section for %s: run go test ./src/quack -run TestLogGolden -update", logModule)
	}
	var got, wanted any
	_ = json.Unmarshal(said, &got)
	_ = json.Unmarshal(want, &wanted)
	if !reflect.DeepEqual(got, wanted) {
		t.Fatalf("%s reads apart from the golden file: run go test ./src/quack -run TestLogGolden -update, and read the difference at the merge", logModule)
	}
}

// The log verb takes an array alone, so a log holding no row answers an empty one. [[spec/tickets/log-shadow-reads-unfiltered-rows]]
func TestLogAnswersAnEmptyArrayForNoRow(t *testing.T) {
	said, err := json.Marshal(logRows(""))
	if err != nil || string(said) != "[]" {
		t.Fatalf("no row reads %s, %v, and wants []", said, err)
	}
}

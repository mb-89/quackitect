// ParseRecord's section of the log golden file, over the fixture session log
// in src/quack/testdata.
// [[spec/tickets/the-log-topic-lands]]
package log

import (
	"bytes"
	"encoding/json"
	"flag"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

var update = flag.Bool("update", false, "write ParseRecord's section of the log golden file again")

// The golden file, its fixture, and this reader's section. [[spec/tickets/the-log-topic-lands]]
var (
	logGoldenAt  = filepath.FromSlash("../../quack/testdata/log.golden.json")
	logFixtureAt = filepath.FromSlash("../../quack/testdata/session.jsonl")
)

const parseRecordSection = "src/tui/log ParseRecord"

// One record as the golden file holds it, its stamp as the line wrote it. [[spec/tickets/the-log-topic-lands]]
type goldenRecord struct {
	Level  string            `json:"level"`
	Kind   string            `json:"kind"`
	Said   string            `json:"said"`
	Text   string            `json:"text,omitempty"`
	Extra  map[string]string `json:"extra,omitempty"`
	Broken bool              `json:"broken,omitempty"`
	Rank   int               `json:"rank"`
}

func TestLogGoldenHoldsParseRecord(t *testing.T) {
	fixture, err := os.ReadFile(logFixtureAt)
	if err != nil {
		t.Fatal(err)
	}
	rows := []goldenRecord{}
	for _, line := range strings.Split(string(fixture), "\n") {
		if strings.TrimSpace(line) == "" {
			continue
		}
		r := ParseRecord(line)
		rows = append(rows, goldenRecord{Level: r.Level, Kind: r.Kind, Said: r.Said, Text: r.Text, Extra: r.Extra, Broken: r.Broken, Rank: Rank(r.Level)})
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
		golden[parseRecordSection] = said
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
	want, held := golden[parseRecordSection]
	if !held {
		t.Fatalf("the golden file holds no section for %s: run go test ./src/tui/log -run TestLogGolden -update", parseRecordSection)
	}
	var got, wanted any
	_ = json.Unmarshal(said, &got)
	_ = json.Unmarshal(want, &wanted)
	if !reflect.DeepEqual(got, wanted) {
		t.Fatalf("%s reads apart from the golden file: run go test ./src/tui/log -run TestLogGolden -update, and read the difference at the merge", parseRecordSection)
	}
}

// The writer of the front golden: it reads each ticket text the golden holds
// again, through the Go note reader. It stands here, since the note package's
// tests write no file. [[spec/tickets/schema-libs-leave]]
package main

import (
	"bytes"
	"encoding/json"
	"os"
	"testing"

	"quackitect/src/note"
	"quackitect/src/yaml"
)

// [[spec/tickets/schema-libs-leave]]
const frontsGoldenAt = "../note/testdata/fronts.golden.json"

// [[spec/tickets/schema-libs-leave]]
type frontEntry struct {
	Name  string          `json:"name"`
	Text  string          `json:"text"`
	Front json.RawMessage `json:"front"`
}

// [[spec/tickets/schema-libs-leave]]
func TestTheFrontGoldenReadsEveryTextAgain(t *testing.T) {
	t.Parallel()
	if !*update {
		t.Skip("go test ./src/quack -run TestTheFrontGoldenReadsEveryTextAgain -update reads the golden again")
	}
	body, err := os.ReadFile(frontsGoldenAt)
	if err != nil {
		t.Fatal(err)
	}
	var entries []frontEntry
	if err := json.Unmarshal(body, &entries); err != nil {
		t.Fatalf("%s reads %v", frontsGoldenAt, err)
	}
	for at, one := range entries {
		if entries[at].Front, err = json.Marshal(note.FrontOf(yaml.SplitLines(one.Text)).Said); err != nil {
			t.Fatal(err)
		}
	}
	var out bytes.Buffer
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	writes.SetIndent("", "  ")
	if err := writes.Encode(entries); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(frontsGoldenAt, out.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
}

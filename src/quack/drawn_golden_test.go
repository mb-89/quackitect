// The writer of the drawn golden: it draws each ticket text the golden holds
// again, through the tickets module's codec. It stands here, since a module's
// tests import no os. [[spec/tickets/branch-scripts-leave]]
package main

import (
	"bytes"
	"encoding/json"
	"flag"
	// level0: OutsideInDoors - the writer reads and writes the golden the tree ships, as a build check reads source
	"os"
	"testing"

	"quackitect/src/modules/tickets"
)

// The golden TestEveryDrawnGoldenMatchesTheProjection in src/modules/tickets reads. [[spec/tickets/branch-scripts-leave]]
const drawnGoldenAt = "../modules/tickets/testdata/drawn.golden.json"

var update = flag.Bool("update", false, "draw each text of the drawn golden again")

// [[spec/tickets/branch-scripts-leave]]
type drawnEntry struct {
	Name  string          `json:"name"`
	Text  string          `json:"text"`
	Drawn json.RawMessage `json:"drawn"`
}

// [[spec/tickets/branch-scripts-leave]]
func TestTheDrawnGoldenRedrawsEveryText(t *testing.T) {
	t.Parallel()
	if !*update {
		t.Skip("go test ./src/quack -run TestTheDrawnGoldenRedrawsEveryText -update draws the golden again")
	}
	body, err := os.ReadFile(drawnGoldenAt)
	if err != nil {
		t.Fatal(err)
	}
	var entries []drawnEntry
	if err := json.Unmarshal(body, &entries); err != nil {
		t.Fatalf("%s reads %v", drawnGoldenAt, err)
	}
	for at, one := range entries {
		drawn, err := tickets.DrawnCodec{}.Parse([]byte(one.Text))
		if err != nil {
			t.Fatalf("%s draws %v", one.Name, err)
		}
		if entries[at].Drawn, err = json.Marshal(drawn); err != nil {
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
	if err := os.WriteFile(drawnGoldenAt, out.Bytes(), 0o644); err != nil {
		t.Fatal(err)
	}
}

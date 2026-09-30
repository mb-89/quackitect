// The place rule the work tab holds, over the cases the place verb's test reads
// too, so the key and the verb write one value off one level.
// [[spec/tickets/view-actions-run-through-verbs]]
package work

import (
	"encoding/json"
	"os"
	"testing"

	"quackitect/src/tui/tree"
)

// The cases test/level0/ticket-edit.test.js reads as well. [[spec/tickets/view-actions-run-through-verbs]]
const placeCasesAt = "testdata/places.json"

func TestPlaceValueReadsTheSharedCases(t *testing.T) {
	text, err := os.ReadFile(placeCasesAt)
	if err != nil {
		t.Fatal(err)
	}
	var said struct {
		Rows []struct {
			Name  string `json:"name"`
			Queue string `json:"queue"`
			Todo  string `json:"todo"`
		} `json:"rows"`
		Cases []struct {
			Says string `json:"says"`
			Name string `json:"name"`
			N    int    `json:"n"`
			Want string `json:"want"`
		} `json:"cases"`
	}
	if err := json.Unmarshal(text, &said); err != nil {
		t.Fatal(err)
	}
	if len(said.Cases) == 0 {
		t.Fatalf("%s holds no case", placeCasesAt)
	}
	items := make([]tree.Item, 0, len(said.Rows))
	byName := map[string]tree.Item{}
	for _, row := range said.Rows {
		one := tree.Item{Name: row.Name, Keys: map[string]string{QueueKey: row.Queue, TodoKey: row.Todo}}
		items = append(items, one)
		byName[row.Name] = one
	}
	level := tree.NewTree(nil, items, false)
	for _, one := range said.Cases {
		value, notice := PlaceValue(level, byName[one.Name], one.N)
		if value != one.Want || (value == "") != (notice != "") {
			t.Fatalf("%s: the place reads %q with the notice %q, and wants %q", one.Says, value, notice, one.Want)
		}
	}
}

// Every base file parses off its projection, and views/bases lists each one
// by name, in name order.
// [[spec/tickets/the-sidebar-reads-v1]]
package views

import (
	"encoding/json"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestViewsBasesParsesEachBase(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	index.Seed(map[string]any{
		"files/spec/views/work.base":  q.Content{Hash: "w", Text: "reads: work/rows\nbadge: work/open-tasks\n"},
		"files/spec/views/board.base": q.Content{Hash: "b", Text: "reads: work/rows\n"},
	})
	if err := index.Store().Run("views/bases"); err != nil {
		t.Fatalf("views/bases runs nowhere: %v", err)
	}
	form, _ := json.Marshal(index.Read("views/bases"))
	want := `[{"name":"board","said":{"reads":"work/rows"}},{"name":"work","said":{"badge":"work/open-tasks","reads":"work/rows"}}]`
	if string(form) != want {
		t.Fatalf("views/bases reads %s, and wants %s", form, want)
	}
}

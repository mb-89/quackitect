// The action rows carry what the registration declares for a renderer, as the
// name rows do, so a sidebar button reads its label and icon off the catalog.
// [[spec/tickets/the-sidebar-renders-generically]]
package index

import (
	"encoding/json"
	"strings"
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestAnActionRegisteringNoLabelWritesNoLabel(t *testing.T) {
	ix := qtest.New(t, func(c *q.Catalog) {
		q.ActionIn(c, "t/bare", func(askIn) []q.Request { return nil }, q.Doc("asks nothing"))
	})
	_, actions, _ := catalogOf(ix.Store())
	for _, row := range actions {
		if row.Name != "t/bare" {
			continue
		}
		text, err := json.Marshal(row)
		if err != nil {
			t.Fatal(err)
		}
		if strings.Contains(string(text), `"label"`) || strings.Contains(string(text), `"icon"`) {
			t.Fatalf("t/bare registers no label and no icon, and its row writes %s", text)
		}
		return
	}
	t.Fatal("index/actions holds no row for t/bare")
}

func TestActionRowsCarryLabelAndIcon(t *testing.T) {
	ix := catalogued(t)
	row := rowNamed(t, ActionsName, rowsRead(t, ix.Read(ActionsName)), "t/ask")
	if row["label"] != "Ask" || row["icon"] != "❓" {
		t.Fatalf("index/actions reads the label of t/ask as %v and its icon as %v", row["label"], row["icon"])
	}
}

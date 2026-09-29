// The action rows carry what the registration declares for a renderer, as the
// name rows do, so a sidebar button reads its label and icon off the catalog.
// [[spec/tickets/the-sidebar-renders-generically]]
package index

import "testing"

func TestActionRowsCarryLabelAndIcon(t *testing.T) {
	ix := catalogued(t)
	row := rowNamed(t, ActionsName, rowsRead(t, ix.Read(ActionsName)), "t/ask")
	if row["label"] != "Ask" || row["icon"] != "❓" {
		t.Fatalf("index/actions reads the label of t/ask as %v and its icon as %v", row["label"], row["icon"])
	}
}

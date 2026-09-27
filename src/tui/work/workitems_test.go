// The progress a row carries, from the index to the detail pane.
// [[spec/design_output/tui#the-work-tab]]
package work

import (
	"strings"
	"testing"
)

// [[spec/design_output/tui#the-work-tab]]
func TestTheDetailPaneShowsTheProgress(t *testing.T) {
	items, err := ReadWorkItems(`[{"name": "a-child", "route": "trivial", "state": "open", "step": "do", "progress": "1/3"}]`)
	if err != nil {
		t.Fatal(err)
	}
	if items[0].Keys["progress"] != "1/3" {
		t.Fatalf("the row carries its progress, and reads %q", items[0].Keys["progress"])
	}
	drawn := []string{}
	for _, one := range workFields("/tree", items[0]) {
		drawn = append(drawn, one.Text)
	}
	said := strings.Join(drawn, "\n")
	if !strings.Contains(said, "progress") || !strings.Contains(said, "1/3") {
		t.Fatalf("the details draw the progress, and read:\n%s", said)
	}
}

// A private note links under the folder the index names for it, and a travelling ticket under its own. [[spec/design_output/tree-view#a-value-carries-a-link]]
func TestAPrivateNoteLinksWhereItStands(t *testing.T) {
	items, err := ReadWorkItems(`[{"name": "slow-lint", "path": ".se/tickets/slow-lint.md", "route": "note", "state": "open", "step": "decide"},
		{"name": "a-child", "path": "spec/tickets/a-child.md", "route": "trivial", "state": "open", "step": "do"}]`)
	if err != nil {
		t.Fatal(err)
	}
	if said := pathOf(items[0]); said != ".se/tickets/slow-lint.md" {
		t.Fatalf("the private note links to %q", said)
	}
	if said := pathOf(items[1]); said != "spec/tickets/a-child.md" {
		t.Fatalf("the travelling ticket links to %q", said)
	}
}

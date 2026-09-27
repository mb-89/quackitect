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

// An open ticket for a person lights the letter on every group over it, however deep it stands. [[spec/tickets/groups-hold-groups]]
func TestPersonLightsTwoLevelsUp(t *testing.T) {
	items, err := ReadWorkItems(`[{"name": "big-move", "route": "group", "state": "open"},
		{"name": "a-part", "route": "group", "state": "open", "group": "big-move"},
		{"name": "a-question", "route": "question", "state": "open", "step": "ask", "group": "a-part", "person": true},
		{"name": "elsewhere", "route": "group", "state": "open"}]`)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 || len(items[0].Kids) != 1 || len(items[0].Kids[0].Kids) != 1 {
		t.Fatalf("the rows nest three deep under big-move, and read %+v", items)
	}
	move, part, question := items[0], items[0].Kids[0], items[0].Kids[0].Kids[0]
	for _, one := range []struct {
		name, said string
	}{{question.Name, question.Keys["person"]}, {part.Name, part.Keys["person"]}, {move.Name, move.Keys["person"]}} {
		if one.said != "true" {
			t.Errorf("%s reads person %q, and a ticket for a person stands under it", one.name, one.said)
		}
	}
	if said := items[1].Keys["person"]; said == "true" {
		t.Errorf("elsewhere holds no ticket for a person, and reads person %q", said)
	}
}

// A tree holding no ticket for a person lights no row. [[spec/tickets/groups-hold-groups]]
func TestPersonStaysDarkWithNoPersonTicket(t *testing.T) {
	items, err := ReadWorkItems(`[{"name": "big-move", "route": "group", "state": "open"},
		{"name": "a-part", "route": "trivial", "state": "open", "group": "big-move"}]`)
	if err != nil {
		t.Fatal(err)
	}
	for _, one := range []string{items[0].Keys[PersonKey], items[0].Kids[0].Keys[PersonKey]} {
		if one != "false" {
			t.Errorf("a row reads person %q, and no ticket for a person stands", one)
		}
	}
}

// The work tab's details and its table: the three parts of the details, the
// link on a name, the press on a mark, and a sort over a key the table hides.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"strings"
	"testing"
)

// The details draw the flags, the rest of the front, then the ask, and nothing off the body. [[spec/design_output/tui#the-work-tab]]
func TestTheDetailsDrawTheFlagsTheFrontThenTheAsk(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2", "s", "enter")
	said := m.content
	flags := strings.Index(said, "U  urgent")
	step := strings.Index(said, "step")
	ask := strings.Index(said, "One piece of it.")
	if flags < 0 || step < 0 || ask < 0 {
		t.Fatalf("the details hold the three parts, and read:\n%s", said)
	}
	if !(flags < step && step < ask) {
		t.Fatalf("the flags come first, the front second and the ask last, and the details read:\n%s", said)
	}
	for _, gone := range []string{"path", "spec/tickets/a-child.md"} {
		if strings.Contains(said, gone) {
			t.Fatalf("the details carry no path, because the name in the table links, and read:\n%s", said)
		}
	}
	if !strings.Contains(said, "O  state    open") {
		t.Fatalf("the state flag draws its letter upper with its value, and the details read:\n%s", said)
	}
}

// The name in the table links to its note, so a click in the list opens it. [[spec/design_output/tree-view#a-value-carries-a-link]]
func TestANameInTheTableLinksToItsNote(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	rows := m.work.Rows(120, 4)
	if !strings.Contains(rows, linkOpen+"file://") || !strings.Contains(rows, "one-group.md") {
		t.Fatalf("a name carries the link to its note, and the rows read %q", rows)
	}
	bare := NewTree(m.work.Cols, m.work.Items, true)
	if strings.Contains(bare.Rows(120, 4), linkOpen) {
		t.Fatal("a tree naming no addresses draws no link")
	}
}

// A press on the mark before a group closes it, and a press again opens it. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestAPressOnTheMarkClosesTheGroupAndOpensItAgain(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2")
	if m.work.Len() != 3 {
		t.Fatalf("the group opens with its ticket under it, and %d rows stand", m.work.Len())
	}
	m = click(m, 0, firstRow())
	if m.work.Len() != 2 || m.work.At() != 0 {
		t.Fatalf("a press on the mark closes the group, and %d rows stand", m.work.Len())
	}
	m = click(m, 1, firstRow())
	if m.work.Len() != 3 {
		t.Fatalf("a press on the mark again opens it, and %d rows stand", m.work.Len())
	}
	m = click(m, 6, firstRow())
	if m.work.Len() != 3 {
		t.Fatalf("a press on the name selects and toggles nothing, and %d rows stand", m.work.Len())
	}
	if m.work.OnMark(0) != true || m.work.OnMark(2) {
		t.Fatal("the mark takes the first two columns of a group's row")
	}
}

// A preset sorts by a key the table hides, so the newest done ticket stands first. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestRecentlyDoneSortsByTheChangeTimeTheTableHides(t *testing.T) {
	t.Parallel()
	rows := `[
	  {"name": "old-done", "path": "spec/tickets/old-done.md", "state": "closed", "route": "trivial", "changed": 100},
	  {"name": "new-done", "path": "spec/tickets/new-done.md", "state": "closed", "route": "trivial", "changed": 300},
	  {"name": "mid-done", "path": "spec/tickets/mid-done.md", "state": "closed", "route": "trivial", "changed": 200},
	  {"name": "still-open", "path": "spec/tickets/still-open.md", "state": "open", "route": "trivial"}
	]`
	root, _ := workTreeWith(t, rows)
	m := window(0)
	m.path = logOf(root)
	tree, err := loadWork(m.path)
	if err != nil {
		t.Fatal(err)
	}
	out, _ := m.Update(workMsg{tree: tree})
	m = press(out.(model), "2")
	m = alt(m, '3')
	if m.input.Value() != "state: closed" {
		t.Fatalf("recently done keeps the closed tickets, and the line reads %q", m.input.Value())
	}
	if said := namesOf(m.work); strings.Join(said, " ") != "new-done mid-done old-done" {
		t.Fatalf("the newest done stands first, and the rows read %v", said)
	}
	if strings.Contains(m.work.Header(120), "changed") {
		t.Fatal("the table draws no changed column, and the sort reads the key anyway")
	}
}

// A capital under alt reads as alt, the shift sign and the letter. [[spec/design_output/tui#the-help-reads-the-cursor]]
func TestAChordWithShiftReadsWithTheShiftSign(t *testing.T) {
	t.Parallel()
	if said := keyShown("alt+F"); said != "alt+⇧f" {
		t.Fatalf("alt+F reads with the sign, and reads %q", said)
	}
	if said := keyShown("alt+q"); said != "alt+q" {
		t.Fatalf("a lower chord reads as it is, and reads %q", said)
	}
}

// The work tab's details and its table: the parts of the details, the
// link on a name, the press on a mark, and a sort over a key the table hides.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"strings"
	"testing"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/work"
)

// The details draw the flags, the rest of the front, then the ask, and nothing off the body. [[spec/design_output/tui#the-work-tab]]
func TestTheDetailsDrawTheFlagsTheFrontThenTheAsk(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "2", "s", "enter")
	said := m.Content
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

// A preset sorts by a key the table hides, so the newest done ticket stands first. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func TestRecentlyDoneSortsByTheChangeTimeTheTableHides(t *testing.T) {
	t.Parallel()
	rows := `[
	  {"name": "old-done", "path": "spec/tickets/old-done.md", "state": "closed", "route": "trivial", "changed": 100},
	  {"name": "new-done", "path": "spec/tickets/new-done.md", "state": "closed", "route": "trivial", "changed": 300},
	  {"name": "mid-done", "path": "spec/tickets/mid-done.md", "state": "closed", "route": "trivial", "changed": 200},
	  {"name": "still-open", "path": "spec/tickets/still-open.md", "state": "open", "route": "trivial"}
	]`
	m := window(0)
	m.Path = logOf(workTree(t))
	out, _ := m.Update(work.Msg{Tree: loadWork(t, rows)})
	m = press(out.(frame.Model), "2")
	m = alt(m, '3')
	if m.Input.Value() != "state: closed" {
		t.Fatalf("recently done keeps the closed tickets, and the line reads %q", m.Input.Value())
	}
	if said := namesOf(theWork(m).Tree); strings.Join(said, " ") != "new-done mid-done old-done" {
		t.Fatalf("the newest done stands first, and the rows read %v", said)
	}
	if strings.Contains(theWork(m).Tree.Header(120), "changed") {
		t.Fatal("the table draws no changed column, and the sort reads the key anyway")
	}
}

// A capital under alt reads as alt, the shift sign and the letter. [[spec/design_output/tui#the-help-reads-the-cursor]]
func TestAChordWithShiftReadsWithTheShiftSign(t *testing.T) {
	t.Parallel()
	if said := frame.KeyShown("alt+F"); said != "alt+⇧f" {
		t.Fatalf("alt+F reads with the sign, and reads %q", said)
	}
	if said := frame.KeyShown("alt+q"); said != "alt+q" {
		t.Fatalf("a lower chord reads as it is, and reads %q", said)
	}
}

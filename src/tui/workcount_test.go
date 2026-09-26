// The count the sidebar's button draws, beside the number the work tab carries
// in its brackets, over one case tree: a door the case stands up, and a verb the
// case writes that prints the places.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"fmt"
	"strings"
	"testing"
	"time"

	"quackitect/tui/frame"
	"quackitect/tui/work"
)

const countRowsSaid = `[
  {"name": "one-group", "path": "spec/tickets/one-group.md", "state": "open", "step": "children",
   "route": "group", "group": "", "urgent": false, "todo": false, "standing": "", "says": "Two tickets that land as one."},
  {"name": "a-child", "path": "spec/tickets/a-child.md", "state": "open", "step": "do",
   "route": "trivial", "group": "one-group", "urgent": false, "todo": false, "standing": "", "says": "One piece of it."},
  {"name": "a-loose-one", "path": "spec/tickets/a-loose-one.md", "state": "open", "step": "do",
   "route": "trivial", "group": "", "urgent": false, "todo": false, "standing": "", "says": "A placed ticket in no group."},
  {"name": "an-unplaced-one", "path": "spec/tickets/an-unplaced-one.md", "state": "open", "step": "do",
   "route": "trivial", "group": "", "urgent": false, "todo": false, "standing": "", "says": "An open ticket the queue places nowhere."},
  {"name": "a-closed-one", "path": "spec/tickets/a-closed-one.md", "state": "closed", "step": "",
   "route": "trivial", "group": "", "urgent": false, "todo": false, "standing": "", "says": "A ticket that lands."}
]`

// The verb a case writes: it prints the places the branch verb prints, the group and its child on the cloud, a placed ticket and a todo. [[spec/design_output/work#one-reading-answers-git]]
const countVerbSaid = `console.log(JSON.stringify({
  branches: [{ branch: "work/one-group", name: "one-group", merged: false, queue: "∞",
    tickets: [{ name: "a-child", queue: "∞" }] }],
  loose: [{ name: "a-loose-one", queue: "1" },
    { name: "read the note", kind: "todo", queue: "2", todo: true, says: "the one on the grace" }],
}));
`

// The strip the window draws once the index's tree and the verb's places land, the way it opens. [[spec/design_output/tui#the-work-tab]]
func stripOnceOpen(t *testing.T, path string) string {
	t.Helper()
	m := newModel(path, time.UTC)
	m.W, m.H = 120, 40
	first, ok := work.Cmd(path, 0)().(work.Msg)
	if !ok || first.Tree == nil {
		t.Fatalf("the index hands the tab its tree, and answered %+v", first)
	}
	out, _ := m.Update(first)
	places, ok := work.PlacesCmd(work.Root(path))().(work.PlacesMsg)
	if !ok || places.Why != "" {
		t.Fatalf("the verb hands the tab its places, and answered %+v", places)
	}
	out, _ = out.(frame.Model).Update(places)
	return out.(frame.Model).RenderStrip()
}

// [[spec/design_output/tui#the-work-tab]]
func TestTheButtonsCountIsTheNumberInTheTabsBrackets(t *testing.T) {
	t.Parallel()
	root, _ := workTreeWith(t, countRowsSaid)
	writeAt(t, root, "src/scripts/cli.js", countVerbSaid)
	path := logOf(root)

	said, err := countSaid(path)
	if err != nil {
		t.Fatalf("the count reads the places the tab reads, and answered %v", err)
	}
	// The placed ticket and the todo stand off the cloud, and the group and its child stand on it, so both read two. [[spec/design_output/tui#the-work-tab]]
	strip := stripOnceOpen(t, path)
	if said != `{"count":2}` || !strings.Contains(strip, fmt.Sprintf("work (%d)", 2)) {
		t.Fatalf("the count is the number in the tab's brackets, and the count reads %s where the strip reads %q", said, strip)
	}
}

// A tree whose verb answers nothing gives the count its reason, so the button draws no number. [[spec/design_output/tui#the-work-tab]]
func TestTheCountAnswersWhyWhereNoBranchVerbStands(t *testing.T) {
	t.Parallel()
	noVerb, _ := workTreeWith(t, countRowsSaid)
	if _, err := countSaid(logOf(noVerb)); err == nil {
		t.Fatal("a tree with no branch verb answers why")
	}
}

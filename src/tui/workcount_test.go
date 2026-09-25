// The count the sidebar's button draws, beside the rows the work tab draws as
// it opens, over one case tree: a door the case stands up, and a verb the case
// writes that prints the places.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"os"
	"path/filepath"
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

// The rows the window's work tab draws once the index's tree and the verb's places land, the way it opens. [[spec/design_output/tui#the-work-tab]]
func tabDrawn(t *testing.T, path string) int {
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
	return theWork(out.(frame.Model)).Tree.Len()
}

// The base file this project ships, with the press moved from the queue to the open preset. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func pressedOpen(t *testing.T) string {
	t.Helper()
	base, err := os.ReadFile(filepath.Join("..", "..", work.BaseAt))
	if err != nil {
		t.Fatal(err)
	}
	said := strings.ReplaceAll(string(base), "\r\n", "\n")
	queue := "- name: queue\n    pressed: true\n"
	open := "- name: open\n"
	if strings.Count(said, queue) != 1 || strings.Count(said, open) != 1 {
		t.Fatalf("the base file presses the queue and names the open preset once, and reads:\n%s", said)
	}
	said = strings.Replace(said, queue, "- name: queue\n", 1)
	return strings.Replace(said, open, "- name: open\n    pressed: true\n", 1)
}

// [[spec/design_output/tui#the-work-tab]]
func TestTheButtonsCountIsTheRowsTheTabDrawsAsItOpens(t *testing.T) {
	t.Parallel()
	root, _ := workTreeWith(t, countRowsSaid)
	writeAt(t, root, "src/scripts/cli.js", countVerbSaid)
	path := logOf(root)

	drawn := tabDrawn(t, path)
	said, err := work.Drawn(path)
	if err != nil {
		t.Fatalf("the count reads the tree the tab reads, and answered %v", err)
	}
	// The queue draws the group and its child on the cloud, the placed ticket and the todo, and leaves the unplaced and the closed off. [[spec/design_output/tui#the-work-tab]]
	if said != drawn || drawn != 4 {
		t.Fatalf("the count is the four rows the queue draws, and the count reads %d where the tab draws %d", said, drawn)
	}

	// A change of the preset the base file presses moves both. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	writeAt(t, root, work.BaseAt, pressedOpen(t))
	drawn = tabDrawn(t, path)
	said, err = work.Drawn(path)
	if err != nil {
		t.Fatalf("the count reads the tree the tab reads, and answered %v", err)
	}
	if said != drawn || drawn != 5 {
		t.Fatalf("the count is the five open rows, and the count reads %d where the tab draws %d", said, drawn)
	}
}

// A tree whose verb answers nothing gives the count its reason, so the button draws no number. [[spec/design_output/tui#the-work-tab]]
func TestTheCountAnswersWhyWhereNoBranchVerbStands(t *testing.T) {
	t.Parallel()
	noVerb, _ := workTreeWith(t, countRowsSaid)
	if _, err := work.Drawn(logOf(noVerb)); err == nil {
		t.Fatal("a tree with no branch verb answers why")
	}
}

// The work tab, over a catalog a case seeds. The items come off the rows
// work/rows answers, and the base file this tree ships says the columns.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"encoding/json"
	"errors"
	"os" // level0: OutsideInDoors - the cases read the work view file the tree ships, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
	"quackitect/src/tui/work"
)

// The rows work/rows answers for a case: a held group carrying one ticket, and a loose one, each at its place. [[spec/tickets/the-work-tab-reads-v1]]
const workRowsSaid = `[
  {"name": "one-group", "kind": "group", "path": "spec/tickets/one-group.md", "route": "group", "state": "open",
   "step": "children", "held": true, "queue": "1", "says": "Two tickets that land as one."},
  {"name": "a-child", "kind": "ticket", "path": "spec/tickets/a-child.md", "route": "trivial", "state": "open",
   "step": "do", "group": "one-group", "urgent": true, "held": true, "queue": "1.1", "says": "One piece of it."},
  {"name": "a-loose-one", "kind": "ticket", "path": "spec/tickets/a-loose-one.md", "route": "trivial", "state": "open",
   "step": "do", "todo": true, "queue": "2", "says": "A ticket in no group."}
]`

// The root a window stands over, which every read reaches through a fake. [[spec/design_output/tui#the-work-tab]]
func workTree(t *testing.T) string {
	t.Helper()
	return t.TempDir()
}

func shippedBase(t *testing.T) []byte {
	t.Helper()
	base, err := os.ReadFile(filepath.Join("..", "..", work.BaseAt))
	if err != nil {
		t.Fatalf("this tree ships %s, and it read %v", work.BaseAt, err)
	}
	return base
}

// The catalog a case hands the tab: the base file this tree ships, and the rows it names. [[spec/tickets/the-work-tab-reads-v1]]
func workCatalog(t *testing.T, rows string) registry.Fake {
	t.Helper()
	return registry.Fake{Values: map[string]any{
		"files/" + work.BaseAt: map[string]any{"text": string(shippedBase(t))},
		"work/rows":            json.RawMessage(rows),
	}}
}

// The tree the tab draws off those rows. [[spec/tickets/the-work-tab-reads-v1]]
func loadWork(t *testing.T, rows string) *tree.Tree {
	t.Helper()
	grid, err := work.Read(workCatalog(t, rows))
	if err != nil {
		t.Fatalf("the tab reads its base file and its rows, and answered %v", err)
	}
	return grid
}

func logOf(root string) string {
	return filepath.Join(root, ".se", ".log", "session.jsonl")
}

// [[spec/design_output/tui#the-work-tab]]
func TestTheWindowDrawsEveryTicketNestedUnderItsGroup(t *testing.T) {
	t.Parallel()
	path := logOf(workTree(t))
	tree := loadWork(t, workRowsSaid)
	m := newModel(path, time.UTC)
	m.W, m.H = 120, 24
	theWork(m).Tree = tree
	m.OpenTab(m.TabNamed("work"))
	said := m.View()
	for _, one := range []string{"one-group", "a-child", "a-loose-one"} {
		if !strings.Contains(said, one) {
			t.Fatalf("the tab draws %s, and the window reads %q", one, said)
		}
	}
}

// A catalog answering no rows says why, and the tab keeps the reason for its wait text. [[spec/tickets/the-work-tab-reads-v1]]
func TestACatalogAnsweringNoRowsSaysWhy(t *testing.T) {
	t.Parallel()
	broken := registry.Fake{Err: errors.New("no index stands here")}
	if _, err := work.Read(broken); err == nil {
		t.Fatal("a catalog answering nothing answers why")
	}
	m := newModelOver(logOf(workTree(t)), time.UTC, broken)
	out, _ := m.Update(registry.Change{Name: "work/rows", Revision: 1, Value: json.RawMessage(workRowsSaid)})
	if held := theWork(out.(frame.Model)); held.Tree != nil || held.Why == "" {
		t.Fatalf("the tab draws no tree and keeps the reason, and holds %v with %q", held.Tree, held.Why)
	}
}

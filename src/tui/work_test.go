// The work tab, over a catalog a case seeds. The items come off the rows
// work/rows answers, and the base file this tree ships says the columns.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"encoding/json"
	"errors"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
	"quackitect/src/tui/work"
)

const indexRowsSaid = `[
  {"name": "one-group", "path": "spec/tickets/one-group.md", "state": "open", "step": "children",
   "route": "group", "group": "", "urgent": false, "todo": false, "standing": "held",
   "says": "Two tickets that land as one."},
  {"name": "a-child", "path": "spec/tickets/a-child.md", "state": "open", "step": "do",
   "route": "trivial", "group": "one-group", "urgent": true, "todo": false, "standing": "held",
   "says": "One piece of it."},
  {"name": "a-loose-one", "path": "spec/tickets/a-loose-one.md", "state": "open", "step": "do",
   "route": "trivial", "group": "", "urgent": false, "todo": true, "standing": "",
   "says": "A ticket in no group."}
]`

// The rows work/rows answers for a case: a held group carrying one ticket, and a loose one, each at its place. [[spec/tickets/the-work-tab-reads-v1]]
const workRowsSaid = `[
  {"name": "one-group", "kind": "group", "path": "spec/tickets/one-group.md", "route": "group", "state": "open",
   "step": "children", "held": true, "queue": "1", "says": "Two tickets that land as one."},
  {"name": "a-child", "kind": "ticket", "path": "spec/tickets/a-child.md", "route": "trivial", "state": "open",
   "step": "do", "group": "one-group", "urgent": true, "held": true, "queue": "1.1", "says": "One piece of it."},
  {"name": "a-loose-one", "kind": "ticket", "path": "spec/tickets/a-loose-one.md", "route": "trivial", "state": "open",
   "step": "do", "todo": true, "queue": "2", "says": "A ticket in no group."}
]`

// The tree a window writes into: the base file this project ships, and the log. [[spec/design_output/tui#the-work-tab]]
func workTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	writeAt(t, root, work.BaseAt, string(shippedBase(t)))
	writeAt(t, root, ".se/.log/session.jsonl", "")
	return root
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

func writeAt(t *testing.T, root, rel, text string) {
	t.Helper()
	at := filepath.Join(root, filepath.FromSlash(rel))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
		t.Fatal(err)
	}
}

func logOf(root string) string {
	return filepath.Join(root, ".se", ".log", "session.jsonl")
}

// [[spec/design_output/tui#the-work-tab]]
func TestAGroupCarriesItsTicketsAndALooseOneStandsAtTheLeft(t *testing.T) {
	t.Parallel()
	items, err := work.ReadWorkItems(indexRowsSaid)
	if err != nil {
		t.Fatalf("the rows read, and answered %v", err)
	}
	if len(items) != 2 {
		t.Fatalf("the rows name a group and a loose ticket, and read %d", len(items))
	}
	if items[0].Name != "one-group" || len(items[0].Kids) != 1 {
		t.Fatalf("the group carries its one ticket, and read %d", len(items[0].Kids))
	}
	if items[0].Keys["held"] != "true" || items[0].Keys["standing"] != "held" {
		t.Fatal("a held group carries the mark, and its standing")
	}
	if items[0].Kids[0].Keys["urgent"] != "true" {
		t.Fatal("a marked ticket carries the mark")
	}
	if items[1].Name != "a-loose-one" || items[1].Keys["group"] != "" {
		t.Fatal("a ticket naming no group stands at the left, with no mark")
	}
	if items[1].Keys["urgent"] != "false" || items[1].Keys["held"] != "false" {
		t.Fatal("an unmarked ticket carries no mark")
	}
	orphan, _ := work.ReadWorkItems(strings.ReplaceAll(indexRowsSaid, `"group": "one-group"`, `"group": "nobody"`))
	if len(orphan) != 3 {
		t.Fatalf("a ticket naming a group the rows hold nowhere stands at the left, and %d rows do", len(orphan))
	}
}

// [[spec/design_output/tui#the-work-tab]]
func TestTheTabReadsTheBaseFileAndTheRowsOffTheCatalog(t *testing.T) {
	t.Parallel()
	tree := loadWork(t, workRowsSaid)
	if tree.Len() != 3 {
		t.Fatalf("the group, its ticket and the loose one stand, and %d rows do", tree.Len())
	}
	head := tree.Header(120)
	for _, one := range []string{"name", "flags", "queue"} {
		if !strings.Contains(head, one) {
			t.Fatalf("the column %s stands in the names, and they read %q", one, head)
		}
	}
	// The table draws the name, the flags and the queue alone: the nesting says the group, and the details draw the rest. [[spec/design_output/tui#the-work-tab]]
	for _, gone := range []string{"says", "state", "kind", "standing", "step", "group"} {
		if strings.Contains(head, gone) {
			t.Fatalf("the column %s stands off the table, and the names read %q", gone, head)
		}
	}
}

// A ticket naming another row nests under it, at any depth, and one naming a row nobody holds stands at the left. [[spec/design_output/tree-view#the-name-column-nests]]
func TestATicketNestsUnderTheRowItNamesAtAnyDepth(t *testing.T) {
	t.Parallel()
	items, err := work.ReadWorkItems(`[
		{"name": "its-child", "route": "trivial", "state": "open", "group": "a-group", "says": "One piece."},
		{"name": "a-group", "route": "group", "state": "open", "group": "", "says": "Two as one."},
		{"name": "grandchild", "route": "trivial", "state": "open", "group": "its-child", "says": ""},
		{"name": "alone", "route": "trivial", "state": "open", "group": "nobody", "says": ""}
	]`)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 || items[0].Name != "a-group" || items[1].Name != "alone" {
		t.Fatalf("the group and the ticket naming no standing row stand at the left, and the roots read %v", items)
	}
	if items[0].Keys["kind"] != work.KindGroup || items[1].Keys["kind"] != work.KindTicket {
		t.Fatalf("the kind reads off the route, and it reads %v", items)
	}
	if len(items[0].Kids) != 1 || items[0].Kids[0].Name != "its-child" {
		t.Fatalf("the child nests under its group, and the kids read %v", items[0].Kids)
	}
	if len(items[0].Kids[0].Kids) != 1 || items[0].Kids[0].Kids[0].Name != "grandchild" {
		t.Fatalf("a child's own child nests under it, and the kids read %v", items[0].Kids[0].Kids)
	}
}

// [[spec/design_output/tree-view#the-filter-reads-an-item]]
func TestTheFilterReadsATicketsKeysInTheLogsOwnLanguage(t *testing.T) {
	t.Parallel()
	tree := loadWork(t, workRowsSaid)
	f, err := draw.ParseFilter("group:one-group")
	if err != nil {
		t.Fatalf("the filter reads, and answered %v", err)
	}
	tree.Narrow(f)
	if !tree.Narrowed() {
		t.Fatal("a filter standing says so")
	}
	if tree.Len() != 2 {
		t.Fatalf("the group stands for its child, and %d rows do", tree.Len())
	}
	tree.Narrow(draw.Filter{})
	if tree.Len() != 3 {
		t.Fatalf("an empty filter keeps every row, and %d stand", tree.Len())
	}
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

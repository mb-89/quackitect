// The work tab draws off work/rows alone, redraws on a watched change, and
// counts off work/open-tasks.
// [[spec/tickets/the-work-tab-reads-v1]]

package work

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
)

// The rows a case seeds: a ticket on the cloud, and a todo no ticket carries. [[spec/tickets/the-work-tab-reads-v1]]
var v1Rows = []map[string]any{
	{"name": "a-ticket", "kind": "ticket", "state": "open", "route": "standard", "path": "spec/tickets/a-ticket.md", "queue": "1", "cloud": true},
	{"name": "a-todo", "kind": "todo", "state": "open", "todo": true, "queue": "2"},
}

func v1Fake(t *testing.T) registry.Fake {
	t.Helper()
	base, err := os.ReadFile(filepath.Join("..", "..", "..", "spec", "views", "work.base"))
	if err != nil {
		t.Fatal(err)
	}
	return registry.Fake{Values: map[string]any{
		"files/spec/views/work.base": map[string]any{"text": string(base)},
		"work/rows":                  v1Rows,
		"work/open-tasks":            1,
	}}
}

// Every item the tree holds, nested ones too, by name. [[spec/tickets/the-work-tab-reads-v1]]
func itemsByName(grid *tree.Tree) map[string]tree.Item {
	out := map[string]tree.Item{}
	var mark func([]tree.Item)
	mark = func(all []tree.Item) {
		for _, one := range all {
			out[one.Name] = one
			mark(one.Kids)
		}
	}
	mark(grid.Items)
	return out
}

func TestTheWorkTabDrawsOffWorkRowsAlone(t *testing.T) {
	t.Parallel()
	grid, err := Read(v1Fake(t))
	if err != nil {
		t.Fatal(err)
	}
	items := itemsByName(grid)
	ticket, todo := items["a-ticket"], items["a-todo"]
	if ticket.Keys[QueueKey] != "1" || ticket.Keys[CloudKey] != flagOf(true) || ticket.Keys["route"] != "standard" {
		t.Fatalf("the ticket reads %v, and wants its place, its cloud letter and its route off the rows", ticket.Keys)
	}
	if todo.Keys["kind"] != KindTodo || todo.Keys[QueueKey] != "2" || todo.Keys[TodoKey] != flagOf(true) {
		t.Fatalf("the todo reads %v, and wants a todo row at its place", todo.Keys)
	}
	if grid.LinkOf == nil || grid.LinkOf(ticket) == "" || grid.LinkOf(todo) != "" {
		t.Fatal("the ticket links to its note, and the todo links nowhere")
	}
	if rows := grid.Rows(120, 4); !strings.Contains(rows, draw.LinkOpen+"file://") || !strings.Contains(rows, "a-ticket.md") {
		t.Fatalf("a name carries the link to its note, and the rows read %q", rows)
	}
	if bare := tree.NewTree(grid.Cols, grid.Items, true); strings.Contains(bare.Rows(120, 4), draw.LinkOpen) {
		t.Fatal("a tree naming no addresses draws no link")
	}
	// The table draws the name, the flags and the queue alone: the nesting says the group, and the details draw the rest. [[spec/design_output/tui#the-work-tab]]
	head := grid.Header(120)
	for _, one := range []string{"name", "flags", "queue"} {
		if !strings.Contains(head, one) {
			t.Fatalf("the column %s stands in the names, and they read %q", one, head)
		}
	}
	for _, gone := range []string{"says", "state", "kind", "standing", "step", "group"} {
		if strings.Contains(head, gone) {
			t.Fatalf("the column %s stands off the table, and the names read %q", gone, head)
		}
	}
}

// A press on the mark before a group closes it, and a press again opens it. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
func TestAPressOnTheMarkClosesTheGroupAndOpensItAgain(t *testing.T) {
	t.Parallel()
	fake := v1Fake(t)
	fake.Values[rowsName] = []map[string]any{
		{"name": "one-group", "kind": "group", "route": "group", "state": "open", "path": "spec/tickets/one-group.md", "queue": "1"},
		{"name": "a-child", "kind": "ticket", "route": "trivial", "state": "open", "path": "spec/tickets/a-child.md", "queue": "1.1", "group": "one-group"},
		{"name": "a-loose-one", "kind": "ticket", "route": "trivial", "state": "open", "path": "spec/tickets/a-loose-one.md", "queue": "2"},
	}
	tab := New(filepath.Join(t.TempDir(), ".se", ".log", "session.jsonl")) // level0: FixtureOutsideHome - the tab reads its root off a path of the case's own
	tab.From = fake
	m := frame.New(tab.Path, time.UTC, []frame.Tab{tab})
	m.W, m.H = 120, 24
	value, _ := json.Marshal(fake.Values[rowsName])
	tab.Update(&m, registry.Change{Name: rowsName, Revision: 1, Value: value})
	click := func(x int) {
		next, _ := m.Update(tea.MouseMsg{X: x, Y: frame.FirstRow(), Button: tea.MouseButtonLeft, Action: tea.MouseActionPress})
		m = next.(frame.Model)
	}
	if tab.Tree == nil || tab.Tree.Len() != 3 {
		t.Fatalf("the group opens with its ticket under it, and the tab holds %v", tab.Tree)
	}
	// The mark stands past the gutter, the way every column does. [[spec/design_output/tree-view#the-view-draws-a-tree]]
	if click(draw.GutterWide); tab.Tree.Len() != 2 || tab.Tree.At() != 0 {
		t.Fatalf("a press on the mark closes the group, and %d rows stand", tab.Tree.Len())
	}
	if click(draw.GutterWide + 1); tab.Tree.Len() != 3 {
		t.Fatalf("a press on the mark again opens it, and %d rows stand", tab.Tree.Len())
	}
	if click(6); tab.Tree.Len() != 3 {
		t.Fatalf("a press on the name selects and toggles nothing, and %d rows stand", tab.Tree.Len())
	}
	if tab.Tree.OnMark(0) || !tab.Tree.OnMark(draw.GutterWide) || tab.Tree.OnMark(draw.GutterWide+tree.MarkWide) {
		t.Fatal("the mark takes the two columns past the gutter on a group's row")
	}
	if rows := tab.Tree.Rows(120, 2); !strings.Contains(rows, "▌") {
		t.Fatalf("the selected row wears the bar in the gutter, and the rows read %q", rows)
	}
}

func TestTheWorkTabRedrawsOnAWatchedChange(t *testing.T) {
	t.Parallel()
	fake := v1Fake(t)
	tab := New(filepath.Join(t.TempDir(), ".se", ".log", "session.jsonl"))
	tab.From = fake
	m := frame.New(tab.Path, time.UTC, []frame.Tab{tab})
	value, _ := json.Marshal(v1Rows[:1])
	handled, next := tab.Update(&m, registry.Change{Name: "work/rows", Revision: 2, Value: value})
	if !handled || next == nil {
		t.Fatalf("the change lands %v, and wants the tab to take it and watch on", handled)
	}
	if tab.Tree == nil {
		t.Fatal("the tab draws no tree off the change")
	}
	if _, stands := itemsByName(tab.Tree)["a-todo"]; stands {
		t.Fatal("the todo stands after a change that drops it")
	}
}

func TestTheCountReadsWorkOpenTasks(t *testing.T) {
	t.Parallel()
	tab := New(filepath.Join(t.TempDir(), ".se", ".log", "session.jsonl"))
	tab.From = v1Fake(t)
	m := frame.New(tab.Path, time.UTC, []frame.Tab{tab})
	tab.Update(&m, registry.Change{Name: "work/open-tasks", Revision: 2, Value: json.RawMessage("3")})
	if said := tab.Label(&m); said != "work (3)" {
		t.Fatalf("the label reads %q, and wants work (3)", said)
	}
}

// The window counts nothing of its own, so the name stands bare until work/open-tasks answers. [[spec/tickets/the-count-chain-leaves]]
func TestTheLabelDrawsNoCountBeforeTheIndexAnswersOne(t *testing.T) {
	t.Parallel()
	if said := New(filepath.Join(t.TempDir(), "session.jsonl")).Label(nil); said != "work" {
		t.Fatalf("the label reads %q before any count, and wants work alone", said)
	}
}

// A row at place zero keeps the state the rows answer, since the held rule stands in the tickets module alone. [[spec/tickets/the-window-held-override-goes]]
func TestARowInHandKeepsTheStateTheRowsAnswer(t *testing.T) {
	t.Parallel()
	base, err := os.ReadFile(filepath.Join("..", "..", "..", "spec", "views", "work.base"))
	if err != nil {
		t.Fatal(err)
	}
	grid, err := ViewOver(string(base), []IndexRow{{Name: "in-hand", Kind: "ticket", State: "open", Queue: "0"}})
	if err != nil {
		t.Fatal(err)
	}
	if said := itemsByName(grid)["in-hand"].Keys["state"]; said != "open" {
		t.Fatalf("the row at place zero reads state %q, and the rows answer open", said)
	}
}

// The rows and the count land, and the tab writes nothing back, so the session log holds no row of the window's own. [[spec/tickets/the-tui-data-paths-leave]]
func TestTheWorkTabWritesNoRowOfItsOwn(t *testing.T) {
	t.Parallel()
	m, tab, _ := actionWindow(t, everyResult)
	tab.Update(&m, registry.Change{Name: badgeName, Revision: 2, Value: json.RawMessage("2")})
	if !tab.counted {
		t.Fatal("the count lands on the tab")
	}
	wroteNothing(t, tab)
}

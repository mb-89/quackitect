// The registry tabs drawn over a fake catalog: index, cli and help.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import (
	"errors"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
)

const (
	caseWide = 200
	caseHigh = 30
)

func TestMain(m *testing.M) {
	draw.LoadColoursForCases(filepath.Join("..", "..", ".."))
	m.Run()
}

// The window over one tab, with the tab's first fetch landed. [[spec/design_output/model#the-registry-tabs]]
func drawn(t *testing.T, tab *Tab, pane frame.Pane) frame.Model {
	t.Helper()
	m := frame.New("", time.UTC, []frame.Tab{tab})
	m.W, m.H = caseWide, caseHigh
	m.Pane = pane
	m.Resize()
	if cmd := tab.Init(&m); cmd != nil {
		if msg := cmd(); msg != nil {
			next, _ := m.Update(msg)
			m = next.(frame.Model)
		}
	}
	m.LoadPane()
	return m
}

var fakeNames = []map[string]any{
	{"name": "work/open-tasks", "provider": map[string]any{"name": "work/open-tasks", "kind": "derived"}, "state": "answered", "value": 3},
	{"name": "config/depth", "provider": map[string]any{"name": "config/depth", "kind": "derived"}, "state": "default", "value": 2},
}

var fakeActions = []map[string]any{
	{"name": "work/pull", "doc": "pulls the next ticket", "fields": []map[string]any{{"Name": "Ticket", "Key": "ticket", "Label": "Ticket", "Doc": "the ticket to pull"}}},
}

// [[spec/design_output/model#the-registry-tabs]]
func TestTheIndexTabDrawsTheFakeCatalog(t *testing.T) {
	view := drawn(t, Index(Fake{Values: map[string]any{NamesName: fakeNames}}), frame.PaneShut).View()
	for _, want := range []string{"name", "provider", "state", "value", "work/open-tasks", "answered", "config/depth", "default", "derived"} {
		if !strings.Contains(view, want) {
			t.Fatalf("the index tab draws no %q:\n%s", want, view)
		}
	}
}

// Two ports carrying their q.Doc, so the help tab reads what the registration gives. [[spec/design_output/model#the-options]]
func documented(c *q.Catalog) {
	q.OutIn(c, "t/depth", 0, q.Doc("how deep the tree reads"))
	q.OutIn(c, "t/width", "", q.Doc("how wide a row draws"))
}

// [[spec/design_output/model#the-registry-tabs]]
func TestTheHelpTabReadsEachDocAsTheRegistrationGivesIt(t *testing.T) {
	store := qtest.New(t, documented).Store()
	docs := []map[string]any{}
	wants := map[string]string{}
	for _, name := range store.Names() {
		looks, _ := store.Presentation(name)
		docs = append(docs, map[string]any{"name": name, "kind": "name", "doc": looks.Doc})
		wants[name] = looks.Doc
	}
	tab := Help(Fake{Values: map[string]any{DocsName: docs}})
	view := drawn(t, tab, frame.PaneShut).View()
	for _, name := range []string{"t/depth", "t/width"} {
		if wants[name] == "" || !strings.Contains(view, wants[name]) {
			t.Fatalf("the help tab draws no doc %q for %s:\n%s", wants[name], name, view)
		}
	}
	for at, row := range tab.All {
		if said, _ := row.Field("doc"); said != wants[docs[at]["name"].(string)] {
			t.Fatalf("the help tab reads the doc of %v as %q, not its q.Doc", docs[at]["name"], said)
		}
	}
}

// [[spec/design_output/model#the-registry-tabs]]
func TestTheCliTabShowsTheCommandLineOfAnAction(t *testing.T) {
	m := drawn(t, Cli(Fake{Values: map[string]any{ActionsName: fakeActions}}), frame.PaneDetails)
	view := m.View()
	for _, want := range []string{"work/pull", "pulls the next ticket", "quack run work/pull --ticket", "the ticket to pull"} {
		if !strings.Contains(view, want) {
			t.Fatalf("the cli tab draws no %q:\n%s", want, view)
		}
	}
}

// [[spec/design_output/model#the-registry-tabs]]
func TestADoorAnsweringAnErrorDrawsItsReason(t *testing.T) {
	view := drawn(t, Index(Fake{Err: errors.New("the index stands down")}), frame.PaneShut).View()
	if !strings.Contains(view, "the index stands down") {
		t.Fatalf("the index tab draws no reason for the error:\n%s", view)
	}
}

// The frame hands each arrival to every tab, so a tab takes the fetch naming it alone. [[spec/design_output/model#the-registry-tabs]]
func TestATabTakesOnlyItsOwnFetch(t *testing.T) {
	values := map[string]any{NamesName: fakeNames, DocsName: []map[string]any{}}
	index, help := Index(Fake{Values: values}), Help(Fake{Values: values})
	m := frame.New("", time.UTC, []frame.Tab{index, help})
	msg := index.Init(&m)()
	if took, _ := help.Update(&m, msg); took {
		t.Fatalf("the help tab takes the index tab's fetch")
	}
	if took, _ := index.Update(&m, msg); !took {
		t.Fatalf("the index tab leaves its own fetch")
	}
	if len(index.All) != len(fakeNames) {
		t.Fatalf("the index tab holds %d rows, not %d", len(index.All), len(fakeNames))
	}
}

// A name arriving above the selection leaves the cursor on the name it stood on. [[spec/tickets/a-refetch-keeps-the-selection]]
func TestARefetchKeepsTheSelectedName(t *testing.T) {
	tab := Index(Fake{Values: map[string]any{NamesName: fakeNames}})
	m := drawn(t, tab, frame.PaneShut)
	tab.Move(&m, 1)
	rows := []Row{{"name": "work/open-tasks"}, {"name": "config/arrives"}, {"name": "config/depth"}}
	tab.Update(&m, fetched{tab: tab.name, rows: rows})
	if said := tab.Selected(&m); said != "config/depth" {
		t.Fatalf("the cursor stays on config/depth across the refetch, and stands on %q", said)
	}
	tab.Update(&m, fetched{tab: tab.name, err: errors.New("the door refuses")})
	if said := tab.Selected(&m); said != "config/depth" {
		t.Fatalf("a refused fetch keeps the rows and the cursor, and the cursor stands on %q", said)
	}
}

// The filter line narrows the rows, and the cursor moves inside what stays. [[spec/design_output/model#the-registry-tabs]]
func TestTheFilterLineNarrowsTheRowsAndTheCursorMovesInThem(t *testing.T) {
	tab := Index(Fake{Values: map[string]any{NamesName: fakeNames}})
	m := drawn(t, tab, frame.PaneShut)
	if err := tab.Narrow(&m, "name: config"); err != nil {
		t.Fatal(err)
	}
	if len(tab.View) != 1 || tab.Selected(&m) != "config/depth" {
		t.Fatalf("the filter keeps %d rows with %q selected, not config/depth alone", len(tab.View), tab.Selected(&m))
	}
	if err := tab.Narrow(&m, ""); err != nil {
		t.Fatal(err)
	}
	tab.Move(&m, 1)
	if tab.Selected(&m) != "config/depth" {
		t.Fatalf("one step down selects %q, not config/depth", tab.Selected(&m))
	}
}

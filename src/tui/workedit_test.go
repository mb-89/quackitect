// The edit in the work tab: the cursor picks a column, a key opens the cell,
// Enter writes the ticket's front, and the schema refuses a field the verbs own.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package main

import (
	"os" // level0: OutsideInDoors - the cases read the ticket schema the tree ships, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
	"testing/fstest"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
	"quackitect/src/tui/work"
)

// The result each action the work tab posts answers over the fake. [[spec/tickets/the-work-keys-call-actions]]
var workResults = map[string]any{"work/place": "placed", "tickets/flip-urgent": "flipped", "tickets/set-field": "set", "work/pull": "pulled"}

// The window over the rows a catalog answers, and the schema this tree ships in a fake tree, answering the posts the tab makes. [[spec/design_output/tui#the-work-tab-takes-edits]]
func editWindow(t *testing.T) (frame.Model, *[]registry.Posted) {
	t.Helper()
	schema, err := os.ReadFile(filepath.Join("..", "..", work.TicketSchemaAt))
	if err != nil {
		t.Fatalf("this tree ships %s, and it read %v", work.TicketSchemaAt, err)
	}
	path := logOf(workTree(t))
	held := loadWork(t, workRowsSaid)
	// The shipped table draws no front field a person writes, so the edit road runs over the columns a case adds. [[spec/design_output/tui#the-work-tab-takes-edits]]
	for _, key := range []string{"group", "step", "reason", "urgent", "kind"} {
		held.Cols = append(held.Cols, tree.Column{Name: key, Key: key, Wide: tree.ColumnWide})
	}
	m := newModel(path, time.UTC)
	m.W, m.H = 120, 24
	theWork(m).Tree = held
	// The tab posts through a fake, so no case reaches an index standing on this box. [[spec/tickets/the-work-keys-call-actions]]
	fake := workCatalog(t, workRowsSaid)
	posted := &[]registry.Posted{}
	fake.Results, fake.Posted = workResults, posted
	theWork(m).From = fake
	theWork(m).Files = fstest.MapFS{work.TicketSchemaAt: {Data: schema}}
	m.OpenTab(m.TabNamed("work"))
	return m, posted
}

func pressed(m frame.Model, keys ...string) frame.Model {
	for _, one := range keys {
		var msg tea.KeyMsg
		switch one {
		case "enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		case "esc":
			msg = tea.KeyMsg{Type: tea.KeyEscape}
		case "alt+enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter, Alt: true}
		case "tab":
			msg = tea.KeyMsg{Type: tea.KeyTab}
		case "left":
			msg = tea.KeyMsg{Type: tea.KeyLeft}
		case "right":
			msg = tea.KeyMsg{Type: tea.KeyRight}
		case "backspace":
			msg = tea.KeyMsg{Type: tea.KeyBackspace}
		default:
			msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(one)}
		}
		next, _ := m.Update(msg)
		m = next.(frame.Model)
	}
	return m
}

func toColumn(m frame.Model, key string) frame.Model {
	for at, col := range theWork(m).Tree.Cols {
		if col.Key == key {
			theWork(m).Tree.CursorTo(at)
		}
	}
	return m
}

func toRow(m frame.Model, name string) frame.Model {
	held := theWork(m).Tree
	for at := 0; at < held.Len(); at++ {
		held.MoveTo(at)
		if held.Selected().Name == name {
			break
		}
	}
	return m
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func TestTheSchemaNamesWhatAFieldTakesAndWhoOwnsIt(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", work.TicketSchemaAt))
	if err != nil {
		t.Fatal(err)
	}
	said := work.SchemaOf(string(text))
	if got := said.Takes("state"); strings.Join(got, " ") != "draft open closed" {
		t.Fatalf("the state takes the three words the schema names, and reads %v", got)
	}
	for _, key := range []string{"state", "step", "steps", "record"} {
		if !said.Owned(key) {
			t.Fatalf("%s is the verbs' to write, and the schema says so", key)
		}
	}
	for _, key := range []string{"group", "urgent", "todo"} {
		if said.Owned(key) || !said.Knows(key) {
			t.Fatalf("%s is a person's to write, and the schema knows it", key)
		}
	}
	if said.Knows("standing") || said.Refuses("standing") == "" {
		t.Fatal("a column the index derives stands in no front, and the tab refuses it")
	}
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func TestAFieldTheVerbsOwnRefusesTheEdit(t *testing.T) {
	t.Parallel()
	m, posted := editWindow(t)
	// The state stands in the flags now, so the step is the column the verbs own. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	for _, key := range []string{"step"} {
		held := toRow(toColumn(m, key), "a-child")
		held = opened(held)
		if theWork(held).Tree.Editing() {
			t.Fatalf("no edit opens on %s", key)
		}
		if !strings.Contains(theWork(held).Notice, "the verbs' to write") || !strings.Contains(theWork(held).Notice, "./RUNME.sh ticket") {
			t.Fatalf("the tab says the verbs own %s, and says %q", key, theWork(held).Notice)
		}
		if !strings.Contains(held.View(), "the verbs' to write") {
			t.Fatal("the notice draws in the tab")
		}
	}
	held := opened(toRow(toColumn(m, "queue"), "a-child"))
	if theWork(held).Tree.Editing() || !strings.Contains(theWork(held).Notice, "no ticket's front") {
		t.Fatalf("a column the index derives refuses the edit, and the tab says %q", theWork(held).Notice)
	}
	if len(*posted) != 0 {
		t.Fatalf("a refused edit posts nothing, and the tab posts %+v", *posted)
	}
}

// The e key opens the cell under the column cursor. [[spec/design_output/tui#the-work-tab-takes-edits]]
func opened(m frame.Model) frame.Model {
	return pressed(m, "e")
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func TestTheCursorMovesAcrossTheColumnsAndTheHeaderLightsIt(t *testing.T) {
	t.Parallel()
	m, _ := editWindow(t)
	theWork(m).Tree.MoveCursor(1)
	theWork(m).Tree.MoveCursor(1)
	if theWork(m).Tree.Cursor() != 2 {
		t.Fatalf("two moves stand on the third column, and the cursor stands at %d", theWork(m).Tree.Cursor())
	}
	for range 3 {
		theWork(m).Tree.MoveCursor(-1)
	}
	if theWork(m).Tree.Cursor() != 0 {
		t.Fatal("the cursor stops at the first column")
	}
	theWork(m).Tree.Schema = theWork(m).TicketRules()
	// The lit cell opens with the open style's own sequence, whatever width the column takes. [[spec/design_output/tree-view#a-cell-takes-an-edit]]
	lit := draw.Open.Render("name")
	lit = lit[:strings.Index(lit, "name")+len("name")]
	if !strings.Contains(theWork(m).Tree.Header(120), lit) || lit == "name" {
		t.Fatalf("the column under the cursor stands lit, and the header reads %q", theWork(m).Tree.Header(120))
	}
}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func TestTheSchemaOffersItsEnumItsConstAndTheTwoFlags(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", work.TicketSchemaAt))
	if err != nil {
		t.Fatal(err)
	}
	said := work.SchemaOf(string(text))
	cases := map[string]string{"reason": "done dropped became answered", "kind": "ticket", "urgent": "true false", "todo": "true false", "group": ""}
	for key, want := range cases {
		if got := strings.Join(said.Takes(key), " "); got != want {
			t.Fatalf("%s offers %q, and offers %q", key, want, got)
		}
	}
	takes := [][2]string{{"reason", "done"}, {"reason", ""}, {"urgent", "true"}, {"todo", "a-loose-one"}, {"group", "any-group"}, {"kind", "ticket"}}
	for _, one := range takes {
		if why := said.Weighs(one[0], one[1]); why != "" {
			t.Fatalf("%s takes %q, and the schema says %q", one[0], one[1], why)
		}
	}
	refuses := map[[2]string]string{
		{"reason", "later"}: "reason takes done, dropped, became, answered alone",
		{"urgent", "maybe"}: "urgent takes a boolean",
		{"kind", "note"}:    "kind takes ticket alone",
		{"kind", ""}:        "kind stands in every ticket",
		{"state", "open"}:   "the verbs' to write",
		{"record", "x"}:     "the verbs' to write",
		{"standing", "x"}:   "no ticket's front",
	}
	for one, want := range refuses {
		if why := said.Weighs(one[0], one[1]); !strings.Contains(why, want) {
			t.Fatalf("%s refuses %q saying %q, and says %q", one[0], one[1], want, why)
		}
	}
}

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func TestTheColumnKeysMoveTheCursorAndEOpensTheCellUnderIt(t *testing.T) {
	t.Parallel()
	m, _ := editWindow(t)
	m = pressed(toRow(m, "a-child"), "d", "right", "a")
	if theWork(m).Tree.Cursor() != 1 {
		t.Fatalf("d and right step right and a steps left, and the cursor stands at %d", theWork(m).Tree.Cursor())
	}
	m = toColumn(m, "group")
	m = pressed(m, "e")
	if !theWork(m).Tree.Editing() || theWork(m).Tree.Typed() != "one-group" {
		t.Fatalf("e opens the cell under the cursor, and the edit holds %q", theWork(m).Tree.Typed())
	}
	// A free field offers the values standing in the data, and a line matching none names the keys. [[spec/design_output/tree-view#the-completion-knows-the-field]]
	if !strings.Contains(m.View(), "tab takes one-group") {
		t.Fatal("an open edit on a free field offers the values standing in the data")
	}
	if m = pressed(m, "z", "z"); !strings.Contains(m.View(), "alt+enter fills every row") {
		t.Fatal("an edit matching no value names its keys on the tab's last line")
	}
}

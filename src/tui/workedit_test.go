// The edit in the work tab: the cursor picks a column, a key opens the cell,
// Enter writes the ticket's front, and the schema refuses a field the verbs own.
// [[spec/design_output/tui#the-work-tab-takes-edits]]

package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/draw"
	"quackitect/tui/frame"
	"quackitect/tui/tree"
	"quackitect/tui/work"
)

const childNote = `---
kind: [[ticket]]
state: open
group: one-group
process: [[trivial]]
step: do
steps:
  - name: do
---

# Ask

One piece of it.

# do

# Discussion
`

// The window over a tree with a door standing, the schema this tree ships, and one ticket on disk. [[spec/design_output/tui#the-work-tab-takes-edits]]
func editWindow(t *testing.T) (frame.Model, string) {
	t.Helper()
	root := workTree(t)
	schema, err := os.ReadFile(filepath.Join("..", "..", work.TicketSchemaAt))
	if err != nil {
		t.Fatalf("this tree ships %s, and it read %v", work.TicketSchemaAt, err)
	}
	writeAt(t, root, work.TicketSchemaAt, string(schema))
	writeAt(t, root, "spec/tickets/a-child.md", childNote)
	path := logOf(root)
	held, err := work.Load(path)
	if err != nil {
		t.Fatal(err)
	}
	// The shipped table draws no group column, so the edit road runs over one a case adds. [[spec/design_output/tui#the-work-tab-takes-edits]]
	held.Cols = append(held.Cols, tree.Column{Name: "group", Key: "group", Wide: tree.ColumnWide}, tree.Column{Name: "step", Key: "step", Wide: tree.ColumnWide})
	m := newModel(path, time.UTC)
	m.W, m.H = 120, 24
	theWork(m).Tree = held
	m.OpenTab(m.TabNamed("work"))
	return m, root
}

func pressed(m frame.Model, keys ...string) frame.Model {
	for _, one := range keys {
		var msg tea.KeyMsg
		switch one {
		case "enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		case "esc":
			msg = tea.KeyMsg{Type: tea.KeyEscape}
		case "shift+enter":
			msg = tea.KeyMsg{Type: tea.KeyShiftTab}
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

func noteAt(t *testing.T, root string) string {
	t.Helper()
	said, err := os.ReadFile(filepath.Join(root, "spec", "tickets", "a-child.md"))
	if err != nil {
		t.Fatal(err)
	}
	return string(said)
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

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func TestAnEditInTheWorkTabWritesTheFieldToTheTicket(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = toRow(toColumn(m, "group"), "a-child")
	m = opened(m)
	if !theWork(m).Tree.Editing() || theWork(m).Tree.Typed() != "one-group" {
		t.Fatalf("the edit opens on the group the cell holds, and holds %q", theWork(m).Tree.Typed())
	}
	m = pressed(m, "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "t", "w", "o", "-", "g", "r", "o", "u", "p", "enter")
	if theWork(m).Tree.Editing() {
		t.Fatal("enter closes the edit")
	}
	if theWork(m).Notice != "" {
		t.Fatalf("a write that lands names nothing, and the tab says %q", theWork(m).Notice)
	}
	if !strings.Contains(noteAt(t, root), "\ngroup: two-group\n") {
		t.Fatalf("enter writes the field into the ticket's front, and the note reads:\n%s", noteAt(t, root))
	}
	if strings.Contains(noteAt(t, root), "edited") {
		t.Fatal("the key naming the edit reaches no file")
	}
}

// [[spec/design_output/tree-view#a-cell-takes-an-edit]]
func TestEscapePutsTheOldValueBackAndWritesNothing(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = toRow(toColumn(m, "group"), "a-child")
	m = pressed(opened(m), "x", "esc")
	if theWork(m).Tree.Editing() {
		t.Fatal("escape closes the edit")
	}
	if noteAt(t, root) != childNote {
		t.Fatal("escape writes nothing")
	}
}

// [[spec/design_output/schema#the-verbs-own-their-fields]]
func TestAFieldTheVerbsOwnRefusesTheEdit(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	// The state stands in the flags now, so the step is the column the verbs own. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	for _, key := range []string{"step"} {
		held := toRow(toColumn(m, key), "a-child")
		held = opened(held)
		if theWork(held).Tree.Editing() {
			t.Fatalf("no edit opens on %s", key)
		}
		if !strings.Contains(theWork(held).Notice, "the verbs' to write") {
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
	if noteAt(t, root) != childNote {
		t.Fatal("a refused edit writes nothing")
	}
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func TestAKeyFlipsAMarkAndWritesIt(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = toRow(m, "a-child")
	// The index calls the row urgent, so the first press turns the mark off, and a note carrying none drops nothing. [[spec/design_output/tui#the-work-tab-takes-edits]]
	m = pressed(m, "u")
	if theWork(m).Tree.Selected().Keys[work.UrgentKey] != work.FlagOff || noteAt(t, root) != childNote {
		t.Fatalf("u turns the mark off, the tab says %q, and the note reads:\n%s", theWork(m).Notice, noteAt(t, root))
	}
	m = pressed(m, "u")
	if !strings.Contains(noteAt(t, root), "\nurgent: true\n") {
		t.Fatalf("u writes the urgent mark on, the tab says %q, and the note reads:\n%s", theWork(m).Notice, noteAt(t, root))
	}
	if theWork(m).Tree.Selected().Keys[work.UrgentKey] != work.FlagOn {
		t.Fatal("the row wears the mark the moment the key flips it")
	}
	m = pressed(m, "u")
	said := noteAt(t, root)
	if strings.Contains(said, "urgent") {
		t.Fatalf("a mark flipped off leaves the front, and the note reads:\n%s", said)
	}
	// The todo takes no key of its own, because a place is the todo. [[spec/design_output/pull#a-todo-forces-a-place]]
	if m = pressed(m, "t"); strings.Contains(noteAt(t, root), "todo") {
		t.Fatal("t writes nothing")
	}
}

// The cell edit stays a road of the tree, and the work tab binds no key to it. [[spec/design_output/tui#the-work-tab-takes-edits]]
func opened(m frame.Model) frame.Model {
	theWork(m).OpenEdit()
	return m
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

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func TestAFrontTakesAFieldSetDroppedAndAdded(t *testing.T) {
	t.Parallel()
	said, ok := work.WithField("---\nkind: [[ticket]]\ngroup: one\n---\n\nbody\n", "group", "two")
	if !ok || !strings.Contains(said, "\ngroup: two\n") {
		t.Fatalf("a field standing takes the value, and reads:\n%s", said)
	}
	said, _ = work.WithField("---\nkind: [[ticket]]\ngroup: one\n---\n\nbody\n", "group", "")
	if strings.Contains(said, "group") {
		t.Fatal("an empty value drops the field")
	}
	said, _ = work.WithField("---\nkind: [[ticket]]\n---\n\nbody\n", "urgent", "true")
	if !strings.HasPrefix(said, "---\nkind: [[ticket]]\nurgent: true\n---\n") {
		t.Fatalf("a field standing nowhere lands before the closing fence, and reads:\n%s", said)
	}
	said, _ = work.WithField("---\nkind: [[ticket]]\n---\n", "group", "a: b")
	if !strings.Contains(said, `group: "a: b"`) {
		t.Fatalf("a value a reader trips on stands quoted, and reads:\n%s", said)
	}
	if _, ok := work.WithField("no front here\n", "group", "two"); ok {
		t.Fatal("a note with no front takes no field")
	}
}

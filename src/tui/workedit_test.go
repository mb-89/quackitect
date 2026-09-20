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
func editWindow(t *testing.T) (model, string) {
	t.Helper()
	root := workTree(t)
	schema, err := os.ReadFile(filepath.Join("..", "..", ticketSchemaAt))
	if err != nil {
		t.Fatalf("this tree ships %s, and it read %v", ticketSchemaAt, err)
	}
	writeAt(t, root, ticketSchemaAt, string(schema))
	writeAt(t, root, "spec/tickets/a-child.md", childNote)
	path := logOf(root)
	tree, err := loadWork(path)
	if err != nil {
		t.Fatal(err)
	}
	m := newModel(path, time.UTC)
	m.w, m.h = 120, 24
	m.work = tree
	m.openTab(m.tabNamed("work"))
	return m, root
}

func pressed(m model, keys ...string) model {
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
		m = next.(model)
	}
	return m
}

func toColumn(m model, key string) model {
	for at, col := range m.work.Cols {
		if col.Key == key {
			m.work.cur = at
		}
	}
	return m
}

func toRow(m model, name string) model {
	for at, one := range m.work.flat {
		if one.item.Name == name {
			m.work.MoveTo(at)
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
	text, err := os.ReadFile(filepath.Join("..", "..", ticketSchemaAt))
	if err != nil {
		t.Fatal(err)
	}
	said := schemaOf(string(text))
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
	if said.Knows("standing") || said.refuses("standing") == "" {
		t.Fatal("a column the index derives stands in no front, and the tab refuses it")
	}
}

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func TestAnEditInTheWorkTabWritesTheFieldToTheTicket(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = toRow(toColumn(m, "group"), "a-child")
	m = pressed(m, "e")
	if !m.work.Editing() || m.work.Typed() != "one-group" {
		t.Fatalf("the edit opens on the group the cell holds, and holds %q", m.work.Typed())
	}
	m = pressed(m, "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "t", "w", "o", "-", "g", "r", "o", "u", "p", "enter")
	if m.work.Editing() {
		t.Fatal("enter closes the edit")
	}
	if m.workNotice != "" {
		t.Fatalf("a write that lands names nothing, and the tab says %q", m.workNotice)
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
	m = pressed(m, "e", "x", "esc")
	if m.work.Editing() {
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
	for _, key := range []string{"state", "step"} {
		held := toRow(toColumn(m, key), "a-child")
		held = pressed(held, "e")
		if held.work.Editing() {
			t.Fatalf("no edit opens on %s", key)
		}
		if !strings.Contains(held.workNotice, "the verbs' to write") {
			t.Fatalf("the tab says the verbs own %s, and says %q", key, held.workNotice)
		}
		if !strings.Contains(held.View(), "the verbs' to write") {
			t.Fatal("the notice draws in the tab")
		}
	}
	held := pressed(toRow(toColumn(m, "standing"), "a-child"), "e")
	if held.work.Editing() || !strings.Contains(held.workNotice, "no ticket's front") {
		t.Fatalf("a column the index derives refuses the edit, and the tab says %q", held.workNotice)
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
	if m.work.Selected().Keys[urgentKey] != flagOff || noteAt(t, root) != childNote {
		t.Fatalf("u turns the mark off, the tab says %q, and the note reads:\n%s", m.workNotice, noteAt(t, root))
	}
	m = pressed(m, "u")
	if !strings.Contains(noteAt(t, root), "\nurgent: true\n") {
		t.Fatalf("u writes the urgent mark on, the tab says %q, and the note reads:\n%s", m.workNotice, noteAt(t, root))
	}
	if m.work.Selected().Keys[urgentKey] != flagOn {
		t.Fatal("the row wears the mark the moment the key flips it")
	}
	m = pressed(m, "u", "t")
	said := noteAt(t, root)
	if strings.Contains(said, "urgent") || !strings.Contains(said, "\ntodo: true\n") {
		t.Fatalf("a mark flipped off leaves the front, and t writes the todo mark, and the note reads:\n%s", said)
	}
}

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func TestTheCursorMovesAcrossTheColumnsAndTheHeaderLightsIt(t *testing.T) {
	t.Parallel()
	m, _ := editWindow(t)
	m = pressed(m, "d", "d")
	if m.work.Cursor() != 2 {
		t.Fatalf("two presses of d stand on the third column, and the cursor stands at %d", m.work.Cursor())
	}
	m = pressed(m, "a", "a", "a")
	if m.work.Cursor() != 0 {
		t.Fatal("the cursor stops at the first column")
	}
	m.work.Schema = m.ticketRules()
	if !strings.Contains(m.work.Header(120), openStyle.Render(pad("name", 34))) {
		t.Fatalf("the column under the cursor stands lit, and the header reads %q", m.work.Header(120))
	}
}

// [[spec/design_output/tui#the-work-tab-takes-edits]]
func TestAFrontTakesAFieldSetDroppedAndAdded(t *testing.T) {
	t.Parallel()
	said, ok := withField("---\nkind: [[ticket]]\ngroup: one\n---\n\nbody\n", "group", "two")
	if !ok || !strings.Contains(said, "\ngroup: two\n") {
		t.Fatalf("a field standing takes the value, and reads:\n%s", said)
	}
	said, _ = withField("---\nkind: [[ticket]]\ngroup: one\n---\n\nbody\n", "group", "")
	if strings.Contains(said, "group") {
		t.Fatal("an empty value drops the field")
	}
	said, _ = withField("---\nkind: [[ticket]]\n---\n\nbody\n", "urgent", "true")
	if !strings.HasPrefix(said, "---\nkind: [[ticket]]\nurgent: true\n---\n") {
		t.Fatalf("a field standing nowhere lands before the closing fence, and reads:\n%s", said)
	}
	said, _ = withField("---\nkind: [[ticket]]\n---\n", "group", "a: b")
	if !strings.Contains(said, `group: "a: b"`) {
		t.Fatalf("a value a reader trips on stands quoted, and reads:\n%s", said)
	}
	if _, ok := withField("no front here\n", "group", "two"); ok {
		t.Fatal("a note with no front takes no field")
	}
}

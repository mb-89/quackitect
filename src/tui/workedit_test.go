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

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
	"quackitect/src/tui/work"
)

// How long a case waits on the command a key hands back. [[spec/tickets/the-work-keys-call-actions]]
const postWithin = time.Second

// The result each action the work tab posts answers over the fake. [[spec/tickets/the-work-keys-call-actions]]
var workResults = map[string]any{"work/place": "placed", "tickets/flip-urgent": "flipped", "tickets/set-field": "set", "work/pull": "pulled"}

// The posts the window's fake keeps. [[spec/tickets/the-work-keys-call-actions]]
func postsIn(m frame.Model) []registry.Posted {
	return *theWork(m).From.(registry.Fake).Posted
}

// Each key reaches the window, and the message its command answers comes back to it, so a post runs the way the program runs it. [[spec/tickets/the-work-keys-call-actions]]
func posting(m frame.Model, keys ...string) frame.Model {
	for _, one := range keys {
		var msg tea.Msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(one)}
		if one == "enter" {
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		}
		for msg != nil {
			next, cmd := m.Update(msg)
			m, msg = next.(frame.Model), answerOf(cmd)
		}
	}
	return m
}

// The message a command answers within the wait, the first of a batch that answers one, and nothing past the wait. [[spec/tickets/the-work-keys-call-actions]]
func answerOf(cmd tea.Cmd) tea.Msg {
	if cmd == nil {
		return nil
	}
	said := make(chan tea.Msg, 1)
	go func() { said <- cmd() }()
	select {
	case msg := <-said:
		if batch, ok := msg.(tea.BatchMsg); ok {
			for _, one := range batch {
				if got := answerOf(one); got != nil {
					return got
				}
			}
			return nil
		}
		return msg
	case <-time.After(postWithin):
		return nil
	}
}

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

// The window over the rows a catalog answers, the schema this tree ships, and one ticket on disk. [[spec/design_output/tui#the-work-tab-takes-edits]]
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
	fake.Results, fake.Posted = workResults, &[]registry.Posted{}
	theWork(m).From = fake
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
func TestAnEditInTheWorkTabPostsTheFieldToItsAction(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = toRow(toColumn(m, "group"), "a-child")
	m = opened(m)
	if !theWork(m).Tree.Editing() || theWork(m).Tree.Typed() != "one-group" {
		t.Fatalf("the edit opens on the group the cell holds, and holds %q", theWork(m).Tree.Typed())
	}
	m = pressed(m, "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "t", "w", "o", "-", "g", "r", "o", "u", "p")
	m = posting(m, "enter")
	if theWork(m).Tree.Editing() {
		t.Fatal("enter closes the edit")
	}
	posts := postsIn(m)
	if len(posts) != 1 || posts[0].Name != "tickets/set-field" || string(posts[0].Input) != `{"name":"a-child","field":"group","value":"two-group"}` {
		t.Fatalf("enter posts the field to tickets/set-field, and posts %+v", posts)
	}
	if noteAt(t, root) != childNote {
		t.Fatal("the tab writes no file, and the verb behind the action writes the front")
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
	if noteAt(t, root) != childNote {
		t.Fatal("a refused edit writes nothing")
	}
}

// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
func TestTheUrgentKeyPostsAFlipAndWritesNothing(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = posting(toRow(m, "a-child"), "u")
	posts := postsIn(m)
	if len(posts) != 1 || posts[0].Name != "tickets/flip-urgent" || string(posts[0].Input) != `{"name":"a-child"}` {
		t.Fatalf("u posts tickets/flip-urgent for the row, and posts %+v", posts)
	}
	if noteAt(t, root) != childNote {
		t.Fatal("the tab writes no file, and the verb behind the action writes the mark")
	}
	// The todo takes no key of its own, because a place is the todo. [[spec/design_output/pull#a-todo-forces-a-place]]
	if m = posting(m, "t"); len(postsIn(m)) != 1 {
		t.Fatal("t posts nothing")
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

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func TestTheCellOffersWhatTheSchemaNamesAndTabTakesIt(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = pressed(toColumn(toRow(m, "a-child"), "reason"), "e")
	if got := strings.Join(theWork(m).Tree.Offer(), " "); got != "done dropped became answered" {
		t.Fatalf("the reason offers the four the schema names, and offers %q", got)
	}
	if !strings.Contains(m.View(), "tab takes done · dropped") {
		t.Fatal("the offer draws on the tab's last line")
	}
	m = posting(pressed(m, "d", "r", "tab"), "enter")
	if posts := postsIn(m); len(posts) != 1 || string(posts[0].Input) != `{"name":"a-child","field":"reason","value":"dropped"}` || noteAt(t, root) != childNote {
		t.Fatalf("tab takes the offer and enter posts it, the tab says %q, and the fake keeps %+v", theWork(m).Notice, posts)
	}
	m = pressed(toColumn(m, "urgent"), "e", "backspace", "backspace", "backspace", "backspace")
	if got := strings.Join(theWork(m).Tree.Offer(), " "); got != "true false" {
		t.Fatalf("a flag offers the two it takes, and offers %q", got)
	}
}

// [[spec/design_output/tree-view#a-schema-refuses-a-value]]
func TestAValueTheSchemaRefusesNamesTheReasonAndWritesNothing(t *testing.T) {
	t.Parallel()
	m, root := editWindow(t)
	m = pressed(toColumn(toRow(m, "a-child"), "reason"), "e", "l", "a", "t", "e", "r", "enter")
	notice := theWork(m).Notice
	if !strings.Contains(notice, "reason takes done, dropped, became, answered alone") || !strings.Contains(notice, "a-child keeps the value") {
		t.Fatalf("a refused value names the schema's reason and the row, and the tab says %q", notice)
	}
	if !strings.Contains(m.View(), "reason takes done") {
		t.Fatal("the reason draws in the tab")
	}
	m = pressed(toColumn(m, "urgent"), "e", "backspace", "backspace", "backspace", "backspace", "backspace", "m", "alt+enter")
	if !strings.Contains(theWork(m).Notice, "urgent takes a boolean") || !strings.Contains(theWork(m).Notice, "one-group, a-child, a-loose-one") {
		t.Fatalf("a refused fill names every row it leaves, and the tab says %q", theWork(m).Notice)
	}
	if noteAt(t, root) != childNote {
		t.Fatalf("a refused value writes nothing, and the note reads:\n%s", noteAt(t, root))
	}
}

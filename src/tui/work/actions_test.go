// The work tab's keys post the actions the view file names, over the fake
// action door, and the tab writes no file of its own.
// [[spec/tickets/the-work-keys-call-actions]]

package work

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
	"quackitect/src/tui/tree"
)

// How long a case waits on the command a key hands back. [[spec/tickets/the-work-keys-call-actions]]
const keyWithin = 2 * time.Second

var actionRows = []map[string]any{
	{"name": "one-ticket", "kind": "ticket", "state": "open", "route": "standard", "path": "spec/tickets/one-ticket.md", "queue": "1", "group": "a-group"},
	{"name": "two-ticket", "kind": "ticket", "state": "open", "route": "standard", "path": "spec/tickets/two-ticket.md", "queue": "2", "group": "a-group"},
}

// The tab over the rows a case seeds, the schema this tree ships, and a fake door keeping every post. [[spec/tickets/the-work-keys-call-actions]]
func actionWindow(t *testing.T, results map[string]any) (frame.Model, *Tab, *[]registry.Posted) {
	t.Helper()
	fake := v1Fake(t)
	fake.Values[rowsName] = actionRows
	posted := &[]registry.Posted{}
	fake.Posted, fake.Results = posted, results
	schema, err := os.ReadFile(filepath.Join("..", "..", "..", filepath.FromSlash(TicketSchemaAt)))
	if err != nil {
		t.Fatal(err)
	}
	rules := SchemaOf(string(schema))
	tab := New(filepath.Join(t.TempDir(), ".se", ".log", "session.jsonl")) // level0: FixtureOutsideHome - the case reads that the tab writes nothing under a root of its own
	tab.From, tab.rules = fake, &rules
	m := frame.New(tab.Path, time.UTC, []frame.Tab{tab})
	m.W, m.H = 120, 24
	value, _ := json.Marshal(actionRows)
	tab.Update(&m, registry.Change{Name: rowsName, Revision: 1, Value: value})
	if tab.Tree == nil {
		t.Fatalf("the tab draws no tree: %s", tab.Why)
	}
	tab.Tree.Cols = append(tab.Tree.Cols, tree.Column{Name: "group", Key: "group", Wide: tree.ColumnWide})
	m.OpenTab(m.TabNamed("work"))
	return m, tab, posted
}

var everyResult = map[string]any{"work/place": "placed", "tickets/flip-urgent": "flipped", "tickets/set-field": "set", "work/pull": "pulled"}

// Each key reaches the window, and the message its command answers comes back to it, the way the program runs it. [[spec/tickets/the-work-keys-call-actions]]
func keyed(t *testing.T, m frame.Model, keys ...string) frame.Model {
	t.Helper()
	for _, one := range keys {
		var msg tea.Msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(one)}
		switch one {
		case "enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		case "alt+enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter, Alt: true}
		case "backspace":
			msg = tea.KeyMsg{Type: tea.KeyBackspace}
		case "tab":
			msg = tea.KeyMsg{Type: tea.KeyTab}
		}
		for msg != nil {
			next, cmd := m.Update(msg)
			m, msg = next.(frame.Model), answerOf(cmd)
		}
	}
	return m
}

// The message a command answers within the wait, each of a batch in turn, and nothing past the wait. [[spec/tickets/the-work-keys-call-actions]]
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
	case <-time.After(keyWithin):
		return nil
	}
}

func selectRow(t *testing.T, tab *Tab, name string) {
	t.Helper()
	for at := 0; at < tab.Tree.Len(); at++ {
		tab.Tree.MoveTo(at)
		if tab.Tree.Selected() != nil && tab.Tree.Selected().Name == name {
			return
		}
	}
	t.Fatalf("no row named %s stands in the tree", name)
}

// The posts the fake kept, each as its action and its input read back. [[spec/tickets/the-work-keys-call-actions]]
func postsOf(t *testing.T, posted []registry.Posted) []map[string]any {
	t.Helper()
	out := []map[string]any{}
	for _, one := range posted {
		input := map[string]any{}
		if err := json.Unmarshal(one.Input, &input); err != nil {
			t.Fatalf("the post of %s carries %s, which reads as no object", one.Name, one.Input)
		}
		input["action"] = one.Name
		out = append(out, input)
	}
	return out
}

// Nothing but the log folder the case hands the tab stands under its root. [[spec/tickets/the-work-keys-call-actions]]
func wroteNothing(t *testing.T, tab *Tab) {
	t.Helper()
	root := Root(tab.Path)
	_ = filepath.WalkDir(root, func(at string, entry os.DirEntry, err error) error {
		if err == nil && !entry.IsDir() {
			t.Errorf("the tab writes %s, and wants to write no file", at)
		}
		return nil
	})
}

func TestThePlaceChordPostsWorkPlace(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, everyResult)
	selectRow(t, tab, "two-ticket")
	m = keyed(t, m, "p")
	if !tab.Placing || !strings.Contains(tab.Notice, "1 to 9") {
		t.Fatalf("p opens the chord and says what it waits for, and the tab says %q", tab.Notice)
	}
	m = keyed(t, m, "1")
	posts := postsOf(t, *posted)
	if tab.Placing || len(posts) != 1 || posts[0]["action"] != "work/place" || posts[0]["name"] != "two-ticket" || posts[0]["n"] != float64(1) {
		t.Fatalf("p then 1 posts %v, and wants work/place with two-ticket at 1", posts)
	}
	selectRow(t, tab, "one-ticket")
	keyed(t, m, "p", "x")
	if tab.Placing || tab.Notice != "" || len(*posted) != 1 {
		t.Fatalf("a key that is no digit drops the chord and posts nothing, and the tab says %q", tab.Notice)
	}
	wroteNothing(t, tab)
}

func TestTheUrgentKeyPostsFlipUrgentForEveryMarkedRow(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, everyResult)
	selectRow(t, tab, "one-ticket")
	tab.Tree.Mark()
	selectRow(t, tab, "two-ticket")
	tab.Tree.Mark()
	m = keyed(t, m, "u")
	posts := postsOf(t, *posted)
	if len(posts) != 2 || posts[0]["action"] != "tickets/flip-urgent" || posts[1]["action"] != "tickets/flip-urgent" {
		t.Fatalf("u over two marked rows posts %v, and wants tickets/flip-urgent twice", posts)
	}
	if names := []any{posts[0]["name"], posts[1]["name"]}; !(names[0] == "one-ticket" && names[1] == "two-ticket" || names[0] == "two-ticket" && names[1] == "one-ticket") {
		t.Fatalf("u posts for %v, and wants both marked rows", names)
	}
	// The todo takes no key of its own, because a place is the todo. [[spec/design_output/pull#a-todo-forces-a-place]]
	if keyed(t, m, "t"); len(*posted) != 2 {
		t.Fatal("t posts nothing")
	}
	wroteNothing(t, tab)
}

func TestAnEditPostsSetFieldForEveryRowItWrites(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, everyResult)
	selectRow(t, tab, "one-ticket")
	tab.Tree.CursorTo(len(tab.Tree.Cols) - 1)
	m = keyed(t, m, "e")
	if !tab.Tree.Editing() || tab.Tree.Typed() != "a-group" {
		t.Fatalf("e opens the edit on the group the cell holds, and the edit holds %q and the tab says %q", tab.Tree.Typed(), tab.Notice)
	}
	keyed(t, m, "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "backspace", "b", "enter")
	if tab.Tree.Editing() {
		t.Fatal("enter closes the edit")
	}
	posts := postsOf(t, *posted)
	if len(posts) != 1 || posts[0]["action"] != "tickets/set-field" || posts[0]["name"] != "one-ticket" || posts[0]["field"] != "group" || posts[0]["value"] != "b" {
		t.Fatalf("an edit of the group posts %v, and wants tickets/set-field on one-ticket with group b", posts)
	}
	wroteNothing(t, tab)
}

func TestThePullKeyPostsWorkPull(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, everyResult)
	m = keyed(t, m, "P")
	posts := postsOf(t, *posted)
	if len(posts) != 1 || posts[0]["action"] != "work/pull" {
		t.Fatalf("P posts %v, and wants work/pull", posts)
	}
	if !strings.Contains(tab.Notice, "work/pull") {
		t.Fatalf("the tab says %q, and wants the action it ran named", tab.Notice)
	}
	wroteNothing(t, tab)
}

func TestAnActionTheIndexRefusesStandsAsTheNotice(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, map[string]any{})
	selectRow(t, tab, "one-ticket")
	keyed(t, m, "u")
	if len(*posted) != 1 || !strings.Contains(tab.Notice, "tickets/flip-urgent") {
		t.Fatalf("a refused flip posts %d times, and the tab says %q, and wants the refusal naming the action", len(*posted), tab.Notice)
	}
}

func TestAValueTheSchemaRefusesPostsNothing(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, everyResult)
	selectRow(t, tab, "one-ticket")
	tab.Tree.Cols = append(tab.Tree.Cols, tree.Column{Name: "step", Key: "step", Wide: tree.ColumnWide})
	tab.Tree.CursorTo(len(tab.Tree.Cols) - 1)
	m = keyed(t, m, "e")
	if len(*posted) != 0 || !strings.Contains(tab.Notice, "the verbs' to write") {
		t.Fatalf("an edit of the step posts %d times, and the tab says %q, and wants no post and the schema's reason", len(*posted), tab.Notice)
	}
	tab.Tree.Cols = append(tab.Tree.Cols, reasonAndUrgent...)
	tab.Tree.CursorTo(len(tab.Tree.Cols) - 2)
	m = keyed(t, m, "e", "l", "a", "t", "e", "r", "enter")
	if len(*posted) != 0 || !strings.Contains(tab.Notice, "reason takes done, dropped, became, answered alone") || !strings.Contains(tab.Notice, "one-ticket keeps the value") {
		t.Fatalf("a refused value posts %d times, and the tab says %q, and wants no post and the schema's reason naming the row", len(*posted), tab.Notice)
	}
	if !strings.Contains(m.View(), "reason takes done") {
		t.Fatal("the reason draws in the tab")
	}
	tab.Tree.CursorTo(len(tab.Tree.Cols) - 1)
	keyed(t, m, "e", "backspace", "backspace", "backspace", "backspace", "backspace", "m", "alt+enter")
	if len(*posted) != 0 || !strings.Contains(tab.Notice, "urgent takes a boolean") || !strings.Contains(tab.Notice, "one-ticket, two-ticket") {
		t.Fatalf("a refused fill posts %d times, and the tab says %q, and wants no post and every row it leaves named", len(*posted), tab.Notice)
	}
	wroteNothing(t, tab)
}

var reasonAndUrgent = []tree.Column{{Name: "reason", Key: "reason", Wide: tree.ColumnWide}, {Name: "urgent", Key: "urgent", Wide: tree.ColumnWide}}

// [[spec/design_output/tree-view#the-completion-knows-the-field]]
func TestTabTakesTheOfferTheSchemaNamesAndEnterPostsIt(t *testing.T) {
	t.Parallel()
	m, tab, posted := actionWindow(t, everyResult)
	selectRow(t, tab, "one-ticket")
	tab.Tree.Cols = append(tab.Tree.Cols, reasonAndUrgent...)
	tab.Tree.CursorTo(len(tab.Tree.Cols) - 2)
	m = keyed(t, m, "e")
	if got := strings.Join(tab.Tree.Offer(), " "); got != "done dropped became answered" {
		t.Fatalf("the reason offers the four the schema names, and offers %q", got)
	}
	if !strings.Contains(m.View(), "tab takes done · dropped") {
		t.Fatal("the offer draws on the tab's last line")
	}
	m = keyed(t, m, "d", "r", "tab", "enter")
	posts := postsOf(t, *posted)
	if len(posts) != 1 || posts[0]["name"] != "one-ticket" || posts[0]["field"] != "reason" || posts[0]["value"] != "dropped" {
		t.Fatalf("tab takes the offer and enter posts it, and the fake keeps %v", posts)
	}
	tab.Tree.CursorTo(len(tab.Tree.Cols) - 1)
	keyed(t, m, "e", "backspace", "backspace", "backspace", "backspace", "backspace")
	if got := strings.Join(tab.Tree.Offer(), " "); got != "true false" {
		t.Fatalf("a flag offers the two it takes, and offers %q", got)
	}
	wroteNothing(t, tab)
}

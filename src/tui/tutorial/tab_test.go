// The tutorial tab draws the examples by chapter with a developer section, the
// selected one's prose and calls, each row's verdict, and F5 posts its run.
// [[spec/design_output/examples#the-tutorial-tab]]
package tutorial

import (
	"encoding/json"
	"os"
	"regexp"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/muesli/termenv"

	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
)

// How long a case waits on the command a key hands back. [[spec/design_output/examples#the-tutorial-tab]]
const keyWithin = 2 * time.Second

const (
	pullPath = "spec/examples/110_tickets/pull.md"
	takePath = "spec/examples/120_branch/take.md"
	edgePath = "spec/examples/910_dev_pull/edge.md"
)

// Three examples, the developer case first, so the tab orders them itself. [[spec/design_output/examples#the-tutorial-tab]]
var seeded = []Row{
	{Path: edgePath, Chapter: "910_dev_pull", Dev: true, Title: "A pull past the queue waits", Body: "---\nkind: [[example]]\n---\n\nA box pulls past the queue.\n"},
	{Path: takePath, Chapter: "120_branch", Title: "A take holds a branch", Keywords: []string{"claim"}, Verdict: "fail", Miss: "a miss", Body: "---\nkind: [[example]]\ntitle: A take holds a branch\n---\n\nA box takes its branch.\n\n```sh\n./RUNME.sh branch take\n# expect: exit 0\n```\n"},
	{Path: pullPath, Chapter: "110_tickets", Title: "A pull hands out a leaf", Verdict: "pass", Body: "---\nkind: [[example]]\n---\n\nA box pulls.\n\n```sh\n./RUNME.sh ticket pull\n```\n"},
}

// The styles draw as ANSI from the first case on, so a lit match shows on the drawn text. [[spec/design_output/examples#the-search]]
func TestMain(run *testing.M) {
	lipgloss.SetColorProfile(termenv.ANSI)
	os.Exit(run.Run())
}

// The window over the tab, the rows handed in as the watch hands them, and a fake door keeping every post. [[spec/design_output/examples#the-tutorial-tab]]
func window(t *testing.T) (frame.Model, *Tab, *[]registry.Posted) {
	t.Helper()
	posted := &[]registry.Posted{}
	fake := registry.Fake{Values: map[string]any{RowsName: seeded}, Results: map[string]any{RunName: "started"}, Posted: posted}
	tab := New(fake)
	m := frame.New("no/such/log.jsonl", time.UTC, []frame.Tab{tab})
	m.W, m.H = 120, 24
	value, _ := json.Marshal(seeded)
	tab.Update(&m, registry.Change{Name: RowsName, Revision: 1, Value: value})
	m.OpenTab(m.TabNamed("tutorial"))
	return m, tab, posted
}

// The line of the left side holding the words. [[spec/design_output/examples#the-tutorial-tab]]
func lineWith(left, words string) string {
	for _, line := range strings.Split(left, "\n") {
		if strings.Contains(line, words) {
			return line
		}
	}
	return ""
}

func TestTheTreeHoldsTheUserChaptersThenTheDeveloperSection(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	left := tab.Left(&m, 80, 20)
	at := -1
	for _, words := range []string{"110_tickets", "A pull hands out a leaf", "120_branch", "A take holds a branch", "developer", "910_dev_pull", "A pull past the queue waits"} {
		next := strings.Index(left, words)
		if next <= at {
			t.Fatalf("%q stands out of order on the left:\n%s", words, left)
		}
		at = next
	}
}

func TestTheMainViewDrawsTheSelectedProseAndCalls(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	tab.Jump(&m, takePath)
	if got := tab.Selected(&m); got != takePath {
		t.Fatalf("the selection reads %q, and wants %s", got, takePath)
	}
	drawn := frame.RenderParts(tab.Detail(&m, 80), 80)
	for _, part := range []string{"A take holds a branch", "A box takes its branch.", "./RUNME.sh branch take", "# expect: exit 0"} {
		if !strings.Contains(drawn, part) {
			t.Fatalf("the main view draws no %q:\n%s", part, drawn)
		}
	}
	if strings.Contains(drawn, "kind: [[example]]") {
		t.Fatalf("the main view draws the front:\n%s", drawn)
	}
}

func TestEachRowCarriesItsLastVerdict(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	left := tab.Left(&m, 80, 20)
	if line := lineWith(left, "A pull hands out a leaf"); !strings.Contains(line, PassMark) {
		t.Fatalf("the passing row reads %q, and wants %s", line, PassMark)
	}
	if line := lineWith(left, "A take holds a branch"); !strings.Contains(line, FailMark) {
		t.Fatalf("the failing row reads %q, and wants %s", line, FailMark)
	}
	if line := lineWith(left, "A pull past the queue waits"); strings.Contains(line, PassMark) || strings.Contains(line, FailMark) {
		t.Fatalf("the row before its first run reads %q, and wants a blank mark", line)
	}
}

func TestF5PostsTheSelectedExampleRun(t *testing.T) {
	t.Parallel()
	m, tab, posted := window(t)
	tab.Jump(&m, pullPath)
	var msg tea.Msg = tea.KeyMsg{Type: tea.KeyF5}
	for msg != nil {
		next, cmd := m.Update(msg)
		m, msg = next.(frame.Model), answerOf(cmd)
	}
	if len(*posted) != 1 || (*posted)[0].Name != RunName || string((*posted)[0].Input) != `{"path":"`+pullPath+`"}` {
		t.Fatalf("F5 posts %+v, and wants one %s of %s", *posted, RunName, pullPath)
	}
}

// The window with the filter pane open and the line typed in, the alt keys pressed as they stand. [[spec/design_output/examples#the-search]]
func searched(m frame.Model, said ...string) frame.Model {
	if m.Pane != frame.PaneFilter {
		m.OpenPane(frame.PaneFilter)
	}
	for _, one := range said {
		if key, isAlt := strings.CutPrefix(one, "alt+"); isAlt {
			next, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(key), Alt: true})
			m = next.(frame.Model)
			continue
		}
		if one == "clear" {
			for range len(m.Input.Value()) {
				next, _ := m.Update(tea.KeyMsg{Type: tea.KeyBackspace})
				m = next.(frame.Model)
			}
			continue
		}
		for _, key := range one {
			next, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{key}})
			m = next.(frame.Model)
		}
	}
	return m
}

// Whether the left side holds each title it keeps and none it drops. [[spec/design_output/examples#the-search]]
func keeps(t *testing.T, left string, kept, dropped []string) {
	t.Helper()
	for _, words := range kept {
		if !strings.Contains(left, words) {
			t.Fatalf("the tree drops %q:\n%s", words, left)
		}
	}
	for _, words := range dropped {
		if strings.Contains(left, words) {
			t.Fatalf("the tree keeps %q:\n%s", words, left)
		}
	}
}

func TestTitleModeKeepsTheExamplesWhoseTitleMatches(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	m = searched(m, "PULL")
	keeps(t, tab.Left(&m, 80, 20), []string{"title search", "110_tickets", "A pull hands out a leaf", "910_dev_pull", "A pull past the queue waits"}, []string{"120_branch", "A take holds a branch"})
	m = searched(m, "clear", "box")
	keeps(t, tab.Left(&m, 80, 20), nil, []string{"A pull hands out a leaf", "A take holds a branch", "A pull past the queue waits"})
}

func TestContentModeKeepsTitleKeywordsOrBodyMatches(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	m = searched(m, "alt+m", "box")
	keeps(t, tab.Left(&m, 80, 20), []string{"content search", "A pull hands out a leaf", "A take holds a branch", "A pull past the queue waits"}, nil)
	m = searched(m, "clear", "claim")
	keeps(t, tab.Left(&m, 80, 20), []string{"A take holds a branch"}, []string{"110_tickets", "A pull hands out a leaf", "developer", "A pull past the queue waits"})
	m = searched(m, "clear", "queue")
	keeps(t, tab.Left(&m, 80, 20), []string{"A pull past the queue waits"}, []string{"A pull hands out a leaf", "A take holds a branch"})
}

// A match the style lights: an escape opening right before the word. [[spec/design_output/examples#the-search]]
var litPull = regexp.MustCompile(`\x1b\[[0-9;]*m(?i:pull)`)

func TestContentModeLightsEveryMatchInTheMainView(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	tab.Jump(&m, pullPath)
	m = searched(m, "pull")
	if lit := litPull.FindAllString(frame.RenderParts(tab.Detail(&m, 80), 80), -1); len(lit) != 0 {
		t.Fatalf("title mode lights %d matches, and wants the main view as it stands", len(lit))
	}
	m = searched(m, "alt+m")
	drawn := frame.RenderParts(tab.Detail(&m, 80), 80)
	if lit := litPull.FindAllString(drawn, -1); len(lit) != 3 {
		t.Fatalf("content mode lights %d matches, and wants the title, the prose and the call lit:\n%q", len(lit), drawn)
	}
}

func TestAltMTurnsTheModeOverUnderTheFilterPane(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	m = searched(m, "box", "alt+m")
	if m.Input.Value() != "box" {
		t.Fatalf("alt+m writes into the line, which reads %q", m.Input.Value())
	}
	keeps(t, tab.Left(&m, 80, 20), []string{"content search", "A pull hands out a leaf"}, nil)
	m = searched(m, "alt+m")
	keeps(t, tab.Left(&m, 80, 20), []string{"title search"}, []string{"A pull hands out a leaf"})
}

func TestClearingTheSearchBringsTheTreeBackWithTheSelectionHeld(t *testing.T) {
	t.Parallel()
	m, tab, _ := window(t)
	m = searched(m, "alt+m", "claim")
	if got := tab.Selected(&m); got != takePath {
		t.Fatalf("the search selects %q, and wants the one kept row %s", got, takePath)
	}
	m = searched(m, "clear")
	keeps(t, tab.Left(&m, 80, 20), []string{"A pull hands out a leaf", "A take holds a branch", "A pull past the queue waits"}, []string{"content search"})
	if got := tab.Selected(&m); got != takePath {
		t.Fatalf("the cleared search selects %q, and wants %s held", got, takePath)
	}
}

// The message a command answers within the wait, each of a batch in turn. [[spec/design_output/examples#the-tutorial-tab]]
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

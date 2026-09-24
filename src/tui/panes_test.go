// The panes are the window's, whatever tab stands open: the filter line each
// tab keeps, the presets the pane offers, and a tab switch under an open pane.
// Every model here reads memory, and the work tree comes off a folder a case
// writes.
// [[spec/design_output/tui#the-filter-pane-takes-letters]]

package main

import (
	"path/filepath"
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/frame"
	"quackitect/tui/log"
	"quackitect/tui/work"
)

// A window holding the log and a loaded work tree, the way a person opens it. [[spec/design_output/tui#the-work-tab]]
func workWindow(t *testing.T, n int) frame.Model {
	t.Helper()
	m := window(n)
	root := workTree(t)
	m.Path = filepath.Join(root, ".se", ".log", "session.jsonl")
	tree, err := work.Load(m.Path)
	if err != nil {
		t.Fatal(err)
	}
	out, _ := m.Update(work.Msg{Tree: tree})
	// The queue view keeps the placed rows, so a case lays places over the three rows the way the verb does. [[spec/design_output/pull#the-queue-is-an-outline]]
	places, _ := work.PlacesIn([]byte(`{"branches":[{"name":"one-group","queue":"1","tickets":[{"name":"a-child","queue":"1.1"}]}],"loose":[{"name":"a-loose-one","queue":"2"}]}`))
	out, _ = out.(frame.Model).Update(work.PlacesMsg{Places: places})
	return out.(frame.Model)
}

// [[spec/design_output/tui#the-window-is-a-split]]
func TestTheWorkTabUnderTheFilterPaneKeepsTheStripAndTheFooter(t *testing.T) {
	t.Parallel()
	m := alt(press(workWindow(t, 3), "2"), 'f')
	if m.Pane != frame.PaneFilter {
		t.Fatal("alt+f opens the filter pane")
	}
	lines := strings.Split(m.View(), "\n")
	if len(lines) != m.H {
		t.Fatalf("the window draws %d lines, and %d stand:\n%s", m.H, len(lines), m.View())
	}
	if !strings.Contains(lines[0], "2 work") {
		t.Fatalf("the strip stands first, and the first line reads %q", lines[0])
	}
	if !strings.Contains(lines[len(lines)-1], "INFO") {
		t.Fatalf("the footer stands last, and the last line reads %q", lines[len(lines)-1])
	}
}

// [[spec/design_output/tui#the-filter-pane-takes-letters]]
func TestEachTabKeepsAFilterLineOfItsOwn(t *testing.T) {
	t.Parallel()
	m := workWindow(t, 3)
	// The queue opens the work tab with the placed rows, sorted by place. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	if said := m.SourceOf(1); said != "queue: /./" {
		t.Fatalf("the work tab opens on the queue, which keeps the placed rows, and its line reads %q", said)
	}
	if said := theWork(m).Tree.Sorts(); len(said) != 1 || said[0].Key != work.QueueKey {
		t.Fatalf("the queue's sort takes hold at the start, and it reads %v", said)
	}
	// The queue is a pressed preset, so the funnel stands red, and a sort of a person's own lets go of it. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	work := press(m, "2")
	if !work.Tabs[work.Open].Narrowed(&work) || work.Pressed() == nil || work.Pressed().Name != "queue" {
		t.Fatal("the work tab opens narrowed by the queue preset")
	}
	if !strings.Contains(frame.RenderParts(work.PresetParts(), 80), "alt+1  queue") {
		t.Fatal("the pressed queue row stands in the pane")
	}
	work.Input.SetValue("")
	work.Narrow("")
	if work.Tabs[work.Open].Narrowed(&work) || work.Pressed() != nil {
		t.Fatal("a cleared line lets go of the queue preset, and the funnel stands grey")
	}
	m = alt(press(m, "2"), '2')
	if m.SourceOf(1) != "queue: /^0$/" {
		t.Fatalf("alt+2 writes the in-hand preset, and the work's line reads %q", m.SourceOf(1))
	}
	m = press(alt(press(m, "1"), 'f'), "l", "i", "n", "e", " ", "2")
	if logTab(m).Filter.Empty() || m.SourceOf(0) != "line 2" {
		t.Fatalf("the log's line narrows the log, and it reads %q", m.SourceOf(0))
	}
	// A digit types into the line under the filter pane, so the strip is the road to the other tab. [[spec/design_output/tui#a-number-opens-a-tab]]
	out, _ := m.Update(tea.MouseMsg{X: 9, Y: frame.StripRow, Button: tea.MouseButtonLeft, Action: tea.MouseActionPress})
	m = out.(frame.Model)
	if m.Open != 1 {
		t.Fatalf("the press lands on the work tab, and tab %d stands open", m.Open)
	}
	if m.Input.Value() != "queue: /^0$/" {
		t.Fatalf("the work tab's line comes up on the switch, and the line reads %q", m.Input.Value())
	}
	if logTab(m).Filter.Empty() {
		t.Fatal("the log keeps its own filter while the work tab stands open")
	}
	// One placeholder stands for every tab, because the strip names the tab. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	if m.Input.Placeholder != "type to narrow" {
		t.Fatalf("the line names no tab, and it says %q", m.Input.Placeholder)
	}
}

// [[spec/design_output/tui#one-key-filters-the-line]]
func TestAPresetWritesItsFilterIntoTheLineAndAgainClearsIt(t *testing.T) {
	t.Parallel()
	m := alt(window(3), 'q')
	if m.Input.Value() != log.PromptsFilter || logTab(m).Filter.Empty() {
		t.Fatalf("alt+q writes the prompts and replies into the line, and it reads %q", m.Input.Value())
	}
	m = alt(m, 'q')
	if m.Input.Value() != "" || !logTab(m).Filter.Empty() {
		t.Fatalf("alt+q again clears the line, and it reads %q", m.Input.Value())
	}
	m = alt(press(workWindow(t, 3), "2"), '2')
	if m.Input.Value() != "queue: /^0$/" {
		t.Fatalf("alt+2 writes the second preset's filter, and the line reads %q", m.Input.Value())
	}
	// A note takes no place in the queue, so a preset of its own shows the notes. [[spec/design_output/pull#the-queue-is-an-outline]]
	if said := alt(m, '7').Input.Value(); said != "route: note" {
		t.Fatalf("alt+7 writes the notes preset's filter, and the line reads %q", said)
	}
	pane := frame.RenderParts(alt(m, 'f').PresetParts(), 80)
	for _, want := range []string{"alt+1  queue", "alt+2  in hand", "alt+3  recently done", "alt+4  urgent", "alt+6  open", "alt+7  notes"} {
		if !strings.Contains(pane, want) {
			t.Fatalf("the pane names each preset with its key and name, and reads:\n%s", pane)
		}
	}
	// The filter stays off the row, because it runs long. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	if strings.Contains(pane, "queue: /^0$/") {
		t.Fatalf("the pane draws no filter beside a preset, and reads:\n%s", pane)
	}
}

// A press on a preset's row writes its filter and applies it, and a press on a row under the pane selects the row. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func TestAPressOnAPresetRowPressesItAndARowStillSelectsUnderThePane(t *testing.T) {
	t.Parallel()
	m := alt(press(workWindow(t, 3), "2"), 'f')
	// The first preset stands two rows under the line: the line, the blank, then the rows. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	m = click(m, m.ListWidth()+4, frame.HeadWide+2+1)
	if m.Input.Value() != "queue: /^0$/" || !theWork(m).Tree.Narrowed() {
		t.Fatalf("a press on the second row writes its filter and narrows the tab, and the line reads %q", m.Input.Value())
	}
	if m.PresetAt(0) != nil || m.PresetAt(1) != nil {
		t.Fatal("the line and the blank under it hold no preset")
	}
	m = alt(m, '2')
	m = click(m, 4, frame.FirstRow()+1)
	if theWork(m).Tree.At() != 1 || m.Pane != frame.PaneFilter {
		t.Fatalf("a press on the second row selects it under the pane, and the cursor stands at %d", theWork(m).Tree.At())
	}
	log := alt(window(5), 'f')
	log = click(log, 10, frame.FirstRow()+2)
	if logTab(log).At() != 2 || log.Pane != frame.PaneFilter {
		t.Fatalf("a press on a log row selects it under the pane, and the cursor stands at %d", logTab(log).At())
	}
}

// [[spec/design_output/tui#a-number-opens-a-tab]]
func TestATabSwitchesUnderAnOpenPaneAndThePaneDrawsTheNewTab(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "enter")
	if m.Pane != frame.PaneDetails {
		t.Fatal("enter opens the details")
	}
	m = press(m, "2")
	if m.Pane != frame.PaneDetails || m.Open != 1 {
		t.Fatalf("the details stay open on the switch, and the pane reads %d on tab %d", m.Pane, m.Open)
	}
	if !strings.Contains(m.Content, "one-group") {
		t.Fatalf("the details draw the work tab's row, and read:\n%s", m.Content)
	}

	m = alt(press(workWindow(t, 3), "2"), 'f')
	out, _ := m.Update(tea.MouseMsg{X: 1, Y: frame.StripRow, Button: tea.MouseButtonLeft, Action: tea.MouseActionPress})
	m = out.(frame.Model)
	if m.Open != 0 || m.Pane != frame.PaneFilter {
		t.Fatalf("a press on the strip under the filter pane switches the tab, and tab %d stands open", m.Open)
	}
}

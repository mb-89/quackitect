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
)

// A window holding the log and a loaded work tree, the way a person opens it. [[spec/design_output/tui#the-work-tab]]
func workWindow(t *testing.T, n int) model {
	t.Helper()
	m := window(n)
	root := workTree(t)
	m.path = filepath.Join(root, ".se", ".log", "session.jsonl")
	tree, err := loadWork(m.path)
	if err != nil {
		t.Fatal(err)
	}
	out, _ := m.Update(workMsg{tree: tree})
	return out.(model)
}

// [[spec/design_output/tui#the-window-is-a-split]]
func TestTheWorkTabUnderTheFilterPaneKeepsTheStripAndTheFooter(t *testing.T) {
	t.Parallel()
	m := alt(press(workWindow(t, 3), "2"), 'f')
	if m.pane != paneFilter {
		t.Fatal("alt+f opens the filter pane")
	}
	lines := strings.Split(m.View(), "\n")
	if len(lines) != m.h {
		t.Fatalf("the window draws %d lines, and %d stand:\n%s", m.h, len(lines), m.View())
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
	if said := m.sourceOf(1); said != "not state: closed" {
		t.Fatalf("the work tab opens on the preset the file presses, and its line reads %q", said)
	}
	m = press(alt(m, 'f'), "l", "i", "n", "e", " ", "2")
	if m.filter.Empty() || m.sourceOf(0) != "line 2" {
		t.Fatalf("the log's line narrows the log, and it reads %q", m.sourceOf(0))
	}
	// A digit types into the line under the filter pane, so the strip is the road to the other tab. [[spec/design_output/tui#a-number-opens-a-tab]]
	out, _ := m.Update(tea.MouseMsg{X: 9, Y: stripRow, Button: tea.MouseButtonLeft, Action: tea.MouseActionPress})
	m = out.(model)
	if m.open != 1 {
		t.Fatalf("the press lands on the work tab, and tab %d stands open", m.open)
	}
	if m.input.Value() != "not state: closed" {
		t.Fatalf("the work tab's line comes up on the switch, and the line reads %q", m.input.Value())
	}
	if m.filter.Empty() {
		t.Fatal("the log keeps its own filter while the work tab stands open")
	}
	if !strings.Contains(m.input.Placeholder, "work") {
		t.Fatalf("the line names the open tab, and it says %q", m.input.Placeholder)
	}
}

// [[spec/design_output/tui#one-key-filters-the-line]]
func TestAPresetWritesItsFilterIntoTheLineAndAgainClearsIt(t *testing.T) {
	t.Parallel()
	m := alt(window(3), 'q')
	if m.input.Value() != talkFilter || m.filter.Empty() {
		t.Fatalf("alt+q writes the talk into the line, and it reads %q", m.input.Value())
	}
	m = alt(m, 'q')
	if m.input.Value() != "" || !m.filter.Empty() {
		t.Fatalf("alt+q again clears the line, and it reads %q", m.input.Value())
	}
	m = alt(press(workWindow(t, 3), "2"), '2')
	if m.input.Value() != "queue: /./" {
		t.Fatalf("alt+2 writes the second preset's filter, and the line reads %q", m.input.Value())
	}
	pane := renderParts(alt(m, 'f').presetParts(), 80)
	for _, want := range []string{"alt+1 not done", "alt+2 queue", "queue: /./"} {
		if !strings.Contains(pane, want) {
			t.Fatalf("the pane names each preset with its key and filter, and reads:\n%s", pane)
		}
	}
}

// [[spec/design_output/tui#a-number-opens-a-tab]]
func TestATabSwitchesUnderAnOpenPaneAndThePaneDrawsTheNewTab(t *testing.T) {
	t.Parallel()
	m := press(workWindow(t, 3), "enter")
	if m.pane != paneDetails {
		t.Fatal("enter opens the details")
	}
	m = press(m, "2")
	if m.pane != paneDetails || m.open != 1 {
		t.Fatalf("the details stay open on the switch, and the pane reads %d on tab %d", m.pane, m.open)
	}
	if !strings.Contains(m.content, "one-group") {
		t.Fatalf("the details draw the work tab's row, and read:\n%s", m.content)
	}

	m = alt(press(workWindow(t, 3), "2"), 'f')
	out, _ := m.Update(tea.MouseMsg{X: 1, Y: stripRow, Button: tea.MouseButtonLeft, Action: tea.MouseActionPress})
	m = out.(model)
	if m.open != 0 || m.pane != paneFilter {
		t.Fatalf("a press on the strip under the filter pane switches the tab, and tab %d stands open", m.open)
	}
}

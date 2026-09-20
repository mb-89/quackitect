// The frame the window draws: the strip of tabs, the numbers opening them, the
// three bands of the help and the footer of status marks. Every model here
// reads memory and no file.

package main

import (
	"quackitect/tui/draw"

	"quackitect/tui/frame"

	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

// A tab of the case's own, carrying the whole interface and drawing one line. [[spec/design_output/tui#the-window-is-a-split]]
type stubTab struct{}

func (stubTab) Name() string { return "work" }

func (stubTab) Init(*frame.Model) tea.Cmd { return nil }

func (stubTab) Update(*frame.Model, tea.Msg) (bool, tea.Cmd) { return false, nil }

func (stubTab) Left(m *frame.Model, w, rows int) string {
	return strings.TrimSuffix(strings.Repeat("the work stands here\n", rows+frame.NamesWide), "\n")
}

func (stubTab) Detail(m *frame.Model, w int) []frame.Part {
	return []frame.Part{{Text: "the work details"}}
}

func (stubTab) Selected(*frame.Model) string { return "" }

func (stubTab) Narrowed(m *frame.Model) bool { return false }

func (stubTab) Keys(m *frame.Model) frame.Band {
	return frame.Band{Name: "THE WORK", Acts: []frame.Act{
		{Key: frame.Bind("r", "read the row", "r"), Do: func(m *frame.Model, _ string) tea.Cmd { return nil }},
	}}
}

func (stubTab) Selection(m *frame.Model) frame.Band {
	return frame.Band{Name: "THE TICKET", Acts: []frame.Act{
		{Key: frame.Bind("o", "open the note", "o"), Do: func(m *frame.Model, _ string) tea.Cmd { return nil }},
	}}
}

func (stubTab) Presets(m *frame.Model) []frame.Preset {
	return []frame.Preset{{Name: "not done", Filter: "not state: closed", Key: "alt+1"}}
}

func (stubTab) Move(*frame.Model, int) {}

func (stubTab) Jump(*frame.Model, string) {}

func (stubTab) Press(*frame.Model, int, int) {}

func (stubTab) Narrow(*frame.Model, string) error { return nil }

func (stubTab) Sorted(*frame.Model, frame.Preset) {}

func (stubTab) Pressed(*frame.Model, frame.Preset) bool { return false }

func (stubTab) Marks(*frame.Model) (string, string) { return "", "" }

// [[spec/design_output/tui#the-header-holds-the-tabs]]
func TestTheStripNamesEveryTabAndTheHelpKeyAboveARule(t *testing.T) {
	t.Parallel()
	lines := strings.Split(window(3).View(), "\n")
	for _, want := range []string{"1 log", "alt+? help"} {
		if !strings.Contains(lines[0], want) {
			t.Fatalf("the strip names %q, and reads %q", want, lines[0])
		}
	}
	for _, gone := range []string{"enter details", "alt+f filter", "log lvl"} {
		if strings.Contains(lines[0], gone) {
			t.Fatalf("the strip names the tabs alone, and reads %q", lines[0])
		}
	}
	if !strings.Contains(lines[1], "────") {
		t.Fatalf("the second line is a rule, and reads %q", lines[1])
	}
	for _, want := range []string{"time", "level", "kind", "said"} {
		if !strings.Contains(lines[2], want) {
			t.Fatalf("the tab names its columns under the rule, and the third line reads %q", want)
		}
	}
	if !strings.Contains(lines[3], "line 1") {
		t.Fatalf("the log starts under the column names, and the fourth line reads %q", lines[3])
	}
}

// [[spec/design_output/tui#a-number-opens-a-tab]]
func TestANumberOpensTheTabAtThatPlaceAndAnyOtherLeavesTheOpenOne(t *testing.T) {
	t.Parallel()
	m := window(3)
	m.Tabs = []frame.Tab{theLog(m), stubTab{}}
	m = press(m, "2")
	if m.Open != 1 {
		t.Fatalf("2 opens the second tab, and tab %d stands open", m.Open)
	}
	strip := strings.Split(m.View(), "\n")[0]
	if !strings.Contains(strip, "1 log") || !strings.Contains(strip, "2 work") {
		t.Fatalf("the strip numbers every tab, and reads %q", strip)
	}
	if !strings.Contains(m.View(), "the work stands here") {
		t.Fatalf("the open tab draws the left side, and the window reads:\n%s", m.View())
	}
	for _, name := range []string{"3", "9"} {
		if m = press(m, name); m.Open != 1 {
			t.Fatalf("%s names no tab and leaves the open one, and tab %d stands open", name, m.Open)
		}
	}
	if m = press(m, "1"); m.Open != 0 {
		t.Fatalf("1 goes back to the log, and tab %d stands open", m.Open)
	}
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func TestTheHelpNamesThreeBandsOutOfTheRegisteredKeys(t *testing.T) {
	t.Parallel()
	m := window(3)
	m.Tabs = []frame.Tab{theLog(m), stubTab{}}
	drawn := frame.RenderParts(m.HelpParts(60), 60)
	for _, want := range []string{"GLOBAL", "1…9", "open the tab at that place", "THE LOG"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the help names %q, and reads:\n%s", want, drawn)
		}
	}
	if strings.Index(drawn, "GLOBAL") > strings.Index(drawn, "THE LOG") {
		t.Fatalf("the global frame.Band stands first, and the help reads:\n%s", drawn)
	}
	// The presets stand in the filter pane alone. [[spec/design_output/tui#one-key-filters-the-line]]
	if strings.Contains(drawn, "PRESETS") || strings.Contains(drawn, "prompts and replies") {
		t.Fatalf("the help names no frame.Preset, and reads:\n%s", drawn)
	}
	work := press(m, "2")
	drawn = frame.RenderParts(work.HelpParts(60), 60)
	for _, want := range []string{"THE WORK", "read the row", "THE TICKET", "open the note"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the open tab's frame.Band names %q, and the help reads:\n%s", want, drawn)
		}
	}
	if strings.Contains(drawn, "THE LOG") {
		t.Fatalf("the shut tab's frame.Band goes, and the help reads:\n%s", drawn)
	}
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func TestTheSelectionBandGoesWhileNothingStandsSelected(t *testing.T) {
	t.Parallel()
	m := window(0)
	// The row's preset stands in the filter pane, and an empty log offers none. [[spec/design_output/tui#one-key-filters-the-line]]
	drawn := frame.RenderParts(m.PresetParts(), 60)
	if strings.Contains(drawn, "this row's kind") {
		t.Fatalf("an empty log selects nothing and offers no row frame.Preset, and the pane reads:\n%s", drawn)
	}
	m = arrive(m, row(1, "tool", "line 1"))
	drawn = frame.RenderParts(m.PresetParts(), 60)
	if !strings.Contains(drawn, "this row's kind") {
		t.Fatalf("a selected row offers its kind as a frame.Preset, and the pane reads:\n%s", drawn)
	}
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func TestAKeyNobodyRegistersDoesNothing(t *testing.T) {
	t.Parallel()
	m := window(5)
	if press(m, "?").Pane != frame.PaneShut {
		t.Fatal("the question mark alone registers nowhere, and opens nothing")
	}
	if theLog(press(m, "x")).Sel != theLog(m).Sel {
		t.Fatal("a key nobody registers moves nothing")
	}
}

// [[spec/design_output/tui#the-footer-carries-status]]
func TestTheFooterCarriesTheFloorAndAFunnelAtFixedPlaces(t *testing.T) {
	t.Parallel()
	m := window(5)
	lines := strings.Split(m.View(), "\n")
	if len(lines) != frame.HeadWide+frame.NamesWide+m.Rows()+frame.FootWide {
		t.Fatalf("the window stands frame.HeadWide, the tab and frame.FootWide high, and drew %d lines", len(lines))
	}
	rule, marks := lines[len(lines)-2], lines[len(lines)-1]
	if !strings.Contains(rule, "────") {
		t.Fatalf("a rule stands over the marks, and reads %q", rule)
	}
	if !strings.Contains(marks, "INFO") || !strings.Contains(marks, draw.Dim.Render(frame.FilterMark)) {
		t.Fatalf("the marks carry a dark funnel and the floor, and read %q", marks)
	}
	wide := ansi.StringWidth(marks)
	m = typed(alt(m, 'f'), "line 3")
	m = press(m, "enter")
	marks = strings.Split(m.View(), "\n")[len(lines)-1]
	if !strings.Contains(marks, draw.LevelStyle("error").Render(frame.FilterMark)) {
		t.Fatalf("a held filter lights the funnel, and the marks read %q", marks)
	}
	if ansi.StringWidth(marks) != wide {
		t.Fatalf("the marks stand at fixed places, and moved from %d to %d columns", wide, ansi.StringWidth(marks))
	}
}

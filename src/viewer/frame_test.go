// The frame the window draws: the strip of tabs, the numbers opening them, the
// three bands of the help and the footer of status marks. Every model here
// reads memory and no file.

package main

import (
	"strings"
	"testing"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

// [[spec/design_output/viewer#the-window-is-a-split]]
type stubTab struct{}

func (stubTab) Name() string { return "work" }

func (stubTab) Left(m *model, w, rows int) string {
	return strings.TrimSuffix(strings.Repeat("the work stands here\n", rows+namesWide), "\n")
}

func (stubTab) Detail(m *model, w int) []part { return []part{{text: "the work details"}} }

func (stubTab) Narrowed(m *model) bool { return false }

func (stubTab) Keys(m *model) band {
	return band{name: "THE WORK", acts: []act{
		{bind("r", "read the row", "r"), func(m *model, _ string) tea.Cmd { return nil }},
	}}
}

func (stubTab) Selection(m *model) band {
	return band{name: "THE TICKET", acts: []act{
		{bind("o", "open the note", "o"), func(m *model, _ string) tea.Cmd { return nil }},
	}}
}

// [[spec/design_output/viewer#the-header-holds-the-tabs]]
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

// [[spec/design_output/viewer#a-number-opens-a-tab]]
func TestANumberOpensTheTabAtThatPlaceAndAnyOtherLeavesTheOpenOne(t *testing.T) {
	t.Parallel()
	m := window(3)
	m.tabs = append(m.tabs, stubTab{})
	m = press(m, "2")
	if m.open != 1 {
		t.Fatalf("2 opens the second tab, and tab %d stands open", m.open)
	}
	strip := strings.Split(m.View(), "\n")[0]
	if !strings.Contains(strip, "1 log") || !strings.Contains(strip, "2 work") {
		t.Fatalf("the strip numbers every tab, and reads %q", strip)
	}
	if !strings.Contains(m.View(), "the work stands here") {
		t.Fatalf("the open tab draws the left side, and the window reads:\n%s", m.View())
	}
	for _, name := range []string{"3", "9"} {
		if m = press(m, name); m.open != 1 {
			t.Fatalf("%s names no tab and leaves the open one, and tab %d stands open", name, m.open)
		}
	}
	if m = press(m, "1"); m.open != 0 {
		t.Fatalf("1 goes back to the log, and tab %d stands open", m.open)
	}
}

// [[spec/design_output/viewer#the-help-reads-the-cursor]]
func TestTheHelpNamesThreeBandsOutOfTheRegisteredKeys(t *testing.T) {
	t.Parallel()
	m := window(3)
	m.tabs = append(m.tabs, stubTab{})
	drawn := renderParts(m.helpParts(60), 60)
	for _, want := range []string{"GLOBAL", "1…9", "open the tab at that place", "THE LOG", "alt+shift+f", "THE ROW"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the help names %q, and reads:\n%s", want, drawn)
		}
	}
	if strings.Index(drawn, "GLOBAL") > strings.Index(drawn, "THE LOG") {
		t.Fatalf("the global band stands first, and the help reads:\n%s", drawn)
	}
	if strings.Index(drawn, "THE LOG") > strings.Index(drawn, "THE ROW") {
		t.Fatalf("the tab band stands over the selection band, and the help reads:\n%s", drawn)
	}
	work := press(m, "2")
	drawn = renderParts(work.helpParts(60), 60)
	for _, want := range []string{"THE WORK", "read the row", "THE TICKET", "open the note"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the open tab's band names %q, and the help reads:\n%s", want, drawn)
		}
	}
	if strings.Contains(drawn, "THE LOG") {
		t.Fatalf("the shut tab's band goes, and the help reads:\n%s", drawn)
	}
}

// [[spec/design_output/viewer#the-help-reads-the-cursor]]
func TestTheSelectionBandGoesWhileNothingStandsSelected(t *testing.T) {
	t.Parallel()
	m := window(0)
	drawn := renderParts(m.helpParts(60), 60)
	if strings.Contains(drawn, "THE ROW") {
		t.Fatalf("an empty log selects nothing and names no row band, and the help reads:\n%s", drawn)
	}
	m = arrive(m, row(1, "tool", "line 1"))
	drawn = renderParts(m.helpParts(60), 60)
	if !strings.Contains(drawn, "THE ROW") {
		t.Fatalf("a selected row names its band, and the help reads:\n%s", drawn)
	}
}

// [[spec/design_output/viewer#the-help-reads-the-cursor]]
func TestAKeyNobodyRegistersDoesNothing(t *testing.T) {
	t.Parallel()
	m := window(5)
	if press(m, "?").pane != paneShut {
		t.Fatal("the question mark alone registers nowhere, and opens nothing")
	}
	if press(m, "x").sel != m.sel {
		t.Fatal("a key nobody registers moves nothing")
	}
}

// [[spec/design_output/viewer#the-footer-carries-status]]
func TestTheFooterCarriesTheFloorAndAFunnelAtFixedPlaces(t *testing.T) {
	t.Parallel()
	m := window(5)
	lines := strings.Split(m.View(), "\n")
	if len(lines) != headWide+namesWide+m.rows()+footWide {
		t.Fatalf("the window stands headWide, the tab and footWide high, and drew %d lines", len(lines))
	}
	rule, marks := lines[len(lines)-2], lines[len(lines)-1]
	if !strings.Contains(rule, "────") {
		t.Fatalf("a rule stands over the marks, and reads %q", rule)
	}
	if !strings.Contains(marks, "INFO") || !strings.Contains(marks, dimStyle.Render("▼")) {
		t.Fatalf("the marks carry a dark funnel and the floor, and read %q", marks)
	}
	wide := ansi.StringWidth(marks)
	m = typed(alt(m, 'f'), "line 3")
	m = press(m, "enter")
	marks = strings.Split(m.View(), "\n")[len(lines)-1]
	if !strings.Contains(marks, levelStyle("error").Render("▼")) {
		t.Fatalf("a held filter lights the funnel, and the marks read %q", marks)
	}
	if ansi.StringWidth(marks) != wide {
		t.Fatalf("the marks stand at fixed places, and moved from %d to %d columns", wide, ansi.StringWidth(marks))
	}
}

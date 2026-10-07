// The frame the window draws: the strip of tabs, the numbers opening them, the
// bands of the help and the footer of status marks. Every model here
// reads memory and no file.

package frame_test

import (
	"path/filepath"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
)

// A tab of the case's own, carrying the whole interface and drawing its names and one line a row. [[spec/design_output/tui#the-window-is-a-split]]
type stubTab struct {
	name, band, selection string
	held                  *string
}

func stub(name, band, selection string) stubTab {
	return stubTab{name: name, band: band, selection: selection, held: new(string)}
}

func (s stubTab) Name() string { return s.name }

func (s stubTab) Label(*frame.Model) string { return s.name }

func (stubTab) Init(*frame.Model) tea.Cmd { return nil }

func (stubTab) Update(*frame.Model, tea.Msg) (bool, tea.Cmd) { return false, nil }

func (s stubTab) Left(m *frame.Model, w, rows int) string {
	return "the " + s.name + " names\n" + strings.TrimSuffix(strings.Repeat("the "+s.name+" stands here\n", rows), "\n")
}

func (s stubTab) Detail(m *frame.Model, w int) []frame.Part {
	return []frame.Part{{Text: "the " + s.name + " details"}}
}

func (stubTab) Selected(*frame.Model) string { return "" }

func (s stubTab) Narrowed(m *frame.Model) bool { return *s.held != "" }

func (s stubTab) Keys(m *frame.Model) frame.Band {
	return frame.Band{Name: s.band, Acts: []frame.Act{
		{Key: frame.Bind("r", "read the row", "r"), Do: func(m *frame.Model, _ string) tea.Cmd { return nil }},
	}}
}

func (s stubTab) Selection(m *frame.Model) frame.Band {
	if s.selection == "" {
		return frame.Band{}
	}
	return frame.Band{Name: s.selection, Acts: []frame.Act{
		{Key: frame.Bind("o", "open the note", "o"), Do: func(m *frame.Model, _ string) tea.Cmd { return nil }},
	}}
}

func (stubTab) Presets(m *frame.Model) []frame.Preset {
	return []frame.Preset{{Name: "not done", Filter: "not state: closed", Key: "alt+1"}}
}

func (stubTab) Move(*frame.Model, int) {}

func (stubTab) Jump(*frame.Model, string) {}

func (stubTab) Press(*frame.Model, int, int) {}

func (s stubTab) Narrow(_ *frame.Model, said string) error {
	*s.held = said
	return nil
}

func (stubTab) Sorted(*frame.Model, frame.Preset) {}

func (stubTab) Pressed(*frame.Model, frame.Preset) bool { return false }

func (stubTab) Marks(*frame.Model) (string, string) { return "", "info" }

// The window over a log stub and a work stub, ten rows high. [[spec/design_output/tui#the-window-is-a-split]]
func window() frame.Model {
	m := frame.New("no/such/log.jsonl", time.UTC, []frame.Tab{stub("log", "THE LOG", ""), stub("work", "THE WORK", "THE TICKET")})
	m.W, m.H = 120, 10+frame.NamesWide+frame.HeadWide+frame.FootWide
	return m
}

func press(m frame.Model, keys ...string) frame.Model {
	for _, name := range keys {
		var msg tea.KeyMsg
		switch name {
		case "enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		case "alt+f":
			msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'f'}, Alt: true}
		default:
			msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(name)}
		}
		out, _ := m.Update(msg)
		m = out.(frame.Model)
	}
	return m
}

// [[spec/design_output/tui#the-header-holds-the-tabs]]
func TestTheStripNamesEveryTabAndTheHelpKeyAboveARule(t *testing.T) {
	t.Parallel()
	lines := strings.Split(window().View(), "\n")
	for _, want := range []string{"1 log", "2 work", "alt+? help"} {
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
	if !strings.Contains(lines[2], "the log names") {
		t.Fatalf("the tab names its columns under the rule, and the third line reads %q", lines[2])
	}
	if !strings.Contains(lines[3], "the log stands here") {
		t.Fatalf("the tab's rows start under the column names, and the fourth line reads %q", lines[3])
	}
}

// [[spec/design_output/tui#a-number-opens-a-tab]]
func TestANumberOpensTheTabAtThatPlaceAndAnyOtherLeavesTheOpenOne(t *testing.T) {
	t.Parallel()
	m := press(window(), "2")
	if m.Open != 1 {
		t.Fatalf("2 opens the second tab, and tab %d stands open", m.Open)
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
	m := window()
	drawn := frame.RenderParts(m.HelpParts(60), 60)
	for _, want := range []string{"GLOBAL", "1…9", "open the tab at that place", "THE LOG"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the help names %q, and reads:\n%s", want, drawn)
		}
	}
	if strings.Index(drawn, "GLOBAL") > strings.Index(drawn, "THE LOG") {
		t.Fatalf("the global band stands first, and the help reads:\n%s", drawn)
	}
	// The presets stand in the filter pane alone. [[spec/design_output/tui#one-key-filters-the-line]]
	if strings.Contains(drawn, "PRESETS") || strings.Contains(drawn, "not done") {
		t.Fatalf("the help names no preset, and reads:\n%s", drawn)
	}
	if strings.Contains(drawn, "THE TICKET") {
		t.Fatalf("a tab selecting nothing adds no selection band, and the help reads:\n%s", drawn)
	}
	work := press(m, "2")
	drawn = frame.RenderParts(work.HelpParts(60), 60)
	for _, want := range []string{"THE WORK", "read the row", "THE TICKET", "open the note"} {
		if !strings.Contains(drawn, want) {
			t.Fatalf("the open tab's band names %q, and the help reads:\n%s", want, drawn)
		}
	}
	if strings.Contains(drawn, "THE LOG") {
		t.Fatalf("the shut tab's band goes, and the help reads:\n%s", drawn)
	}
}

// [[spec/design_output/tui#the-footer-carries-status]]
func TestTheFooterCarriesTheFloorAndAFunnelAtFixedPlaces(t *testing.T) {
	t.Parallel()
	m := window()
	lines := strings.Split(m.View(), "\n")
	if len(lines) != frame.HeadWide+frame.NamesWide+m.Rows()+frame.FootWide {
		t.Fatalf("the window stands the head, the tab and the foot high, and drew %d lines", len(lines))
	}
	rule, marks := lines[len(lines)-2], lines[len(lines)-1]
	if !strings.Contains(rule, "────") {
		t.Fatalf("a rule stands over the marks, and reads %q", rule)
	}
	if !strings.Contains(marks, "INFO") || !strings.Contains(marks, draw.Dim.Render(frame.FilterMark)) {
		t.Fatalf("the marks carry a dark funnel and the floor, and read %q", marks)
	}
	wide := ansi.StringWidth(marks)
	m = press(m, "alt+f", "l", "i", "n", "e", "enter")
	marks = strings.Split(m.View(), "\n")[len(lines)-1]
	if !strings.Contains(marks, draw.LevelStyle("error").Render(frame.FilterMark)) {
		t.Fatalf("a held filter lights the funnel, and the marks read %q", marks)
	}
	if ansi.StringWidth(marks) != wide {
		t.Fatalf("the marks stand at fixed places, and moved from %d to %d columns", wide, ansi.StringWidth(marks))
	}
}

func TestTheWindowNamesItsTabsAndAnswersZeroForAnyOther(t *testing.T) {
	t.Parallel()
	m := window()
	for name, want := range map[string]int{"log": 1, "work": 2, "nothing": 0, "": 0} {
		if got := m.TabNamed(name); got != want {
			t.Fatalf("tab %q stands at %d, and TabNamed answers %d", name, want, got)
		}
	}
}

func TestATabMsgOpensThatTabAndAnUnknownOneLeavesTheOpenTab(t *testing.T) {
	t.Parallel()
	next, _ := window().Update(frame.TabMsg{Name: "work"})
	m := next.(frame.Model)
	if m.Open != 1 {
		t.Fatalf("a TabMsg opens the work tab, and tab %d stands open", m.Open)
	}
	next, _ = m.Update(frame.TabMsg{Name: "nothing"})
	if next.(frame.Model).Open != 1 {
		t.Fatalf("a name no tab carries leaves the open one, and tab %d stands open", next.(frame.Model).Open)
	}
}

// The marks wear the colours the config names, and a case run stands in for the window's start. [[spec/tickets/the-colours-stand-in-config]]
func TestMain(m *testing.M) {
	draw.LoadColoursForCases(filepath.Join("..", "..", ".."))
	m.Run()
}

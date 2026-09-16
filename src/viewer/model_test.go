// The keys and the arrivals, driven through Update the way the terminal drives
// them. Every model here reads memory and no file.

package main

import (
	"fmt"
	"strings"
	"testing"
	"time"

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

func row(at int, door, said string) Record {
	return Record{
		At:    time.Date(2026, 9, 11, 15, 0, at, 0, time.UTC),
		Level: "info",
		Kind:  door,
		Said:  said,
	}
}

func window(n int) model {
	m := newModel("no/such/log.jsonl", time.UTC)
	m.w, m.h = 120, 10+namesWide+headWide+footWide
	for at := 1; at <= n; at++ {
		m.all = append(m.all, row(at, "tool", fmt.Sprintf("line %d", at)))
	}
	m.rebuild()
	return m
}

func press(m model, keys ...string) model {
	for _, name := range keys {
		var msg tea.KeyMsg
		switch name {
		case "up":
			msg = tea.KeyMsg{Type: tea.KeyUp}
		case "down":
			msg = tea.KeyMsg{Type: tea.KeyDown}
		case "pgup":
			msg = tea.KeyMsg{Type: tea.KeyPgUp}
		case "pgdown":
			msg = tea.KeyMsg{Type: tea.KeyPgDown}
		case "home":
			msg = tea.KeyMsg{Type: tea.KeyHome}
		case "end":
			msg = tea.KeyMsg{Type: tea.KeyEnd}
		case "enter":
			msg = tea.KeyMsg{Type: tea.KeyEnter}
		default:
			msg = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune(name)}
		}
		out, _ := m.Update(msg)
		m = out.(model)
	}
	return m
}

func arrive(m model, recs ...Record) model {
	out, _ := m.Update(linesMsg{recs: recs})
	return out.(model)
}

func TestWAndSMoveTheLogUpAndDown(t *testing.T) {
	t.Parallel()
	m := press(window(20), "w", "w")
	if m.sel != 17 {
		t.Fatalf("two presses of w land on row 17, and landed on %d", m.sel)
	}
	m = press(m, "s")
	if m.sel != 18 {
		t.Fatalf("s moves one row down to 18, and landed on %d", m.sel)
	}
}

func TestTheArrowsScrollTheDetailsAndLeaveTheLogWhereItStands(t *testing.T) {
	t.Parallel()
	m := window(20)
	m.all[19].Text = strings.Repeat("a long reply line\n", 60)
	m = press(m, "enter", "down", "down", "down")
	if m.sel != 19 {
		t.Fatalf("the arrows leave the log on row 19, and it stands on %d", m.sel)
	}
	if m.box.YOffset != 3 {
		t.Fatalf("three downs scroll the details three lines, and they scrolled %d", m.box.YOffset)
	}
	m = press(m, "w")
	if m.sel != 18 || m.box.YOffset != 0 {
		t.Fatalf("w moves the log to 18 and opens its details at the top, and got row %d offset %d", m.sel, m.box.YOffset)
	}
}

func TestTheArrowsMoveTheLogWhileTheDetailsAreClosed(t *testing.T) {
	t.Parallel()
	m := press(window(20), "up")
	if m.sel != 18 {
		t.Fatalf("up moves the log to row 18 with the details closed, and landed on %d", m.sel)
	}
}

func TestEnterOpensTheDetailsAndEnterClosesThem(t *testing.T) {
	t.Parallel()
	m := press(window(5), "enter")
	if m.pane != paneDetails {
		t.Fatal("the first enter opens the details")
	}
	if !strings.Contains(m.View(), "│") {
		t.Fatal("the open details stand behind a rule")
	}
	m = press(m, "enter")
	if m.pane != paneShut {
		t.Fatal("the second enter closes the details")
	}
	if strings.Contains(m.View(), "│") {
		t.Fatal("the closed details leave no rule behind")
	}
}

func TestHomeGoesToTheFirstRowAndLetsGoOfTheNewest(t *testing.T) {
	t.Parallel()
	m := press(window(30), "home")
	if m.sel != 0 || m.top != 0 || m.follow {
		t.Fatalf("home lands on row 0 at the top and stops following, and got row %d top %d follow %v", m.sel, m.top, m.follow)
	}
}

func TestEndGoesToTheNewestRowAndFollowsWhatArrives(t *testing.T) {
	t.Parallel()
	m := press(window(30), "home", "end")
	if m.sel != 29 || !m.follow {
		t.Fatalf("end lands on row 29 and follows, and got row %d follow %v", m.sel, m.follow)
	}
	m = arrive(m, row(31, "tool", "line 31"))
	if m.sel != 30 {
		t.Fatalf("a following window moves onto the row that arrives, 30, and stands on %d", m.sel)
	}
}

func TestAnArrivingRowLeavesAHeldSelectionAlone(t *testing.T) {
	t.Parallel()
	m := press(window(30), "w", "w")
	top := m.top
	m = arrive(m, row(31, "tool", "line 31"), row(32, "tool", "line 32"))
	if m.sel != 27 || m.top != top || m.follow {
		t.Fatalf("a held window stays on row 27 at top %d, and got row %d top %d follow %v", top, m.sel, m.top, m.follow)
	}
}

func TestPageKeysStepAWholeWindow(t *testing.T) {
	t.Parallel()
	m := press(window(50), "pgup")
	if m.sel != 39 {
		t.Fatalf("pgup steps ten rows up to 39 in a window ten rows high, and landed on %d", m.sel)
	}
	m = press(m, "pgup", "pgup", "pgup", "pgup")
	if m.sel != 0 {
		t.Fatalf("pgup stops at row 0, and landed on %d", m.sel)
	}
	m = press(m, "pgdown")
	if m.sel != 10 || m.follow {
		t.Fatalf("pgdown steps ten rows down to 10 and holds, and got row %d follow %v", m.sel, m.follow)
	}
}

func TestSAtTheNewestRowStaysThere(t *testing.T) {
	t.Parallel()
	m := press(window(5), "s", "s")
	if m.sel != 4 || !m.follow {
		t.Fatalf("s at the newest row stays on 4 and follows, and got row %d follow %v", m.sel, m.follow)
	}
}

func TestAReplyArrivingUnderAHeldPromptReachesItsDetails(t *testing.T) {
	t.Parallel()
	m := window(0)
	m = arrive(m, row(1, "prompt", "are you bound?"), row(2, "tool", "Read"))
	m = press(m, "w", "enter")
	if strings.Contains(m.box.View(), "yes, bound") {
		t.Fatal("the details show no reply before one arrives")
	}
	m = arrive(m, row(3, "reply", "yes, bound"))
	if m.sel != 0 {
		t.Fatalf("the held selection stays on the prompt at 0, and stands on %d", m.sel)
	}
	if !strings.Contains(m.box.View(), "yes, bound") {
		t.Fatalf("the prompt's details take the reply once it lands, and show:\n%s", m.box.View())
	}
}

func alt(m model, key rune) model {
	out, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{key}, Alt: true})
	return out.(model)
}

func typed(m model, said string) model {
	for _, key := range said {
		out, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{key}})
		m = out.(model)
	}
	return m
}

func erase(m model, n int) model {
	for i := 0; i < n; i++ {
		out, _ := m.Update(tea.KeyMsg{Type: tea.KeyBackspace})
		m = out.(model)
	}
	return m
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

// [[spec/design_output/viewer#alt-l-raises-the-floor]]
func TestAltLRaisesTheFloorAndComesRoundAgain(t *testing.T) {
	t.Parallel()
	m := newModel("no/such/log.jsonl", time.UTC)
	m.w, m.h = 120, 10+namesWide+headWide+footWide
	for at, level := range []string{"debug", "info", "warn", "error", "fatal", ""} {
		r := row(at+1, "hook", "a "+level+" line")
		r.Level = level
		m.all = append(m.all, r)
	}
	m.rebuild()

	shown := func() int { return len(m.view) }
	if shown() != 5 {
		t.Fatalf("the floor opens at info and shows 5 rows, and it shows %d", shown())
	}
	if !strings.Contains(m.renderMarks(), "INFO") {
		t.Fatalf("the footer names the floor, and reads %q", m.renderMarks())
	}
	for _, want := range []struct {
		floor string
		rows  int
	}{{"warn", 3}, {"error", 2}, {"fatal", 1}, {"debug", 6}, {"info", 5}} {
		m = alt(m, 'l')
		if m.floor != want.floor || shown() != want.rows {
			t.Fatalf("alt+l brings the floor to %s with %d rows, and stands at %s with %d", want.floor, want.rows, m.floor, shown())
		}
		if !strings.Contains(m.renderMarks(), pad(strings.ToUpper(want.floor), floorWide)) {
			t.Fatalf("the footer names %s, and reads %q", want.floor, m.renderMarks())
		}
	}
}

func TestAltQuestionMarkOpensTheHelpAndClosesItAgain(t *testing.T) {
	t.Parallel()
	m := alt(window(3), '?')
	if m.pane != paneHelp || !strings.Contains(m.box.View(), "THE WINDOW") {
		t.Fatalf("alt+? opens the help, and the pane shows:\n%s", m.box.View())
	}
	m = press(m, "enter")
	if m.pane != paneDetails {
		t.Fatal("enter swaps the help for the details")
	}
	m = alt(alt(m, '?'), '?')
	if m.pane != paneShut {
		t.Fatal("alt+? twice closes the help")
	}
}

func TestAltFOpensTheFilterAndLettersNarrowTheLog(t *testing.T) {
	t.Parallel()
	m := window(0)
	m = arrive(m, row(1, "prompt", "are you bound?"), row(2, "tool", "Read"), row(3, "reply", "yes, bound"))
	m = alt(m, 'f')
	if m.pane != paneFilter || !strings.Contains(m.box.View(), "THE FILTER") {
		t.Fatalf("alt+f opens the filter, and the pane shows:\n%s", m.box.View())
	}
	m = typed(m, "kind: reply or s")
	if len(m.view) != 1 || m.all[m.view[0]].Kind != "reply" {
		t.Fatalf("w and s type into the filter, and the view holds %v", m.view)
	}
	if !strings.Contains(m.box.View(), "kind: reply or s") {
		t.Fatalf("the pane shows what a person types, and shows:\n%s", m.box.View())
	}
}

func TestAHeldFilterWearsRedAltFAndAClearedLineBringsEveryRowBack(t *testing.T) {
	t.Parallel()
	m := alt(window(5), 'f')
	m = typed(m, "line 3")
	if len(m.view) != 1 || m.filter.Empty() {
		t.Fatalf("the filter holds one row, and the view holds %v", m.view)
	}
	m = press(m, "enter")
	if m.pane != paneShut || len(m.view) != 1 {
		t.Fatalf("enter closes the filter pane and keeps the filter, and got pane %d view %v", m.pane, m.view)
	}
	if !strings.Contains(m.renderMarks(), levelStyle("error").Render("▼")) {
		t.Fatalf("a held filter lights the funnel, and the marks read %q", m.renderMarks())
	}
	m = erase(alt(m, 'f'), len("line 3"))
	if !m.filter.Empty() || len(m.view) != 5 {
		t.Fatalf("a cleared line drops the filter, and the view holds %v", m.view)
	}
	if m.pane != paneFilter {
		t.Fatal("the filter pane stands open while the line clears")
	}
	if !strings.Contains(m.renderMarks(), dimStyle.Render("▼")) {
		t.Fatalf("a dropped filter darkens the funnel, and the marks read %q", m.renderMarks())
	}
}

func TestAHalfTypedFilterKeepsTheLastOneThatWorkedAndSaysStillTyping(t *testing.T) {
	t.Parallel()
	m := alt(window(5), 'f')
	m = typed(m, `"line 3`)
	if !m.filter.Empty() || len(m.view) != 5 || m.filterBad != "still typing" {
		t.Fatalf("a half-typed phrase keeps every row and says still typing, and got %v %q", m.view, m.filterBad)
	}
	if !strings.Contains(m.box.View(), "still typing") {
		t.Fatalf("the pane says still typing, and shows:\n%s", m.box.View())
	}
}

func TestAFilterMovesAHeldSelectionOntoARowItKeeps(t *testing.T) {
	t.Parallel()
	m := press(window(10), "home")
	m = typed(alt(m, 'f'), "line 7 or line 9")
	if m.sel != 6 {
		t.Fatalf("the selection moves to the first kept row at or after it, index 6, and stands on %d", m.sel)
	}
}

func mixed() model {
	m := window(0)
	read := row(4, "tool", "a.md")
	read.Extra = map[string]string{"tool": "Read"}
	warn := row(5, "vale", "refused a line")
	warn.Level = "warn"
	return arrive(m, row(1, "prompt", "hi"), row(2, "tool", "x"), row(3, "prompt", "again"), read, warn)
}

func chord(m model, msg tea.KeyMsg) model {
	out, _ := m.Update(msg)
	return out.(model)
}

var (
	altShiftF = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'F'}, Alt: true}
	altQ      = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}, Alt: true}
)

// [[spec/design_output/viewer#one-key-filters-the-line]]
func TestAltShiftFKeepsTheSelectedKindAndTheSameChordClearsIt(t *testing.T) {
	t.Parallel()
	if altShiftF.String() != "alt+F" || altQ.String() != "alt+q" {
		t.Fatalf("the chords read %q and %q", altShiftF.String(), altQ.String())
	}
	m := press(mixed(), "home")
	m = chord(m, altShiftF)
	if m.input.Value() != "kind: /^prompt$/" || len(m.view) != 2 {
		t.Fatalf("alt+shift+f on a prompt keeps both prompts, and got %q %v", m.input.Value(), m.view)
	}
	if m.pane != paneShut {
		t.Fatalf("the chord filters while browsing and opens no pane, and opened pane %d", m.pane)
	}
	m = press(m, "s")
	if m.all[m.sel].Kind != "prompt" {
		t.Fatalf("s steps to the next prompt while the filter holds, and landed on %q", m.all[m.sel].Kind)
	}
	m = press(m, "w")
	m = chord(m, altShiftF)
	if !m.filter.Empty() || len(m.view) != 5 || m.input.Value() != "" {
		t.Fatalf("the same chord on a prompt clears the filter, and got %q %v", m.input.Value(), m.view)
	}
}

func TestAltShiftFOnAToolLineKeepsThatToolAlone(t *testing.T) {
	t.Parallel()
	m := press(mixed(), "end", "w")
	m = chord(m, altShiftF)
	if m.input.Value() != "tool: /^Read$/" || len(m.view) != 1 {
		t.Fatalf("alt+shift+f on a Read line keeps Read alone, and got %q %v", m.input.Value(), m.view)
	}
}

func TestAltQKeepsThePromptsAndTheRepliesAndTheSameChordClearsIt(t *testing.T) {
	t.Parallel()
	m := arrive(mixed(), row(6, "reply", "hello"))
	m = press(m, "end")
	m = chord(m, altQ)
	if m.input.Value() != talkFilter || len(m.view) != 3 || m.pane != paneShut {
		t.Fatalf("alt+q keeps the two prompts and the reply and opens no pane, and got %q %v %d", m.input.Value(), m.view, m.pane)
	}
	if !strings.Contains(m.renderMarks(), levelStyle("error").Render("▼")) {
		t.Fatalf("a filter alt+q sets lights the funnel, and the marks read %q", m.renderMarks())
	}
	m = chord(m, altQ)
	if !m.filter.Empty() || len(m.view) != 6 || m.input.Value() != "" {
		t.Fatalf("the same chord clears the filter, and got %q %v", m.input.Value(), m.view)
	}
	m = chord(m, tea.KeyMsg{Type: tea.KeyCtrlF, Alt: true})
	if !m.filter.Empty() || m.pane != paneShut {
		t.Fatalf("alt+ctrl+f went, and it set %q", m.input.Value())
	}
}

func TestAnotherChordReplacesTheFilterAndLeavesTheHeaderShort(t *testing.T) {
	t.Parallel()
	m := chord(press(mixed(), "home"), altShiftF)
	m = chord(m, altQ)
	if m.input.Value() != talkFilter {
		t.Fatalf("a second chord writes its own filter, and got %q", m.input.Value())
	}
	strip := m.renderStrip()
	if strings.Contains(strip, "shift") || strings.Contains(strip, "alt+q") {
		t.Fatalf("the strip names no chord, and reads %q", strip)
	}
	if !strings.Contains(FilterHelp, "alt+shift+f") || !strings.Contains(FilterHelp, "alt+q") {
		t.Fatal("the filter pane names both chords")
	}
	if strings.Contains(FilterHelp, "ctrl+f") || strings.Contains(HelpText, "ctrl+f") {
		t.Fatal("no help names the chord that went")
	}
}

// [[spec/design_output/viewer#e-finds-the-newest-error]]
func TestEJumpsToTheNewestErrorAndAgainToTheOneBefore(t *testing.T) {
	t.Parallel()
	m := window(10)
	m.all[2].Level, m.all[6].Level = "error", "error"
	m.all[8].Level = "warn"
	m = press(m, "home", "e")
	if m.sel != 6 || m.follow {
		t.Fatalf("e lands on the newest error at 6 and holds, and got row %d follow %v", m.sel, m.follow)
	}
	m = press(m, "e")
	if m.sel != 2 {
		t.Fatalf("e again lands on the error before, at 2, and landed on %d", m.sel)
	}
	m = press(m, "e")
	if m.sel != 2 {
		t.Fatalf("e on the oldest error stays, and landed on %d", m.sel)
	}
}

func TestEWithNoErrorLeavesTheSelectionWhereItStands(t *testing.T) {
	t.Parallel()
	m := press(window(5), "home", "e")
	if m.sel != 0 {
		t.Fatalf("e finds no error and leaves row 0, and landed on %d", m.sel)
	}
}

func TestARestartedLogReplacesWhatWasRead(t *testing.T) {
	t.Parallel()
	m := press(window(10), "home")
	out, _ := m.Update(linesMsg{recs: []Record{row(1, "level0", "session start")}, restarted: true})
	m = out.(model)
	if len(m.all) != 1 || m.sel != 0 || !m.follow {
		t.Fatalf("a restart keeps the one new row, selected and following, and got %d rows at %d follow %v", len(m.all), m.sel, m.follow)
	}
}

// The keys and the arrivals, driven through Update the way the terminal drives
// them. Every model here reads memory and no file.

package main

import (
	"fmt"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/draw"
	"quackitect/tui/frame"
	"quackitect/tui/log"
)

func row(at int, door, said string) log.Record {
	return log.Record{
		At:    time.Date(2026, 9, 11, 15, 0, at, 0, time.UTC),
		Level: "info",
		Kind:  door,
		Said:  said,
	}
}

func window(n int) frame.Model {
	m := newModel("no/such/log.jsonl", time.UTC)
	m.W, m.H = 120, 10+frame.NamesWide+frame.HeadWide+frame.FootWide
	for at := 1; at <= n; at++ {
		logTab(m).All = append(logTab(m).All, row(at, "tool", fmt.Sprintf("line %d", at)))
	}
	logTab(m).Rebuild(m.Rows())
	return m
}

func press(m frame.Model, keys ...string) frame.Model {
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
		m = out.(frame.Model)
	}
	return m
}

func arrive(m frame.Model, recs ...log.Record) frame.Model {
	out, _ := m.Update(log.LinesMsg{Recs: recs})
	return out.(frame.Model)
}

func TestWAndSMoveTheLogUpAndDown(t *testing.T) {
	t.Parallel()
	m := press(window(20), "w", "w")
	if logTab(m).Sel != 17 {
		t.Fatalf("two presses of w land on row 17, and landed on %d", logTab(m).Sel)
	}
	m = press(m, "s")
	if logTab(m).Sel != 18 {
		t.Fatalf("s moves one row down to 18, and landed on %d", logTab(m).Sel)
	}
}

func TestTheArrowsScrollTheDetailsAndLeaveTheLogWhereItStands(t *testing.T) {
	t.Parallel()
	m := window(20)
	logTab(m).All[19].Text = strings.Repeat("a long reply line\n", 60)
	m = press(m, "enter", "down", "down", "down")
	if logTab(m).Sel != 19 {
		t.Fatalf("the arrows leave the log on row 19, and it stands on %d", logTab(m).Sel)
	}
	if m.Box.YOffset != 3 {
		t.Fatalf("three downs scroll the details three lines, and they scrolled %d", m.Box.YOffset)
	}
	m = press(m, "w")
	if logTab(m).Sel != 18 || m.Box.YOffset != 0 {
		t.Fatalf("w moves the log to 18 and opens its details at the top, and got row %d offset %d", logTab(m).Sel, m.Box.YOffset)
	}
}

func TestTheArrowsMoveTheLogWhileTheDetailsAreClosed(t *testing.T) {
	t.Parallel()
	m := press(window(20), "up")
	if logTab(m).Sel != 18 {
		t.Fatalf("up moves the log to row 18 with the details closed, and landed on %d", logTab(m).Sel)
	}
}

func TestEnterOpensTheDetailsAndEnterClosesThem(t *testing.T) {
	t.Parallel()
	m := press(window(5), "enter")
	if m.Pane != frame.PaneDetails {
		t.Fatal("the first enter opens the details")
	}
	if !strings.Contains(m.View(), "│") {
		t.Fatal("the open details stand behind a rule")
	}
	m = press(m, "enter")
	if m.Pane != frame.PaneShut {
		t.Fatal("the second enter closes the details")
	}
	if strings.Contains(m.View(), "│") {
		t.Fatal("the closed details leave no rule behind")
	}
}

func TestHomeGoesToTheFirstRowAndLetsGoOfTheNewest(t *testing.T) {
	t.Parallel()
	m := press(window(30), "home")
	if logTab(m).Sel != 0 || logTab(m).Top != 0 || logTab(m).Follow {
		t.Fatalf("home lands on row 0 at the top and stops following, and got row %d top %d follow %v", logTab(m).Sel, logTab(m).Top, logTab(m).Follow)
	}
}

func TestEndGoesToTheNewestRowAndFollowsWhatArrives(t *testing.T) {
	t.Parallel()
	m := press(window(30), "home", "end")
	if logTab(m).Sel != 29 || !logTab(m).Follow {
		t.Fatalf("end lands on row 29 and follows, and got row %d follow %v", logTab(m).Sel, logTab(m).Follow)
	}
	m = arrive(m, row(31, "tool", "line 31"))
	if logTab(m).Sel != 30 {
		t.Fatalf("a following window moves onto the row that arrives, 30, and stands on %d", logTab(m).Sel)
	}
}

func TestAnArrivingRowLeavesAHeldSelectionAlone(t *testing.T) {
	t.Parallel()
	m := press(window(30), "w", "w")
	top := logTab(m).Top
	m = arrive(m, row(31, "tool", "line 31"), row(32, "tool", "line 32"))
	if logTab(m).Sel != 27 || logTab(m).Top != top || logTab(m).Follow {
		t.Fatalf("a held window stays on row 27 at top %d, and got row %d top %d follow %v", top, logTab(m).Sel, logTab(m).Top, logTab(m).Follow)
	}
}

func TestPageKeysStepAWholeWindow(t *testing.T) {
	t.Parallel()
	m := press(window(50), "pgup")
	if logTab(m).Sel != 39 {
		t.Fatalf("pgup steps ten rows up to 39 in a window ten rows high, and landed on %d", logTab(m).Sel)
	}
	m = press(m, "pgup", "pgup", "pgup", "pgup")
	if logTab(m).Sel != 0 {
		t.Fatalf("pgup stops at row 0, and landed on %d", logTab(m).Sel)
	}
	m = press(m, "pgdown")
	if logTab(m).Sel != 10 || logTab(m).Follow {
		t.Fatalf("pgdown steps ten rows down to 10 and holds, and got row %d follow %v", logTab(m).Sel, logTab(m).Follow)
	}
}

func TestSAtTheNewestRowStaysThere(t *testing.T) {
	t.Parallel()
	m := press(window(5), "s", "s")
	if logTab(m).Sel != 4 || !logTab(m).Follow {
		t.Fatalf("s at the newest row stays on 4 and follows, and got row %d follow %v", logTab(m).Sel, logTab(m).Follow)
	}
}

func TestAReplyArrivingUnderAHeldPromptReachesItsDetails(t *testing.T) {
	t.Parallel()
	m := window(0)
	m = arrive(m, row(1, "prompt", "are you bound?"), row(2, "tool", "Read"))
	m = press(m, "w", "enter")
	if strings.Contains(m.Box.View(), "yes, bound") {
		t.Fatal("the details show no reply before one arrives")
	}
	m = arrive(m, row(3, "reply", "yes, bound"))
	if logTab(m).Sel != 0 {
		t.Fatalf("the held selection stays on the prompt at 0, and stands on %d", logTab(m).Sel)
	}
	if !strings.Contains(m.Box.View(), "yes, bound") {
		t.Fatalf("the prompt's details take the reply once it lands, and show:\n%s", m.Box.View())
	}
}

func alt(m frame.Model, key rune) frame.Model {
	out, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{key}, Alt: true})
	return out.(frame.Model)
}

func typed(m frame.Model, said string) frame.Model {
	for _, key := range said {
		out, _ := m.Update(tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{key}})
		m = out.(frame.Model)
	}
	return m
}

func erase(m frame.Model, n int) frame.Model {
	for i := 0; i < n; i++ {
		out, _ := m.Update(tea.KeyMsg{Type: tea.KeyBackspace})
		m = out.(frame.Model)
	}
	return m
}

// [[spec/design_output/tui#alt-l-raises-the-floor]]
func TestAltLRaisesTheFloorAndComesRoundAgain(t *testing.T) {
	t.Parallel()
	m := newModel("no/such/log.jsonl", time.UTC)
	m.W, m.H = 120, 10+frame.NamesWide+frame.HeadWide+frame.FootWide
	for at, level := range []string{"debug", "info", "warn", "error", "fatal", ""} {
		r := row(at+1, "hook", "a "+level+" line")
		r.Level = level
		logTab(m).All = append(logTab(m).All, r)
	}
	logTab(m).Rebuild(m.Rows())

	shown := func() int { return len(logTab(m).View) }
	if shown() != 5 {
		t.Fatalf("the floor opens at info and shows 5 rows, and it shows %d", shown())
	}
	if !strings.Contains(m.RenderMarks(), "INFO") {
		t.Fatalf("the footer names the floor, and reads %q", m.RenderMarks())
	}
	for _, want := range []struct {
		floor string
		rows  int
	}{{"warn", 3}, {"error", 2}, {"fatal", 1}, {"debug", 6}, {"info", 5}} {
		m = alt(m, 'l')
		if logTab(m).Floor != want.floor || shown() != want.rows {
			t.Fatalf("alt+l brings the floor to %s with %d rows, and stands at %s with %d", want.floor, want.rows, logTab(m).Floor, shown())
		}
		if !strings.Contains(m.RenderMarks(), draw.Pad(strings.ToUpper(want.floor), frame.FloorWide)) {
			t.Fatalf("the footer names %s, and reads %q", want.floor, m.RenderMarks())
		}
	}
}

func TestAltQuestionMarkOpensTheHelpAndClosesItAgain(t *testing.T) {
	t.Parallel()
	m := alt(window(3), '?')
	if m.Pane != frame.PaneHelp || !strings.Contains(m.Box.View(), "GLOBAL") {
		t.Fatalf("alt+? opens the help, and the pane shows:\n%s", m.Box.View())
	}
	m = press(m, "enter")
	if m.Pane != frame.PaneDetails {
		t.Fatal("enter swaps the help for the details")
	}
	m = alt(alt(m, '?'), '?')
	if m.Pane != frame.PaneShut {
		t.Fatal("alt+? twice closes the help")
	}
}

func TestAltFOpensTheFilterAndLettersNarrowTheLog(t *testing.T) {
	t.Parallel()
	m := window(0)
	m = arrive(m, row(1, "prompt", "are you bound?"), row(2, "tool", "Read"), row(3, "reply", "yes, bound"))
	m = alt(m, 'f')
	if m.Pane != frame.PaneFilter || !strings.Contains(m.Box.View(), "THE LANGUAGE") {
		t.Fatalf("alt+f opens the filter, and the pane shows:\n%s", m.Box.View())
	}
	m = typed(m, "kind: reply or s")
	if len(logTab(m).View) != 1 || logTab(m).All[logTab(m).View[0]].Kind != "reply" {
		t.Fatalf("w and s type into the filter, and the view holds %v", logTab(m).View)
	}
	if !strings.Contains(m.Box.View(), "kind: reply or s") {
		t.Fatalf("the pane shows what a person types, and shows:\n%s", m.Box.View())
	}
}

func TestAHeldFilterWearsRedAltFAndAClearedLineBringsEveryRowBack(t *testing.T) {
	t.Parallel()
	m := alt(window(5), 'f')
	m = typed(m, "line 3")
	if len(logTab(m).View) != 1 || logTab(m).Filter.Empty() {
		t.Fatalf("the filter holds one row, and the view holds %v", logTab(m).View)
	}
	m = press(m, "enter")
	if m.Pane != frame.PaneShut || len(logTab(m).View) != 1 {
		t.Fatalf("enter closes the filter pane and keeps the filter, and got pane %d view %v", m.Pane, logTab(m).View)
	}
	if !strings.Contains(m.RenderMarks(), draw.LevelStyle("error").Render(frame.FilterMark)) {
		t.Fatalf("a held filter lights the funnel, and the marks read %q", m.RenderMarks())
	}
	m = erase(alt(m, 'f'), len("line 3"))
	if !logTab(m).Filter.Empty() || len(logTab(m).View) != 5 {
		t.Fatalf("a cleared line drops the filter, and the view holds %v", logTab(m).View)
	}
	if m.Pane != frame.PaneFilter {
		t.Fatal("the filter pane stands open while the line clears")
	}
	if !strings.Contains(m.RenderMarks(), draw.Dim.Render(frame.FilterMark)) {
		t.Fatalf("a dropped filter darkens the funnel, and the marks read %q", m.RenderMarks())
	}
}

func TestAHalfTypedFilterKeepsTheLastOneThatWorkedAndSaysStillTyping(t *testing.T) {
	t.Parallel()
	m := alt(window(5), 'f')
	m = typed(m, `"line 3`)
	if !logTab(m).Filter.Empty() || len(logTab(m).View) != 5 || m.FilterBad != "still typing" {
		t.Fatalf("a half-typed phrase keeps every row and says still typing, and got %v %q", logTab(m).View, m.FilterBad)
	}
	if !strings.Contains(m.Box.View(), "still typing") {
		t.Fatalf("the pane says still typing, and shows:\n%s", m.Box.View())
	}
}

func TestAFilterMovesAHeldSelectionOntoARowItKeeps(t *testing.T) {
	t.Parallel()
	m := press(window(10), "home")
	m = typed(alt(m, 'f'), "line 7 or line 9")
	if logTab(m).Sel != 6 {
		t.Fatalf("the selection moves to the first kept row at or after it, index 6, and stands on %d", logTab(m).Sel)
	}
}

func mixed() frame.Model {
	m := window(0)
	read := row(4, "tool", "a.md")
	read.Extra = map[string]string{"tool": "Read"}
	warn := row(5, "vale", "refused a line")
	warn.Level = "warn"
	return arrive(m, row(1, "prompt", "hi"), row(2, "tool", "x"), row(3, "prompt", "again"), read, warn)
}

func chord(m frame.Model, msg tea.KeyMsg) frame.Model {
	out, _ := m.Update(msg)
	return out.(frame.Model)
}

var (
	altShiftF = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'F'}, Alt: true}
	altQ      = tea.KeyMsg{Type: tea.KeyRunes, Runes: []rune{'q'}, Alt: true}
)

// [[spec/design_output/tui#one-key-filters-the-line]]
func TestAltShiftFKeepsTheSelectedKindAndTheSameChordClearsIt(t *testing.T) {
	t.Parallel()
	if altShiftF.String() != "alt+F" || altQ.String() != "alt+q" {
		t.Fatalf("the chords read %q and %q", altShiftF.String(), altQ.String())
	}
	m := press(mixed(), "home")
	m = chord(m, altShiftF)
	if m.Input.Value() != "kind: /^prompt$/" || len(logTab(m).View) != 2 {
		t.Fatalf("alt+shift+f on a prompt keeps both prompts, and got %q %v", m.Input.Value(), logTab(m).View)
	}
	if m.Pane != frame.PaneShut {
		t.Fatalf("the chord filters while browsing and opens no pane, and opened pane %d", m.Pane)
	}
	m = press(m, "s")
	if logTab(m).All[logTab(m).Sel].Kind != "prompt" {
		t.Fatalf("s steps to the next prompt while the filter holds, and landed on %q", logTab(m).All[logTab(m).Sel].Kind)
	}
	m = press(m, "w")
	m = chord(m, altShiftF)
	if !logTab(m).Filter.Empty() || len(logTab(m).View) != 5 || m.Input.Value() != "" {
		t.Fatalf("the same chord on a prompt clears the filter, and got %q %v", m.Input.Value(), logTab(m).View)
	}
}

func TestAltShiftFOnAToolLineKeepsThatToolAlone(t *testing.T) {
	t.Parallel()
	m := press(mixed(), "end", "w")
	m = chord(m, altShiftF)
	if m.Input.Value() != "tool: /^Read$/" || len(logTab(m).View) != 1 {
		t.Fatalf("alt+shift+f on a Read line keeps Read alone, and got %q %v", m.Input.Value(), logTab(m).View)
	}
}

func TestAltQKeepsThePromptsAndTheRepliesAndTheSameChordClearsIt(t *testing.T) {
	t.Parallel()
	m := arrive(mixed(), row(6, "reply", "hello"))
	m = press(m, "end")
	m = chord(m, altQ)
	if m.Input.Value() != log.PromptsFilter || len(logTab(m).View) != 3 || m.Pane != frame.PaneShut {
		t.Fatalf("alt+q keeps the two prompts and the reply and opens no pane, and got %q %v %d", m.Input.Value(), logTab(m).View, m.Pane)
	}
	if !strings.Contains(m.RenderMarks(), draw.LevelStyle("error").Render(frame.FilterMark)) {
		t.Fatalf("a filter alt+q sets lights the funnel, and the marks read %q", m.RenderMarks())
	}
	m = chord(m, altQ)
	if !logTab(m).Filter.Empty() || len(logTab(m).View) != 6 || m.Input.Value() != "" {
		t.Fatalf("the same chord clears the filter, and got %q %v", m.Input.Value(), logTab(m).View)
	}
	m = chord(m, tea.KeyMsg{Type: tea.KeyCtrlF, Alt: true})
	if !logTab(m).Filter.Empty() || m.Pane != frame.PaneShut {
		t.Fatalf("alt+ctrl+f went, and it set %q", m.Input.Value())
	}
}

func TestAnotherChordReplacesTheFilterAndLeavesTheHeaderShort(t *testing.T) {
	t.Parallel()
	m := chord(press(mixed(), "home"), altShiftF)
	m = chord(m, altQ)
	if m.Input.Value() != log.PromptsFilter {
		t.Fatalf("a second chord writes its own filter, and got %q", m.Input.Value())
	}
	strip := m.RenderStrip()
	if strings.Contains(strip, "shift") || strings.Contains(strip, "alt+q") {
		t.Fatalf("the strip names no chord, and reads %q", strip)
	}
	// The presets name the chords, once, and the language under them names none. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	pane := frame.RenderParts(m.PresetParts(), 80)
	if !strings.Contains(pane, "alt+⇧f") || !strings.Contains(pane, "alt+q") {
		t.Fatalf("the presets name both chords, and read:\n%s", pane)
	}
	if strings.Contains(frame.FilterHelp, "alt+") || strings.Contains(frame.HelpText, "ctrl+f") {
		t.Fatal("the language names no chord, and no help names the chord that went")
	}
}

// [[spec/design_output/tui#e-finds-the-newest-error]]
func TestEJumpsToTheNewestErrorAndAgainToTheOneBefore(t *testing.T) {
	t.Parallel()
	m := window(10)
	logTab(m).All[2].Level, logTab(m).All[6].Level = "error", "error"
	logTab(m).All[8].Level = "warn"
	m = press(m, "home", "e")
	if logTab(m).Sel != 6 || logTab(m).Follow {
		t.Fatalf("e lands on the newest error at 6 and holds, and got row %d follow %v", logTab(m).Sel, logTab(m).Follow)
	}
	m = press(m, "e")
	if logTab(m).Sel != 2 {
		t.Fatalf("e again lands on the error before, at 2, and landed on %d", logTab(m).Sel)
	}
	m = press(m, "e")
	if logTab(m).Sel != 2 {
		t.Fatalf("e on the oldest error stays, and landed on %d", logTab(m).Sel)
	}
}

func TestEWithNoErrorLeavesTheSelectionWhereItStands(t *testing.T) {
	t.Parallel()
	m := press(window(5), "home", "e")
	if logTab(m).Sel != 0 {
		t.Fatalf("e finds no error and leaves row 0, and landed on %d", logTab(m).Sel)
	}
}

func TestARestartedLogReplacesWhatWasRead(t *testing.T) {
	t.Parallel()
	m := press(window(10), "home")
	out, _ := m.Update(log.LinesMsg{Recs: []log.Record{row(1, "level0", "session start")}, Restarted: true})
	m = out.(frame.Model)
	if len(logTab(m).All) != 1 || logTab(m).Sel != 0 || !logTab(m).Follow {
		t.Fatalf("a restart keeps the one new row, selected and following, and got %d rows at %d follow %v", len(logTab(m).All), logTab(m).Sel, logTab(m).Follow)
	}
}

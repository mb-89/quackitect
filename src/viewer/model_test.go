// The keys and the arrivals, driven through Update the way the terminal drives
// them. Every model here reads memory and no file.

package main

import (
	"fmt"
	"strings"
	"testing"
	"time"

	tea "github.com/charmbracelet/bubbletea"
)

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
	m.w, m.h = 120, 10+headWide
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

// [[spec/design_output/viewer#the-header]]
func TestTheHeaderNamesTheColumnsAndTheThreeKeysAboveARule(t *testing.T) {
	t.Parallel()
	lines := strings.Split(window(3).View(), "\n")
	for _, want := range []string{"time", "level", "kind", "said", "enter details", "alt+? help", "alt+f filter"} {
		if !strings.Contains(lines[0], want) {
			t.Fatalf("the first line names %q, and reads %q", want, lines[0])
		}
	}
	if !strings.Contains(lines[1], "────") {
		t.Fatalf("the second line is a rule, and reads %q", lines[1])
	}
	if !strings.Contains(lines[2], "line 1") {
		t.Fatalf("the log starts under the rule, and the third line reads %q", lines[2])
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
	head := strings.Split(m.renderHeader(), "\n")[0]
	if !strings.Contains(head, levelStyle("error").Render("alt+f filter")) {
		t.Fatalf("a held filter wears alt+f in bold red, and the header reads %q", head)
	}
	m = erase(alt(m, 'f'), len("line 3"))
	if !m.filter.Empty() || len(m.view) != 5 {
		t.Fatalf("a cleared line drops the filter, and the view holds %v", m.view)
	}
	if m.pane != paneFilter {
		t.Fatal("the filter pane stands open while the line clears")
	}
	head = strings.Split(m.renderHeader(), "\n")[0]
	if !strings.Contains(head, dimStyle.Render("alt+f filter")) {
		t.Fatalf("a dropped filter wears alt+f as it did, and the header reads %q", head)
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
	altCtrlF  = tea.KeyMsg{Type: tea.KeyCtrlF, Alt: true}
)

// [[spec/design_output/viewer#one-key-filters-the-line]]
func TestAltShiftFKeepsTheSelectedKindAndTheSameChordClearsIt(t *testing.T) {
	t.Parallel()
	if altShiftF.String() != "alt+F" || altCtrlF.String() != "alt+ctrl+f" {
		t.Fatalf("the chords read %q and %q", altShiftF.String(), altCtrlF.String())
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

func TestAltCtrlFKeepsTheSelectedLevelAndTheSameChordClearsIt(t *testing.T) {
	t.Parallel()
	m := press(mixed(), "end")
	m = chord(m, altCtrlF)
	if m.input.Value() != "level: /^warn$/" || len(m.view) != 1 || m.pane != paneShut {
		t.Fatalf("alt+ctrl+f on a warning keeps warnings alone and opens no pane, and got %q %v %d", m.input.Value(), m.view, m.pane)
	}
	m = chord(m, altCtrlF)
	if !m.filter.Empty() || len(m.view) != 5 {
		t.Fatalf("the same chord clears the filter, and got %q %v", m.input.Value(), m.view)
	}
}

func TestAnotherKindReplacesTheFilterAndLeavesTheHeaderShort(t *testing.T) {
	t.Parallel()
	m := chord(press(mixed(), "home"), altShiftF)
	m = press(m, "end")
	m = chord(m, altCtrlF)
	if m.input.Value() != "level: /^info$/" {
		t.Fatalf("a chord on another line writes its own filter, and got %q", m.input.Value())
	}
	head := strings.Split(m.renderHeader(), "\n")[0]
	if strings.Contains(head, "shift") || strings.Contains(head, "ctrl") {
		t.Fatalf("the header names no chord, and reads %q", head)
	}
	if !strings.Contains(FilterHelp, "alt+shift+f") || !strings.Contains(FilterHelp, "alt+ctrl+f") {
		t.Fatal("the filter pane names both chords")
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

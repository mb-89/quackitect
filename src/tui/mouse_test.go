// The mouse, driven through Update the way the terminal drives it: a press on
// the strip, a press on a row, and the wheel over each side of the split.

package main

import (
	"testing"

	tea "github.com/charmbracelet/bubbletea"
)

func click(m model, x, y int) model {
	msg := tea.MouseMsg{X: x, Y: y, Button: tea.MouseButtonLeft, Action: tea.MouseActionPress}
	next, _ := m.Update(msg)
	return next.(model)
}

func wheel(m model, x int, up bool) model {
	button := tea.MouseButtonWheelDown
	if up {
		button = tea.MouseButtonWheelUp
	}
	msg := tea.MouseMsg{X: x, Y: 5, Button: button, Action: tea.MouseActionPress}
	next, _ := m.Update(msg)
	return next.(model)
}

func TestAPressOnARowSelectsThatRowAndAPressBelowTheLastOneHoldsIt(t *testing.T) {
	t.Parallel()
	m := window(5)
	m = click(m, 10, firstRow())
	if m.at() != 0 {
		t.Fatalf("a press on the first row selects it, and the cursor stands at %d", m.at())
	}
	m = click(m, 10, firstRow()+2)
	if m.at() != 2 {
		t.Fatalf("a press on the third row selects it, and the cursor stands at %d", m.at())
	}
	m = click(m, 10, firstRow()+9)
	if m.at() != 2 {
		t.Fatalf("a press past the last row holds the cursor, and it stands at %d", m.at())
	}
}

func TestAPressOnTheNamesRowSortsAndOpensNoPane(t *testing.T) {
	t.Parallel()
	m := click(window(5), gutterWide, namesRow)
	if m.sortAt != 0 {
		t.Fatalf("a press on the first name sorts by it, and the sort stands at %d", m.sortAt)
	}
	if m.pane != paneShut {
		t.Fatalf("a press on the names row opens no pane, and the pane reads %d", m.pane)
	}
}

func TestAPressOnTheStripOpensTheTabUnderItAndTheHelpAtItsRightEnd(t *testing.T) {
	t.Parallel()
	m := window(5)
	if n := m.tabAt(3); n != 1 {
		t.Fatalf("the log tab stands under column 3, and tabAt answers %d", n)
	}
	if n := m.tabAt(90); n != 0 {
		t.Fatalf("no tab stands under column 90, and tabAt answers %d", n)
	}
	m = click(m, m.w-2, stripRow)
	if m.pane != paneHelp {
		t.Fatalf("a press on the help key opens the help, and the pane reads %d", m.pane)
	}
	m = click(m, m.w-2, stripRow)
	if m.pane != paneShut {
		t.Fatalf("a second press shuts the help, and the pane reads %d", m.pane)
	}
}

func TestTheWheelMovesTheLogOverTheListAndScrollsThePaneOverThePane(t *testing.T) {
	t.Parallel()
	m := window(30)
	m = click(m, 10, firstRow())
	was := m.at()
	m = wheel(m, 10, false)
	if m.at() != was+wheelStep {
		t.Fatalf("the wheel carries %d rows down, and the cursor moved from %d to %d", wheelStep, was, m.at())
	}
	m = wheel(m, 10, true)
	if m.at() != was {
		t.Fatalf("the wheel carries %d rows back up, and the cursor stands at %d", wheelStep, m.at())
	}

	m = press(m, "enter")
	if m.pane != paneDetails {
		t.Fatalf("enter opens the details, and the pane reads %d", m.pane)
	}
	held := m.at()
	m = wheel(m, m.listWidth()+1, false)
	if m.at() != held {
		t.Fatalf("the wheel over the pane holds the cursor, and it moved to %d", m.at())
	}
}

func TestThePressAndTheWheelReachNothingWhileTheFilterTakesLetters(t *testing.T) {
	t.Parallel()
	m := alt(window(5), 'f')
	if m.pane != paneFilter {
		t.Fatalf("alt+f opens the filter, and the pane reads %d", m.pane)
	}
	was := m.at()
	m = click(m, 10, firstRow())
	if m.at() != was || m.pane != paneFilter {
		t.Fatalf("a press reaches nothing while the filter takes letters, and the cursor stands at %d", m.at())
	}
	m = wheel(m, 10, false)
	if m.at() != was {
		t.Fatalf("the wheel reaches nothing while the filter takes letters, and the cursor stands at %d", m.at())
	}
}

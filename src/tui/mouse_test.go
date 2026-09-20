// The mouse, driven through Update the way the terminal drives it: a press on
// the strip, a press on a row, and the wheel over each side of the split.

package main

import (
	"quackitect/tui/draw"

	"quackitect/tui/frame"

	"testing"

	tea "github.com/charmbracelet/bubbletea"
)

func click(m frame.Model, x, y int) frame.Model {
	msg := tea.MouseMsg{X: x, Y: y, Button: tea.MouseButtonLeft, Action: tea.MouseActionPress}
	next, _ := m.Update(msg)
	return next.(frame.Model)
}

func wheel(m frame.Model, x int, up bool) frame.Model {
	button := tea.MouseButtonWheelDown
	if up {
		button = tea.MouseButtonWheelUp
	}
	msg := tea.MouseMsg{X: x, Y: 5, Button: button, Action: tea.MouseActionPress}
	next, _ := m.Update(msg)
	return next.(frame.Model)
}

func TestAPressOnARowSelectsThatRowAndAPressBelowTheLastOneHoldsIt(t *testing.T) {
	t.Parallel()
	m := window(5)
	m = click(m, 10, frame.FirstRow())
	if logTab(m).At() != 0 {
		t.Fatalf("a press on the first row selects it, and the cursor stands at %d", logTab(m).At())
	}
	m = click(m, 10, frame.FirstRow()+2)
	if logTab(m).At() != 2 {
		t.Fatalf("a press on the third row selects it, and the cursor stands at %d", logTab(m).At())
	}
	m = click(m, 10, frame.FirstRow()+9)
	if logTab(m).At() != 2 {
		t.Fatalf("a press past the last row holds the cursor, and it stands at %d", logTab(m).At())
	}
}

func TestAPressOnTheNamesRowSortsAndOpensNoPane(t *testing.T) {
	t.Parallel()
	m := click(window(5), draw.GutterWide, frame.NamesRow)
	if logTab(m).SortAt != 0 {
		t.Fatalf("a press on the first name sorts by it, and the sort stands at %d", logTab(m).SortAt)
	}
	if m.Pane != frame.PaneShut {
		t.Fatalf("a press on the names row opens no pane, and the pane reads %d", m.Pane)
	}
}

func TestAPressOnTheStripOpensTheTabUnderItAndTheHelpAtItsRightEnd(t *testing.T) {
	t.Parallel()
	m := window(5)
	if n := m.TabAt(3); n != 1 {
		t.Fatalf("the log tab stands under column 3, and TabAt answers %d", n)
	}
	if n := m.TabAt(90); n != 0 {
		t.Fatalf("no tab stands under column 90, and TabAt answers %d", n)
	}
	m = click(m, m.W-2, frame.StripRow)
	if m.Pane != frame.PaneHelp {
		t.Fatalf("a press on the help key opens the help, and the pane reads %d", m.Pane)
	}
	m = click(m, m.W-2, frame.StripRow)
	if m.Pane != frame.PaneShut {
		t.Fatalf("a second press shuts the help, and the pane reads %d", m.Pane)
	}
}

func TestTheWheelMovesTheLogOverTheListAndScrollsThePaneOverThePane(t *testing.T) {
	t.Parallel()
	m := window(30)
	m = click(m, 10, frame.FirstRow())
	was := logTab(m).At()
	m = wheel(m, 10, false)
	if logTab(m).At() != was+frame.WheelStep {
		t.Fatalf("the wheel carries %d rows down, and the cursor moved from %d to %d", frame.WheelStep, was, logTab(m).At())
	}
	m = wheel(m, 10, true)
	if logTab(m).At() != was {
		t.Fatalf("the wheel carries %d rows back up, and the cursor stands at %d", frame.WheelStep, logTab(m).At())
	}

	m = press(m, "enter")
	if m.Pane != frame.PaneDetails {
		t.Fatalf("enter opens the details, and the pane reads %d", m.Pane)
	}
	held := logTab(m).At()
	m = wheel(m, m.ListWidth()+1, false)
	if logTab(m).At() != held {
		t.Fatalf("the wheel over the pane holds the cursor, and it moved to %d", logTab(m).At())
	}
}

// The mouse reaches the rows under the filter pane, the way it does under the details. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func TestThePressAndTheWheelReachTheRowsWhileTheFilterTakesLetters(t *testing.T) {
	t.Parallel()
	m := alt(window(5), 'f')
	if m.Pane != frame.PaneFilter {
		t.Fatalf("alt+f opens the filter, and the pane reads %d", m.Pane)
	}
	m = click(m, 10, frame.FirstRow())
	if logTab(m).At() != 0 || m.Pane != frame.PaneFilter {
		t.Fatalf("a press selects the first row under the pane, and the cursor stands at %d", logTab(m).At())
	}
	m = wheel(m, 10, false)
	if logTab(m).At() != 3 {
		t.Fatalf("the wheel moves the log under the pane, and the cursor stands at %d", logTab(m).At())
	}
}

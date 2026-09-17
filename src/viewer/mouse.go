// The mouse. A press on the strip opens the tab under it or the help at its
// right end, a press on a row selects that row, and the wheel moves the log or
// scrolls the open pane. The window asks the terminal for these events, and a
// terminal reporting none leaves every move to the keys.
// [[spec/design_output/viewer#the-mouse-reaches-the-window]]

package main

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

// The row the strip stands on, the row the column names stand on, and the rows one wheel notch carries. [[spec/design_output/viewer#the-mouse-reaches-the-window]]
const (
	stripRow  = 0
	namesRow  = headWide
	wheelStep = 3
)

// The first row a list line stands on, under the strip, the rule and the names. [[spec/design_output/viewer#the-window-is-a-split]]
func firstRow() int { return headWide + namesWide }

// [[spec/design_output/viewer#the-mouse-reaches-the-window]]
func (m model) mouse(msg tea.MouseMsg) (tea.Model, tea.Cmd) {
	if m.pane == paneFilter {
		return m, nil
	}
	switch msg.Button {
	case tea.MouseButtonWheelUp:
		m.wheel(msg.X, -wheelStep)
	case tea.MouseButtonWheelDown:
		m.wheel(msg.X, wheelStep)
	case tea.MouseButtonLeft:
		if msg.Action == tea.MouseActionPress {
			m.press(msg.X, msg.Y)
		}
	}
	return m, nil
}

// The wheel scrolls the pane where it stands over the pane, and moves the log everywhere else. [[spec/design_output/viewer#the-mouse-reaches-the-window]]
func (m *model) wheel(x, step int) {
	if m.overPane(x) {
		if step < 0 {
			m.box.ScrollUp(-step)
			return
		}
		m.box.ScrollDown(step)
		return
	}
	m.moveTo(m.at() + step)
}

// [[spec/design_output/viewer#the-mouse-reaches-the-window]]
func (m *model) press(x, y int) {
	if y == stripRow {
		m.pressStrip(x)
		return
	}
	if m.overPane(x) {
		return
	}
	if y == namesRow {
		m.sortOn(columnAt(x, m.listWidth()))
		return
	}
	at := m.top + y - firstRow()
	if y >= firstRow() && at >= 0 && at < len(m.view) {
		m.moveTo(at)
	}
}

// [[spec/design_output/viewer#the-header-holds-the-tabs]]
func (m *model) pressStrip(x int) {
	if x >= m.w-ansi.StringWidth(helpKey) {
		m.openPane(paneHelp)
		return
	}
	if n := m.tabAt(x); n > 0 {
		m.openTab(n)
	}
}

// The tab the column x stands on, counted from 1, and 0 where it stands on none. [[spec/design_output/viewer#a-number-opens-a-tab]]
func (m model) tabAt(x int) int {
	at := 0
	for i, one := range m.tabs {
		wide := ansi.StringWidth(tabName(i, one))
		if x >= at && x < at+wide {
			return i + 1
		}
		at += wide + 1
	}
	return 0
}

// Whether the column x stands on the open pane, which takes the right of the split. [[spec/design_output/viewer#the-window-is-a-split]]
func (m model) overPane(x int) bool {
	return m.pane != paneShut && x >= m.listWidth()
}

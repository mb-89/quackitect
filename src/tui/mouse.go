// The mouse. A press on the strip opens the tab under it or the help at its
// right end, a press on a row selects that row, and the wheel moves the log or
// scrolls the open pane. The window asks the terminal for these events, and a
// terminal reporting none leaves every move to the keys.
// [[spec/design_output/tui#the-mouse-reaches-the-window]]

package main

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

// The row the strip stands on, the row the column names stand on, and the rows one wheel notch carries. [[spec/design_output/tui#the-mouse-reaches-the-window]]
const (
	stripRow  = 0
	namesRow  = headWide
	wheelStep = 3
)

// The first row a list line stands on, under the strip, the rule and the names. [[spec/design_output/tui#the-window-is-a-split]]
func firstRow() int { return headWide + namesWide }

// The mouse reaches the window under every pane, so a row selects and a tab switches while the filter takes letters. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (m model) mouse(msg tea.MouseMsg) (tea.Model, tea.Cmd) {
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

// The wheel scrolls the pane where it stands over the pane, and moves the log everywhere else. [[spec/design_output/tui#the-mouse-reaches-the-window]]
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

// [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (m *model) press(x, y int) {
	if y == stripRow {
		m.pressStrip(x)
		return
	}
	if m.overPane(x) {
		// A press on a preset's row presses it, so the filter lands and applies at once. [[spec/design_output/tui#the-filter-pane-takes-letters]]
		if m.pane == paneFilter {
			if one := m.presetAt(y - headWide); one != nil {
				m.pressPreset(*one)
			}
		}
		return
	}
	// A press on the work tab reaches its tree, which holds its own order. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
	if m.onWork() {
		m.pressWork(x, y)
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

// Whether the tab the window stands on draws the work tree. [[spec/design_output/tui#the-work-tab]]
func (m model) onWork() bool {
	return m.work != nil && m.open >= 0 && m.open < len(m.tabs) &&
		m.tabs[m.open].Name() == "work"
}

// [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (m *model) pressWork(x, y int) {
	if y == namesRow {
		m.work.SortOn(m.work.ColumnAt(x, m.listWidth()))
		m.loadPane()
		return
	}
	if y >= firstRow() {
		m.work.MoveToRow(y - firstRow())
		// A press on the mark before a group opens it, and closes it again. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
		if m.work.OnMark(x) {
			m.work.Toggle()
		}
		m.loadPane()
	}
}

// [[spec/design_output/tui#the-header-holds-the-tabs]]
func (m *model) pressStrip(x int) {
	if x >= m.w-ansi.StringWidth(helpKey) {
		m.openPane(paneHelp)
		return
	}
	if n := m.tabAt(x); n > 0 {
		m.openTab(n)
	}
}

// The tab the column x stands on, counted from 1, and 0 where it stands on none. [[spec/design_output/tui#a-number-opens-a-tab]]
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

// Whether the column x stands on the open pane, which takes the right of the split. [[spec/design_output/tui#the-window-is-a-split]]
func (m model) overPane(x int) bool {
	return m.pane != paneShut && x >= m.listWidth()
}

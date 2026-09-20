// The mouse. A press on the strip opens the tab under it or the help at its
// right end, a press on the left side reaches the open tab, and the wheel
// moves the tab or scrolls the open pane. The window asks the terminal for
// these events, and a terminal reporting none leaves every move to the keys.
// [[spec/design_output/tui#the-mouse-reaches-the-window]]

package frame

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

// The row the strip stands on, the row the column names stand on, and the rows one wheel notch carries. [[spec/design_output/tui#the-mouse-reaches-the-window]]
const (
	StripRow  = 0
	NamesRow  = HeadWide
	WheelStep = 3
)

// The first row a list line stands on, under the strip, the rule and the names. [[spec/design_output/tui#the-window-is-a-split]]
func FirstRow() int { return HeadWide + NamesWide }

// The mouse reaches the window under every pane, so a row selects and a tab switches while the filter takes letters. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (m Model) Mouse(msg tea.MouseMsg) (tea.Model, tea.Cmd) {
	switch msg.Button {
	case tea.MouseButtonWheelUp:
		m.wheel(msg.X, -WheelStep)
	case tea.MouseButtonWheelDown:
		m.wheel(msg.X, WheelStep)
	case tea.MouseButtonLeft:
		if msg.Action == tea.MouseActionPress {
			m.press(msg.X, msg.Y)
		}
	}
	return m, nil
}

// The wheel scrolls the pane where it stands over the pane, and moves the tab everywhere else. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (m *Model) wheel(x, step int) {
	if m.OverPane(x) {
		if step < 0 {
			m.Box.ScrollUp(-step)
			return
		}
		m.Box.ScrollDown(step)
		return
	}
	m.Tab().Move(m, step)
}

// [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (m *Model) press(x, y int) {
	if y == StripRow {
		m.pressStrip(x)
		return
	}
	if m.OverPane(x) {
		// A press on a preset's row presses it, so the filter lands and applies at once. [[spec/design_output/tui#the-filter-pane-takes-letters]]
		if m.Pane == PaneFilter {
			if one := m.PresetAt(y - HeadWide); one != nil {
				m.PressPreset(*one)
			}
		}
		return
	}
	m.Tab().Press(m, x, y)
}

// [[spec/design_output/tui#the-header-holds-the-tabs]]
func (m *Model) pressStrip(x int) {
	if x >= m.W-ansi.StringWidth(HelpKey) {
		m.OpenPane(PaneHelp)
		return
	}
	if n := m.TabAt(x); n > 0 {
		m.OpenTab(n)
	}
}

// The tab the column x stands on, counted from 1, and 0 where it stands on none. [[spec/design_output/tui#a-number-opens-a-tab]]
func (m Model) TabAt(x int) int {
	at := 0
	for i, one := range m.Tabs {
		wide := ansi.StringWidth(tabName(i, one))
		if x >= at && x < at+wide {
			return i + 1
		}
		at += wide + 1
	}
	return 0
}

// Whether the column x stands on the open pane, which takes the right of the split. [[spec/design_output/tui#the-window-is-a-split]]
func (m Model) OverPane(x int) bool {
	return m.Pane != PaneShut && x >= m.ListWidth()
}

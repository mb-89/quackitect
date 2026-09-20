// The tabs the window holds, and the strip naming them. The frame is the
// window's: the strip, the split, the pane and the footer. A tab draws the left
// side, holds its own rows and its own filter line, and answers the keys, the
// mouse and the footer through this interface. The log is the first tab.
// [[spec/design_output/tui#the-window-is-a-split]]

package frame

import (
	"time"

	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"

	"quackitect/tui/draw"
	"quackitect/tui/tree"
)

// [[spec/design_output/tui#a-number-opens-a-tab]]
const MostTabs = 9

// The span a tab waits before it asks its source again, where the source answers nothing. [[spec/design_output/tui#how-a-line-arrives]]
const Poll = 250 * time.Millisecond

// The strip's right end, which the key draws and a press reaches. [[spec/design_output/tui#the-header-holds-the-tabs]]
const HelpKey = "alt+? help "

// What the frame reads of a tab. [[spec/design_output/tui#the-packages-the-window-holds]]
type Tab interface {
	Name() string
	// The tab's first command, which the window batches. [[spec/design_output/tui#the-work-tab]]
	Init(m *Model) tea.Cmd
	// The arrivals and the key modes the tab owns, and whether it took the one handed in. [[spec/design_output/tui#the-work-tab-takes-edits]]
	Update(m *Model, msg tea.Msg) (bool, tea.Cmd)
	Left(m *Model, w, rows int) string
	Detail(m *Model, w int) []Part
	// What the pane's key names the selection by, so the pane holds still while the selection stands. [[spec/design_output/tui#the-pane-holds-still]]
	Selected(m *Model) string
	Narrowed(m *Model) bool
	Keys(m *Model) Band
	Selection(m *Model) Band
	Presets(m *Model) []Preset
	// The arrows and the wheel move the selection, and the page keys, home and end jump it. [[spec/design_output/tui#the-keys]]
	Move(m *Model, step int)
	Jump(m *Model, name string)
	// A press on the left side of the window. [[spec/design_output/tui#the-mouse-reaches-the-window]]
	Press(m *Model, x, y int)
	// The filter line narrows the tab, and a preset's sort takes hold in it. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	Narrow(m *Model, said string) error
	Sorted(m *Model, one Preset)
	// Whether the tab holds the order a preset carrying no filter names. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	Pressed(m *Model, one Preset) bool
	// The order and the floor the footer draws. [[spec/design_output/tui#the-footer-carries-status]]
	Marks(m *Model) (order, floor string)
}

// A preset a tab offers: its name, the filter it writes into the line, the key pressing it, and the sort it carries. [[spec/design_output/tui#the-filter-pane-takes-letters]]
type Preset struct {
	Name   string
	Filter string
	Key    string
	Sorts  []tree.Sort
}

// A tab switch keeps the pane, which draws off the new tab, and the line takes that tab's filter. [[spec/design_output/tui#a-number-opens-a-tab]]
func (m *Model) OpenTab(n int) {
	if n < 1 || n > len(m.Tabs) || n > MostTabs {
		return
	}
	m.Open = n - 1
	m.Input.SetValue(m.SourceOf(m.Open))
	m.Resize()
	m.Box.GotoTop()
}

// The tab of that name, counted from 1, and 0 where the window holds none. [[spec/design_output/tui#a-tab-the-caller-names]]
func (m Model) TabNamed(name string) int {
	for at, one := range m.Tabs {
		if one.Name() == name {
			return at + 1
		}
	}
	return 0
}

// [[spec/design_output/tui#the-header-holds-the-tabs]]
func (m Model) RenderStrip() string {
	names := make([]string, 0, len(m.Tabs))
	for at, one := range m.Tabs {
		name := tabName(at, one)
		style := draw.Dim
		if at == m.Open {
			style = draw.Open
		}
		names = append(names, style.Render(name))
	}
	strip := strings.Join(names, " ")
	key := draw.Dim.Render(HelpKey)
	if m.Pane == PaneHelp {
		key = draw.Open.Render(HelpKey)
	}
	gap := m.W - ansi.StringWidth(strip) - ansi.StringWidth(key)
	if gap < 1 {
		return draw.Cut(strip, m.W)
	}
	return strip + strings.Repeat(" ", gap) + key
}

// The text one tab takes in the strip, which the strip draws and a press measures. [[spec/design_output/tui#the-header-holds-the-tabs]]
func tabName(at int, one Tab) string {
	return fmt.Sprintf(" %d %s ", at+1, one.Name())
}

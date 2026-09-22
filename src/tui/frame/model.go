// The window: a strip of tabs, the open tab on the left, one pane on the right
// and a footer of status marks. The frame holds what every tab shares, and a
// tab holds its own rows, so the frame reads no record and no ticket tree.
// [[spec/design_output/tui#the-window-is-a-split]]

package frame

import (
	"fmt"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/cursor"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"quackitect/tui/draw"
)

const (
	HeadWide  = 2
	FootWide  = 2
	NamesWide = 1

	firstPaneWidth  = 40
	firstPaneHeight = 10
	leastPaneWidth  = 10
	leastInputWidth = 10
	listExtraShare  = 10
)

type Pane int

const (
	PaneShut Pane = iota
	PaneDetails
	PaneHelp
	PaneFilter
)

// [[spec/design_output/tui#the-window-is-a-split]]
type Model struct {
	Tabs      []Tab
	Open      int
	Path      string
	Zone      *time.Location
	Pane      Pane
	Box       viewport.Model
	Shown     string
	Content   string
	Input     textinput.Model
	FilterBad string
	W, H      int
	// Each tab holds a filter line of its own, and the pane shows the open tab's. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	Sources []string
	Opened  bool
}

// The window over the tabs handed in, the first of which is the log. [[spec/design_output/tui#the-packages-the-window-holds]]
func New(path string, zone *time.Location, tabs []Tab) Model {
	input := textinput.New()
	input.Prompt = "filter "
	input.PromptStyle = draw.Bar
	// One placeholder for every tab, because the strip names the tab already. [[spec/design_output/tui#the-filter-pane-takes-letters]]
	input.Placeholder = "type to narrow"
	input.Cursor.SetMode(cursor.CursorStatic)
	return Model{
		Tabs:    tabs,
		Path:    path,
		Zone:    zone,
		Box:     viewport.New(firstPaneWidth, firstPaneHeight),
		Input:   input,
		Sources: make([]string, len(tabs)),
	}
}

// The filter line the tab at that place holds. [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m Model) SourceOf(at int) string {
	if at < 0 || at >= len(m.Sources) {
		return ""
	}
	return m.Sources[at]
}

// The tab standing open. [[spec/design_output/tui#the-window-is-a-split]]
func (m Model) Tab() Tab { return m.Tabs[m.Open] }

func (m Model) Init() tea.Cmd {
	cmds := make([]tea.Cmd, 0, len(m.Tabs))
	for _, one := range m.Tabs {
		cmds = append(cmds, one.Init(&m))
	}
	return tea.Batch(cmds...)
}

// [[spec/design_output/tui#the-window-is-a-split]]
func (m Model) Body() int { return max(2, m.H-HeadWide-FootWide) }

func (m Model) Rows() int { return max(1, m.Body()-NamesWide) }

func (m Model) ListWidth() int {
	if m.Pane == PaneShut {
		return m.W
	}
	return m.W/2 + m.W/listExtraShare
}

func (m *Model) Resize() {
	m.Box.Width = max(leastPaneWidth, m.W-m.ListWidth()-2)
	m.Box.Height = m.Body()
	m.Input.Width = max(leastInputWidth, m.Box.Width-len(m.Input.Prompt)-2)
	m.Shown = ""
	at := m.Box.YOffset
	m.LoadPane()
	m.Box.SetYOffset(at)
}

func (m *Model) OpenPane(want Pane) {
	if m.Pane == want {
		m.Pane = PaneShut
	} else {
		m.Pane = want
	}
	if m.Pane == PaneFilter {
		m.Input.Focus()
	} else {
		m.Input.Blur()
	}
	m.Resize()
	m.Box.GotoTop()
}

// [[spec/design_output/tui#the-pane-holds-still]]
func (m *Model) LoadPane() {
	if m.Pane == PaneShut {
		return
	}
	var parts []Part
	switch m.Pane {
	case PaneHelp:
		parts = m.HelpParts(m.Box.Width)
	case PaneFilter:
		parts = append(m.FilterHead(), m.PresetParts()...)
		parts = append(parts, Part{}, Part{Text: FilterHelp})
	default:
		parts = m.Tab().Detail(m, m.Box.Width)
	}
	content := RenderParts(parts, m.Box.Width)
	key := fmt.Sprintf("%d:%s", m.Pane, m.Tab().Selected(m))
	if m.Pane != PaneDetails {
		key = fmt.Sprint(m.Pane)
	}
	if key != m.Shown {
		m.Box.SetContent(content)
		m.Box.GotoTop()
	} else if content != m.Content {
		at := m.Box.YOffset
		m.Box.SetContent(content)
		m.Box.SetYOffset(at)
	}
	m.Shown, m.Content = key, content
}

// The frame takes the size, the keys, the mouse and the tab call, and hands every other arrival to the tabs until one takes it. [[spec/design_output/tui#the-window-is-a-split]]
func (m Model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.W, m.H = msg.Width, msg.Height
		m.Resize()
		return m, nil

	case tea.KeyMsg:
		if m.Pane == PaneFilter {
			return m.Typing(msg)
		}
		// A tab holding a mode of its own, an open edit or a chord, takes every key. [[spec/design_output/tui#the-work-tab-takes-edits]]
		if took, cmd := m.Tab().Update(&m, msg); took {
			return m, cmd
		}
		return m.Key(msg.String())

	case tea.MouseMsg:
		return m.Mouse(msg)

	// [[spec/design_output/tui#a-second-launch-hands-over]]
	case TabMsg:
		if n := m.TabNamed(msg.Name); n > 0 {
			m.OpenTab(n)
		}
		return m, nil
	}
	for _, one := range m.Tabs {
		if took, cmd := one.Update(&m, msg); took {
			return m, cmd
		}
	}
	return m, nil
}

// [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m Model) Typing(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "ctrl+c":
		return m, tea.Quit
	case "enter", "esc", "alt+f":
		m.OpenPane(PaneFilter)
		return m, nil
	case "up":
		m.Box.ScrollUp(1)
		return m, nil
	case "down":
		m.Box.ScrollDown(1)
		return m, nil
	case "pgup", "pgdown", "home", "end":
		m.Tab().Jump(&m, msg.String())
		return m, nil
	}
	// A preset's key presses it under the pane as well as over the tab. [[spec/design_output/tui#one-key-filters-the-line]]
	if m.PressKey(msg.String()) {
		return m, nil
	}
	// A key the tab marks as working under the pane reaches it here, so the floor rises while the line takes letters. [[spec/design_output/tui#alt-l-raises-the-floor]]
	for _, one := range m.Tab().Keys(&m).Acts {
		if one.Under && matches(msg.String(), one.Key) {
			return m, one.Do(&m, msg.String())
		}
	}
	before := m.Input.Value()
	var cmd tea.Cmd
	m.Input, cmd = m.Input.Update(msg)
	if m.Input.Value() != before {
		m.Narrow(m.Input.Value())
	}
	m.LoadPane()
	return m, cmd
}

// [[spec/design_output/tui#the-window-is-a-split]]
func (m Model) View() string {
	if m.H == 0 {
		return ""
	}
	head := m.RenderStrip() + "\n" + draw.Rule.Render(strings.Repeat("─", max(1, m.W)))
	body := m.Tab().Left(&m, m.ListWidth(), m.Rows())
	if m.Pane != PaneShut {
		rule := draw.Rule.Render(strings.TrimSuffix(strings.Repeat("│ \n", m.Body()), "\n"))
		right := lipgloss.NewStyle().Width(m.Box.Width).MaxHeight(m.Body()).Render(m.Box.View())
		body = lipgloss.JoinHorizontal(lipgloss.Top, body, rule, right)
	}
	return head + "\n" + body + "\n" + m.RenderFooter()
}

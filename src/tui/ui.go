// The window: a strip of tabs, the open tab on the left, one pane on the right
// and a footer of status marks. w and s move the log, the arrows scroll the
// pane, a number opens a tab, and enter, alt+? and alt+f open the details, the
// help and the filter in that pane.
// [[spec/design_output/tui#the-keys]]

package main

import (
	"errors"
	"fmt"
	"regexp"
	"strings"
	"time"

	"github.com/charmbracelet/bubbles/cursor"
	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/x/ansi"
)

const (
	stampWide = 8
	levelWide = 5
	kindWide  = 10
	headWide  = 2
	footWide  = 2
	namesWide = 1
	lineGaps  = 3

	firstPaneWidth  = 40
	firstPaneHeight = 10
	leastPaneWidth  = 10
	leastInputWidth = 10
	listExtraShare  = 10
	// [[spec/design_output/tui#one-key-filters-the-line]]
	talkFilter = "kind: /^(prompt|reply)$/"
)

type pane int

const (
	paneShut pane = iota
	paneDetails
	paneHelp
	paneFilter
)

type model struct {
	tabs      []tab
	open      int
	path      string
	zone      *time.Location
	all       []Record
	view      []int
	sel       int
	top       int
	follow    bool
	pane      pane
	box       viewport.Model
	shown     string
	content   string
	input     textinput.Model
	filter    Filter
	filterBad string
	floor     string
	sortAt    int
	sortDown  bool
	w, h      int
	tailer    *tailer
	err       error
	// [[spec/design_output/tui#the-work-tab]]
	work     *Tree
	workWhy  string
	workTick int64
}

func newModel(path string, zone *time.Location) model {
	input := textinput.New()
	input.Prompt = "filter "
	input.PromptStyle = barStyle
	input.Placeholder = "type to narrow the log"
	input.Cursor.SetMode(cursor.CursorStatic)
	return model{
		tabs:   []tab{logTab{}, workTab{}},
		path:   path,
		zone:   zone,
		sel:    -1,
		follow: true,
		floor:  "info",
		sortAt: sortNone,
		box:    viewport.New(firstPaneWidth, firstPaneHeight),
		input:  input,
		tailer: newTailer(path),
	}
}

// [[spec/design_output/tui#the-work-tab]]
func (m model) Init() tea.Cmd {
	return tea.Batch(m.tailer.cmd(), workCmd(m.path, 0))
}

// [[spec/design_output/tui#the-window-is-a-split]]
func (m model) body() int { return max(2, m.h-headWide-footWide) }

func (m model) rows() int { return max(1, m.body()-namesWide) }

func (m model) listWidth() int {
	if m.pane == paneShut {
		return m.w
	}
	return m.w/2 + m.w/listExtraShare
}

func (m model) at() int {
	for p, index := range m.view {
		if index == m.sel {
			return p
		}
	}
	return -1
}

// [[spec/design_output/tui#the-filter-holds-the-selection]]
func (m *model) rebuild() {
	// One language narrows every tab, and the tree joins the line with its presses. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	if m.work != nil {
		m.work.Filtering(m.filter.Source)
	}
	m.view = m.view[:0]
	for index, r := range m.all {
		if Rank(r.Level) >= Rank(m.floor) && m.filter.Match(r) {
			m.view = append(m.view, index)
		}
	}
	m.applySort()
	switch {
	case len(m.view) == 0:
	case m.follow || m.sel < 0:
		m.sel = m.view[len(m.view)-1]
	case m.at() < 0:
		m.sel = m.view[len(m.view)-1]
		for _, index := range m.view {
			if index >= m.sel {
				m.sel = index
				break
			}
		}
	}
	m.clampTop()
}

func (m *model) clampTop() {
	p := m.at()
	if p < 0 {
		m.top = 0
		return
	}
	if p < m.top {
		m.top = p
	}
	if p >= m.top+m.rows() {
		m.top = p - m.rows() + 1
	}
	m.top = max(0, min(m.top, max(0, len(m.view)-m.rows())))
	if p < m.top {
		m.top = p
	}
}

func (m *model) moveTo(p int) {
	if len(m.view) == 0 {
		return
	}
	p = max(0, min(p, len(m.view)-1))
	m.sel = m.view[p]
	m.follow = p == len(m.view)-1
	m.clampTop()
	m.loadPane()
}

func (m *model) resize() {
	m.box.Width = max(leastPaneWidth, m.w-m.listWidth()-2)
	m.box.Height = m.body()
	m.input.Width = max(leastInputWidth, m.box.Width-len(m.input.Prompt)-2)
	m.shown = ""
	at := m.box.YOffset
	m.loadPane()
	m.box.SetYOffset(at)
}

func (m *model) openPane(want pane) {
	if m.pane == want {
		m.pane = paneShut
	} else {
		m.pane = want
	}
	if m.pane == paneFilter {
		m.input.Focus()
	} else {
		m.input.Blur()
	}
	m.resize()
	m.box.GotoTop()
}

// [[spec/design_output/tui#the-pane-holds-still]]
func (m *model) loadPane() {
	if m.pane == paneShut {
		return
	}
	var parts []part
	switch m.pane {
	case paneHelp:
		parts = m.helpParts(m.box.Width)
	case paneFilter:
		parts = []part{{text: m.input.View(), drawn: true}}
		if m.filterBad != "" {
			parts = append(parts, part{style: levelStyle("error"), text: m.filterBad})
		}
		// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
		if m.onWork() {
			parts = append(parts, workPresets(m)...)
		}
		parts = append(parts, part{}, part{text: FilterHelp})
	default:
		parts = m.tabs[m.open].Detail(m, m.box.Width)
	}
	content := renderParts(parts, m.box.Width)
	key := fmt.Sprintf("%d:%d", m.pane, m.sel)
	if m.pane != paneDetails {
		key = fmt.Sprint(m.pane)
	}
	if key != m.shown {
		m.box.SetContent(content)
		m.box.GotoTop()
	} else if content != m.content {
		at := m.box.YOffset
		m.box.SetContent(content)
		m.box.SetYOffset(at)
	}
	m.shown, m.content = key, content
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.w, m.h = msg.Width, msg.Height
		m.resize()
		m.clampTop()
		return m, nil

	case tailErrMsg:
		m.err = msg.err
		return m, m.tailer.cmd()

	case linesMsg:
		if msg.restarted {
			m.all, m.sel, m.top, m.follow = nil, -1, 0, true
		}
		m.all = append(m.all, msg.recs...)
		m.rebuild()
		m.loadPane()
		return m, m.tailer.cmd()

	// [[spec/design_output/tui#the-work-tab]]
	case workMsg:
		if !msg.same {
			m.work, m.workWhy = msg.tree, msg.why
			if m.work != nil {
				m.work.Filtering(m.filter.Source)
			}
			m.loadPane()
		}
		m.workTick = msg.tick
		return m, workCmd(m.path, m.workTick)

	case tea.KeyMsg:
		if m.pane == paneFilter {
			return m.typing(msg)
		}
		return m.key(msg.String())

	case tea.MouseMsg:
		return m.mouse(msg)

	// [[spec/design_output/tui#a-second-launch-hands-over]]
	case tabMsg:
		if n := m.tabNamed(msg.name); n > 0 {
			m.openTab(n)
		}
		return m, nil
	}
	return m, nil
}

func (m *model) jump(name string) {
	switch name {
	case "pgup":
		m.moveTo(m.at() - m.rows())
	case "pgdown":
		m.moveTo(m.at() + m.rows())
	case "home":
		m.moveTo(0)
	case "end":
		m.moveTo(len(m.view) - 1)
	}
}

// [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (m model) typing(msg tea.KeyMsg) (tea.Model, tea.Cmd) {
	switch msg.String() {
	case "ctrl+c":
		return m, tea.Quit
	case "enter", "esc", "alt+f":
		m.openPane(paneFilter)
		return m, nil
	case "alt+F", "alt+q":
		m.quick(msg.String())
		return m, nil
	// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	case "alt+1", "alt+2", "alt+3", "alt+4", "alt+5", "alt+6", "alt+7", "alt+8", "alt+9":
		if pressPreset(&m, msg.String()) {
			m.loadPane()
		}
		return m, nil
	case "alt+l":
		m.raiseFloor()
		return m, nil
	case "up":
		m.box.ScrollUp(1)
		return m, nil
	case "down":
		m.box.ScrollDown(1)
		return m, nil
	case "pgup", "pgdown", "home", "end":
		m.jump(msg.String())
		return m, nil
	}
	before := m.input.Value()
	var cmd tea.Cmd
	m.input, cmd = m.input.Update(msg)
	if m.input.Value() != before {
		m.narrow(m.input.Value())
	}
	m.loadPane()
	return m, cmd
}

// [[spec/design_output/tui#alt-l-raises-the-floor]]
func (m *model) raiseFloor() {
	m.floor = ladder[(Rank(m.floor)+1)%len(ladder)]
	m.rebuild()
	m.loadPane()
}

// [[spec/design_output/tui#e-finds-the-newest-error]]
func (m *model) toError() {
	here := m.at()
	onError := here >= 0 && strings.EqualFold(m.all[m.view[here]].Level, "error")
	for p := len(m.view) - 1; p >= 0; p-- {
		if onError && p >= here {
			continue
		}
		if strings.EqualFold(m.all[m.view[p]].Level, "error") {
			m.moveTo(p)
			return
		}
	}
}

// [[spec/design_output/tui#one-key-filters-the-line]]
func (m *model) quick(name string) {
	said := talkFilter
	if name == "alt+F" {
		if m.sel < 0 || m.sel >= len(m.all) {
			return
		}
		r := m.all[m.sel]
		said = fmt.Sprintf("kind: /^%s$/", regexp.QuoteMeta(r.Kind))
		if r.Label() != r.Kind {
			said = fmt.Sprintf("tool: /^%s$/", regexp.QuoteMeta(r.Label()))
		}
	}
	if m.input.Value() == said {
		said = ""
	}
	m.input.SetValue(said)
	m.narrow(said)
	m.loadPane()
}

func (m *model) narrow(said string) {
	f, err := ParseFilter(said)
	switch {
	case errors.Is(err, ErrIncomplete):
		m.filterBad = "still typing"
	case err != nil:
		m.filterBad = err.Error()
	default:
		m.filter, m.filterBad = f, ""
		m.rebuild()
	}
}

// [[spec/design_output/tui#the-window-is-a-split]]
func (m model) View() string {
	if m.h == 0 {
		return ""
	}
	head := m.renderStrip() + "\n" + ruleStyle.Render(strings.Repeat("─", max(1, m.w)))
	body := m.tabs[m.open].Left(&m, m.listWidth(), m.rows())
	if m.pane != paneShut {
		rule := ruleStyle.Render(strings.TrimSuffix(strings.Repeat("│ \n", m.body()), "\n"))
		right := lipgloss.NewStyle().Width(m.box.Width).MaxHeight(m.body()).Render(m.box.View())
		body = lipgloss.JoinHorizontal(lipgloss.Top, body, rule, right)
	}
	return head + "\n" + body + "\n" + m.renderFooter()
}

// [[spec/design_output/tui#the-columns-stand-still]]
func (m model) renderNames(w int) string {
	cells := make([]string, 0, len(logColumns))
	for i, one := range logColumns {
		name := one.name
		if one.wide > 0 {
			name = pad(name, one.wide)
		}
		style := headStyle
		if i == m.sortAt {
			style = barStyle
		}
		cells = append(cells, style.Render(name))
	}
	return headStyle.Render(strings.Repeat(" ", gutterWide)) + cut(strings.Join(cells, " "), w-gutterWide)
}

func (m model) renderRows(w, rows int) string {
	lines := make([]string, 0, rows)
	switch {
	case m.err != nil:
		lines = append(lines, levelStyle("error").Render(cut("the log does not read: "+m.err.Error(), w)))
	case len(m.all) == 0:
		lines = append(lines, dimStyle.Render(cut("waiting for "+m.path, w)))
	case len(m.view) == 0:
		lines = append(lines, dimStyle.Render(cut("no line matches the filter", w)))
	}
	for p := m.top; len(lines) < rows; p++ {
		if p >= len(m.view) {
			lines = append(lines, "")
			continue
		}
		index := m.view[p]
		lines = append(lines, m.renderRow(m.all[index], index == m.sel, w))
	}
	return lipgloss.NewStyle().Width(w).Render(strings.Join(lines, "\n"))
}

// [[spec/design_output/tui#colours]]
func (m model) renderRow(r Record, selected bool, w int) string {
	gutter := "  "
	if selected {
		gutter = barStyle.Render("▌") + " "
	}
	level := r.Level
	if level == "" {
		level = "info"
	}
	room := max(1, w-2-stampWide-levelWide-kindWide-lineGaps)
	stamp := pad(r.Stamp(m.zone), stampWide)
	said := pad(cut(oneLine(r.Said), room), room)

	mark := func(style lipgloss.Style) lipgloss.Style {
		if selected {
			return style.Background(rowSelected)
		}
		return style
	}
	gap := mark(lipgloss.NewStyle()).Render(" ")
	return gutter + strings.Join([]string{
		mark(dimStyle).Render(stamp),
		mark(levelStyle(r.Level)).Render(pad(level, levelWide)),
		mark(kindStyle(r.Label())).Render(pad(r.Label(), kindWide)),
		mark(saidStyle(r)).Render(said),
	}, gap)
}

func pad(said string, wide int) string {
	shown := ansi.StringWidth(said)
	if shown > wide {
		return ansi.Truncate(said, wide, "")
	}
	return said + strings.Repeat(" ", wide-shown)
}

func cut(said string, wide int) string {
	if ansi.StringWidth(said) <= wide {
		return said
	}
	return ansi.Truncate(said, wide, "…")
}

func oneLine(said string) string {
	return strings.NewReplacer("\r\n", " ", "\n", " ", "\r", " ", "\t", " ").Replace(said)
}

package main

import (
	"errors"
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/textinput"
	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

type focus int

const (
	focusList focus = iota
	focusDetail
)

type model struct {
	path string

	all  []Record // every record read, in file order
	view []int    // indexes into all, after the filter

	selSeq  int64 // the selection is a record, never a row number
	top     int   // first visible row of the list
	follow  bool  // true while the selection sits on the newest line
	focus   focus
	details bool

	filter    Filter
	filterBad string // the message under the list when the typed filter will not compile
	input     textinput.Model
	detail    viewport.Model

	w, h   int
	tailer *tailer
	err    error
}

var (
	greyStyle   = lipgloss.NewStyle().Foreground(lipgloss.AdaptiveColor{Light: "245", Dark: "241"})
	selStyle    = lipgloss.NewStyle().Bold(true)
	errStyle    = lipgloss.NewStyle().Foreground(lipgloss.Color("203"))
	dimStyle    = lipgloss.NewStyle().Foreground(lipgloss.AdaptiveColor{Light: "246", Dark: "243"})
	focusStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("111")).Bold(true)
	selBarStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("111")).Bold(true)
	okStyle     = lipgloss.NewStyle().Foreground(lipgloss.Color("77"))
	notOKStyle  = lipgloss.NewStyle().Foreground(lipgloss.Color("203")).Bold(true)
)

// Colour carries meaning here and nowhere else. Kind and source are the two
// things the eye scans for, so they are the two things that get a colour.
func kindColour(k string) lipgloss.Style {
	switch strings.ToLower(k) {
	case "refusal", "deny", "error", "fail":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("203"))
	case "call":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("111"))
	case "answer":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("150"))
	case "note":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("179"))
	case "heartbeat":
		return greyStyle
	case "unparsed":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("208"))
	}
	return lipgloss.NewStyle()
}

func srcColour(s string) lipgloss.Style {
	switch strings.ToLower(s) {
	case "engine":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("140"))
	case "agent":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("73"))
	case "user":
		return lipgloss.NewStyle().Foreground(lipgloss.Color("186"))
	}
	return dimStyle
}

func newModel(path string) model {
	in := textinput.New()
	in.Prompt = "filter "
	in.Placeholder = "type to narrow"
	in.Focus()
	return model{
		path:   path,
		input:  in,
		detail: viewport.New(40, 10),
		follow: true,
		tailer: newTailer(path),
	}
}

func (m model) Init() tea.Cmd { return tea.Batch(m.tailer.cmd(), textinput.Blink) }

func (m *model) rebuild() {
	m.view = m.view[:0]
	for i, r := range m.all {
		if m.filter.Empty() || m.filter.Match(r) {
			m.view = append(m.view, i)
		}
	}
	if m.follow && len(m.view) > 0 {
		m.selSeq = m.all[m.view[len(m.view)-1]].Seq
	}
	m.clampTop()
}

func (m model) selIndex() int {
	for i, ai := range m.view {
		if m.all[ai].Seq == m.selSeq {
			return i
		}
	}
	if len(m.view) == 0 {
		return -1
	}
	return len(m.view) - 1
}

func (m *model) clampTop() {
	rows := m.listRows()
	sel := m.selIndex()
	if sel < 0 {
		m.top = 0
		return
	}
	if m.top > len(m.view)-1 {
		m.top = max(0, len(m.view)-rows)
	}
	if sel < m.top {
		m.top = sel
	}
	if sel >= m.top+rows {
		m.top = sel - rows + 1
	}
	if m.top < 0 {
		m.top = 0
	}
}

func (m *model) moveSel(delta int) {
	if len(m.view) == 0 {
		return
	}
	i := m.selIndex() + delta
	if i < 0 {
		i = 0
	}
	if i > len(m.view)-1 {
		i = len(m.view) - 1
	}
	m.selSeq = m.all[m.view[i]].Seq
	// Following the newest line is not a mode the user sets. It is where the
	// selection is. Move up and the list holds still.
	m.follow = i == len(m.view)-1
	m.clampTop()
	m.loadDetail()
}

// loadDetail is called when the SELECTION changes and at no other time. New
// records must never redraw this pane: that is the v3 defect being removed.
func (m *model) loadDetail() {
	if !m.details {
		return
	}
	i := m.selIndex()
	if i < 0 {
		m.detail.SetContent(FilterHelp)
		return
	}
	m.detail.SetContent(m.all[m.view[i]].Detail())
	m.detail.GotoTop()
}

func (m model) listRows() int {
	// header, filter line, status line
	r := m.h - 3
	if r < 1 {
		return 1
	}
	return r
}

func (m model) listWidth() int {
	if !m.details {
		return m.w
	}
	lw := m.w/2 + m.w/10
	if lw < 20 {
		lw = m.w
	}
	return lw
}

func (m model) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.w, m.h = msg.Width, msg.Height
		m.input.Width = max(10, m.w-10)
		m.detail.Width = max(10, m.w-m.listWidth()-3)
		m.detail.Height = max(3, m.h-3)
		m.clampTop()
		return m, nil

	case tailErrMsg:
		m.err = msg.err
		return m, m.tailer.cmd()

	case linesMsg:
		if len(msg.recs) > 0 {
			m.all = append(m.all, msg.recs...)
			m.rebuild()
			// The detail pane is bound to a record, so arriving lines do not
			// touch it. It is reloaded only when following moved the selection.
			if m.follow {
				m.loadDetail()
			}
		}
		return m, m.tailer.cmd()

	case tea.KeyMsg:
		switch msg.String() {
		case "ctrl+c":
			return m, tea.Quit
		case "ctrl+d":
			m.details = !m.details
			m.detail.Width = max(10, m.w-m.listWidth()-3)
			m.detail.Height = max(3, m.h-3)
			if m.details {
				m.loadDetail()
			} else {
				m.focus = focusList
			}
			m.clampTop()
			return m, nil
		case "tab":
			if m.details {
				if m.focus == focusList {
					m.focus = focusDetail
				} else {
					m.focus = focusList
				}
			}
			return m, nil
		case "esc":
			m.input.SetValue("")
			m.filter, m.filterBad = Filter{}, ""
			m.rebuild()
			m.loadDetail()
			return m, nil
		case "up", "down", "pgup", "pgdown", "home", "end":
			if m.focus == focusDetail {
				var cmd tea.Cmd
				m.detail, cmd = m.detail.Update(msg)
				return m, cmd
			}
			switch msg.String() {
			case "up":
				m.moveSel(-1)
			case "down":
				m.moveSel(1)
			case "pgup":
				m.moveSel(-m.listRows())
			case "pgdown":
				m.moveSel(m.listRows())
			case "home":
				m.moveSel(-len(m.view))
			case "end":
				m.moveSel(len(m.view))
			}
			return m, nil
		}
	}

	// Everything else is filter input. There is no key to press first.
	before := m.input.Value()
	var cmd tea.Cmd
	m.input, cmd = m.input.Update(msg)
	if m.input.Value() != before {
		f, err := ParseFilter(m.input.Value())
		if err != nil {
			// A half-typed pattern is not an error. The last filter that
			// worked stays on screen and the status line says which of the two
			// this is, because "still typing" and "will not compile" call for
			// different reactions from the person.
			if errors.Is(err, ErrIncomplete) {
				m.filterBad = "still typing"
			} else {
				m.filterBad = err.Error()
			}
		} else {
			m.filter, m.filterBad = f, ""
			m.rebuild()
			m.loadDetail()
		}
	}
	return m, cmd
}

func (m model) View() string {
	if m.h == 0 {
		return ""
	}
	left := m.renderList()
	if !m.details {
		return left
	}
	right := lipgloss.NewStyle().
		Width(m.detail.Width).
		Height(m.h - 1).
		Render(m.renderDetail())
	sep := lipgloss.NewStyle().Foreground(lipgloss.Color("238")).
		Render(strings.Repeat("│\n", max(1, m.h-1)))
	return lipgloss.JoinHorizontal(lipgloss.Top, left, sep, right)
}

func (m model) renderList() string {
	w := m.listWidth()
	var b strings.Builder
	rows := m.listRows()
	sel := m.selIndex()
	for i := 0; i < rows; i++ {
		idx := m.top + i
		if idx >= len(m.view) {
			b.WriteString("\n")
			continue
		}
		r := m.all[m.view[idx]]
		b.WriteString(m.renderRow(r, idx == sel, w))
		b.WriteString("\n")
	}
	b.WriteString(m.renderStatus(w))
	b.WriteString("\n")
	b.WriteString(lipgloss.NewStyle().Width(w).Render(m.input.View()))
	return lipgloss.NewStyle().Width(w).Render(b.String())
}

func (m model) renderRow(r Record, selected bool, w int) string {
	// The selected line is marked three ways, because one subtle way is what
	// it was before: a gutter bar, a bold underline across the whole row, and
	// the row padded so the underline reaches the right edge.
	mark := func(st lipgloss.Style) lipgloss.Style {
		if selected {
			return st.Underline(true).Bold(true)
		}
		return st
	}
	gutter := "  "
	if selected {
		gutter = selBarStyle.Render("▌") + " "
	}
	stamp := mark(greyStyle).Render(r.Day() + " " + r.Stamp())
	src := mark(srcColour(r.Src)).Render(pad(r.Src, 7))
	kind := mark(kindColour(r.Kind)).Render(pad(r.Kind, 9))

	used := 2 + 14 + 1 + 7 + 1 + 9 + 1 + 1 + 1
	msgW := w - used
	if msgW < 10 {
		msgW = 10
	}
	msg := mark(lipgloss.NewStyle()).Render(pad(oneLine(r.Msg, msgW), msgW))
	return fmt.Sprintf("%s%s %s %s %s %s", gutter, stamp, src, kind, msg, mark(markColour(r)).Render(r.Mark()))
}

// The mark is the fastest thing on the line to read, so it carries colour.
func markColour(r Record) lipgloss.Style {
	if r.OK == nil {
		return dimStyle
	}
	if *r.OK {
		return okStyle
	}
	return notOKStyle
}

func (m model) renderStatus(w int) string {
	if m.err != nil {
		return errStyle.Render(truncate("cannot read the log: "+m.err.Error(), w))
	}
	if m.filterBad != "" {
		return errStyle.Render(truncate("filter "+m.filterBad+" · showing the last one that worked", w))
	}
	shown := len(m.view)
	total := len(m.all)
	follow := "held"
	if m.follow {
		follow = "following"
	}
	where := focusStyle.Render("list")
	if m.focus == focusDetail {
		where = focusStyle.Render("details")
	}
	s := fmt.Sprintf("%d of %d  ·  %s  ·  focus %s  ·  ctrl+d details  ·  tab focus  ·  esc clear",
		shown, total, follow, where)
	return dimStyle.Render(truncate(s, w))
}

func (m model) renderDetail() string {
	head := dimStyle.Render("details")
	if m.selIndex() < 0 {
		head = dimStyle.Render("filter help")
	}
	return head + "\n" + m.detail.View()
}

func pad(s string, n int) string {
	rs := []rune(s)
	if len(rs) >= n {
		return string(rs[:n])
	}
	return s + strings.Repeat(" ", n-len(rs))
}

func oneLine(s string, w int) string {
	s = strings.ReplaceAll(strings.ReplaceAll(s, "\n", " "), "\t", " ")
	return truncate(s, w)
}

func truncate(s string, w int) string {
	rs := []rune(s)
	if w <= 1 || len(rs) <= w {
		return s
	}
	return string(rs[:w-1]) + "…"
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

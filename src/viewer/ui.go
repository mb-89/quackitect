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

	selID    int64 // the selection is a record, by an identity this program owns
	onFilter bool  // the selection is on the filter line, which is a row like any other
	top      int   // first visible row of the list
	follow   bool  // true while the selection sits on the newest line
	focus    focus
	details  bool

	helping   bool // the pane is showing the filter language rather than a record
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
	headerStyle = lipgloss.NewStyle().
			Foreground(lipgloss.AdaptiveColor{Light: "238", Dark: "252"}).
			Bold(true)
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
	in.PromptStyle = focusStyle
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
		m.selID = m.all[m.view[len(m.view)-1]].ID
	}
	m.clampTop()
}

func (m model) selIndex() int {
	for i, ai := range m.view {
		if m.all[ai].ID == m.selID {
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
	// The filter is a row. It sits after the last record, and selecting it
	// shows what it can do, in the pane that shows what a record holds.
	if m.onFilter {
		if delta < 0 {
			m.onFilter = false
			m.loadDetail()
		}
		return
	}
	if len(m.view) == 0 {
		if delta > 0 {
			m.onFilter = true
			m.loadDetail()
		}
		return
	}
	i := m.selIndex() + delta
	if i > len(m.view)-1 {
		// Past the last record is the filter, and only by one step. A page
		// down from the middle stops at the last record.
		if m.selIndex() == len(m.view)-1 {
			m.onFilter = true
			m.follow = false
			m.loadDetail()
			return
		}
		i = len(m.view) - 1
	}
	if i < 0 {
		i = 0
	}
	m.selID = m.all[m.view[i]].ID
	// Following the newest line is not a mode the user sets. It is where the
	// selection is. Move up and the list holds still.
	m.follow = i == len(m.view)-1
	m.clampTop()
	m.loadDetail()
}

// One key puts the window back the way it started. Clearing the filter alone
// left the selection where it was, so a person who filtered, read, and cleared
// was still held and watched nothing arrive.
//
// Following is where the selection is rather than a mode, so getting back to
// it means moving to the newest line. That is the same move End makes, and it
// is made here for the same reason.
func (m *model) clearAndFollow() {
	m.input.SetValue("")
	m.filter, m.filterBad = Filter{}, ""
	m.rebuild()
	m.onFilter = false
	if len(m.view) == 0 {
		// Nothing to select, and the next line to arrive is the newest one.
		m.follow = true
		m.loadDetail()
		return
	}
	m.moveSel(len(m.view))
}

// One key opens the details and the same key closes them. Enter is what a
// person reaches for, and ctrl+d works where a terminal gives Enter to
// something else.
func (m *model) toggleDetails() {
	m.details = !m.details
	m.detail.Width = max(10, m.w-m.listWidth()-3)
	m.detail.Height = max(3, m.h-4)
	if m.details {
		m.loadDetail()
	} else {
		m.focus = focusList
	}
	m.clampTop()
}

// loadDetail is called when the SELECTION changes and at no other time. New
// records must never redraw this pane: that is the v3 defect being removed.
func (m *model) loadDetail() {
	if !m.details {
		return
	}
	// THE PANE WRAPS RATHER THAN CLIPS. A viewport cuts at its width, and the
	// lines worth opening the pane for are the long ones.
	show := func(text string) { m.detail.SetContent(Wrap(text, m.detail.Width)) }
	if m.onFilter {
		show(FilterHelp)
		m.detail.GotoTop()
		m.helping = true
		return
	}
	i := m.selIndex()
	if i < 0 {
		show(FilterHelp)
		return
	}
	m.helping = false
	show(m.all[m.view[i]].Detail())
	m.detail.GotoTop()
}

// One description of the columns. The header and the rows are rendered from
// it, so they cannot drift apart.
type column struct {
	title string
	width int // 0 means: take what is left
}

var columns = []column{
	{"time", 14},
	{"src", 7},
	{"kind", 9},
	{"actor", 9},
	{"message", 0},
	{"ok", 2},
}

func (m model) msgWidth(w int) int {
	used := 2 // the gutter
	for _, c := range columns {
		if c.width == 0 {
			continue
		}
		used += c.width + 1
	}
	if n := w - used; n > 10 {
		return n
	}
	return 10
}

func (m model) renderHeader(w int) string {
	var b strings.Builder
	b.WriteString("  ")
	for i, c := range columns {
		width := c.width
		if width == 0 {
			width = m.msgWidth(w)
		}
		b.WriteString(pad(c.title, width))
		if i < len(columns)-1 {
			b.WriteByte(' ')
		}
	}
	return headerStyle.Width(w).Render(b.String())
}

func (m model) listRows() int {
	// the column titles, the filter line, and the status line
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
		m.input.Width = max(10, m.listWidth()-12)
		m.detail.Width = max(10, m.w-m.listWidth()-3)
		m.detail.Height = max(3, m.h-4)
		// A NARROWER PANE WRAPS DIFFERENTLY, so what is shown is built again at
		// the new width. The selection has not moved, so the scroll is kept.
		at := m.detail.YOffset
		m.loadDetail()
		m.detail.YOffset = at
		m.clampTop()
		return m, nil

	case tailErrMsg:
		m.err = msg.err
		return m, m.tailer.cmd()

	case linesMsg:
		// The file started again, so what was read before it is gone. Keeping
		// it would leave two lines under one identity.
		if msg.restarted {
			m.all = nil
			m.top = 0
			m.selID = 0
			m.follow = true
		}
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
		// Keys are matched by TYPE as well as by name. A terminal that reports
		// a key under a name this program did not expect would otherwise send
		// it to the filter, where an arrow moves a text cursor and nothing
		// visible happens.
		switch msg.Type {
		case tea.KeyCtrlC:
			return m, tea.Quit
		case tea.KeyCtrlD, tea.KeyEnter:
			m.toggleDetails()
			return m, nil

		case tea.KeyTab:
			if m.details {
				if m.focus == focusList {
					m.focus = focusDetail
				} else {
					m.focus = focusList
				}
			}
			return m, nil
		case tea.KeyEsc:
			m.clearAndFollow()
			return m, nil
		case tea.KeyUp, tea.KeyDown, tea.KeyPgUp, tea.KeyPgDown, tea.KeyHome, tea.KeyEnd,
			tea.KeyCtrlP, tea.KeyCtrlN:
			if m.focus == focusDetail {
				var cmd tea.Cmd
				m.detail, cmd = m.detail.Update(msg)
				return m, cmd
			}
			switch msg.Type {
			case tea.KeyUp, tea.KeyCtrlP:
				m.moveSel(-1)
			case tea.KeyDown, tea.KeyCtrlN:
				m.moveSel(1)
			case tea.KeyPgUp:
				m.moveSel(-m.listRows())
			case tea.KeyPgDown:
				m.moveSel(m.listRows())
			case tea.KeyHome:
				m.moveSel(-len(m.view))
			case tea.KeyEnd:
				m.onFilter = false
				m.moveSel(len(m.view))
			}
			return m, nil
		}
		// The same keys, matched by name, for a terminal this build has not
		// met. Nothing here is reached when the types above matched.
		switch msg.String() {
		case "up", "ctrl+p":
			m.moveSel(-1)
			return m, nil
		case "down", "ctrl+n":
			m.moveSel(1)
			return m, nil
		case "pgup":
			m.moveSel(-m.listRows())
			return m, nil
		case "pgdown":
			m.moveSel(m.listRows())
			return m, nil
		case "home":
			m.moveSel(-len(m.view))
			return m, nil
		case "end":
			m.onFilter = false
			m.moveSel(len(m.view))
			return m, nil
		case "enter", "ctrl+d":
			m.toggleDetails()
			return m, nil
		case "esc":
			m.clearAndFollow()
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
		Render(strings.Repeat("│\n", max(1, m.h-1))) // a rule between columns, not an icon
	return lipgloss.JoinHorizontal(lipgloss.Top, left, sep, right)
}

func (m model) renderList() string {
	w := m.listWidth()
	var b strings.Builder
	// The titles never scroll away. A column nobody can name is a column
	// nobody can filter on.
	b.WriteString(m.renderHeader(w))
	b.WriteString("\n")
	rows := m.listRows()
	sel := m.selIndex()
	for i := 0; i < rows; i++ {
		idx := m.top + i
		if idx >= len(m.view) {
			b.WriteString("\n")
			continue
		}
		r := m.all[m.view[idx]]
		b.WriteString(m.renderRow(r, !m.onFilter && idx == sel, w))
		b.WriteString("\n")
	}
	// The filter sits under the list and above the status line, because it is
	// the last row a person walks onto.
	b.WriteString(m.renderFilter())
	b.WriteString("\n")
	b.WriteString(m.renderStatus(w))
	return lipgloss.NewStyle().Width(w).Render(b.String())
}

// The filter is drawn like a row and marked like one. The input renders
// itself, colours and all, so it is neither wrapped in another style nor
// truncated: wrapping makes lipgloss lay it out again, and truncating counts
// runes in a string that is mostly invisible escape characters.
func (m model) renderFilter() string {
	gutter := "  "
	if m.onFilter {
		gutter = selBarStyle.Render("▌") + " " // the selection bar, a shape and not an icon
	}
	return gutter + m.input.View()
}

func (m model) renderRow(r Record, selected bool, w int) string {
	mark := func(st lipgloss.Style) lipgloss.Style {
		if selected {
			return st.Underline(true).Bold(true)
		}
		return st
	}
	gutter := "  "
	if selected {
		gutter = selBarStyle.Render("▌") + " " // the selection bar, a shape and not an icon
	}
	msgW := m.msgWidth(w)
	cells := []string{
		mark(greyStyle).Render(pad(r.Day()+" "+r.Stamp(), columns[0].width)),
		mark(srcColour(r.Src)).Render(pad(r.Src, columns[1].width)),
		mark(kindColour(r.Kind)).Render(pad(r.Kind, columns[2].width)),
		mark(dimStyle).Render(pad(r.Actor, columns[3].width)),
		mark(lipgloss.NewStyle()).Render(pad(oneLine(r.Msg, msgW), msgW)),
		mark(markColour(r)).Render(pad(r.Mark(), columns[5].width)),
	}
	return gutter + strings.Join(cells, " ")
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
		return errStyle.Render(truncate("filter "+m.filterBad+" · showing the last one that worked", w)) // · is a separator, not an icon
	}
	shown := len(m.view)
	total := len(m.all)
	if total == 0 {
		return dimStyle.Render(truncate("waiting for "+m.path+" · nothing has been written to it yet", w)) // · is a separator, not an icon
	}
	follow := "held"
	if m.follow {
		follow = "following"
	}
	focus := "list"
	if m.focus == focusDetail {
		focus = "details"
	}
	// A BUILD THAT WAS NEVER STAMPED SAYS NOTHING, so it is not shown. The
	// word is what a variable holds when nobody set it, and putting it on the
	// bar asks the reader to work that out.
	s := fmt.Sprintf("%d of %d  ·  %s  ·  tab focus %s  ·  enter details  ·  esc clear and follow", // · is a separator, not an icon
		shown, total, follow, focusStyle.Render(focus))
	if Build != "unstamped" {
		s += "  ·  " + Build // · is a separator, not an icon
	}
	return dimStyle.Render(truncate(s, w))
}

func (m model) renderDetail() string {
	head := dimStyle.Render("details")
	if m.helping || m.selIndex() < 0 {
		head = dimStyle.Render("the filter language")
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
	return string(rs[:w-1]) + "…" // an ellipsis is punctuation, not an icon
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

// The log tab. It reads the session log the window is handed, follows every
// line that lands, starts again when a new session rotates the file, and
// draws the rows under the column names with a floor, a filter and an order.
// [[spec/design_output/tui#the-viewer]]

package log

import (
	"fmt"
	"regexp"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"quackitect/tui/draw"
	"quackitect/tui/frame"
)

const (
	StampWide = 8
	LevelWide = 5
	KindWide  = 10
	lineGaps  = 3
	// [[spec/design_output/tui#one-key-filters-the-line]]
	PromptsFilter = "kind: /^(prompt|reply)$/"
)

// The tab's own rows and where it stands in them, which the window tests read. [[spec/design_output/tui#the-packages-the-window-holds]]
type Tab struct {
	Path     string
	Zone     *time.Location
	All      []Record
	View     []int
	Sel      int
	Top      int
	Follow   bool
	Floor    string
	SortAt   int
	SortDown bool
	Filter   draw.Filter
	Tailer   *tailer
	Err      error
}

// The tab over the log at that path, following it from its first line. [[spec/design_output/tui#how-a-line-arrives]]
func New(path string, zone *time.Location) *Tab {
	return &Tab{Path: path, Zone: zone, Sel: -1, Follow: true, Floor: "info", SortAt: SortNone, Tailer: newTailer(path)}
}

func (*Tab) Name() string { return "log" }

func (*Tab) Label(_ *frame.Model) string { return "log" }

func (t *Tab) Init(_ *frame.Model) tea.Cmd { return t.Tailer.cmd() }

// The lines that arrive and the error that stops them are this tab's, and every key mode is the frame's. [[spec/design_output/tui#how-a-line-arrives]]
func (t *Tab) Update(m *frame.Model, msg tea.Msg) (bool, tea.Cmd) {
	switch msg := msg.(type) {
	case tailErrMsg:
		t.Err = msg.err
		return true, t.Tailer.cmd()
	case LinesMsg:
		if msg.Restarted {
			t.All, t.Sel, t.Top, t.Follow = nil, -1, 0, true
		}
		t.All = append(t.All, msg.Recs...)
		t.Rebuild(m.Rows())
		m.LoadPane()
		return true, t.Tailer.cmd()
	}
	return false, nil
}

func (t *Tab) Left(_ *frame.Model, w, rows int) string {
	return t.RenderNames(w) + "\n" + t.RenderRows(w, rows)
}

func (t *Tab) Detail(_ *frame.Model, _ int) []frame.Part { return DetailOf(t.All, t.Sel, t.Zone) }

func (t *Tab) Selected(_ *frame.Model) string { return fmt.Sprint(t.Sel) }

func (t *Tab) Narrowed(_ *frame.Model) bool { return !t.Filter.Empty() }

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (t *Tab) Keys(_ *frame.Model) frame.Band {
	return frame.Band{Name: "THE LOG", Acts: []frame.Act{
		{Key: frame.Bind("w s", "one row up, one row down", "w", "s", "W", "S"), Do: func(m *frame.Model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "w") {
				step = -1
			}
			t.Move(m, step)
			return nil
		}},
		{Key: frame.Bind("e", "the newest error, and e again the one before it", "e"), Do: func(m *frame.Model, _ string) tea.Cmd {
			t.toError(m)
			return nil
		}},
		// The floor rises under the filter pane too, so the mark stands on the binding. [[spec/design_output/tui#alt-l-raises-the-floor]]
		{Key: frame.Bind("alt+l", "raise the floor, and round again", "alt+l"), Under: true, Do: func(m *frame.Model, _ string) tea.Cmd {
			t.raiseFloor(m)
			return nil
		}},
	}}
}

func (*Tab) Selection(_ *frame.Model) frame.Band { return frame.Band{} }

// The log's presets: the prompts and the replies, and the kind of the selected row. [[spec/design_output/tui#one-key-filters-the-line]]
func (t *Tab) Presets(_ *frame.Model) []frame.Preset {
	out := []frame.Preset{{Name: "prompts and replies", Filter: PromptsFilter, Key: "alt+q"}}
	if t.Sel >= 0 && t.Sel < len(t.All) {
		r := t.All[t.Sel]
		said := fmt.Sprintf("kind: /^%s$/", regexp.QuoteMeta(r.Kind))
		if r.Label() != r.Kind {
			said = fmt.Sprintf("tool: /^%s$/", regexp.QuoteMeta(r.Label()))
		}
		out = append(out, frame.Preset{Name: "this row's kind", Filter: said, Key: "alt+F"})
	}
	return out
}

func (t *Tab) Move(m *frame.Model, step int) { t.MoveTo(m, t.At()+step) }

func (t *Tab) Jump(m *frame.Model, name string) {
	switch name {
	case "pgup":
		t.MoveTo(m, t.At()-m.Rows())
	case "pgdown":
		t.MoveTo(m, t.At()+m.Rows())
	case "home":
		t.MoveTo(m, 0)
	case "end":
		t.MoveTo(m, len(t.View)-1)
	}
}

// A press on a column name sorts by it, and a press on a row selects that row. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (t *Tab) Press(m *frame.Model, x, y int) {
	if y == frame.NamesRow {
		t.SortOn(m, ColumnAt(x, m.ListWidth()))
		return
	}
	at := t.Top + y - frame.FirstRow()
	if y >= frame.FirstRow() && at >= 0 && at < len(t.View) {
		t.MoveTo(m, at)
	}
}

// [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (t *Tab) Narrow(m *frame.Model, said string) error {
	f, err := draw.ParseFilter(said)
	if err != nil {
		return err
	}
	t.Filter = f
	t.Rebuild(m.Rows())
	m.LoadPane()
	return nil
}

// The log's columns hold their own order, so a preset's sort reaches nothing here. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (*Tab) Sorted(_ *frame.Model, _ frame.Preset) {}

func (*Tab) Pressed(_ *frame.Model, _ frame.Preset) bool { return false }

// [[spec/design_output/tui#the-footer-carries-status]]
func (t *Tab) Marks(_ *frame.Model) (string, string) { return t.SortSays(), t.Floor }

func (t *Tab) At() int {
	for p, index := range t.View {
		if index == t.Sel {
			return p
		}
	}
	return -1
}

// [[spec/design_output/tui#the-filter-holds-the-selection]]
func (t *Tab) Rebuild(rows int) {
	t.View = t.View[:0]
	for index, r := range t.All {
		if Rank(r.Level) >= Rank(t.Floor) && t.Filter.Match(r) {
			t.View = append(t.View, index)
		}
	}
	t.applySort()
	switch {
	case len(t.View) == 0:
	case t.Follow || t.Sel < 0:
		t.Sel = t.View[len(t.View)-1]
	case t.At() < 0:
		t.Sel = t.View[len(t.View)-1]
		for _, index := range t.View {
			if index >= t.Sel {
				t.Sel = index
				break
			}
		}
	}
	t.clampTop(rows)
}

// The top row clamps to the rows the window shows, which the frame says. [[spec/design_output/tui#the-window-is-a-split]]
func (t *Tab) clampTop(rows int) {
	rows = max(1, rows)
	p := t.At()
	if p < 0 {
		t.Top = 0
		return
	}
	if p < t.Top {
		t.Top = p
	}
	if p >= t.Top+rows {
		t.Top = p - rows + 1
	}
	t.Top = max(0, min(t.Top, max(0, len(t.View)-rows)))
	if p < t.Top {
		t.Top = p
	}
}

func (t *Tab) MoveTo(m *frame.Model, p int) {
	if len(t.View) == 0 {
		return
	}
	p = max(0, min(p, len(t.View)-1))
	t.Sel = t.View[p]
	t.Follow = p == len(t.View)-1
	t.clampTop(m.Rows())
	m.LoadPane()
}

// [[spec/design_output/tui#alt-l-raises-the-floor]]
func (t *Tab) raiseFloor(m *frame.Model) {
	t.Floor = ladder[(Rank(t.Floor)+1)%len(ladder)]
	t.Rebuild(m.Rows())
	m.LoadPane()
}

// [[spec/design_output/tui#e-finds-the-newest-error]]
func (t *Tab) toError(m *frame.Model) {
	here := t.At()
	onError := here >= 0 && strings.EqualFold(t.All[t.View[here]].Level, "error")
	for p := len(t.View) - 1; p >= 0; p-- {
		if onError && p >= here {
			continue
		}
		if strings.EqualFold(t.All[t.View[p]].Level, "error") {
			t.MoveTo(m, p)
			return
		}
	}
}

// [[spec/design_output/tui#the-columns-stand-still]]
func (t *Tab) RenderNames(w int) string {
	cells := make([]string, 0, len(logColumns))
	for i, one := range logColumns {
		name := one.name
		if one.wide > 0 {
			name = draw.Pad(name, one.wide)
		}
		style := draw.Head
		if i == t.SortAt {
			style = draw.Bar
		}
		cells = append(cells, style.Render(name))
	}
	return draw.Head.Render(strings.Repeat(" ", draw.GutterWide)) + draw.Cut(strings.Join(cells, " "), w-draw.GutterWide)
}

func (t *Tab) RenderRows(w, rows int) string {
	t.clampTop(rows)
	lines := make([]string, 0, rows)
	switch {
	case t.Err != nil:
		lines = append(lines, draw.LevelStyle("error").Render(draw.Cut("the log does not read: "+t.Err.Error(), w)))
	case len(t.All) == 0:
		lines = append(lines, draw.Dim.Render(draw.Cut("waiting for "+t.Path, w)))
	case len(t.View) == 0:
		lines = append(lines, draw.Dim.Render(draw.Cut("no line matches the filter", w)))
	}
	for p := t.Top; len(lines) < rows; p++ {
		if p >= len(t.View) {
			lines = append(lines, "")
			continue
		}
		index := t.View[p]
		lines = append(lines, t.renderRow(t.All[index], index == t.Sel, w))
	}
	return lipgloss.NewStyle().Width(w).Render(strings.Join(lines, "\n"))
}

// [[spec/design_output/tui#colours]]
func (t *Tab) renderRow(r Record, selected bool, w int) string {
	gutter := "  "
	if selected {
		gutter = draw.Bar.Render("▌") + " "
	}
	level := r.Level
	if level == "" {
		level = "info"
	}
	room := max(1, w-2-StampWide-LevelWide-KindWide-lineGaps)
	stamp := draw.Pad(r.Stamp(t.Zone), StampWide)
	said := draw.Pad(draw.Cut(draw.OneLine(r.Said), room), room)

	mark := func(style lipgloss.Style) lipgloss.Style {
		if selected {
			return style.Background(draw.RowSelected)
		}
		return style
	}
	gap := mark(lipgloss.NewStyle()).Render(" ")
	return gutter + strings.Join([]string{
		mark(draw.Dim).Render(stamp),
		mark(draw.LevelStyle(r.Level)).Render(draw.Pad(level, LevelWide)),
		mark(draw.KindStyle(r.Label())).Render(draw.Pad(r.Label(), KindWide)),
		mark(saidStyle(r)).Render(said),
	}, gap)
}

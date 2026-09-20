// The work tab. It draws every ticket this tree holds, nested under its group,
// off the rows the index answers. A change under the tree wakes the index,
// and the index wakes this tab, so it redraws with no key pressed and polls
// nothing. The details draw one row whole, with its links.
// [[spec/design_output/tui#the-work-tab]]

package work

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"quackitect/tui/draw"
	"quackitect/tui/frame"
	"quackitect/tui/tree"
)

// [[spec/design_output/tree-view#a-base-file-says-it]]
const BaseAt = "spec/views/work.base"

// The pause a dead index costs before the next ask, so it spins nothing. [[spec/design_output/tui#the-work-tab]]
const poll = 250 * time.Millisecond

// The keys the details draw as fields, in this order, and the rest they leave to the flags and the text. [[spec/design_output/tui#the-work-tab]]
var detailKeys = []string{"step", "group", "standing", "route", QueueKey}

// The tab's own tree and what stands over it, which the window tests read. [[spec/design_output/tui#the-packages-the-window-holds]]
type Tab struct {
	Path string
	Tree *tree.Tree
	Why  string
	Tick int64
	// [[spec/design_output/tui#the-work-tab-takes-edits]]
	Notice string
	rules  *ticketSchema
	// The places the verb answers last, laid over each tree the index hands over. [[spec/design_output/tui#the-work-tab]]
	Places *Places
	// The place chord stands open, and the next key closes it. [[spec/design_output/tui#the-work-tab-takes-edits]]
	Placing bool
}

// The tab over the tree whose log stands at that path. [[spec/design_output/tui#the-work-tab]]
func New(path string) *Tab { return &Tab{Path: path} }

func (*Tab) Name() string { return "work" }

// The log stands two folders under the root, so the root reads off its path. [[spec/design_output/tui#the-work-tab]]
func Root(path string) string {
	return filepath.Dir(filepath.Dir(filepath.Dir(path)))
}

// [[spec/design_output/tui#the-work-tab]]
func Load(path string) (*tree.Tree, error) {
	root := Root(path)
	base, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(BaseAt)))
	if err != nil {
		return nil, err
	}
	views, err := tree.ReadBase(string(base))
	if err != nil {
		return nil, err
	}
	said, err := askIndex(root, "tickets", map[string]any{})
	if err != nil {
		return nil, err
	}
	items, err := ReadWorkItems(string(said))
	if err != nil {
		return nil, err
	}
	one := views[0]
	out := tree.NewTree(one.Cols, items, one.Nests)
	out.Sorted(one.Sorts)
	// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	out.Flagged(one.Flags)
	out.Presets(one.Presets)
	// A name in the table links to its note, so the details carry no path. [[spec/design_output/tree-view#a-value-carries-a-link]]
	out.LinkOf = func(item tree.Item) string {
		// A sentence todo is no note, so its name links nowhere. [[spec/design_output/stop#the-plan]]
		if item.Keys["kind"] == KindTodo {
			return ""
		}
		return draw.FileAddress(root, pathOf(item))
	}
	return out, nil
}

func (t *Tab) Init(_ *frame.Model) tea.Cmd { return Cmd(t.Path, 0) }

// The index's answer, the verb's answer, and the keys while an edit or the place chord stands open are this tab's. [[spec/design_output/tui#the-work-tab-takes-edits]]
func (t *Tab) Update(m *frame.Model, msg tea.Msg) (bool, tea.Cmd) {
	switch msg := msg.(type) {
	case Msg:
		return true, t.takes(m, msg)
	case PlacesMsg:
		if msg.Why != "" {
			return true, nil
		}
		places := msg.Places
		t.Places = &places
		if t.Tree != nil {
			Placed(t.Tree, places)
			t.Tree.Filtering(m.SourceOf(m.TabNamed("work") - 1))
			m.LoadPane()
		}
		return true, nil
	case tea.KeyMsg:
		if m.Open != m.TabNamed("work")-1 {
			return false, nil
		}
		// An open edit takes every key, the way the filter line does. [[spec/design_output/tui#the-work-tab-takes-edits]]
		if t.Tree != nil && t.Tree.Editing() {
			t.editing(msg)
			return true, nil
		}
		t.Notice = ""
		// The place chord takes the next key, digit or not. [[spec/design_output/tui#the-work-tab-takes-edits]]
		if t.Placing {
			t.placeAt(msg.String())
			// The plan file wakes no index, so the tab asks the verb again itself. [[spec/design_output/pull#a-todo-forces-a-place]]
			return true, PlacesCmd(Root(t.Path))
		}
	}
	return false, nil
}

// [[spec/design_output/tui#the-work-tab]]
func (t *Tab) takes(m *frame.Model, msg Msg) tea.Cmd {
	next := []tea.Cmd{}
	if !msg.Same {
		if msg.Tree != nil {
			msg.Tree.Carry(t.Tree)
		}
		t.Tree, t.Why = msg.Tree, msg.Why
		if t.Tree != nil {
			// The first answer opens the line on the preset the file presses, and a later one keeps what stands. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
			at := m.TabNamed("work") - 1
			if !m.Opened && at >= 0 {
				m.Sources[at] = t.Tree.Opening()
				m.Opened = true
				if m.Open == at {
					m.Input.SetValue(m.Sources[at])
				}
			}
			if t.Places != nil {
				Placed(t.Tree, *t.Places)
			}
			t.Tree.Filtering(m.SourceOf(at))
			// A change under the tree moves the queue too, so the verb runs again behind each tree. [[spec/design_output/tui#the-work-tab]]
			next = append(next, PlacesCmd(Root(t.Path)))
		}
		m.LoadPane()
	}
	t.Tick = msg.Tick
	return tea.Batch(append(next, Cmd(t.Path, t.Tick))...)
}

// The presets the base file names, each under a number with alt. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tab) Presets(_ *frame.Model) []frame.Preset {
	if t.Tree == nil {
		return nil
	}
	said := t.Tree.PresetList()
	out := make([]frame.Preset, 0, len(said))
	for at, one := range said {
		out = append(out, frame.Preset{
			Name:   one.Name,
			Filter: one.Filters,
			Key:    fmt.Sprintf("alt+%d", at+1),
			Sorts:  one.Sorts,
		})
	}
	return out
}

// [[spec/design_output/tui#the-work-tab]]
type Msg struct {
	Tree *tree.Tree
	Why  string
	Tick int64
	Same bool
}

// The index holds the call until a sweep past the tick, and the tab reads the rows again then. [[spec/design_output/index#the-index-fires-on-change]]
func Cmd(path string, was int64) tea.Cmd {
	return func() tea.Msg {
		root := Root(path)
		said, err := askIndex(root, "changes", map[string]any{"since": was})
		if err != nil {
			// A door answering nowhere costs a pause before the next ask, so a dead index spins nothing. [[spec/design_output/tui#the-work-tab]]
			time.Sleep(poll)
			return Msg{Why: err.Error(), Tick: was}
		}
		var at struct {
			Tick int64 `json:"tick"`
		}
		if err := json.Unmarshal(said, &at); err != nil {
			return Msg{Why: err.Error(), Tick: was}
		}
		if at.Tick == was {
			return Msg{Tick: at.Tick, Same: true}
		}
		loaded, err := Load(path)
		if err != nil {
			return Msg{Why: err.Error(), Tick: at.Tick}
		}
		return Msg{Tree: loaded, Tick: at.Tick}
	}
}

// [[spec/design_output/tui#the-work-tab]]
func (t *Tab) Left(m *frame.Model, w, rows int) string {
	if t.Tree == nil {
		return lipgloss.NewStyle().Width(w).Render(strings.Join(t.waits(w, rows), "\n"))
	}
	// A notice takes the last line while one stands, so a refusal reads where the edit was. [[spec/design_output/tui#the-work-tab-takes-edits]]
	if t.Notice != "" {
		t.Tree.Scroll(rows - 1)
		return t.Tree.Header(w) + "\n" + t.Tree.Rows(w, rows-1) + "\n" + draw.LevelStyle("warn").Render(draw.Cut(t.Notice, w))
	}
	t.Tree.Scroll(rows)
	return t.Tree.Header(w) + "\n" + t.Tree.Rows(w, rows)
}

// [[spec/design_output/tui#the-work-tab]]
func (t *Tab) waits(w, rows int) []string {
	said := "The index answers this tab, and it draws the moment a door stands."
	if t.Why != "" {
		said = t.Why
	}
	lines := []string{
		draw.Head.Render(draw.Cut("the work browser", w)),
		"",
		draw.Dim.Render(draw.Cut(said, w)),
	}
	for len(lines) < rows+frame.NamesWide {
		lines = append(lines, "")
	}
	return lines
}

// The details of one row, in three parts: every flag in the column's order, the rest of the front, then the whole ask. [[spec/design_output/tui#the-work-tab]]
func (t *Tab) Detail(_ *frame.Model, w int) []frame.Part {
	if t.Tree == nil {
		return []frame.Part{{Text: draw.Cut("A row of the work browser shows its note here.", w)}}
	}
	one := t.Tree.Selected()
	if one == nil {
		return []frame.Part{{Text: draw.Cut("No row stands under the cursor.", w)}}
	}
	root := Root(t.Path)
	// The name heads the details as text, because the table's own name carries the link. [[spec/design_output/tree-view#a-value-carries-a-link]]
	out := []frame.Part{{Text: draw.Head.Bold(true).Render(one.Name), Drawn: true}, {}}
	for _, held := range t.Tree.States(*one) {
		out = append(out, frame.Part{Text: tree.FlagStyle(held).Render(fmt.Sprintf("%s  %-8s %s", held.Letter, held.Key, held.Value)), Drawn: true})
	}
	if fields := workFields(root, *one); len(fields) > 0 {
		out = append(out, frame.Part{})
		out = append(out, fields...)
	}
	says := strings.TrimSpace(one.Keys["says"])
	if says == "" {
		return out
	}
	out = append(out, frame.Part{})
	for _, line := range strings.Split(draw.Wrap(says, w), "\n") {
		out = append(out, frame.Part{Text: draw.WithLinks(root, line), Drawn: true})
	}
	return out
}

// The selected row's name, so the pane holds still while it stands. [[spec/design_output/tui#the-pane-holds-still]]
func (t *Tab) Selected(_ *frame.Model) string {
	if t.Tree == nil || t.Tree.Selected() == nil {
		return ""
	}
	return t.Tree.Selected().Name
}

// The path a row names, or the ticket's own place under the tickets folder. [[spec/design_output/tree-view#a-value-carries-a-link]]
func pathOf(one tree.Item) string {
	if said := strings.TrimSpace(one.Keys["path"]); said != "" {
		return said
	}
	return draw.TicketPath(one.Name)
}

// The fields a row carries, one a line, each value a link where the tree resolves it. [[spec/design_output/tree-view#a-value-carries-a-link]]
func workFields(root string, one tree.Item) []frame.Part {
	wide := 0
	for _, key := range detailKeys {
		if strings.TrimSpace(one.Keys[key]) != "" {
			wide = max(wide, len(key))
		}
	}
	out := []frame.Part{}
	for _, key := range detailKeys {
		value := strings.TrimSpace(one.Keys[key])
		if value == "" {
			continue
		}
		if key == "group" {
			value = draw.Linked(value, draw.FileAddress(root, draw.TicketPath(value)))
		}
		out = append(out, frame.Part{Text: draw.Dim.Render(fmt.Sprintf("%-*s  ", wide, key)) + value, Drawn: true})
	}
	return out
}

// A pressed preset narrows the tab, the queue among them, so the funnel stands red while one holds. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tab) Narrowed(m *frame.Model) bool {
	return t.Tree != nil && (t.Tree.Narrowed() || m.Pressed() != nil)
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (t *Tab) Keys(_ *frame.Model) frame.Band {
	return frame.Band{Name: "THE WORK", Acts: []frame.Act{
		{Key: frame.Bind("w s", "one row up, one row down", "w", "s", "W", "S"), Do: func(m *frame.Model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "w") {
				step = -1
			}
			t.Move(m, step)
			return nil
		}},
		{Key: frame.Bind("space", "open a group, and close it", " "), Do: func(_ *frame.Model, _ string) tea.Cmd {
			if t.Tree != nil {
				t.Tree.Toggle()
			}
			return nil
		}},
		{Key: frame.Bind("+ -", "open every group, and close every one", "+", "-"), Do: func(_ *frame.Model, name string) tea.Cmd {
			if t.Tree == nil {
				return nil
			}
			if name == "+" {
				t.Tree.Expand(true)
				return nil
			}
			t.Tree.Collapse(true)
			return nil
		}},
		// A place is the todo, and the same digit again takes it off. No cell opens here, because every field a person sets has a key of its own. [[spec/design_output/pull#the-queue-is-an-outline]]
		{Key: frame.Bind("p 1…9", "place the row in the queue: p, then the place, and the same place again clears it", placeKey), Do: func(_ *frame.Model, _ string) tea.Cmd {
			t.openPlace()
			return nil
		}},
		{Key: frame.Bind("u", "flip the urgent mark", "u"), Do: func(_ *frame.Model, _ string) tea.Cmd {
			t.flip(UrgentKey)
			return nil
		}},
	}}
}

func (*Tab) Selection(_ *frame.Model) frame.Band { return frame.Band{} }

func (t *Tab) Move(m *frame.Model, step int) {
	if t.Tree != nil {
		t.Tree.Move(step)
		m.LoadPane()
	}
}

// The tree holds its own rows, and a jump moves it a window at a time. [[spec/design_output/tui#the-keys]]
func (t *Tab) Jump(m *frame.Model, name string) {
	if t.Tree == nil {
		return
	}
	switch name {
	case "pgup":
		t.Tree.Move(-m.Rows())
	case "pgdown":
		t.Tree.Move(m.Rows())
	case "home":
		t.Tree.MoveTo(0)
	case "end":
		t.Tree.MoveTo(t.Tree.Len() - 1)
	}
	m.LoadPane()
}

// A press on the work tab reaches its tree, which holds its own order. [[spec/design_output/tree-view#a-sort-holds-several-keys]]
func (t *Tab) Press(m *frame.Model, x, y int) {
	if t.Tree == nil {
		return
	}
	if y == frame.NamesRow {
		t.Tree.SortOn(t.Tree.ColumnAt(x, m.ListWidth()))
		m.LoadPane()
		return
	}
	if y >= frame.FirstRow() {
		t.Tree.MoveToRow(y - frame.FirstRow())
		// A press on the mark before a group opens it, and closes it again. [[spec/design_output/tree-view#a-parent-expands-and-collapses]]
		if t.Tree.OnMark(x) {
			t.Tree.Toggle()
		}
		m.LoadPane()
	}
}

// [[spec/design_output/tui#the-filter-pane-takes-letters]]
func (t *Tab) Narrow(_ *frame.Model, said string) error {
	if t.Tree == nil {
		return nil
	}
	return t.Tree.Filtering(said)
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tab) Sorted(_ *frame.Model, one frame.Preset) {
	if t.Tree != nil {
		t.Tree.Sorted(one.Sorts)
	}
}

// [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (t *Tab) Pressed(_ *frame.Model, one frame.Preset) bool {
	return t.Tree != nil && sameSorts(t.Tree.Sorts(), one.Sorts)
}

func sameSorts(held, want []tree.Sort) bool {
	if len(held) != len(want) {
		return false
	}
	for at := range held {
		if held[at] != want[at] {
			return false
		}
	}
	return true
}

// The work tab holds no floor and no column order of the log's kind, so the footer reads the log's. [[spec/design_output/tui#the-footer-carries-status]]
func (*Tab) Marks(_ *frame.Model) (string, string) { return "", "" }

// The registry tabs: index, cli and help, each drawing the rows one catalog
// name holds, with its columns and its details.
// [[spec/design_output/model#the-registry-tabs]]

package registry

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
)

// The span a tab waits before it asks the catalog again, so a restart of the index reaches it. [[spec/design_output/model#the-registry-tabs]]
const askAgain = 2 * time.Second

// The widths of the columns a tab draws. [[spec/design_output/model#the-registry-tabs]]
const (
	nameWide     = 30
	providerWide = 36
	stateWide    = 10
	kindWide     = 8
)

// One column a tab draws: its header, the row field it reads, and its width, where the last column takes what is left. [[spec/design_output/model#the-registry-tabs]]
type column struct {
	head  string
	field string
	wide  int
}

// [[spec/design_output/model#the-registry-tabs]]
type Tab struct {
	name    string
	source  string
	columns []column
	From    Catalog
	All     []Row
	View    []int
	Sel     int
	Top     int
	Filter  draw.Filter
	Err     error
}

// The rows landing from one read of the catalog, named for the tab that asked. The frame hands each arrival to every tab. [[spec/design_output/model#the-registry-tabs]]
type fetched struct {
	tab  string
	rows []Row
	err  error
}

// The span a tab waited, named for the tab that waited. [[spec/design_output/model#the-registry-tabs]]
type again struct{ tab string }

// One row of a catalog list, keyed as its json. [[spec/design_output/model#the-registry-tabs]]
type Row map[string]any

// The text of one field, a provider as its name and kind, and any other value as its json. [[spec/design_output/model#the-registry-tabs]]
func (r Row) Field(name string) (string, bool) {
	value, found := r[name]
	if !found || value == nil {
		return "", false
	}
	switch v := value.(type) {
	case string:
		return v, true
	case map[string]any:
		if name == "provider" {
			return fmt.Sprintf("%v (%v)", v["name"], v["kind"]), true
		}
	}
	said, err := json.Marshal(value)
	if err != nil {
		return "", false
	}
	return string(said), true
}

func (r Row) Haystack() string {
	var all []string
	for name := range r {
		if said, found := r.Field(name); found {
			all = append(all, said)
		}
	}
	return strings.Join(all, " ")
}

func (r Row) Detail() string { return r.Haystack() }

func (r Row) text(name string) string {
	said, _ := r.Field(name)
	return said
}

// [[spec/design_output/model#the-registry-tabs]]
func Index(c Catalog) *Tab {
	return &Tab{name: "index", source: NamesName, From: c, Sel: -1, columns: []column{
		{"name", "name", nameWide}, {"provider", "provider", providerWide}, {"state", "state", stateWide}, {"value", "value", 0}}}
}

// [[spec/design_output/model#the-registry-tabs]]
func Cli(c Catalog) *Tab {
	return &Tab{name: "cli", source: ActionsName, From: c, Sel: -1, columns: []column{
		{"action", "name", nameWide}, {"doc", "doc", 0}}}
}

// [[spec/design_output/model#the-registry-tabs]]
func Help(c Catalog) *Tab {
	return &Tab{name: "help", source: DocsName, From: c, Sel: -1, columns: []column{
		{"name", "name", nameWide}, {"kind", "kind", kindWide}, {"doc", "doc", 0}}}
}

func (t *Tab) Name() string                { return t.name }
func (t *Tab) Label(_ *frame.Model) string { return t.name }

func (t *Tab) Init(_ *frame.Model) tea.Cmd { return t.fetch() }

// One read of the catalog, in a command so the window keeps answering. [[spec/design_output/model#the-registry-tabs]]
func (t *Tab) fetch() tea.Cmd {
	from, source, name := t.From, t.source, t.name
	return func() tea.Msg {
		said, err := from.Read(source)
		if err != nil {
			return fetched{tab: name, err: err}
		}
		var rows []Row
		if err := json.Unmarshal(said, &rows); err != nil {
			return fetched{tab: name, err: err}
		}
		return fetched{tab: name, rows: rows}
	}
}

// Only the arrivals naming this tab are its own. A landed read waits, then asks again. [[spec/design_output/model#the-registry-tabs]]
func (t *Tab) Update(m *frame.Model, msg tea.Msg) (bool, tea.Cmd) {
	switch msg := msg.(type) {
	case fetched:
		if msg.tab != t.name {
			return false, nil
		}
		t.Err = msg.err
		if msg.err == nil {
			t.All = msg.rows
		}
		t.Rebuild(m.Rows())
		m.LoadPane()
		name := t.name
		return true, tea.Tick(askAgain, func(time.Time) tea.Msg { return again{tab: name} })
	case again:
		if msg.tab != t.name {
			return false, nil
		}
		return true, t.fetch()
	}
	return false, nil
}

// The rows the filter keeps, with the selection held on its row where that row stays. [[spec/design_output/model#the-registry-tabs]]
func (t *Tab) Rebuild(rows int) {
	kept := ""
	if t.Sel >= 0 && t.Sel < len(t.All) {
		kept = t.All[t.Sel].text("name")
	}
	t.View = t.View[:0]
	t.Sel = -1
	for at, one := range t.All {
		if t.Filter.Match(one) {
			t.View = append(t.View, at)
			if kept != "" && one.text("name") == kept {
				t.Sel = at
			}
		}
	}
	if t.Sel < 0 && len(t.View) > 0 {
		t.Sel = t.View[0]
	}
	t.clampTop(rows)
}

func (t *Tab) at() int {
	for place, index := range t.View {
		if index == t.Sel {
			return place
		}
	}
	return -1
}

func (t *Tab) clampTop(rows int) {
	rows = max(1, rows)
	p := max(0, t.at())
	if p < t.Top {
		t.Top = p
	}
	if p >= t.Top+rows {
		t.Top = p - rows + 1
	}
	t.Top = max(0, min(t.Top, max(0, len(t.View)-rows)))
}

// The header line over the columns. [[spec/design_output/model#the-registry-tabs]]
func (t *Tab) names(w int) string {
	return draw.Head.Render(strings.Repeat(" ", draw.GutterWide)) + draw.Head.Render(draw.Cut(t.line(w-draw.GutterWide, func(c column) string { return c.head }), w-draw.GutterWide))
}

// One line over the columns, each cut to its width and the last cut to the room left. [[spec/design_output/model#the-registry-tabs]]
func (t *Tab) line(w int, cell func(column) string) string {
	var out []string
	used := 0
	for _, c := range t.columns {
		wide := c.wide
		if wide == 0 {
			wide = max(1, w-used)
		}
		out = append(out, draw.Pad(draw.Cut(draw.OneLine(cell(c)), wide), wide))
		used += wide + 1
	}
	return strings.TrimRight(strings.Join(out, " "), " ")
}

func (t *Tab) Left(_ *frame.Model, w, rows int) string {
	t.clampTop(rows)
	lines := make([]string, 0, rows)
	switch {
	case t.Err != nil:
		lines = append(lines, draw.LevelStyle("error").Render(draw.Cut("the index does not answer: "+t.Err.Error(), w)))
	case len(t.All) == 0:
		lines = append(lines, draw.Dim.Render(draw.Cut("waiting for "+t.source, w)))
	case len(t.View) == 0:
		lines = append(lines, draw.Dim.Render(draw.Cut("no row matches the filter", w)))
	}
	for p := t.Top; len(lines) < rows; p++ {
		if p >= len(t.View) {
			lines = append(lines, "")
			continue
		}
		index := t.View[p]
		gutter := "  "
		if index == t.Sel {
			gutter = draw.Bar.Render("▌") + " "
		}
		row := t.All[index]
		lines = append(lines, gutter+t.line(w-draw.GutterWide, func(c column) string { return row.text(c.field) }))
	}
	return t.names(w) + "\n" + strings.Join(lines, "\n")
}

// The selected row in full: the value whole, the doc wrapped, and for an action the fields and the command line it runs. [[spec/design_output/model#the-registry-tabs]]
func (t *Tab) Detail(_ *frame.Model, _ int) []frame.Part {
	if t.Sel < 0 || t.Sel >= len(t.All) {
		return nil
	}
	row := t.All[t.Sel]
	parts := []frame.Part{{Style: draw.Head, Text: row.text("name")}}
	switch t.name {
	case "index":
		parts = append(parts, frame.Part{Text: "provider  " + row.text("provider")}, frame.Part{Text: "state     " + row.text("state")})
		if value, found := row["value"]; found {
			full, _ := json.MarshalIndent(value, "", "  ")
			parts = append(parts, frame.Part{}, frame.Part{Text: string(full), Drawn: true})
		}
	case "cli":
		parts = append(parts, frame.Part{Text: row.text("doc")}, frame.Part{})
		command := "quack run " + row.text("name")
		fields, _ := row["fields"].([]any)
		for _, one := range fields {
			field, _ := one.(map[string]any)
			key := textOf(field, "Key", "key")
			parts = append(parts, frame.Part{Text: fmt.Sprintf("%s: %s", textOf(field, "Label", "label"), textOf(field, "Doc", "doc"))})
			command += " --" + key + " <" + key + ">"
		}
		parts = append(parts, frame.Part{}, frame.Part{Text: command})
	default:
		parts = append(parts, frame.Part{Text: "kind      " + row.text("kind")}, frame.Part{}, frame.Part{Text: row.text("doc")})
	}
	return parts
}

// The text under the first of these keys that holds a string. [[spec/design_output/model#the-registry-tabs]]
func textOf(from map[string]any, keys ...string) string {
	for _, key := range keys {
		if said, ok := from[key].(string); ok {
			return said
		}
	}
	return ""
}

func (t *Tab) Selected(_ *frame.Model) string {
	if t.Sel < 0 || t.Sel >= len(t.All) {
		return ""
	}
	return t.All[t.Sel].text("name")
}

func (t *Tab) Narrowed(_ *frame.Model) bool { return !t.Filter.Empty() }

func (t *Tab) Keys(_ *frame.Model) frame.Band {
	return frame.Band{Name: "THE " + strings.ToUpper(t.name)}
}

func (t *Tab) Selection(_ *frame.Model) frame.Band   { return frame.Band{} }
func (t *Tab) Presets(_ *frame.Model) []frame.Preset { return nil }

func (t *Tab) Move(m *frame.Model, step int) { t.moveTo(m, t.at()+step) }

func (t *Tab) moveTo(m *frame.Model, p int) {
	if len(t.View) == 0 {
		return
	}
	t.Sel = t.View[max(0, min(p, len(t.View)-1))]
	t.clampTop(m.Rows())
	m.LoadPane()
}

func (t *Tab) Jump(m *frame.Model, name string) {
	switch name {
	case "pgup":
		t.moveTo(m, t.at()-m.Rows())
	case "pgdown":
		t.moveTo(m, t.at()+m.Rows())
	case "home":
		t.moveTo(m, 0)
	case "end":
		t.moveTo(m, len(t.View)-1)
	}
}

// A press on a row selects it. [[spec/design_output/tui#the-mouse-reaches-the-window]]
func (t *Tab) Press(m *frame.Model, _, y int) {
	if at := t.Top + y - frame.FirstRow(); y >= frame.FirstRow() && at >= 0 && at < len(t.View) {
		t.moveTo(m, at)
	}
}

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

func (t *Tab) Sorted(_ *frame.Model, _ frame.Preset)       {}
func (t *Tab) Pressed(_ *frame.Model, _ frame.Preset) bool { return false }
func (t *Tab) Marks(_ *frame.Model) (string, string)       { return "", "" }

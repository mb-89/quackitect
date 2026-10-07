// The tutorial tab: the examples by chapter on the left, the selected one's
// prose and calls on the right, each row's last verdict, and F5 running it.
// [[spec/design_output/examples#the-tutorial-tab]]
package tutorial

import (
	"context"
	"encoding/json"
	"sort"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"

	"quackitect/src/tui/draw"
	"quackitect/src/tui/frame"
	"quackitect/src/tui/registry"
)

// The name the tab reads, and the action F5 posts, which src/modules/examples owns and a renderer spells again. [[spec/design_output/examples#the-tutorial-tab]]
const (
	RowsName = "examples/rows"
	RunName  = "examples/run"
)

// The mark a row wears for its last verdict, and a blank one before its first run. [[spec/design_output/examples#the-tutorial-tab]]
const (
	PassMark  = "✓"
	FailMark  = "✗"
	BlankMark = " "
)

// One example as examples/rows answers it. [[spec/design_output/examples#the-tutorial-tab]]
type Row struct {
	Path      string   `json:"path"`
	Chapter   string   `json:"chapter"`
	Dev       bool     `json:"dev,omitempty"`
	Title     string   `json:"title"`
	Keywords  []string `json:"keywords"`
	Interface []string `json:"interface"`
	Body      string   `json:"body"`
	Verdict   string   `json:"verdict,omitempty"`
	Miss      string   `json:"miss,omitempty"`
}

// The road the tab reads and posts through. [[spec/design_output/examples#the-tutorial-tab]]
type Source interface {
	registry.Catalog
	registry.Watcher
	registry.Caller
}

// The heading over the developer chapters. [[spec/design_output/examples#the-places]]
const developer = "developer"

// The styles of the tree and the main view: a heading, a title, a call, and a match the content search lights. [[spec/design_output/examples#the-tutorial-tab]]
var (
	headingStyle = lipgloss.NewStyle().Bold(true)
	callStyle    = lipgloss.NewStyle().Faint(true)
	matchStyle   = lipgloss.NewStyle().Reverse(true)
)

// The line over the tree naming the mode while the search holds a word. [[spec/design_output/examples#the-search]]
const (
	titleMode   = "title search"
	contentMode = "content search"
)

// The tab's own watch ending, and its call to watch again. [[spec/design_output/examples#the-tutorial-tab]]
type (
	watchEnded registry.Ended
	watchAgain struct{}
)

// The answer a run's post lands as. [[spec/design_output/examples#the-tutorial-tab]]
type runSaid struct {
	path, refused string
}

// [[spec/design_output/examples#the-tutorial-tab]]
type Tab struct {
	From    Source
	Rows    []Row
	Notice  string
	At      int
	word    string
	content bool
	stream  <-chan tea.Msg
}

// The tab over its source. [[spec/design_output/examples#the-tutorial-tab]]
func New(from Source) *Tab { return &Tab{From: from} }

func (t *Tab) Name() string                { return "tutorial" }
func (t *Tab) Label(_ *frame.Model) string { return "tutorial" }

// The watch's first event carries the rows, so the tab draws off it. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) Init(_ *frame.Model) tea.Cmd { return t.watches() }

func (t *Tab) watches() tea.Cmd {
	if t.From == nil {
		return nil
	}
	t.stream = registry.Stream(context.Background(), t.From, []string{RowsName})
	return t.next()
}

// The next message off the tab's own stream, whose end lands as the tab's own message. [[spec/tickets/the-work-tab-reads-v1]]
func (t *Tab) next() tea.Cmd {
	if t.stream == nil {
		return nil
	}
	armed := registry.Next(t.stream)
	return func() tea.Msg {
		said := armed()
		if ended, over := said.(registry.Ended); over {
			return watchEnded(ended)
		}
		return said
	}
}

// A change to the rows redraws the tree, a watch ending watches again after a pause, and a run's answer stands as the notice. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) Update(_ *frame.Model, msg tea.Msg) (bool, tea.Cmd) {
	switch msg := msg.(type) {
	case registry.Change:
		if msg.Name != RowsName {
			return false, nil
		}
		t.redraws(msg.Value)
		return true, t.next()
	case watchEnded:
		t.Notice, t.stream = msg.Why, nil
		return true, tea.Tick(frame.Poll, func(time.Time) tea.Msg { return watchAgain{} })
	case watchAgain:
		return true, t.watches()
	case runSaid:
		t.Notice = msg.path + " runs in a clone of its own."
		if msg.refused != "" {
			t.Notice = msg.path + " refuses: " + msg.refused
		}
		return true, nil
	}
	return false, nil
}

// The run of one example, posted off the window. [[spec/design_output/examples#one-runner-two-drivers]]
func (t *Tab) runs(path string) tea.Cmd {
	if path == "" || t.From == nil {
		return nil
	}
	from := t.From
	return func() tea.Msg {
		if _, err := from.Call(RunName, struct {
			Path string `json:"path"`
		}{path}); err != nil {
			return runSaid{path: path, refused: err.Error()}
		}
		return runSaid{path: path}
	}
}

// The rows in tree order: the user chapters, then the developer ones, each by path, the selection held. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) redraws(value json.RawMessage) {
	var rows []Row
	if json.Unmarshal(value, &rows) != nil {
		return
	}
	sort.SliceStable(rows, func(i, j int) bool {
		if rows[i].Dev != rows[j].Dev {
			return !rows[i].Dev
		}
		return rows[i].Path < rows[j].Path
	})
	selected := ""
	if t.At < len(t.Rows) {
		selected = t.Rows[t.At].Path
	}
	t.Rows, t.At = rows, 0
	t.jumps(selected)
}

// The rows the search keeps, by their place in the tree. [[spec/design_output/examples#the-search]]
func (t *Tab) kept() []int {
	out := []int{}
	for at, one := range t.Rows {
		if matches(one, t.word, t.content) {
			out = append(out, at)
		}
	}
	return out
}

// Title mode reads the title, and content mode the title, each keyword and the body, case-blind. [[spec/design_output/examples#the-search]]
func matches(one Row, word string, content bool) bool {
	if word == "" || strings.Contains(strings.ToLower(one.Title), word) {
		return true
	}
	if !content {
		return false
	}
	for _, said := range one.Keywords {
		if strings.Contains(strings.ToLower(said), word) {
			return true
		}
	}
	return strings.Contains(strings.ToLower(one.Body), word)
}

// The mark a row wears for its last verdict. [[spec/design_output/examples#the-tutorial-tab]]
func markOf(one Row) string {
	switch one.Verdict {
	case "pass":
		return PassMark
	case "fail":
		return FailMark
	}
	return BlankMark
}

// The tree: a heading a chapter, a row an example under it, the developer heading over the developer chapters, and the notice last. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) Left(_ *frame.Model, width, _ int) string {
	lines, chapter, dev := []string{}, "", false
	if t.word != "" {
		mode := titleMode
		if t.content {
			mode = contentMode
		}
		lines = append(lines, draw.Dim.Render(mode))
	}
	for _, at := range t.kept() {
		one := t.Rows[at]
		if one.Dev && !dev {
			lines, dev = append(lines, headingStyle.Render(developer)), true
		}
		if one.Chapter != chapter {
			lines, chapter = append(lines, headingStyle.Render(one.Chapter)), one.Chapter
		}
		cursor := "  "
		if at == t.At {
			cursor = "> "
		}
		lines = append(lines, draw.Cut(cursor+markOf(one)+" "+one.Title, width))
	}
	if t.Notice != "" {
		lines = append(lines, "", draw.LevelStyle("warn").Render(draw.Cut(t.Notice, width)))
	}
	return strings.Join(lines, "\n")
}

// The selected example: its title, its miss, then its body with the front cut off, each call in the call style, each heading bold, and every match lit in content mode. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) Detail(_ *frame.Model, width int) []frame.Part {
	if t.At >= len(t.Rows) {
		return nil
	}
	one := t.Rows[t.At]
	parts := []frame.Part{{Style: headingStyle, Text: one.Title}, {Text: ""}}
	if one.Miss != "" {
		parts = append(parts, frame.Part{Text: FailMark + " " + one.Miss}, frame.Part{Text: ""})
	}
	fenced := false
	for _, line := range strings.Split(bodyOf(one.Body), "\n") {
		switch {
		case strings.HasPrefix(line, "```"):
			fenced = !fenced
		case fenced:
			parts = append(parts, frame.Part{Style: callStyle, Text: line})
		case strings.HasPrefix(line, "#"):
			parts = append(parts, frame.Part{Style: headingStyle, Text: strings.TrimLeft(line, "# ")})
		default:
			parts = append(parts, frame.Part{Text: line})
		}
	}
	if !t.content || t.word == "" {
		return parts
	}
	return lit(parts, t.word, width)
}

// Each part wrapped as the pane wraps it, then drawn whole with every match in the match style. A match the wrap splits lights on each half apart. [[spec/design_output/examples#the-search]]
func lit(parts []frame.Part, word string, width int) []frame.Part {
	out := []frame.Part{}
	for _, one := range parts {
		for _, line := range strings.Split(draw.Wrap(one.Text, width), "\n") {
			out = append(out, frame.Part{Text: litLine(line, word, one.Style), Drawn: true})
		}
	}
	return out
}

func litLine(line, word string, style lipgloss.Style) string {
	lower := strings.ToLower(line)
	if len(lower) != len(line) {
		return style.Render(line)
	}
	drawn := ""
	for {
		at := strings.Index(lower, word)
		if at < 0 {
			return drawn + style.Render(line)
		}
		if at > 0 {
			drawn += style.Render(line[:at])
		}
		drawn += matchStyle.Render(line[at : at+len(word)])
		line, lower = line[at+len(word):], lower[at+len(word):]
		if line == "" {
			return drawn
		}
	}
}

// The body past its front. [[spec/design_output/examples#the-format]]
func bodyOf(text string) string {
	if front, ok := strings.CutPrefix(text, "---\n"); ok {
		if _, body, ok := strings.Cut(front, "\n---\n"); ok {
			return strings.TrimLeft(body, "\n")
		}
	}
	return text
}

func (t *Tab) Selected(_ *frame.Model) string {
	if t.At < len(t.Rows) {
		return t.Rows[t.At].Path
	}
	return ""
}

func (t *Tab) Narrowed(_ *frame.Model) bool { return t.word != "" }

// The tab's keys: a step up and down the tree, F5 running the selected example, and alt+m turning the search over, under the filter pane too. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) Keys(_ *frame.Model) frame.Band {
	return frame.Band{Name: "THE TUTORIAL", Acts: []frame.Act{
		{Key: frame.Bind("w s", "one example up, one example down", "w", "s", "W", "S"), Do: func(m *frame.Model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "w") {
				step = -1
			}
			t.Move(m, step)
			return nil
		}},
		{Key: frame.Bind("F5", "run the selected example in a clone of its own", "f5"), Do: func(m *frame.Model, _ string) tea.Cmd {
			return t.runs(t.Selected(m))
		}},
		{Key: frame.Bind("alt+m", "turn the search over: title, then content", "alt+m"), Under: true, Do: func(m *frame.Model, _ string) tea.Cmd {
			t.content = !t.content
			t.Move(m, 0)
			return nil
		}},
	}}
}

func (t *Tab) Selection(_ *frame.Model) frame.Band   { return frame.Band{} }
func (t *Tab) Presets(_ *frame.Model) []frame.Preset { return nil }

// A step through the kept rows. [[spec/design_output/examples#the-tutorial-tab]]
func (t *Tab) Move(_ *frame.Model, by int) {
	kept := t.kept()
	for place, at := range kept {
		if at == t.At {
			t.At = kept[max(0, min(len(kept)-1, place+by))]
			return
		}
	}
	if len(kept) > 0 {
		t.At = kept[0]
	}
}

func (t *Tab) Jump(_ *frame.Model, path string) { t.jumps(path) }

func (t *Tab) jumps(path string) {
	for at, one := range t.Rows {
		if one.Path == path {
			t.At = at
			return
		}
	}
}

func (t *Tab) Press(_ *frame.Model, _, _ int) {}

// The word the search reads in the mode the tab holds, and an empty word keeps every row with the selection held. [[spec/design_output/examples#the-search]]
func (t *Tab) Narrow(m *frame.Model, word string) error {
	t.word = strings.ToLower(strings.TrimSpace(word))
	t.Move(m, 0)
	return nil
}

func (t *Tab) Sorted(_ *frame.Model, _ frame.Preset)       {}
func (t *Tab) Pressed(_ *frame.Model, _ frame.Preset) bool { return false }
func (t *Tab) Marks(_ *frame.Model) (string, string)       { return "", "" }

// The work tab. It draws every ticket this tree holds, nested under its group,
// off the rows the index answers. A change under the tree wakes the index,
// and the index wakes this tab, so it redraws with no key pressed and polls
// nothing. The details draw one row whole, with its links.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// [[spec/design_output/tree-view#a-base-file-says-it]]
const workBaseAt = "spec/views/work.base"

// The keys the details draw as fields, in this order, and the rest they leave to the flags and the text. [[spec/design_output/tui#the-work-tab]]
var detailKeys = []string{"step", "group", "standing", "route", queueKey}

// [[spec/design_output/tui#the-work-tab]]
type workTab struct{}

func (workTab) Name() string { return "work" }

// The log stands two folders under the root, so the root reads off its path. [[spec/design_output/tui#the-work-tab]]
func workRoot(path string) string {
	return filepath.Dir(filepath.Dir(filepath.Dir(path)))
}

// [[spec/design_output/tui#the-work-tab]]
func loadWork(path string) (*Tree, error) {
	root := workRoot(path)
	base, err := os.ReadFile(filepath.Join(root, filepath.FromSlash(workBaseAt)))
	if err != nil {
		return nil, err
	}
	views, err := ReadBase(string(base))
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
	tree := NewTree(one.Cols, items, one.Nests)
	tree.Sorted(one.Sorts)
	// [[spec/design_output/tree-view#a-flag-draws-a-letter]]
	tree.Flagged(one.Flags)
	tree.Presets(one.Presets)
	// A name in the table links to its note, so the details carry no path. [[spec/design_output/tree-view#a-value-carries-a-link]]
	tree.LinkOf = func(item Item) string { return fileAddress(root, pathOf(item)) }
	return tree, nil
}

// The presets the base file names, each under a number with alt. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func (workTab) Presets(m *model) []preset {
	if m.work == nil {
		return nil
	}
	said := m.work.PresetList()
	out := make([]preset, 0, len(said))
	for at, one := range said {
		out = append(out, preset{
			Name:   one.Name,
			Filter: one.Filters,
			Key:    fmt.Sprintf("alt+%d", at+1),
			Sorts:  one.Sorts,
		})
	}
	return out
}

// [[spec/design_output/tui#the-work-tab]]
type workMsg struct {
	tree *Tree
	why  string
	tick int64
	same bool
}

// The index holds the call until a sweep past the tick, and the tab reads the rows again then. [[spec/design_output/index#the-index-fires-on-change]]
func workCmd(path string, was int64) tea.Cmd {
	return func() tea.Msg {
		root := workRoot(path)
		said, err := askIndex(root, "changes", map[string]any{"since": was})
		if err != nil {
			// A door answering nowhere costs a pause before the next ask, so a dead index spins nothing. [[spec/design_output/tui#the-work-tab]]
			time.Sleep(poll)
			return workMsg{why: err.Error(), tick: was}
		}
		var at struct {
			Tick int64 `json:"tick"`
		}
		if err := json.Unmarshal(said, &at); err != nil {
			return workMsg{why: err.Error(), tick: was}
		}
		if at.Tick == was {
			return workMsg{tick: at.Tick, same: true}
		}
		tree, err := loadWork(path)
		if err != nil {
			return workMsg{why: err.Error(), tick: at.Tick}
		}
		return workMsg{tree: tree, tick: at.Tick}
	}
}

// [[spec/design_output/tui#the-work-tab]]
func (workTab) Left(m *model, w, rows int) string {
	if m.work == nil {
		return lipgloss.NewStyle().Width(w).Render(strings.Join(workWaits(m, w, rows), "\n"))
	}
	// A notice takes the last line while one stands, so a refusal reads where the edit was. [[spec/design_output/tui#the-work-tab-takes-edits]]
	if m.workNotice != "" {
		m.work.Scroll(rows - 1)
		return m.work.Header(w) + "\n" + m.work.Rows(w, rows-1) + "\n" + levelStyle("warn").Render(cut(m.workNotice, w))
	}
	m.work.Scroll(rows)
	return m.work.Header(w) + "\n" + m.work.Rows(w, rows)
}

// [[spec/design_output/tui#the-work-tab]]
func workWaits(m *model, w, rows int) []string {
	said := "The index answers this tab, and it draws the moment a door stands."
	if m.workWhy != "" {
		said = m.workWhy
	}
	lines := []string{
		headStyle.Render(cut("the work browser", w)),
		"",
		dimStyle.Render(cut(said, w)),
	}
	for len(lines) < rows+namesWide {
		lines = append(lines, "")
	}
	return lines
}

// The details of one row, in three parts: every flag in the column's order, the rest of the front, then the whole ask. [[spec/design_output/tui#the-work-tab]]
func (workTab) Detail(m *model, w int) []part {
	if m.work == nil {
		return []part{{text: cut("A row of the work browser shows its note here.", w)}}
	}
	one := m.work.Selected()
	if one == nil {
		return []part{{text: cut("No row stands under the cursor.", w)}}
	}
	root := workRoot(m.path)
	// The name heads the details as text, because the table's own name carries the link. [[spec/design_output/tree-view#a-value-carries-a-link]]
	out := []part{{text: headStyle.Bold(true).Render(one.Name), drawn: true}, {}}
	for _, held := range m.work.States(*one) {
		out = append(out, part{text: flagStyle(held).Render(fmt.Sprintf("%s  %-8s %s", held.Letter, held.Key, held.Value)), drawn: true})
	}
	if fields := workFields(root, *one); len(fields) > 0 {
		out = append(out, part{})
		out = append(out, fields...)
	}
	says := strings.TrimSpace(one.Keys["says"])
	if says == "" {
		return out
	}
	out = append(out, part{})
	for _, line := range strings.Split(Wrap(says, w), "\n") {
		out = append(out, part{text: withLinks(root, line), drawn: true})
	}
	return out
}

// The path a row names, or the ticket's own place under the tickets folder. [[spec/design_output/tree-view#a-value-carries-a-link]]
func pathOf(one Item) string {
	if said := strings.TrimSpace(one.Keys["path"]); said != "" {
		return said
	}
	return ticketPath(one.Name)
}

// The fields a row carries, one a line, each value a link where the tree resolves it. [[spec/design_output/tree-view#a-value-carries-a-link]]
func workFields(root string, one Item) []part {
	wide := 0
	for _, key := range detailKeys {
		if strings.TrimSpace(one.Keys[key]) != "" {
			wide = max(wide, len(key))
		}
	}
	out := []part{}
	for _, key := range detailKeys {
		value := strings.TrimSpace(one.Keys[key])
		if value == "" {
			continue
		}
		if key == "group" {
			value = linked(value, fileAddress(root, ticketPath(value)))
		}
		out = append(out, part{text: dimStyle.Render(fmt.Sprintf("%-*s  ", wide, key)) + value, drawn: true})
	}
	return out
}

func (workTab) Narrowed(m *model) bool { return m.work != nil && m.work.Narrowed() }

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (workTab) Keys(m *model) band {
	return band{name: "THE WORK", acts: []act{
		{bind("w s", "one row up, one row down", "w", "s", "W", "S"), func(m *model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "w") {
				step = -1
			}
			if m.work != nil {
				m.work.Move(step)
				m.loadPane()
			}
			return nil
		}},
		{bind("space", "open a group, and close it", " "), func(m *model, _ string) tea.Cmd {
			if m.work != nil {
				m.work.Toggle()
			}
			return nil
		}},
		{bind("+ -", "open every group, and close every one", "+", "-"), func(m *model, name string) tea.Cmd {
			if m.work == nil {
				return nil
			}
			if name == "+" {
				m.work.Expand(true)
				return nil
			}
			m.work.Collapse(true)
			return nil
		}},
		// [[spec/design_output/tui#the-work-tab-takes-edits]]
		{bind("a d", "back one column, and on one column", "a", "d", "A", "D"), func(m *model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "a") {
				step = -1
			}
			if m.work != nil {
				m.work.MoveCursor(step)
			}
			return nil
		}},
		{bind("e", "edit the cell under the cursor: enter writes, esc drops, shift+enter fills", "e"), func(m *model, _ string) tea.Cmd {
			m.openEdit()
			return nil
		}},
		{bind("u t", "flip the urgent mark, and the todo mark", "u", "t"), func(m *model, name string) tea.Cmd {
			key := urgentKey
			if name == "t" {
				key = todoKey
			}
			m.flip(key)
			return nil
		}},
		// [[spec/design_output/tree-view#a-fill-reaches-the-marks]]
		{bind("m M", "mark a row, and M the run from the last mark", "m", "M"), func(m *model, name string) tea.Cmd {
			if m.work == nil {
				return nil
			}
			if name == "M" {
				m.work.MarkRun()
				return nil
			}
			m.work.Mark()
			return nil
		}},
	}}
}

func (workTab) Selection(_ *model) band { return band{} }

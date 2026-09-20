// The work tab. It draws every ticket this tree holds, nested under its group,
// off the rows the index answers. A change under the tree wakes the index,
// and the index wakes this tab, so it redraws with no key pressed and polls
// nothing. No file stands between the index and the tab.
// [[spec/design_output/tui#the-work-tab]]

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// [[spec/design_output/tree-view#a-base-file-says-it]]
const workBaseAt = "spec/views/work.base"

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
	// A preset pressed in the file stands pressed when the tab opens. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
	tree.Presets(one.Presets)
	return tree, nil
}

// The buttons the filter panel draws, each with the key that presses it. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func workPresets(m *model) []part {
	if m.work == nil {
		return nil
	}
	said := m.work.PresetList()
	if len(said) == 0 {
		return nil
	}
	names := make([]string, 0, len(said))
	for at, one := range said {
		name := fmt.Sprintf("alt+%d %s", at+1, one.Name)
		if one.Pressed {
			names = append(names, openStyle.Render("["+name+"]"))
			continue
		}
		names = append(names, dimStyle.Render(" "+name+" "))
	}
	return []part{{}, {text: strings.Join(names, " "), drawn: true}}
}

// A number under alt presses the preset standing at that place. [[spec/design_output/tree-view#a-preset-carries-its-sort]]
func pressPreset(m *model, name string) bool {
	if m.work == nil || !strings.HasPrefix(name, "alt+") {
		return false
	}
	at, err := strconv.Atoi(strings.TrimPrefix(name, "alt+"))
	said := m.work.PresetList()
	if err != nil || at < 1 || at > len(said) {
		return false
	}
	m.work.Press(said[at-1].Name)
	return true
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

// [[spec/design_output/tui#the-work-tab]]
func (workTab) Detail(m *model, w int) []part {
	if m.work == nil {
		return []part{{text: cut("A row of the work browser shows its note here.", w)}}
	}
	one := m.work.Selected()
	if one == nil {
		return []part{{text: cut("No row stands under the cursor.", w)}}
	}
	out := make([]part, 0, len(one.Keys)+1)
	for _, line := range strings.Split(one.Detail(), "\n") {
		out = append(out, part{text: cut(line, w)})
	}
	return out
}

func (workTab) Narrowed(m *model) bool { return m.work != nil && m.work.Narrowed() }

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (workTab) Keys(m *model) band {
	return band{name: "THE WORK", acts: []act{
		{bind("1 2", "the log, and the work", "1", "2"), func(m *model, name string) tea.Cmd {
			m.openTab(int(name[0] - '0'))
			return nil
		}},
		{bind("w s", "one row up, one row down", "w", "s", "W", "S"), func(m *model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "w") {
				step = -1
			}
			if m.work != nil {
				m.work.Move(step)
			}
			return nil
		}},
		{bind("space", "open a group, and close it", " "), func(m *model, _ string) tea.Cmd {
			if m.work != nil {
				m.work.Toggle()
			}
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

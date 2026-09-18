// The work tab. It draws every ticket this tree holds, nested under its group,
// off the one answer the work verb writes. A write to that answer redraws the
// tab with no key pressed, and nothing here writes a ticket.
// [[spec/design_output/viewer#the-work-tab]]

package main

import (
	"os"
	"path/filepath"
	"strings"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// The work answer of [[spec/design_output/work#one-verb-answers-git]], owned by .claude/skills/level0/lib/folders.js and spelled again here because a Go module imports no JavaScript.
const workAnswerAt = ".se/work.json"

// [[spec/design_output/tree-view#a-base-file-says-it]]
const workBaseAt = "spec/views/work.base"

// [[spec/design_output/viewer#the-work-tab]]
type workTab struct{}

func (workTab) Name() string { return "work" }

// The log stands two folders under the root, so the root reads off its path. [[spec/design_output/viewer#the-work-tab]]
func workRoot(path string) string {
	return filepath.Dir(filepath.Dir(filepath.Dir(path)))
}

// [[spec/design_output/viewer#the-work-tab]]
func workAt(path string) string {
	return filepath.Join(workRoot(path), filepath.FromSlash(workAnswerAt))
}

// The time the answer carries, which says whether a reader reads it again. [[spec/design_output/viewer#the-work-tab]]
func workStamp(path string) time.Time {
	info, err := os.Stat(workAt(path))
	if err != nil {
		return time.Time{}
	}
	return info.ModTime()
}

// [[spec/design_output/viewer#the-work-tab]]
func loadWork(path string) (*Tree, error) {
	base, err := os.ReadFile(filepath.Join(workRoot(path), filepath.FromSlash(workBaseAt)))
	if err != nil {
		return nil, err
	}
	views, err := ReadBase(string(base))
	if err != nil {
		return nil, err
	}
	said, err := os.ReadFile(workAt(path))
	if err != nil {
		return nil, err
	}
	items, err := ReadWorkItems(string(said))
	if err != nil {
		return nil, err
	}
	one := views[0]
	return NewTree(one.Cols, items, one.Nests), nil
}

// [[spec/design_output/viewer#the-work-tab]]
type workMsg struct {
	tree *Tree
	why  string
	at   time.Time
	same bool
}

// A poll answers the answer's own time, so a write redraws with no key pressed. [[spec/design_output/viewer#the-work-tab]]
func workCmd(path string, was time.Time) tea.Cmd {
	return func() tea.Msg {
		time.Sleep(poll)
		at := workStamp(path)
		if at.Equal(was) {
			return workMsg{at: at, same: true}
		}
		tree, err := loadWork(path)
		if err != nil {
			return workMsg{why: err.Error(), at: at}
		}
		return workMsg{tree: tree, at: at}
	}
}

// [[spec/design_output/viewer#the-work-tab]]
func (workTab) Left(m *model, w, rows int) string {
	if m.work == nil {
		return lipgloss.NewStyle().Width(w).Render(strings.Join(workWaits(m, w, rows), "\n"))
	}
	m.work.Scroll(rows)
	return m.work.Header(w) + "\n" + m.work.Rows(w, rows)
}

// [[spec/design_output/viewer#the-work-tab]]
func workWaits(m *model, w, rows int) []string {
	said := "Run ./RUNME.sh branch answer, and this tab draws what it writes."
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

// [[spec/design_output/viewer#the-work-tab]]
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

// [[spec/design_output/viewer#the-help-reads-the-cursor]]
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
	}}
}

func (workTab) Selection(_ *model) band { return band{} }

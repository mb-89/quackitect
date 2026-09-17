// The work tab. It stands in the strip beside the log, so a person sees the
// window hold more than one thing and the number keys carry between them. The
// tree view, its base file and its source of items land here next, and until
// they do the tab says so.
// [[spec/design_output/viewer#the-work-tab]]

package main

import (
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
)

// [[spec/design_output/viewer#the-work-tab]]
type workTab struct{}

func (workTab) Name() string { return "work" }

// [[spec/design_output/viewer#the-work-tab]]
func (workTab) Left(_ *model, w, rows int) string {
	lines := []string{
		headStyle.Render(cut("the work browser", w)),
		"",
		dimStyle.Render(cut("This tab stands empty, and the tree view lands in it next.", w)),
		dimStyle.Render(cut("Press 1 for the log, and 2 for this tab.", w)),
	}
	for len(lines) < rows+namesWide {
		lines = append(lines, "")
	}
	return lipgloss.NewStyle().Width(w).Render(strings.Join(lines, "\n"))
}

// [[spec/design_output/viewer#the-work-tab]]
func (workTab) Detail(_ *model, w int) []part {
	return []part{{text: cut("A row of the work browser shows its note here.", w)}}
}

func (workTab) Narrowed(_ *model) bool { return false }

// [[spec/design_output/viewer#the-help-reads-the-cursor]]
func (workTab) Keys(_ *model) band {
	return band{name: "THE WORK", acts: []act{
		{bind("1 2", "the log, and the work", "1", "2"), func(m *model, name string) tea.Cmd {
			m.openTab(int(name[0] - '0'))
			return nil
		}},
	}}
}

func (workTab) Selection(_ *model) band { return band{} }

// The tabs the window holds, and the strip naming them. The frame is the
// window's: the strip, the split, the pane and the footer. A tab draws the left
// side, says what the details hold, holds a filter line of its own, and names
// the presets its filter pane offers. The log is the first tab.
// [[spec/design_output/tui#the-window-is-a-split]]

package main

import (
	"fmt"
	"regexp"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/x/ansi"
)

// [[spec/design_output/tui#a-number-opens-a-tab]]
const mostTabs = 9

// The strip's right end, which the key draws and a press reaches. [[spec/design_output/tui#the-header-holds-the-tabs]]
const helpKey = "alt+? help "

type tab interface {
	Name() string
	Left(m *model, w, rows int) string
	Detail(m *model, w int) []part
	Narrowed(m *model) bool
	Keys(m *model) band
	Selection(m *model) band
	Presets(m *model) []preset
}

// A preset a tab offers: its name, the filter it writes into the line, the key pressing it, and the sort it carries. [[spec/design_output/tui#the-filter-pane-takes-letters]]
type preset struct {
	Name   string
	Filter string
	Key    string
	Sorts  []Sort
}

// [[spec/design_output/tui#the-columns-stand-still]]
type logTab struct{}

func (logTab) Name() string { return "log" }

func (logTab) Left(m *model, w, rows int) string {
	return m.renderNames(w) + "\n" + m.renderRows(w, rows)
}

func (logTab) Detail(m *model, w int) []part { return detailOf(m.all, m.sel, m.zone) }

func (logTab) Narrowed(m *model) bool { return !m.filter.Empty() }

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (logTab) Keys(m *model) band {
	return band{name: "THE LOG", acts: []act{
		{bind("w s", "one row up, one row down", "w", "s", "W", "S"), func(m *model, name string) tea.Cmd {
			step := 1
			if strings.EqualFold(name, "w") {
				step = -1
			}
			m.moveTo(m.at() + step)
			return nil
		}},
		{bind("e", "the newest error, and e again the one before it", "e"), func(m *model, _ string) tea.Cmd {
			m.toError()
			return nil
		}},
		{bind("alt+l", "raise the floor, and round again", "alt+l"), func(m *model, _ string) tea.Cmd {
			m.raiseFloor()
			return nil
		}},
	}}
}

func (logTab) Selection(_ *model) band { return band{} }

// The log's presets: the prompts and the replies, and the kind of the selected row. [[spec/design_output/tui#one-key-filters-the-line]]
func (logTab) Presets(m *model) []preset {
	out := []preset{{Name: "prompts and replies", Filter: promptsFilter, Key: "alt+q"}}
	if m.sel >= 0 && m.sel < len(m.all) {
		r := m.all[m.sel]
		said := fmt.Sprintf("kind: /^%s$/", regexp.QuoteMeta(r.Kind))
		if r.Label() != r.Kind {
			said = fmt.Sprintf("tool: /^%s$/", regexp.QuoteMeta(r.Label()))
		}
		out = append(out, preset{Name: "this row's kind", Filter: said, Key: "alt+F"})
	}
	return out
}

// A tab switch keeps the pane, which draws off the new tab, and the line takes that tab's filter. [[spec/design_output/tui#a-number-opens-a-tab]]
func (m *model) openTab(n int) {
	if n < 1 || n > len(m.tabs) || n > mostTabs {
		return
	}
	m.open = n - 1
	m.input.SetValue(m.sourceOf(m.open))
	m.resize()
	m.box.GotoTop()
}

// [[spec/design_output/tui#the-header-holds-the-tabs]]
func (m model) renderStrip() string {
	names := make([]string, 0, len(m.tabs))
	for at, one := range m.tabs {
		name := m.tabName(at, one)
		style := dimStyle
		if at == m.open {
			style = openStyle
		}
		names = append(names, style.Render(name))
	}
	strip := strings.Join(names, " ")
	key := dimStyle.Render(helpKey)
	if m.pane == paneHelp {
		key = openStyle.Render(helpKey)
	}
	gap := m.w - ansi.StringWidth(strip) - ansi.StringWidth(key)
	if gap < 1 {
		return cut(strip, m.w)
	}
	return strip + strings.Repeat(" ", gap) + key
}

// The text one tab takes in the strip, which the strip draws and a press measures. The work tab counts the rows this box takes behind its name. [[spec/design_output/tui#the-work-tab]]
func (m model) tabName(at int, one tab) string {
	if one.Name() == "work" && m.places != nil {
		return fmt.Sprintf(" %d %s (%d) ", at+1, one.Name(), m.places.takeable)
	}
	return fmt.Sprintf(" %d %s ", at+1, one.Name())
}

// The tabs the window holds, and the strip naming them. The frame is the
// window's: the strip, the split, the pane and the footer. A tab draws the left
// side, says what the details hold, and says whether a filter holds in it. The
// log is the first, and it draws its rows under a line of column names.
// [[spec/design_output/viewer#the-window-is-a-split]]

package main

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"github.com/charmbracelet/x/ansi"
)

// [[spec/design_output/viewer#a-number-opens-a-tab]]
const mostTabs = 9

type tab interface {
	Name() string
	Left(m *model, w, rows int) string
	Detail(m *model, w int) []part
	Narrowed(m *model) bool
}

// [[spec/design_output/viewer#the-columns-stand-still]]
type logTab struct{}

func (logTab) Name() string { return "log" }

func (logTab) Left(m *model, w, rows int) string {
	return m.renderNames(w) + "\n" + m.renderRows(w, rows)
}

func (logTab) Detail(m *model, w int) []part { return detailOf(m.all, m.sel, m.zone) }

func (logTab) Narrowed(m *model) bool { return !m.filter.Empty() }

// [[spec/design_output/viewer#a-number-opens-a-tab]]
func (m *model) openTab(n int) {
	if n < 1 || n > len(m.tabs) || n > mostTabs {
		return
	}
	m.open = n - 1
	m.resize()
	m.box.GotoTop()
}

var openStyle = lipgloss.NewStyle().Foreground(lipgloss.Color("111")).Bold(true)

// [[spec/design_output/viewer#the-header-holds-the-tabs]]
func (m model) renderStrip() string {
	names := make([]string, 0, len(m.tabs))
	for at, one := range m.tabs {
		name := fmt.Sprintf(" %d %s ", at+1, one.Name())
		style := dimStyle
		if at == m.open {
			style = openStyle
		}
		names = append(names, style.Render(name))
	}
	strip := strings.Join(names, " ")
	helpKey := dimStyle.Render("alt+? help ")
	if m.pane == paneHelp {
		helpKey = openStyle.Render("alt+? help ")
	}
	gap := m.w - ansi.StringWidth(strip) - ansi.StringWidth(helpKey)
	if gap < 1 {
		return cut(strip, m.w)
	}
	return strip + strings.Repeat(" ", gap) + helpKey
}

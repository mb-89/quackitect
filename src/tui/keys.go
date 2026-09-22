// Every key the window holds, as a binding carrying its own name and sentence.
// The window reads the registration the help draws, so a key nobody registers
// reaches the help nowhere and works nowhere. Three bands stand: the global
// one, the one the open tab adds, and the one the selected thing adds.
// [[spec/design_output/tui#the-help-reads-the-cursor]]

package main

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
)

// [[spec/design_output/tui#the-help-reads-the-cursor]]
type act struct {
	key key.Binding
	do  func(m *model, name string) tea.Cmd
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
type band struct {
	name string
	acts []act
}

func (b band) bindings() []key.Binding {
	out := make([]key.Binding, 0, len(b.acts))
	for _, one := range b.acts {
		out = append(out, one.key)
	}
	return out
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func bind(shown, sentence string, names ...string) key.Binding {
	return key.NewBinding(key.WithKeys(names...), key.WithHelp(shown, sentence))
}

func matches(name string, one key.Binding) bool {
	for _, held := range one.Keys() {
		if held == name {
			return true
		}
	}
	return false
}

func numbers() []string {
	out := make([]string, 0, mostTabs)
	for n := 1; n <= mostTabs; n++ {
		out = append(out, fmt.Sprint(n))
	}
	return out
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func globalBand() band {
	return band{name: "GLOBAL", acts: []act{
		{bind("1…9", "open the tab at that place", numbers()...), func(m *model, name string) tea.Cmd {
			m.openTab(int(name[0] - '0'))
			return nil
		}},
		{bind("enter", "the details of the selection", "enter"), func(m *model, _ string) tea.Cmd {
			m.openPane(paneDetails)
			return nil
		}},
		{bind("alt+?", "this help", "alt+?", "alt+/"), func(m *model, _ string) tea.Cmd {
			m.openPane(paneHelp)
			return nil
		}},
		{bind("alt+f", "the filter of the open tab", "alt+f"), func(m *model, _ string) tea.Cmd {
			m.openPane(paneFilter)
			return nil
		}},
		{bind("up down", "scroll the pane, or move the tab while none stands open", "up", "down"), scroll},
		{bind("pgup pgdn", "a whole window up or down", "pgup", "pgdown"), jumping},
		{bind("home", "the first row", "home"), jumping},
		{bind("end", "the newest row, and follow what arrives", "end"), jumping},
		{bind("q", "leave", "q", "ctrl+c"), func(_ *model, _ string) tea.Cmd { return tea.Quit }},
	}}
}

func scroll(m *model, name string) tea.Cmd {
	switch {
	case m.pane != paneShut && name == "up":
		m.box.ScrollUp(1)
	case m.pane != paneShut:
		m.box.ScrollDown(1)
	case name == "up":
		m.moveTo(m.at() - 1)
	default:
		m.moveTo(m.at() + 1)
	}
	return nil
}

func jumping(m *model, name string) tea.Cmd {
	m.jump(name)
	return nil
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (m model) bands() []band {
	open := m.tabs[m.open]
	out := []band{globalBand(), open.Keys(&m)}
	if held := open.Selection(&m); len(held.acts) > 0 {
		out = append(out, held)
	}
	return out
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (m model) key(name string) (tea.Model, tea.Cmd) {
	// A preset's key stands before the bands, so the same key presses it over the tab and under the pane. [[spec/design_output/tui#one-key-filters-the-line]]
	if m.pressKey(name) {
		return m, nil
	}
	for _, held := range m.bands() {
		for _, one := range held.acts {
			if matches(name, one.key) {
				return m, one.do(&m, name)
			}
		}
	}
	return m, nil
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (m model) helpParts(w int) []part {
	var parts []part
	for _, held := range m.bands() {
		parts = append(parts, part{style: headStyle, text: held.name})
		parts = append(parts, held.lines()...)
		parts = append(parts, part{})
	}
	// The presets stand in the filter pane alone, so the help names none. [[spec/design_output/tui#one-key-filters-the-line]]
	return append(parts, part{text: strings.TrimSpace(HelpText)})
}

// The sign the help draws for shift, so a chord stays short. [[spec/design_output/tui#the-help-reads-the-cursor]]
const shiftSign = "⇧"

// A key reads as a person presses it, so a capital under alt reads as alt, the shift sign and the letter. [[spec/design_output/tui#the-help-reads-the-cursor]]
func keyShown(name string) string {
	if strings.HasPrefix(name, "alt+") && len(name) == len("alt+")+1 && name[len(name)-1] >= 'A' && name[len(name)-1] <= 'Z' {
		return "alt+" + shiftSign + strings.ToLower(name[len(name)-1:])
	}
	return name
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (b band) lines() []part {
	wide := 0
	for _, one := range b.bindings() {
		wide = max(wide, len([]rune(one.Help().Key)))
	}
	out := make([]part, 0, len(b.acts))
	for _, one := range b.bindings() {
		out = append(out, part{text: "  " + pad(one.Help().Key, wide) + "  " + one.Help().Desc})
	}
	return out
}

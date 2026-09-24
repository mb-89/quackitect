// Every key the window holds, as a binding carrying its own name and sentence.
// The window reads the registration the help draws, so a key nobody registers
// reaches the help nowhere and works nowhere. The bands stand: the global
// one, the one the open tab adds, and the one the selected thing adds.
// [[spec/design_output/tui#the-help-reads-the-cursor]]

package frame

import (
	"fmt"
	"strings"

	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"

	"quackitect/tui/draw"
)

// [[spec/design_output/tui#the-help-reads-the-cursor]]
type Act struct {
	Key key.Binding
	Do  func(m *Model, name string) tea.Cmd
	// Whether the key works while the filter pane takes letters too. [[spec/design_output/tui#alt-l-raises-the-floor]]
	Under bool
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
type Band struct {
	Name string
	Acts []Act
}

func (b Band) bindings() []key.Binding {
	out := make([]key.Binding, 0, len(b.Acts))
	for _, one := range b.Acts {
		out = append(out, one.Key)
	}
	return out
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func Bind(shown, sentence string, names ...string) key.Binding {
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
	out := make([]string, 0, MostTabs)
	for n := 1; n <= MostTabs; n++ {
		out = append(out, fmt.Sprint(n))
	}
	return out
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func globalBand() Band {
	return Band{Name: "GLOBAL", Acts: []Act{
		{Key: Bind("1…9", "open the tab at that place", numbers()...), Do: func(m *Model, name string) tea.Cmd {
			m.OpenTab(int(name[0] - '0'))
			return nil
		}},
		{Key: Bind("enter", "the details of the selection", "enter"), Do: func(m *Model, _ string) tea.Cmd {
			m.OpenPane(PaneDetails)
			return nil
		}},
		{Key: Bind("alt+?", "this help", "alt+?", "alt+/"), Do: func(m *Model, _ string) tea.Cmd {
			m.OpenPane(PaneHelp)
			return nil
		}},
		{Key: Bind("alt+f", "the filter of the open tab", "alt+f"), Do: func(m *Model, _ string) tea.Cmd {
			m.OpenPane(PaneFilter)
			return nil
		}},
		{Key: Bind("up down", "scroll the pane, or move the tab while none stands open", "up", "down"), Do: scroll},
		{Key: Bind("pgup pgdn", "a whole window up or down", "pgup", "pgdown"), Do: jumping},
		{Key: Bind("home", "the first row", "home"), Do: jumping},
		{Key: Bind("end", "the newest row, and follow what arrives", "end"), Do: jumping},
		{Key: Bind("q", "leave", "q", "ctrl+c"), Do: func(_ *Model, _ string) tea.Cmd { return tea.Quit }},
	}}
}

func scroll(m *Model, name string) tea.Cmd {
	switch {
	case m.Pane != PaneShut && name == "up":
		m.Box.ScrollUp(1)
	case m.Pane != PaneShut:
		m.Box.ScrollDown(1)
	case name == "up":
		m.Tab().Move(m, -1)
	default:
		m.Tab().Move(m, 1)
	}
	return nil
}

func jumping(m *Model, name string) tea.Cmd {
	m.Tab().Jump(m, name)
	return nil
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (m Model) Bands() []Band {
	open := m.Tab()
	out := []Band{globalBand(), open.Keys(&m)}
	if held := open.Selection(&m); len(held.Acts) > 0 {
		out = append(out, held)
	}
	return out
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (m Model) Key(name string) (tea.Model, tea.Cmd) {
	// A preset's key stands before the bands, so the same key presses it over the tab and under the pane. [[spec/design_output/tui#one-key-filters-the-line]]
	if m.PressKey(name) {
		return m, nil
	}
	for _, held := range m.Bands() {
		for _, one := range held.Acts {
			if matches(name, one.Key) {
				return m, one.Do(&m, name)
			}
		}
	}
	return m, nil
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (m Model) HelpParts(w int) []Part {
	var parts []Part
	for _, held := range m.Bands() {
		parts = append(parts, Part{Style: draw.Head, Text: held.Name})
		parts = append(parts, held.lines()...)
		parts = append(parts, Part{})
	}
	// The presets stand in the filter pane alone, so the help names none. [[spec/design_output/tui#one-key-filters-the-line]]
	return append(parts, Part{Text: strings.TrimSpace(HelpText)})
}

// The sign the help draws for shift, so a chord stays short. [[spec/design_output/tui#the-help-reads-the-cursor]]
const shiftSign = "⇧"

// A key reads as a person presses it, so a capital under alt reads as alt, the shift sign and the letter. [[spec/design_output/tui#the-help-reads-the-cursor]]
func KeyShown(name string) string {
	if strings.HasPrefix(name, "alt+") && len(name) == len("alt+")+1 && name[len(name)-1] >= 'A' && name[len(name)-1] <= 'Z' {
		return "alt+" + shiftSign + strings.ToLower(name[len(name)-1:])
	}
	return name
}

// [[spec/design_output/tui#the-help-reads-the-cursor]]
func (b Band) lines() []Part {
	wide := 0
	for _, one := range b.bindings() {
		wide = max(wide, len([]rune(one.Help().Key)))
	}
	out := make([]Part, 0, len(b.Acts))
	for _, one := range b.bindings() {
		out = append(out, Part{Text: "  " + draw.Pad(one.Help().Key, wide) + "  " + one.Help().Desc})
	}
	return out
}

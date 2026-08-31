package main

import (
	"fmt"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
)

// A key echo. It exists because a key that does nothing gives no evidence,
// and a guess about a terminal is not evidence.
type keyModel struct{ seen []string }

func (m keyModel) Init() tea.Cmd { return nil }

func (m keyModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	k, ok := msg.(tea.KeyMsg)
	if !ok {
		return m, nil
	}
	if k.Type == tea.KeyCtrlC {
		return m, tea.Quit
	}
	line := fmt.Sprintf("type=%d  name=%q  runes=%q  alt=%v", int(k.Type), k.String(), string(k.Runes), k.Alt)
	m.seen = append(m.seen, line)
	if len(m.seen) > 20 {
		m.seen = m.seen[len(m.seen)-20:]
	}
	return m, nil
}

func (m keyModel) View() string {
	var b strings.Builder
	b.WriteString("Press keys. Every one is printed with what this terminal called it.\n")
	b.WriteString("The arrows are the ones that matter. ctrl+c to leave.\n")
	b.WriteString("build " + Build + "\n\n")
	for _, l := range m.seen {
		b.WriteString("  " + l + "\n")
	}
	return b.String()
}

func showKeys() {
	p := tea.NewProgram(keyModel{})
	if _, err := p.Run(); err != nil {
		fmt.Println(err)
	}
}

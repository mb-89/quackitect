// The colour each kind wears. A prompt wears bold yellow across its whole row,
// and a reply wears bold green, so a turn reads at a glance. A tool row wears
// the colour of the tool it names. The numbers stand in the config.
// [[spec/design_output/viewer#colours]]

package main

import (
	"hash/fnv"
	"strings"

	"github.com/charmbracelet/lipgloss"
	"quackitect/config"
)

// The file the colours stand in, under the folder the Vale styles share. [[spec/design_output/viewer#colours]]
const coloursAt = "spec/config/styles/colours.json"

var palette struct {
	kinds  map[string]string
	tools  map[string]string
	levels map[string]string
	window map[string]string
	bold   map[string]string
	spare  []string
}

// The styles the window wears outside a row, which the read below fills. [[spec/design_output/viewer#colours]]
var (
	dimStyle    lipgloss.Style
	barStyle    lipgloss.Style
	ruleStyle   lipgloss.Style
	headStyle   lipgloss.Style
	openStyle   lipgloss.Style
	rowSelected lipgloss.Color
)

// The window reads the colours once, at start, and holds what it reads. [[spec/design_output/viewer#colours]]
func loadColours(root string) {
	palette.kinds = config.Map(root, coloursAt, "kinds")
	palette.tools = config.Map(root, coloursAt, "tools")
	palette.levels = config.Map(root, coloursAt, "levels")
	palette.window = config.Map(root, coloursAt, "window")
	palette.bold = config.Map(root, coloursAt, "bold")
	palette.spare = config.List(root, coloursAt, "spare")

	dimStyle = windowStyle("dim")
	barStyle = windowStyle("bar")
	ruleStyle = windowStyle("rule")
	headStyle = windowStyle("head")
	openStyle = windowStyle("tab")
	rowSelected = lipgloss.Color(palette.window["selected"])
}

// A colour the config holds nowhere leaves the style plain, so the window wears the terminal's own. [[spec/design_output/viewer#colours]]
func styleOf(name, colour string) lipgloss.Style {
	out := lipgloss.NewStyle()
	if colour != "" {
		out = out.Foreground(lipgloss.Color(colour))
	}
	if palette.bold[name] != "" {
		out = out.Bold(true)
	}
	return out
}

func windowStyle(name string) lipgloss.Style {
	return styleOf(name, palette.window[name])
}

func kindStyle(kind string) lipgloss.Style {
	if colour, found := palette.kinds[kind]; found {
		return styleOf(kind, colour)
	}
	if colour, found := palette.tools[kind]; found {
		return styleOf(kind, colour)
	}
	if len(palette.spare) == 0 {
		return lipgloss.NewStyle()
	}
	sum := fnv.New32a()
	sum.Write([]byte(kind))
	return styleOf(kind, palette.spare[sum.Sum32()%uint32(len(palette.spare))])
}

func levelStyle(level string) lipgloss.Style {
	said := strings.ToLower(level)
	if colour, found := palette.levels[said]; found {
		return styleOf(said, colour)
	}
	return dimStyle
}

func saidStyle(r Record) lipgloss.Style {
	switch strings.ToLower(r.Level) {
	case "debug", "warn", "error", "fatal":
		return levelStyle(r.Level).Bold(false)
	}
	switch r.Kind {
	case "prompt":
		return kindStyle("prompt")
	case "reply":
		return kindStyle("reply").Bold(false)
	// The kind list names the colour once, and the said column reads it there. [[spec/design_output/viewer#colours]]
	case "answer", "note":
		return lipgloss.NewStyle().Foreground(kindStyle(r.Kind).GetForeground())
	}
	return lipgloss.NewStyle()
}

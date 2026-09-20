// The colour each kind wears. A prompt wears bold yellow across its whole row,
// and a reply wears bold green, so a turn reads at a glance. A tool row wears
// the colour of the tool it names. The numbers stand in the config.
// [[spec/design_output/tui#colours]]

package draw

import (
	"hash/fnv"
	"strings"

	"github.com/charmbracelet/lipgloss"

	"quackitect/config"
)

// The file the colours stand in, under the folder the Vale styles share. [[spec/design_output/tui#colours]]
const coloursAt = "spec/config/styles/colours.json"

var palette struct {
	kinds  map[string]string
	tools  map[string]string
	levels map[string]string
	window map[string]string
	bold   map[string]string
	spare  []string
	flags  map[string]string
}

// The styles the window wears outside a row, which the read below fills. [[spec/design_output/tui#colours]]
var (
	Dim         lipgloss.Style
	Bar         lipgloss.Style
	Rule        lipgloss.Style
	Head        lipgloss.Style
	Open        lipgloss.Style
	RowSelected lipgloss.Color
)

// The window reads the colours once, at start, and holds what it reads. [[spec/design_output/tui#colours]]
func LoadColours(root string) {
	palette.kinds = config.Map(root, coloursAt, "kinds")
	palette.tools = config.Map(root, coloursAt, "tools")
	palette.levels = config.Map(root, coloursAt, "levels")
	palette.window = config.Map(root, coloursAt, "window")
	palette.bold = config.Map(root, coloursAt, "bold")
	palette.spare = config.List(root, coloursAt, "spare")
	palette.flags = config.Map(root, coloursAt, "flags")

	Dim = WindowStyle("dim")
	Bar = WindowStyle("bar")
	Rule = WindowStyle("rule")
	Head = WindowStyle("head")
	Open = WindowStyle("tab")
	RowSelected = lipgloss.Color(palette.window["selected"])
}

// A colour the config holds nowhere leaves the style plain, so the window wears the terminal's own. [[spec/design_output/tui#colours]]
func StyleOf(name, colour string) lipgloss.Style {
	out := lipgloss.NewStyle()
	if colour != "" {
		out = out.Foreground(lipgloss.Color(colour))
	}
	if palette.bold[name] != "" {
		out = out.Bold(true)
	}
	return out
}

func WindowStyle(name string) lipgloss.Style {
	return StyleOf(name, palette.window[name])
}

func KindStyle(kind string) lipgloss.Style {
	if colour, found := palette.kinds[kind]; found {
		return StyleOf(kind, colour)
	}
	if colour, found := palette.tools[kind]; found {
		return StyleOf(kind, colour)
	}
	if len(palette.spare) == 0 {
		return lipgloss.NewStyle()
	}
	sum := fnv.New32a()
	sum.Write([]byte(kind))
	return StyleOf(kind, palette.spare[sum.Sum32()%uint32(len(palette.spare))])
}

func LevelStyle(level string) lipgloss.Style {
	said := strings.ToLower(level)
	if colour, found := palette.levels[said]; found {
		return StyleOf(said, colour)
	}
	return Dim
}

// The colour a flag's tone wears, and the empty string where the config names none. [[spec/design_output/tui#colours]]
func FlagColour(tone string) string {
	return palette.flags[tone]
}

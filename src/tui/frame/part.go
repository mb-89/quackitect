// A part of the pane: one line drawn as it stands, or a text the pane wraps
// and styles. Every tab's details and the help and the filter pane hand the
// pane these.
// [[spec/design_output/tui#the-details]]

package frame

import (
	"strings"

	"github.com/charmbracelet/lipgloss"

	"quackitect/tui/draw"
)

type Part struct {
	Style lipgloss.Style
	Text  string
	Drawn bool
}

func RenderParts(parts []Part, width int) string {
	lines := []string{}
	for _, one := range parts {
		if one.Drawn {
			lines = append(lines, one.Text)
			continue
		}
		for _, line := range strings.Split(draw.Wrap(one.Text, width), "\n") {
			lines = append(lines, one.Style.Render(line))
		}
	}
	return strings.Join(lines, "\n")
}

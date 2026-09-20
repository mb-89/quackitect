// The colour the said column wears for one record: a level's colour where the
// level speaks, and the kind's colour where a prompt, a reply, an answer or a
// note does.
// [[spec/design_output/tui#colours]]
package log

import (
	"strings"

	"github.com/charmbracelet/lipgloss"

	"quackitect/tui/draw"
)

func saidStyle(r Record) lipgloss.Style {
	switch strings.ToLower(r.Level) {
	case "debug", "warn", "error", "fatal":
		return draw.LevelStyle(r.Level).Bold(false)
	}
	switch r.Kind {
	case "prompt":
		return draw.KindStyle("prompt")
	case "reply":
		return draw.KindStyle("reply").Bold(false)
	// The kind list names the colour once, and the said column reads it there. [[spec/design_output/tui#colours]]
	case "answer", "note":
		return lipgloss.NewStyle().Foreground(draw.KindStyle(r.Kind).GetForeground())
	}
	return lipgloss.NewStyle()
}

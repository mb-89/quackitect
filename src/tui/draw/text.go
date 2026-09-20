// A line cut to a width, padded to one, or folded onto one line, the way
// every column and every pane of the window draws it.
// [[spec/design_output/tui#the-columns-stand-still]]
package draw

import (
	"strings"

	"github.com/charmbracelet/x/ansi"
)

// The gutter each row opens with, which the log's columns and the tree's share. [[spec/design_output/tui#the-columns-stand-still]]
const GutterWide = 2

func Pad(said string, wide int) string {
	shown := ansi.StringWidth(said)
	if shown > wide {
		return ansi.Truncate(said, wide, "")
	}
	return said + strings.Repeat(" ", wide-shown)
}

func Cut(said string, wide int) string {
	if ansi.StringWidth(said) <= wide {
		return said
	}
	return ansi.Truncate(said, wide, "…")
}

func OneLine(said string) string {
	return strings.NewReplacer("\r\n", " ", "\n", " ", "\r", " ", "\t", " ").Replace(said)
}

// The pane's parts: a drawn line stands as it is, and a text wraps at the
// width through the draw package, which the frame imports by its folder under
// the one module. [[spec/tickets/go-code-shares-one-module]]

package frame

import (
	"testing"

	"github.com/charmbracelet/lipgloss"
)

func TestADrawnPartStandsAndATextWraps(t *testing.T) {
	parts := []Part{
		{Text: "a drawn line past the width", Drawn: true},
		{Text: "eleven twelve", Style: lipgloss.NewStyle()},
	}
	got := RenderParts(parts, 8)
	want := "a drawn line past the width\neleven\ntwelve"
	if got != want {
		t.Fatalf("the parts read %q, and the pane wants %q", got, want)
	}
}

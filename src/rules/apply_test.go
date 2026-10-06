// Apply rewrites a text by the replace actions its findings carry.
// [[spec/tickets/vale-leaves-the-tree]]
package rules

import "testing"

func TestApply(t *testing.T) {
	t.Parallel()
	swap := Finding{Check: "VoiceParagraph.Contraction", Line: 2, Span: [2]int{4, 8}, Match: "can't", Action: &Action{Name: "replace", Params: []string{"cannot"}}}
	t.Run("a replace action rewrites its match at its line and span", func(t *testing.T) {
		if got := Apply("a line\nWe can't go.\n", []Finding{swap}); got != "a line\nWe cannot go.\n" {
			t.Fatalf("Apply answers %q", got)
		}
	})
	t.Run("a finding with no action, or a span its match no longer fills, leaves the text", func(t *testing.T) {
		bare := swap
		bare.Action = nil
		moved := swap
		moved.Span = [2]int{1, 5}
		if got := Apply("a line\nWe can't go.\n", []Finding{bare, moved}); got != "a line\nWe can't go.\n" {
			t.Fatalf("Apply answers %q", got)
		}
	})
}

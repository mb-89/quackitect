// The mint a route makes answers its warnings beside the ticket, or why it
// mints none.
// [[spec/design_output/pull#a-draft-opens]]
package pull

import "testing"

// A box reading no schema mints no ticket, warns on nothing, and says why. [[spec/design_output/pull#a-draft-opens]]
func TestRoutedWarnedNamesWhyNothingMints(t *testing.T) {
	text, warned, why := (&It{}).RoutedWarned(".se/tickets/slow-lint.md", Process{}, nil, "The lint drags.", nil)
	if text != "" || len(warned) != 0 || why != "this box reads no schema, so no ticket mints" {
		t.Fatalf("the mint answers %q, %q, %q", text, warned, why)
	}
}

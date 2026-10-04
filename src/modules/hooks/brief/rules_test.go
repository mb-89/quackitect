// A note's rules read numbered, with its Examples under them.
// [[spec/tickets/work-verbs-port-to-go]]
package brief

import (
	"slices"
	"testing"
)

// The rules number each item past its star, and the Examples table rides under a blank line. [[spec/design_output/level0#the-examples-ride-the-rules]]
func TestTheRulesReadNumberedWithTheirExamples(t *testing.T) {
	text := "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Name the role.\n\n# Examples\n\n| do | do not |\n|---|---|\n"
	want := []string{"1. Say what is.", "2. Name the role.", "", "| do | do not |", "|---|---|"}
	if got := RulesOf(text); !slices.Equal(got, want) {
		t.Fatalf("the rules read %q", got)
	}
	if got := RulesOf("# Nothing\n"); len(got) != 0 {
		t.Fatalf("a note with no rules reads %q", got)
	}
}

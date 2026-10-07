// A note's rules read numbered, with its Examples under them.
// [[spec/tickets/work-verbs-port-to-go]]
package brief

import (
	"slices"
	"strings"
	"testing"
)

// The rules number each item past its star, and the Examples table rides under a blank line. [[spec/design_output/level0#the-examples-ride-the-rules]]
func TestTheRulesReadNumberedWithTheirExamples(t *testing.T) {
	text := "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n2. Name the role.\n\n# Examples\n\n| do | do not |\n|---|---|\n"
	want := []string{"1. Say what is.", "2. Name the role.", "", "| do | do not |", "|---|---|"}
	if got := RulesOf(text); !slices.Equal(got, want) {
		t.Fatalf("the rules read %q", got)
	}
	if got := RulesOf("# Actionables\n\n1. Star a rule. `*`\n"); len(got) != 1 || got[0] != "1. Star a rule." {
		t.Fatalf("a star in a code span reads %q", got)
	}
	if got := RulesOf("# Nothing\n"); len(got) != 0 {
		t.Fatalf("a note with no rules reads %q", got)
	}
}

// A rule wrapped over two lines reads as one, and a bullet numbers as an item. [[spec/design_output/level0#the-examples-ride-the-rules]]
func TestAWrappedRuleReadsAsOne(t *testing.T) {
	text := "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Pull first. *\n2. Push after,\n   once it stands green.\n\n# Examples\n\n| the rule | do |\n|---|---|\n| 1 | pull |\n"
	want := "1. Pull first.\n2. Push after, once it stands green.\n\n| the rule | do |\n|---|---|\n| 1 | pull |"
	if got := strings.Join(RulesOf(text), "\n"); got != want {
		t.Fatalf("the rules read:\n%s\nand want:\n%s", got, want)
	}
	if got := RulesOf("# Actionables\n\n- One rule.\n"); len(got) != 1 || got[0] != "1. One rule." {
		t.Fatalf("a note with no examples reads %v", got)
	}
}

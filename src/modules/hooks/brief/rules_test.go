// A note's rules print numbered, their stars taken off, and its Examples
// table stands under them.
// [[spec/design_output/level0#the-examples-ride-the-rules]]
package brief

import (
	"strings"
	"testing"
)

func TestRulesOf(t *testing.T) {
	text := "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Pull first. *\n2. Push after,\n   once it stands green.\n\n# Examples\n\n| the rule | do |\n|---|---|\n| 1 | pull |\n"
	want := "1. Pull first.\n2. Push after, once it stands green.\n\n| the rule | do |\n|---|---|\n| 1 | pull |"
	if got := strings.Join(RulesOf(text), "\n"); got != want {
		t.Fatalf("the rules read:\n%s\nand want:\n%s", got, want)
	}
	if got := RulesOf("# Actionables\n\n- One rule.\n"); len(got) != 1 || got[0] != "1. One rule." {
		t.Fatalf("a note with no examples reads %v", got)
	}
}

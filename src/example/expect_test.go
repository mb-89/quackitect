// The one evaluator of an expect line: each form holds over the outcome and the
// tree it names, and a miss says what it wants and what it got.
// [[spec/design_output/examples#the-format]]
package example

import (
	"strings"
	"testing"
)

// A tree holding one ticket and one private note, which a field and a stands line read. [[spec/design_output/examples#the-format]]
func reads(path string) (string, bool) {
	if path == "spec/tickets/one.md" {
		return "---\nkind: [[ticket]]\nstate: closed\n---\n\n# Ask\n", true
	}
	if path == ".se/tickets/stray.md" {
		return "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n", true
	}
	return "", false
}

func TestEachExpectFormHoldsOverAnOutcome(t *testing.T) {
	t.Parallel()
	said := Outcome{Code: 0, Out: "work  alpha at do, leaf 1 of 1\n"}
	for _, one := range []struct {
		line string
		miss string
	}{
		{"exit 0", ""},
		{"exit 1", "exit 1"},
		{`says "leaf 1 of"`, ""},
		{`says "leaf 2 of"`, "leaf 2 of"},
		{`quiet "refused"`, ""},
		{`quiet "alpha"`, "alpha"},
		{"stands spec/tickets/one.md", ""},
		{"stands spec/tickets/two.md", "spec/tickets/two.md"},
		{"field one state closed", ""},
		{"field one state open", "closed"},
		{"field two state open", "two"},
		{"field stray state open", ""},
	} {
		t.Run(one.line, func(t *testing.T) {
			t.Parallel()
			expect, fault := expectOf(one.line, 1)
			if fault != "" {
				t.Fatalf("the line reads as no expect: %s", fault)
			}
			miss := Holds(expect, said, reads)
			if (one.miss == "") != (miss == "") || !strings.Contains(miss, one.miss) {
				t.Fatalf("the expect answers %q, and wants a miss holding %q", miss, one.miss)
			}
		})
	}
}

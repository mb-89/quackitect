// The guidance verb: a named note, and a hand holding nothing.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A named note prints its rules under a heading naming it. [[spec/design_output/pull#the-work-answer]]
func TestANamedNotePrintsItsRules(t *testing.T) {
	one := newTree(t, map[string]string{"spec/guidance/voice.md": "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Say what is. *\n"})
	if code := one.branchSays("guidance", "spec/guidance/voice"); code != 0 {
		t.Fatalf("the guidance answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "# Reads spec/guidance/voice\n\n1. Say what is.")
}

// A name reaching no note refuses, and a hand holding nothing refuses. [[spec/design_output/pull#the-work-answer]]
func TestGuidanceRefusesWhatStandsNowhere(t *testing.T) {
	one := newTree(t, nil)
	if code := one.branchSays("guidance", "spec/guidance/none"); code != codeRed {
		t.Fatalf("a missing note answers %d", code)
	}
	if code := one.branchSays("guidance"); code != codeRed {
		t.Fatalf("an empty hand answers %d", code)
	}
	holds(t, one.errs.String(), "Nothing stands in your hand, so no step names a note.")
}

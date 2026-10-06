// The escalation: the question, and the person step it puts in.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported escalate parsers askedIn, wordsIn and optionsFlag, and the route readers

import (
	"slices"
	"testing"
)

// An escalation with no words refuses, and one with no hold refuses. [[spec/design_output/pull#a-person-step-goes-in]]
func TestAnEscalationWantsAQuestionAndAHold(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("escalate"); code != codeRefused {
		t.Fatalf("a bare escalation answers %d", code)
	}
	if code := one.branchSays("escalate", "which", "one?"); code != codeRed {
		t.Fatalf("an escalation with no hold answers %d", code)
	}
	holds(t, one.errs.String(), "no ticket file stands in your hand")
}

// The question is every word past the flags, and the options split on commas. [[spec/design_output/pull#a-person-step-goes-in]]
func TestTheQuestionIsTheWordsPastTheFlags(t *testing.T) {
	t.Parallel()
	rest := []string{"which", "--options", "a, b", "one", "--as", "helper-1"}
	if askedIn(rest) != "which one" || !slices.Equal(wordsIn(flagIn(rest, optionsFlag)), []string{"a", "b"}) {
		t.Fatalf("the question reads %q", askedIn(rest))
	}
}

// The person step goes in before the leaf, takes the next number, and the ticket stands at it. [[spec/design_output/pull#a-person-step-goes-in]]
func TestThePersonStepGoesInBeforeTheLeaf(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	text, path := one.d.withPersonStep(note{Name: "kid", Text: childNote}, "build", "which one", nil)
	if path != "person-1" || fieldOf(text, "step") != "person-1" {
		t.Fatalf("the step goes in at %q", path)
	}
	at := leafOf(frontOf(text), "person-1")
	if at == nil || at.By != byPerson || at.Asks != "which one" || at.Leaves[at.At+1].Path != "build" {
		t.Fatalf("the person step reads %+v", at)
	}
}

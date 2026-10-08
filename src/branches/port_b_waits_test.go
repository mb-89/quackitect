// What holds a group back over a real tree: a parent on main waiting on an
// open group, and a gate question on trunk the take walks past.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported heldIn, openState and closedState through the pb helpers

import (
	"strings"
	"testing"
)

// The gate question the first group waits on. [[spec/tickets/work-verbs-port-to-go]]
const pbGate = "the-owner-flips"

// A tree whose group one-group sits under big-parent, which stands on main alone and waits on the open first-group. [[spec/tickets/work-verbs-port-to-go]]
func pbChainOnMain(t *testing.T) *tree {
	under := strings.Replace(pbGroupNote, "state: open\n", "state: open\ngroup: big-parent\n", 1)
	one := pbIdentify(newTree(t, map[string]string{
		ticketAt("big-parent"):  strings.Replace(pbGroupNote, "state: open\n", "state: open\ndepends_on: [first-group]\n", 1),
		ticketAt("first-group"): pbGroupNote,
	}))
	one.branch("one-group", map[string]string{pbAt: under})
	return one
}

// A take leaves a group whose parent on main alone waits on an open group, and switches nowhere. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeLeavesAGroupWhoseParentWaits(t *testing.T) {
	t.Parallel()
	one := pbChainOnMain(t)
	if code := one.branchSays("take", "one-group"); code != codeRed {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "work/one-group stands at no free todo")
	if one.here() != trunk {
		t.Fatal("the take switches")
	}
}

// The trigger names no branch free where a parent on main alone waits. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTriggerNamesNoBranchFreeUnderAWaitingParent(t *testing.T) {
	t.Parallel()
	one := pbChainOnMain(t)
	one.out.Reset()
	one.errs.Reset()
	if code := Cloud(one.d, []string{"trigger"}); code != 0 {
		t.Fatalf("the trigger answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "No branch stands free")
}

// A ticket text waiting on the gate. [[spec/tickets/work-verbs-port-to-go]]
func pbGated(text string) string {
	return strings.Replace(text, "kind: [[ticket]]\n", "kind: [[ticket]]\ndepends_on: ["+pbGate+"]\n", 1)
}

// The gate question at a state. [[spec/tickets/work-verbs-port-to-go]]
func pbQuestion(state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + `
steps:
  - name: answer
    by: person
---

# Ask

Does the slice switch over?

# answer

# Discussion

Nothing yet.
`
}

// Two free groups, the first waiting on the gate on trunk, and the take run over them; answers the tree and the two tips before. [[spec/tickets/work-verbs-port-to-go]]
func pbTwoGroups(t *testing.T, gate string) (*tree, int, string, string) {
	one := pbIdentify(newTree(t, map[string]string{ticketAt(pbGate): pbQuestion(gate)}))
	atChildren := withField(pbGroupNote, "step", "children")
	one.branch("a-gated", map[string]string{ticketAt("a-gated"): pbGated(atChildren), ticketAt("a-child"): pbGated(pbChild("a-gated", "open"))})
	one.branch("b-free", map[string]string{ticketAt("b-free"): atChildren, ticketAt("b-child"): pbChild("b-free", "open")})
	a, b := one.rev("origin/work/a-gated"), one.rev("origin/work/b-free")
	code := one.branchSays("take")
	one.fetch()
	return one, code, a, b
}

// A take walks past a group whose gate stands open on trunk and claims the next free one, and the listing names the wait. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeWalksPastAnOpenGate(t *testing.T) {
	t.Parallel()
	one, code, a, b := pbTwoGroups(t, openState)
	if code != 0 {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	if one.rev("origin/work/a-gated") != a {
		t.Error("the gated group takes a claim")
	}
	if one.rev("origin/work/b-free") == b {
		t.Error("the next free group takes no claim")
	}
	if taken := heldIn(one.show("origin/work/b-free", ticketAt("b-free"))); taken == nil || !strings.HasPrefix(taken.Hand, pbBox) {
		t.Errorf("the claim on b-free reads %+v", taken)
	}
	one.out.Reset()
	one.errs.Reset()
	one.branchSays("list")
	pdMatches(t, pbSaid(one), `work/a-gated\s+todo`)
	pdMatches(t, pbSaid(one), `(?m)^ {2}a-child\s+ticket\s+open\s+waits for `+pbGate)
}

// A gate the owner closes on trunk frees its group for the take. [[spec/tickets/work-verbs-port-to-go]]
func TestPBAClosedGateFreesItsGroup(t *testing.T) {
	t.Parallel()
	one, code, a, b := pbTwoGroups(t, closedState)
	if code != 0 {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	if one.rev("origin/work/a-gated") == a {
		t.Error("the first group takes no claim once its gate stands closed")
	}
	if one.rev("origin/work/b-free") != b {
		t.Error("the second group takes a claim too")
	}
}

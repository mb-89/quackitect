// The unblock: a cloud box hands nothing out, and a desk hands a person's
// question to its successor.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it runs unblock through the unexported tree fixture and reads fieldOf

import "testing"

// A cloud box answers its own question, so the unblock refuses there. [[spec/guidance/cloud/cloud]]
func TestACloudBoxHandsNoQuestionOut(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("unblock", "a", "b"); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "A cloud box hands no question out.")
}

// A desk closes the child as became, and the successor carries the question under Discussion. [[spec/design_output/work#a-person-step-leaves]]
func TestTheUnblockHandsTheQuestionOn(t *testing.T) {
	t.Parallel()
	asking := "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/standard]]\ngroup: g\nsteps:\n  - name: ask\n    by: person\n    asks: which one; and why\nstep: ask\n---\n\n# Ask\n\nAsk it.\n"
	next := "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/person]]\nsteps:\n  - name: answer\n    by: person\nstep: answer\n---\n\n# Ask\n\nAnswer it.\n\n# Discussion\n\n<!-- what anybody adds -->\n"
	one := newTree(t, map[string]string{ticketAt("kid"): asking, ticketAt("next"): next}).desk()
	if code := one.branchSays("unblock", "kid", "next"); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	if fieldOf(one.read(ticketAt("kid")), "reason") != "became" {
		t.Fatal("the child stays open")
	}
	holds(t, one.read(ticketAt("next")), "# Discussion\n\n- [[spec/tickets/kid]] hands this over at `ask`, which waits for a person.\n  - which one\n  - and why\n")
	holds(t, one.git("log", "-1", "--format=%s"), "kid: closes became next")
}

// A successor off the person route stands refused. [[spec/tickets/a-box-keeps-its-tickets]]
func TestASuccessorOffThePersonRouteRefuses(t *testing.T) {
	t.Parallel()
	asking := "---\nstate: open\nsteps:\n  - name: ask\n    by: person\nstep: ask\n---\n"
	next := "---\nstate: open\nprocess: [[spec/processes/standard]]\nsteps:\n  - name: answer\n    by: person\n---\n"
	one := newTree(t, map[string]string{ticketAt("kid"): asking, ticketAt("next"): next}).desk()
	if code := one.branchSays("unblock", "kid", "next"); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "next stands off the person route")
}

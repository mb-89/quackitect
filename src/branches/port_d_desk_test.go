// The desk, ported off test/level0/work-desk.test.js: a desk takes a cloud
// branch into trunk by a merge alone, so the take refuses and the merge lands.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// The take on a desk refuses, names main, and leaves the box where it stood. [[spec/tickets/work-verbs-port-to-go]]
func TestPDADeskTakeRefusesAndNamesMain(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("one-group"): pdGroupNote}).desk()
	one.d.Failures = deskNodes()
	one.branch("one-group", nil)
	was := one.rev("HEAD")
	if code := one.branchSays("take", "one-group"); code != codeRefused {
		t.Fatalf("a desk take answers %d", code)
	}
	holds(t, one.errs.String(), "A desk works on main alone")
	holds(t, one.errs.String(), "git switch main")
	if one.rev("HEAD") != was || one.here() != trunk {
		t.Fatal("the refused take moves the box")
	}
	if one.rev("refs/heads/work/one-group") != "" {
		t.Fatal("the refused take makes a branch")
	}
}

// A desk's merge takes a done cloud branch into main, the check passes on it, and the branch closes. [[spec/tickets/work-verbs-port-to-go]]
func TestPDADeskMergesADoneCloudBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.d.Runme = []string{"true"}
	done := withField(withEntry(pdGroupNote, entryRow("sync", "a1b2c3", "d4e5f6")), "state", closedState)
	one.branch("one-group", map[string]string{ticketAt("one-group"): done})
	tip := one.rev("origin/work/one-group")
	if code := one.branchSays("merge", "one-group"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	holds(t, one.out.String(), "work/one-group is merged, and the check passes on the merge commit")
	holds(t, one.out.String(), "work/one-group is closed")
	one.fetch()
	if !pdInside(one, tip, "origin/main") {
		t.Fatal("origin/main carries no merge")
	}
	if one.originHas("work/one-group") {
		t.Fatal("the branch stands on origin")
	}
}

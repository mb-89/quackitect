// The close over a real clone, as test/level0/work.test.js drives it through
// fake doors: a branch inside trunk goes, one outside it stays, and a trunk
// ahead of origin holds every branch.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// Pushes a branch carrying a file, and merges it into main with a merge commit, pushed. [[spec/tickets/work-verbs-port-to-go]]
func paLanded(one *tree, branch string) {
	one.t.Helper()
	one.git("switch", "-q", "-c", branch, "main")
	one.land(branch+" lands", map[string]string{branch + ".md": "landed\n"})
	one.git("push", "-q", "origin", branch)
	one.git("switch", "-q", "main")
	one.git("merge", "-q", "--no-ff", "-m", "merge "+branch, branch)
	one.git("branch", "-q", "-D", branch)
	one.git("push", "-q", "origin", "main")
	one.git("fetch", "-q", "origin")
}

// Close refuses a branch outside trunk, and deletes one inside it. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseDeletesInsideTrunkAlone(t *testing.T) {
	one := newTree(t, nil)
	paLanded(one, "work/landed")
	one.branch("elsewhere", map[string]string{"else.md": "else\n"})
	if code := one.branchSays("close", "landed"); code != codeOK {
		t.Fatalf("close answers %d: %s", code, paSaid(one))
	}
	if paOriginHas(one, "work/landed") {
		t.Fatal("origin still carries work/landed")
	}
	one.branchSays("close", "elsewhere")
	holds(t, paSaid(one), "outside main")
	if !paOriginHas(one, "work/elsewhere") {
		t.Fatal("the close deletes a branch outside trunk")
	}
}

// Close takes a name carrying its own prefix, and reaches the branch the platform cut. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseTakesItsOwnPrefix(t *testing.T) {
	one := newTree(t, nil)
	paLanded(one, "claude/roaming-hopper-ab12cd")
	if code := one.branchSays("close", "claude/roaming-hopper-ab12cd"); code != codeOK {
		t.Fatalf("close answers %d: %s", code, paSaid(one))
	}
	if paOriginHas(one, "claude/roaming-hopper-ab12cd") {
		t.Fatal("origin still carries the platform's branch")
	}
}

// Close holds a trunk carrying commits origin has never seen, and deletes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseHoldsAnUnpushedTrunk(t *testing.T) {
	one := newTree(t, nil)
	paLanded(one, "work/landed")
	one.land("one ahead", map[string]string{"x.md": "x\n"})
	one.land("two ahead", map[string]string{"y.md": "y\n"})
	if code := one.branchSays("close"); code != codeRed {
		t.Fatalf("close answers %d: %s", code, paSaid(one))
	}
	holds(t, paSaid(one), "Push main first")
	if !paOriginHas(one, "work/landed") {
		t.Fatal("the held close deletes a branch")
	}
}

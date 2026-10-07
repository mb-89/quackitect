// The close over a fake clone, as test/level0/work.test.js drives it through
// fake doors: a branch inside trunk goes, one outside it stays, and a trunk
// ahead of origin holds every branch.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it runs close through the unexported tree fixture and the pa helpers, and reads the exit codes

import "testing"

// Pushes a branch carrying a file, and merges it into main with a merge commit, pushed. [[spec/tickets/work-verbs-port-to-go]]
func paLanded(one *tree, branch string) {
	one.t.Helper()
	one.cut(branch, "main")
	one.land(branch+" lands", map[string]string{branch + ".md": "landed\n"})
	one.push(branch)
	one.switchTo("main")
	one.mergeIn(branch, "merge "+branch)
	one.drop(branch)
	one.push("main")
	one.fetch()
}

// Close refuses a branch outside trunk, and deletes one inside it. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseDeletesInsideTrunkAlone(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	paLanded(one, "work/landed")
	one.branch("elsewhere", map[string]string{"else.md": "else\n"})
	if code := one.branchSays("close", "landed"); code != codeOK {
		t.Fatalf("close answers %d: %s", code, paSaid(one))
	}
	if paOriginHas(one, "work/landed") {
		t.Fatal("origin still carries work/landed")
	}
	if code := one.branchSays("close", "elsewhere"); code != codeRed {
		t.Fatalf("close answers %d", code)
	}
	holds(t, paSaid(one), "work/elsewhere is outside main, so closing it drops its work.")
	if !paOriginHas(one, "work/elsewhere") {
		t.Fatal("the close deletes a branch outside trunk")
	}
}

// Close takes a name carrying its own prefix, and reaches the branch the platform cut. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseTakesItsOwnPrefix(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	paLanded(one, "claude/roaming-hopper-ab12cd")
	if code := one.branchSays("close", "claude/roaming-hopper-ab12cd"); code != codeOK {
		t.Fatalf("close answers %d: %s", code, paSaid(one))
	}
	if paOriginHas(one, "claude/roaming-hopper-ab12cd") {
		t.Fatal("origin still carries the platform's branch")
	}
}

// Close holds a trunk carrying commits origin lacks, and deletes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPACloseHoldsAnUnpushedTrunk(t *testing.T) {
	t.Parallel()
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

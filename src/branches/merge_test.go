// The trunk end: merge refuses short of done, and close keeps an unmerged branch.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A merge names its branch, and a branch short of done stands unready. [[spec/design_output/work#the-merge-lands-the-truth]]
func TestAMergeWantsADoneGroup(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	if code := one.branchSays("merge"); code != codeRefused {
		t.Fatalf("a bare merge answers %d", code)
	}
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	if code := one.branchSays("merge", "g"); code != codeRed {
		t.Fatalf("a merge at todo answers %d", code)
	}
	holds(t, one.errs.String(), "work/g stands at todo, so it is not ready.")
}

// A done branch inside a pull request lands through GitHub, so the merge stands aside. [[spec/tickets/merge-reads-open-pulls]]
func TestAMergeStandsAsideForAPullRequest(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.branch("g", map[string]string{ticketAt("g"): withField(groupNote, "state", closedState)})
	one.pushAt("origin/work/g", "refs/pull/7/head")
	if code := one.branchSays("merge", "g"); code != codeRed {
		t.Fatalf("the merge answers %d", code)
	}
	holds(t, one.errs.String(), "work/g stands in pull request #7")
}

// Close keeps a branch outside trunk, and names the force. [[spec/design_output/work#a-merged-branch-closes]]
func TestCloseKeepsAnUnmergedBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	if code := one.branchSays("close", "g"); code != codeRed {
		t.Fatalf("close answers %d", code)
	}
	holds(t, one.errs.String(), "work/g is outside main, so closing it drops its work.")
	if one.rev("origin/work/g") == "" {
		t.Fatal("the close drops the branch")
	}
}

// Close deletes a branch trunk carries through a merge commit. [[spec/design_output/work#a-merged-branch-closes]]
func TestCloseDeletesAMergedBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.branch("g", map[string]string{ticketAt("g"): withField(groupNote, "state", closedState)})
	one.mergeIn("origin/work/g", "")
	one.push("main")
	if code := one.branchSays("close"); code != 0 {
		t.Fatalf("close answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "work/g is closed.")
}

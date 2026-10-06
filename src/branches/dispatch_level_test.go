// A done branch main already carries holds nothing to merge, so the dispatch
// opens no pull request over it. [[spec/tickets/dispatch-skips-merged-done-branches]]
package branches

import "testing"

// The dispatch posts no pull request over a done branch level with main, and answers green. [[spec/tickets/dispatch-skips-merged-done-branches]]
func TestDispatchPostsNoPullRequestOverADoneBranchLevelWithMain(t *testing.T) {
	t.Parallel()
	one := dfDoneTree(t)
	one.git("merge", "-q", "--ff-only", "origin/"+workBranch+"landing")
	one.git("push", "-q", "origin", trunk)
	one.git("fetch", "-q", "origin")
	if plan := one.dpPlan(); len(plan.Done) != 0 {
		t.Fatalf("the plan keeps %v at done", plan.Done)
	}
	hub := newHub()
	one.out.Reset()
	if code := Dispatch(one.d, hub.send, []string{"--fire"}); code != codeOK {
		t.Fatalf("the run answers %d: %s", code, one.out.String())
	}
	if posted := hub.pullsSent("POST"); len(posted) != 0 {
		t.Fatalf("the dispatch posts %d pull request(s): %s", len(posted), one.out.String())
	}
}

// The plan keeps a done branch carrying a commit main lacks. [[spec/tickets/dispatch-skips-merged-done-branches]]
func TestThePlanKeepsADoneBranchAheadOfMain(t *testing.T) {
	t.Parallel()
	if plan := dfDoneTree(t).dpPlan(); len(plan.Done) != 1 || plan.Done[0] != workBranch+"landing" {
		t.Fatalf("the plan keeps %v at done", plan.Done)
	}
}

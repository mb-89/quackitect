package main

import (
	"testing"
	"time"
)

// THE PICK IS A SET DIFFERENCE AND A DATE COMPARISON.
//
// A group is workable when it has a branch under refs/heads/group/ and its entry
// is absent or lapsed. That is the whole of what a scheduler has to understand,
// and it is the whole of what se group --next answers.

// aGroupBranchOnOrigin pushes one branch under refs/heads/group/, which is what
// makes a bucket a cloud group a box can be started on.
func aGroupBranchOnOrigin(t *testing.T, r Roots, bucket string) {
	t.Helper()
	mustGit(t, r.Work, "push", "--quiet", "origin", "HEAD:refs/heads/"+aGroupBranch+bucket)
}

func TestTheNextGroupIsOneWithABranchAndNoLiveEntry(t *testing.T) {
	r := aBoxOverGroups(t)
	other := anotherBoxOverTheSameTree(t, r)
	now := time.Now().UTC()
	aGroupBranchOnOrigin(t, r, "alpha")
	aGroupBranchOnOrigin(t, r, "beta")

	// THE CLEAN CASE: nothing is held, so the first branch in order is offered.
	name, says := TheNextGroup(t.Context(), r, now)
	if name != "group/alpha" {
		t.Fatalf("the pick answered %q, and two free branches are here: %s", name, says)
	}

	// THE PLANTED CASE: another box takes it, and the one beside it is offered.
	if got := ClaimTheGroup(t.Context(), other, "alpha", now); got.Refused != "" {
		t.Fatalf("the other box could not take group/alpha: %s", got.Refused)
	}
	if name, says = TheNextGroup(t.Context(), r, now); name != "group/beta" {
		t.Fatalf("the pick answered %q with group/alpha held: %s", name, says)
	}

	// AND WITH EVERY GROUP HELD THERE IS NO ANSWER, AND A REASON.
	if got := ClaimTheGroup(t.Context(), other, "beta", now); got.Refused != "" {
		t.Fatalf("the other box could not take group/beta: %s", got.Refused)
	}
	name, says = TheNextGroup(t.Context(), r, now)
	if name != "" {
		t.Errorf("the pick offered %q, and both groups are held", name)
	}
	if says == "" {
		t.Error("nothing was offered and nothing said why, so a box cannot tell that from a fault")
	}
}

// A BRANCH THAT LAPSED COMES BACK, which is what frees a group from a box that
// never came back.
func TestALapsedGroupIsWorkableAgain(t *testing.T) {
	r := aBoxOverGroups(t)
	other := anotherBoxOverTheSameTree(t, r)
	now := time.Now().UTC()
	aGroupBranchOnOrigin(t, r, "alpha")

	// THE PLANTED CASE: a hold written four hours ago, which is past the lease.
	if got := ClaimTheGroup(t.Context(), other, "alpha", now.Add(-4*time.Hour)); got.Refused != "" {
		t.Fatalf("the other box could not take group/alpha: %s", got.Refused)
	}
	if name, says := TheNextGroup(t.Context(), r, now); name != "group/alpha" {
		t.Errorf("a lapsed hold was not offered again: %q %s", name, says)
	}

	// THE CLEAN CASE: the same hold, written now, keeps the group.
	if got := ClaimTheGroup(t.Context(), other, "alpha", now); got.Refused != "" {
		t.Fatalf("the other box could not renew group/alpha: %s", got.Refused)
	}
	if name, _ := TheNextGroup(t.Context(), r, now); name != "" {
		t.Errorf("a live hold was offered as workable: %q", name)
	}
}

// A TREE WITH NO GROUP BRANCH ANSWERS NOTHING, AND SAYS SO.
func TestABoxWithNoGroupBranchIsOfferedNothing(t *testing.T) {
	r := aBoxOverGroups(t)
	name, says := TheNextGroup(t.Context(), r, time.Now().UTC())
	if name != "" {
		t.Errorf("a tree carrying no group branch offered %q", name)
	}
	if says == "" {
		t.Error("nothing was offered and nothing said why")
	}
}

package main

import (
	"strings"
	"testing"
	"time"
)

// THE ORDER IS WRITTEN DOWN, AND IT CLEARS ITSELF.
//
// Not cutting a branch until another group closes is the same order kept in
// somebody's head, and it has to be remembered again every time. A group entry
// that names what it waits on is read cold, off the one file a scheduler with no
// engine opens, and the wait ends when the other group is done.
//
// IT IS NOT blocked. Blocked waits for a person, which is the wrong shape for an
// unattended loop: it stops the loop and asks somebody to come back.

func TestAGroupWaitingOnAnUnfinishedGroupIsNotOffered(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()
	aGroupBranchOnOrigin(t, r, "level0")
	aGroupBranchOnOrigin(t, r, "voice")

	// THE CLEAN CASE: with nothing declared, the first branch in order is offered.
	if name, says := TheNextGroup(t.Context(), r, now); name != "group/level0" {
		t.Fatalf("the pick answered %q with two free branches: %s", name, says)
	}

	// THE PLANTED CASE: voice waits on level0, which nobody has finished.
	if got := TheGroupWaitsOn(t.Context(), r, "voice", []string{"level0"}, now); got.Refused != "" {
		t.Fatalf("the wait could not be written: %s", got.Refused)
	}
	why := whyTheGroupIsNotWorkable(t.Context(), r, theGroupsEverybodySees(t.Context(), r), "group/voice", now)
	if why == "" {
		t.Fatal("a group waiting on an unfinished one was offered as workable")
	}
	if !strings.Contains(why, "group/level0") {
		t.Errorf("the refusal does not name what it waits on: %s", why)
	}

	// AND THE PICK SKIPS IT RATHER THAN STOPPING, so a box is handed the group
	// that can be worked instead of nothing at all.
	if name, _ := TheNextGroup(t.Context(), r, now); name != "group/level0" {
		t.Errorf("the pick answered %q, and level0 is free while voice waits on it", name)
	}
}

// AND THE WAIT ENDS WITH NOBODY TO UNBLOCK IT, which is the whole reason it is
// not blocked.
func TestAWaitClearsWhenTheGroupItWaitsOnIsDone(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()
	aGroupBranchOnOrigin(t, r, "level0")
	aGroupBranchOnOrigin(t, r, "voice")

	if got := TheGroupWaitsOn(t.Context(), r, "voice", []string{"level0"}, now); got.Refused != "" {
		t.Fatalf("the wait could not be written: %s", got.Refused)
	}
	if got := ClaimTheGroup(t.Context(), r, "level0", now); got.Refused != "" {
		t.Fatalf("group/level0 could not be taken: %s", got.Refused)
	}
	if got := FinishTheGroup(t.Context(), r, "level0", now); got.Refused != "" {
		t.Fatalf("group/level0 could not be finished: %s", got.Refused)
	}

	// NOBODY UNBLOCKED ANYTHING. The other group being done is the whole of it.
	if why := whyTheGroupIsNotWorkable(t.Context(), r, theGroupsEverybodySees(t.Context(), r), "group/voice", now); why != "" {
		t.Fatalf("the wait outlived the group it waited on: %s", why)
	}
}

// A CLAIM DOES NOT DROP THE ORDER. Every writer builds a fresh entry, so the
// wait is carried in one place rather than remembered by each of them.
func TestAClaimKeepsTheWaitOnTheEntry(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()
	aGroupBranchOnOrigin(t, r, "level0")
	aGroupBranchOnOrigin(t, r, "voice")

	if got := TheGroupWaitsOn(t.Context(), r, "voice", []string{"level0"}, now); got.Refused != "" {
		t.Fatalf("the wait could not be written: %s", got.Refused)
	}
	// A CLAIM ON A DIFFERENT GROUP REWRITES THE FILE, and the entry beside it
	// has to survive that.
	if got := ClaimTheGroup(t.Context(), r, "level0", now); got.Refused != "" {
		t.Fatalf("group/level0 could not be taken: %s", got.Refused)
	}
	have := theGroupsEverybodySees(t.Context(), r)
	if got := have["group/voice"].DependsOn; len(got) != 1 || got[0] != "group/level0" {
		t.Fatalf("the wait was dropped by a write beside it: %v", got)
	}
}

// A WAIT ON A GROUP THAT IS GONE IS ALREADY CLEAR.
//
// The retro merges a finished group and prunes its entry, and its branch goes
// with it. Reading that name as unfinished would park this group behind
// something nobody can find, and no box could ever clear it.
func TestAWaitOnAGroupThatIsGoneIsClear(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()
	aGroupBranchOnOrigin(t, r, "voice")

	// NOTHING NAMED retired IS HERE: no branch, no entry, which is what a group
	// looks like after the retro takes it in.
	if got := TheGroupWaitsOn(t.Context(), r, "voice", []string{"retired"}, now); got.Refused != "" {
		t.Fatalf("the wait could not be written: %s", got.Refused)
	}
	if why := whyTheGroupIsNotWorkable(t.Context(), r, theGroupsEverybodySees(t.Context(), r), "group/voice", now); why != "" {
		t.Fatalf("a wait on a group with no branch held: %s", why)
	}
	if name, says := TheNextGroup(t.Context(), r, now); name != "group/voice" {
		t.Errorf("the pick answered %q, and group/voice waits only on a group that is gone: %s", name, says)
	}
}

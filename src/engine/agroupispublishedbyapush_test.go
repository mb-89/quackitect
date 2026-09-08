package main

import (
	"encoding/json"
	"strings"
	"testing"
	"time"
)

// THE PUSH IS THE ARBITER, so these drive a real git against a real remote.
//
// What is under test is which box wins, and git decides that. A fed git would
// answer whatever it was told, which is the one thing that cannot be faked here.

// theGroupsOnOrigin reads the file off the branch the remote carries, the way a
// scheduler with no engine and no clone would.
func theGroupsOnOrigin(t *testing.T, r Roots) TheGroups {
	t.Helper()
	bare := mustGit(t, r.Work, "remote", "get-url", "origin")
	text, err := runGit(t, bare, "show", "se/claims:"+groupsFile)
	if err != nil {
		t.Fatalf("the remote carries no %s, so nothing a scheduler reads is there: %v", groupsFile, err)
	}
	out := TheGroups{}
	if err := json.Unmarshal([]byte(text), &out); err != nil {
		t.Fatalf("the file on the remote will not read: %v\n%s", err, text)
	}
	return out
}

// A CLAIM WRITES held WITH A RESOLVED LEASE, AND IT REACHES THE BRANCH.
func TestAGroupClaimReachesTheClaimsBranch(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()

	got := ClaimTheGroup(t.Context(), r, "voice", now)
	if got.Refused != "" {
		t.Fatalf("a group nobody holds was refused: %s", got.Refused)
	}
	if got.Published == nil || !got.Published.Pushed {
		t.Fatalf("the hold reached no other box: %+v", got.Published)
	}

	e, ok := theGroupsOnOrigin(t, r)["group/voice"]
	if !ok {
		t.Fatal("the file on the remote names no group, so a scheduler sees nothing")
	}
	if e.State != GroupHeld || e.By != Box(r) {
		t.Fatalf("the entry is %+v, and this box is %s", e, Box(r))
	}
	ends, err := time.Parse(ClaimStamp, e.Lapses)
	if err != nil {
		t.Fatalf("lapses is not an absolute stamp a reader with no engine can compare: %q", e.Lapses)
	}
	want := now.Add(theGroupLease(r))
	if ends.Sub(want) > time.Minute || want.Sub(ends) > time.Minute {
		t.Errorf("the lease ends at %s, and one claim_hours from now is %s", ends, want)
	}
}

// A GROUP ANOTHER BOX HOLDS IS REFUSED, AND THE REFUSAL NAMES THE HOLDER.
func TestAGroupAnotherBoxHoldsIsRefusedAndNamesIt(t *testing.T) {
	r := aBoxOverGroups(t)
	other := anotherBoxOverTheSameTree(t, r)
	now := time.Now().UTC()

	if first := ClaimTheGroup(t.Context(), other, "voice", now); first.Refused != "" {
		t.Fatalf("the first box could not take the group: %s", first.Refused)
	}

	// THE PLANTED CASE.
	got := ClaimTheGroup(t.Context(), r, "voice", now)
	if got.Refused == "" {
		t.Fatal("two boxes took one group, which is the state the hold exists to prevent")
	}
	if !strings.Contains(got.Refused, Box(other)) {
		t.Errorf("the refusal does not name who holds it: %s", got.Refused)
	}

	// THE CLEAN CASE: a group nobody holds, on the same box and the same file.
	if free := ClaimTheGroup(t.Context(), r, "filter", now); free.Refused != "" {
		t.Errorf("a group nobody holds was refused: %s", free.Refused)
	}
}

// AND A WRITE THAT GOES AHEAD ANYWAY IS REFUSED BY THE RELAY.
//
// The scheduler's pick is a hint, so a box can arrive holding a snapshot that is
// already stale. The relay reads the parent before it writes, which is the
// compare and swap behind the push, and the loser is told who won.
func TestAWriteOverAGroupAnotherBoxWonNamesTheWinner(t *testing.T) {
	r := aBoxOverGroups(t)
	other := anotherBoxOverTheSameTree(t, r)
	now := time.Now().UTC()

	if first := ClaimTheGroup(t.Context(), other, "voice", now); first.Refused != "" {
		t.Fatalf("the winner could not take the group: %s", first.Refused)
	}
	mine := GroupEntry{State: GroupHeld, By: Box(r),
		Lapses: now.Add(theGroupLease(r)).UTC().Format(ClaimStamp)}

	// THE PLANTED CASE: this box writes the group anyway, off a stale pick.
	p := PublishTheGroup(t.Context(), r, &GroupChange{Name: "group/voice", Entry: mine}, "a stale pick")
	if p.Pushed {
		t.Fatal("a box wrote over a group another box holds")
	}
	if p.Lost != Box(other) {
		t.Errorf("the answer names %q as the holder, and it is %q: %s", p.Lost, Box(other), p.Says)
	}
	if !strings.Contains(p.Says, Box(other)) {
		t.Errorf("the sentence does not say who holds it: %s", p.Says)
	}
	if e := theGroupsOnOrigin(t, r)["group/voice"]; e.By != Box(other) {
		t.Errorf("the remote now names %q, and the winner is %q", e.By, Box(other))
	}

	// THE CLEAN CASE: the same write, for a group nobody holds, lands.
	clean := PublishTheGroup(t.Context(), r, &GroupChange{Name: "group/filter", Entry: mine}, "a free group")
	if !clean.Pushed {
		t.Errorf("a write for a free group was stopped as well: %s", clean.Says)
	}
}

// AN ORDINARY CLAIM DOES NOT DROP THE GROUPS THE FILE ALREADY HELD.
//
// The claims ref carries one file per kind, and a write that rebuilt the tree
// from this box's claims alone would free every group every other box holds.
func TestAnOrdinaryClaimKeepsTheGroupsFile(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()
	if got := ClaimTheGroup(t.Context(), r, "voice", now); got.Refused != "" {
		t.Fatalf("the group could not be taken: %s", got.Refused)
	}

	tok := mintUnclaimed(t, r, "a token beside groups")
	if _, err := Claim(r, Claimant(r, "worker-one"), []string{tok.ID}, now); err != nil {
		t.Fatal(err)
	}
	if p := Publish(t.Context(), r, []string{"spec/work/" + tok.ID + ".md"}, "a token claim"); !p.Pushed {
		t.Fatalf("the token claim did not publish: %s", p.Says)
	}
	if e := theGroupsOnOrigin(t, r)["group/voice"]; e.State != GroupHeld {
		t.Errorf("a token claim dropped the group hold, and the entry is now %+v", e)
	}
}

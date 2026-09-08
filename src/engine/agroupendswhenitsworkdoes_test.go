package main

import (
	"strings"
	"testing"
	"time"
)

// A GROUP WITH AN OPEN TOKEN IN IT IS NOT DONE.
//
// The retro merges a done group and prunes its entry, so saying done early loses
// the rest of the group behind a state that never expires.
func TestAGroupWithAnOpenTokenIsNotDone(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()

	// THE PLANTED CASE: one token still open in the bucket.
	open := mintInBucket(t, r, "still to do", "voice")
	got := FinishTheGroup(t.Context(), r, "voice", now)
	if got.Refused == "" {
		t.Fatalf("a group still holding %s was called done", open.ID)
	}
	if !strings.Contains(got.Refused, "open token") {
		t.Errorf("the refusal does not say what is left: %s", got.Refused)
	}

	// THE CLEAN CASE: a bucket beside it whose only token has ended.
	over := mintInBucket(t, r, "already settled", "filter")
	over.Disposition = Done
	over.Status = "closed"
	if err := SaveToken(r, over); err != nil {
		t.Fatal(err)
	}
	done := FinishTheGroup(t.Context(), r, "filter", now)
	if done.Refused != "" {
		t.Fatalf("a bucket with nothing open was refused: %s", done.Refused)
	}
	e := theGroupsOnOrigin(t, r)["group/filter"]
	if e.State != GroupDone || e.By != Box(r) {
		t.Errorf("the entry a scheduler reads is %+v, and this box is %s", e, Box(r))
	}
	if e.Lapses != "" {
		t.Errorf("a finished group carries a lease, so it becomes unfinished: %+v", e)
	}
}

// A BLOCKED GROUP CARRIES THE REASON A PERSON WILL ACT ON.
func TestABlockedGroupCarriesItsReason(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()

	// THE PLANTED CASE: a block with nothing said, which nobody can settle.
	if quiet := BlockTheGroup(t.Context(), r, "voice", "   ", now); quiet.Refused == "" {
		t.Error("a group was blocked with no reason, so nobody is told what to settle")
	}

	// THE CLEAN CASE.
	got := BlockTheGroup(t.Context(), r, "voice", "a token needs a person", now)
	if got.Refused != "" {
		t.Fatalf("a block with a reason on it was refused: %s", got.Refused)
	}
	e := theGroupsOnOrigin(t, r)["group/voice"]
	if e.State != GroupBlocked || e.Why != "a token needs a person" {
		t.Fatalf("the entry a scheduler reads is %+v", e)
	}
	if e.Lapses != "" {
		t.Errorf("a blocked group carries a lease, so it comes back on its own: %+v", e)
	}

	// AND A BLOCKED GROUP IS NOT HANDED OUT AGAIN, because a person settles it.
	if again := ClaimTheGroup(t.Context(), r, "voice", now); again.Refused == "" {
		t.Error("a blocked group was taken by a box, and only a person can settle it")
	}
}

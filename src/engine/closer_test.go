package main

import (
	"strings"
	"testing"
)

// FOUR EYES CAN BE MADE TWO IN ONE EXTRA COMMAND, and this is that command.
//
// An actor drafts a token assigned to itself, submits it, rewrites the assignee
// to somebody else, and then pulls as a reviewer. The four-eyes check asks who
// the token is assigned to NOW, and the answer is somebody else, so the actor is
// handed its own draft and agrees it.
//
// AND IT LEAVES NO TRACE. The note afterwards says probeB's token was agreed by
// probeA, which is exactly what a legitimate review looks like.
//
// SO THE CHECK HAS TO ASK WHO SUBMITTED IT, which is a fact about the past that
// the engine writes and nobody may type, rather than who owns it, which is a
// field any actor may rewrite.

// A DRAFT REASSIGNED AFTER SUBMISSION IS STILL ITS DRAFTER'S.
func TestAReassignedDraftIsNotHandedBackToItsDrafter(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: SpecOpen,
		Detail: "a problem worth stating",
		Criteria: []Criterion{{Says: "it is done", Runs: "exit 1"}}})

	// probeA drafts it and sends it for review.
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID}); done {
		t.Fatal("the draft was refused")
	}
	// THE BYPASS. Any actor may write the assignee, so the drafter hands the
	// token to somebody else and stops being its owner.
	after, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Assignee = "probeB"
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}

	// THE REVIEWER QUEUE MUST NOT HAND IT BACK. This is the first of the two
	// doors and it is the one the reproduction went through.
	got := next(r, "probeA", RoleReviewer)
	if got.Pull == AnswerReview && got.Token != nil && got.Token.ID == one.ID {
		t.Fatalf("probeA drafted %s and the reviewer queue handed it back", one.ID)
	}

	// AND THE VERDICT DOOR MUST REFUSE IT TOO, whatever the queue did. A check
	// on one door only is a check somebody walks round.
	a, _ := settle(r, "probeA", RoleReviewer, Payload{ID: one.ID, Verdict: "accept"})
	if len(a.Findings) == 0 {
		t.Fatalf("probeA agreed its own draft and nothing refused it: %+v", a)
	}
	back, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status == ImpOpen {
		t.Errorf("the draft was agreed by the actor that wrote it and the work is open")
	}
}

// AND THE SAME BYPASS ON THE IMPLEMENTATION HALF. judge carries the identical
// check, so the identical rewrite walks round it.
func TestAReassignedSubmissionIsNotHandedBackToItsSubmitter(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: ImpOpen})

	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID, Disposition: "done"}); done {
		t.Fatal("the submission was refused")
	}
	after, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Assignee = "probeB"
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}

	got := next(r, "probeA", RoleReviewer)
	if got.Pull == AnswerReview && got.Token != nil && got.Token.ID == one.ID {
		t.Fatalf("probeA submitted %s and the reviewer queue handed it back", one.ID)
	}
	a, _ := settle(r, "probeA", RoleReviewer, Payload{ID: one.ID, Verdict: "accept"})
	if len(a.Findings) == 0 {
		t.Fatalf("probeA agreed its own submission and nothing refused it: %+v", a)
	}
	if !strings.Contains(a.Findings[0].Wrong, "cannot judge it") {
		t.Errorf("the refusal does not say the submitter cannot judge it: %+v", a.Findings)
	}
}

// WHO SUBMITTED IT IS WRITTEN BY THE ENGINE AND NOBODY MAY TYPE IT.
//
// A field a person can write is a field the bypass rewrites, and then the check
// built on it is the check that was there before.
func TestWhoSubmittedIsTheEnginesAndNotAnybodysToWrite(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: ImpOpen})
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID, Disposition: "done"}); done {
		t.Fatal("the submission was refused")
	}
	after, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	if after.SubmittedBy != "probeA" {
		t.Errorf("probeA submitted it and the note says %q", after.SubmittedBy)
	}
	if err := WriteFieldBy(&after, "submitted_by", "probeB", "probeA"); err == nil {
		t.Error("submitted_by was written by hand, so the bypass has something to rewrite")
	}
}

// AND A REVIEWER THAT DID NOT SUBMIT IT IS STILL HANDED IT. A guard that
// refuses everything refuses nothing, because somebody turns it off.
func TestSomebodyElsesSubmissionIsStillReviewable(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: ImpOpen})
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID, Disposition: "done"}); done {
		t.Fatal("the submission was refused")
	}
	got := next(r, "probeB", RoleReviewer)
	if got.Pull != AnswerReview || got.Token == nil || got.Token.ID != one.ID {
		t.Fatalf("probeB did not submit %s and was not handed it: %+v", one.ID, got)
	}
}

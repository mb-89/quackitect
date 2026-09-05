package main

import (
	"testing"
	"time"
)

// A WORKER PULL NEVER HANDS THE AUTHOR ITS OWN DONE TOKEN.
//
// The submission puts the token down. A worker that names it again after,
// through se run or se apply, takes it back up, and the queue handed back what
// an actor held before asking whose queue the next step is on. So the author
// was handed its own verdict with the step 3 checklist, and the only move it
// was offered was to grade its own work. Standard says the verdict is by a
// reviewer, never the author.
func TestAWorkerPullDoesNotHandTheAuthorItsOwnDoneToken(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "submitted, then named again")

	if got := Pull(r, "worker-1", RoleWorker, Payload{}); got.Pull != AnswerWork {
		t.Fatalf("the worker was not handed the token: %s %s", got.Pull, got.Notice)
	}
	ticked(t, r, tok.ID)
	if got := Pull(r, "worker-1", RoleWorker, Payload{ID: tok.ID}); got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}

	// PULLING AGAIN AS A WORKER FINDS NO DONE TOKEN OF ITS OWN.
	noDoneTokenOfItsOwn := func(when string) {
		t.Helper()
		got := Pull(r, "worker-1", RoleWorker, Payload{})
		if got.Pull == AnswerWork && got.Token.Status == "done" && got.Token.Author == "worker-1" {
			t.Fatalf("%s, the worker was handed its own done token %s, with the verdict's checklist", when, got.Token.ID)
		}
	}
	noDoneTokenOfItsOwn("straight after the submission")

	// AND AFTER NAMING IT AGAIN, the way se run --on does, which takes it up.
	//
	// IT CLAIMS AGAIN FIRST, because its own submission handed the claim back
	// with the hold. Naming it without one used to work on the claim it had
	// already finished with.
	if _, err := Claim(r, Claimant(r, "worker-1"), []string{tok.ID}, time.Now().UTC()); err != nil {
		t.Fatalf("the author claiming its own done token again: %v", err)
	}
	if _, err := TakeUp(r, tok.ID, "worker-1"); err != nil {
		t.Fatalf("naming the done token again: %v", err)
	}
	noDoneTokenOfItsOwn("after naming the token again")
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Holder != "" {
		t.Fatalf("the author still holds %s after the pull, so no reviewer can take it", tok.ID)
	}

	// A REVIEWER PULL BY THE AUTHOR HOLDING IT IS REFUSED, NAMING THE AUTHOR RULE.
	if _, err := TakeUp(r, tok.ID, "worker-1"); err != nil {
		t.Fatalf("naming the done token again: %v", err)
	}
	got := Pull(r, "worker-1", RoleReviewer, Payload{})
	if got.Pull != AnswerRefused || len(got.Findings) == 0 || got.Findings[0].Clause != "author" {
		t.Fatalf("the author's reviewer pull was answered %s %+v", got.Pull, got.Findings)
	}
	back, err = LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Holder != "" {
		t.Fatalf("the author still holds %s after the refusal, so no reviewer can take it", tok.ID)
	}
}

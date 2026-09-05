package main

import (
	"testing"
	"time"
)

// A SUBMISSION HANDS THE TOKEN ON, SO IT HANDS THE CLAIM BACK.
//
// MEASURED, working the verdict queue on 2026-09-05. Four tokens stood at done
// and every one was refused to the reviewer, each naming the worker who had
// already finished with it. A claim stands for three hours, so a verdict could
// not start for three hours after the work was submitted. The queue read empty
// while it was full, and two reviewers spent a session polling it.
func TestASubmittedTokenIsNotStillClaimed(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a verdict is owed")
	now := time.Now().UTC()

	// THE CLAIM IS PUT WHERE THE WORK IS DONE. The fixture claims as main, and
	// what this is about is the claimant and the submitter being one actor.
	if _, err := Release(r, Claimant(r, "main"), []string{tok.ID}, now); err != nil {
		t.Fatalf("releasing the fixture claim: %v", err)
	}
	if _, err := Claim(r, Claimant(r, "worker-1"), []string{tok.ID}, now); err != nil {
		t.Fatalf("claiming as the worker: %v", err)
	}

	ticked(t, r, tok.ID)
	if got := Pull(r, "worker-1", RoleWorker, Payload{ID: tok.ID}); got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}

	done, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if done.Status != "done" {
		t.Fatalf("the token stands at %q, and the work step ends at done", done.Status)
	}
	if done.ClaimedBy != "" {
		t.Errorf("it is still claimed by %q after that same actor submitted it", done.ClaimedBy)
	}

	// AND THE NEXT ACTOR CAN TAKE IT, which is the whole of what the claim was
	// standing in the way of.
	got, err := Claim(r, Claimant(r, "reviewer-1"), []string{tok.ID}, now)
	if err != nil {
		t.Fatalf("a reviewer claiming the token owing its verdict: %v", err)
	}
	if len(got.Taken) != 1 {
		t.Fatalf("the reviewer was refused the token owing its verdict: %+v", got)
	}
}

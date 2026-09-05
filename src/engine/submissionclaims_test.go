package main

import (
	"bytes"
	"context"
	"testing"
	"time"
)

// THE QUEUE CLAIMS WHAT IT HANDS OVER.
//
// A pull that submits answers with the next token, and that token arrived with
// no claim on it. It travels, so the first run or apply on it was refused: it
// travels, and this box holds no claim on it. The claim gate is the door that
// says a tracked token is not worked without a claim, and the queue was handing
// tokens straight through the wall it stands in.
func TestASubmissionHandsAClaimedToken(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-one"
	submitted := mintStandard(t, r, "the one submitted")
	next := mintUnclaimed(t, r, "the one handed on")
	if _, err := TakeUp(r, submitted.ID, actor); err != nil {
		t.Fatal(err)
	}
	ticked(t, r, submitted.ID)

	a := Pull(r, actor, RoleWorker, Payload{ID: submitted.ID})
	if a.Pull != AnswerWork || a.Token == nil {
		t.Fatalf("the submission answered %q and handed no work: %s", a.Pull, a.Notice)
	}
	if a.Token.ID != next.ID {
		t.Fatalf("the submission handed %s, and %s was the token waiting", a.Token.ID, next.ID)
	}
	if !ClaimedHere(r, a.Token.ClaimedBy) {
		t.Errorf("%s came back claimed by %q, so the next call on it is refused for want of a claim",
			a.Token.ID, a.Token.ClaimedBy)
	}
	if why := NoClaimHere(r, *a.Token, time.Now().UTC()); why != "" {
		t.Errorf("the gate refuses the token the queue just handed over: %s", why)
	}

	// AND THE COMMAND THAT FOLLOWS GOES THROUGH, which is what the agent does
	// next and what was refused.
	var out, said bytes.Buffer
	c := &call{ctx: context.Background(), roots: r,
		args: []string{"--on", a.Token.ID, "--by", actor, "--command", "echo one"},
		out:  &out, err: &said}
	if code := runRun(c); code != 0 {
		t.Fatalf("the run after the submission was refused: %s%s", said.String(), out.String())
	}
}

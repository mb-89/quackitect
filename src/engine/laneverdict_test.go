package main

import (
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
	"time"
)

// A SECOND NAME IN ONE SESSION IS NOT A SECOND EVALUATOR.
//
// MEASURED on a token in the record: the work step was claimed by f5927132/main
// and the queue handed the verdict to f5927132/reviewer-tallis-two, a helper
// the same session had spawned. The engine writes the author's name down and
// compares the name, so one session worked a token and the same session ruled
// on it, which is what reviewing.md rule 14 exists to stop.
//
// THE LANE IS THE SESSION, AND THE BOX IS BESIDE IT so a session id from
// another machine is another machine's. It is not the box alone: two sessions
// over one clone are two evaluators, this package drives the standard process
// that way, and staffing spawns reviewers beside the agent that works, so a
// guard on the box would refuse every verdict one machine can give. The last
// step here is that second session being handed the same token.
func TestTheLaneThatWorkedItIsRefusedTheVerdict(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	arrive(t, r, log, "s-one")
	lane := Box(r) + "/s-one"

	// THE WORK STEP IS CLAIMED AND DONE AS box/one.
	tok := mintUnclaimed(t, r, "one session, two names")
	claimAs(t, r, "one", tok.ID)
	if got := Pull(r, "one", RoleWorker, Payload{}); got.Pull != AnswerWork || got.Token.ID != tok.ID {
		t.Fatalf("the worker was not handed the token: %s %s", got.Pull, got.Notice)
	}
	ticked(t, r, tok.ID)
	if got := Pull(r, "one", RoleWorker, Payload{ID: tok.ID}); got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}
	done, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if done.WorkedIn != lane {
		t.Fatalf("the token says the work step was done in %q, and it was done in %q",
			done.WorkedIn, lane)
	}

	// AND THE VERDICT PULL AS box/two, IN THAT SAME LANE, IS HANDED NOTHING.
	claimAs(t, r, "two", tok.ID)
	got := Pull(r, "two", RoleReviewer, Payload{})
	if got.Pull == AnswerWork {
		t.Fatalf("a second name in the lane that worked it was handed the verdict: %+v", got.Token)
	}
	// AND THE ANSWER SAYS WHICH BOX WORKED IT, AND WHAT HAPPENS INSTEAD, so a
	// queue holding nothing for this lane does not read as an empty queue.
	for _, want := range []string{tok.ID, Box(r), "s-one", "another session", "wait"} {
		if !strings.Contains(got.Notice, want) {
			t.Errorf("the answer does not say %q: %s", want, got.Notice)
		}
	}

	// AND THE DOOR IS SHUT TOO, for a lane that took the token up by hand.
	if _, err := TakeUp(r, tok.ID, "two"); err != nil {
		t.Fatalf("taking the token up as two: %v", err)
	}
	ticked(t, r, tok.ID)
	shut := Pull(r, "two", RoleReviewer, Payload{ID: tok.ID, Disposition: "done"})
	if shut.Pull != AnswerRefused || len(shut.Findings) == 0 {
		t.Fatalf("the lane's own verdict was taken at the door: %s %s", shut.Pull, shut.Notice)
	}
	if !strings.Contains(shut.Findings[0].Wrong, Box(r)) {
		t.Errorf("the refusal does not say which box worked it: %+v", shut.Findings[0])
	}
	if back, err := LoadToken(r, tok.ID); err != nil || back.Ended() {
		t.Fatalf("the token closed on a verdict from the lane that worked it: %v %v", back.Disposition, err)
	}

	// AND ANOTHER SESSION ON THIS BOX IS HANDED IT, because two sessions are
	// two evaluators. Without this the guard reads as a reviewer being handed
	// nothing at all.
	if _, err := PutDown(r, tok.ID, "two"); err != nil {
		t.Fatalf("putting the token back: %v", err)
	}
	arrive(t, r, log, "s-two")
	if got := Pull(r, "two", RoleReviewer, Payload{}); got.Pull != AnswerWork || got.Token.ID != tok.ID {
		t.Fatalf("the other session was not handed the verdict: %s %s", got.Pull, got.Notice)
	}
}

// claimAs takes a token for one name on this box, and says so where the claim
// is refused, because a test that works an unclaimed tracked token is a test
// about a door it did not mean to open.
func claimAs(t *testing.T, r Roots, actor, id string) {
	t.Helper()
	res, err := Claim(r, Claimant(r, actor), []string{id}, time.Now().UTC())
	if err != nil {
		t.Fatalf("claiming %s as %s: %v", id, actor, err)
	}
	if len(res.Taken) != 1 {
		t.Fatalf("claiming %s as %s was refused: %+v", id, actor, res.Refused)
	}
}

package main

import "testing"

// WHAT IS ALREADY IN THE HAND GOES THROUGH THE SAME GATE AS WHAT IS NOT.
//
// The queue walks the tokens this actor already holds before anything else, so
// an agent that was interrupted gets its own token back rather than a second
// one. That path asked whether the step was theirs and whether sub-tokens were
// open, and nothing else. It did not ask Blocked and it did not ask
// WaitsForAPerson, which every other path in the same function asks.
//
// MEASURED: a token carrying needs_human was released and se claim --next
// handed it straight back inside a minute, because the claim asks the queue and
// the queue read it as work already in hand.
//
// A TOKEN WAITING ON A PERSON DOES NOT SIT IN AN AGENT'S HAND. So it is set
// back, the way a step that is not the agent's is set back, rather than passed
// over and left held where nobody can see it is stuck.
func TestAHeldTokenWaitingOnAPersonIsSetBack(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	mine := mintStandard(t, r, "held and parked")
	if _, err := TakeUp(r, mine.ID, "worker-held"); err != nil {
		t.Fatal(err)
	}
	held, err := LoadToken(r, mine.ID)
	if err != nil {
		t.Fatal(err)
	}
	if held.Holder != "worker-held" {
		t.Fatalf("the token was not taken up: holder is %q", held.Holder)
	}
	held.NeedsHuman = true
	if err := SaveToken(r, held); err != nil {
		t.Fatal(err)
	}

	got := Pull(r, "worker-held", RoleWorker, Payload{})
	if got.Pull == AnswerWork && got.Token != nil && got.Token.ID == mine.ID {
		t.Errorf("the queue handed back a held token that waits on a person: %s", mine.ID)
	}

	after, err := LoadToken(r, mine.ID)
	if err != nil {
		t.Fatal(err)
	}
	if after.Holder != "" {
		t.Errorf("it was left in the hand as %q, so nothing says it is stuck", after.Holder)
	}
}

// AND AN ORDINARY HELD TOKEN STILL COMES STRAIGHT BACK, which is what the fast
// path is for. An agent that pulled, was interrupted, and pulled again gets the
// same token rather than a second one.
func TestAnOrdinaryHeldTokenIsStillHandedBack(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	mine := mintStandard(t, r, "ordinary held work")
	if _, err := TakeUp(r, mine.ID, "worker-again"); err != nil {
		t.Fatal(err)
	}

	got := Pull(r, "worker-again", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token == nil {
		t.Fatalf("the queue did not hand back what the agent holds: %s %s", got.Pull, got.Notice)
	}
	if got.Token.ID != mine.ID {
		t.Errorf("the queue handed %s, wanted the held %s", got.Token.ID, mine.ID)
	}
}

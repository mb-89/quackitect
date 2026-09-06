package main

import (
	"strings"
	"testing"
)

// TAKING A TOKEN OFF THE QUEUE DOES NOT BIND YOU.
//
// THE OWNER'S WORDS: an unbound agent is not converted into a bound agent just
// because he takes something from the queue.
//
// An unbound agent may take work from the queue. It is not made to, and the
// queue does not choose for it, but it may name a token and take it. What must
// not happen is that doing so moves the rung underneath it.
//
// TRUE BY CONSTRUCTION IS NOT THE SAME AS HELD. SetBinding has three callers in
// the engine, and taking a token is none of them. The rung and the queue are
// read by different people at different times, and the next hand to add a
// convenience needs something telling them the rung is not theirs to move.
func TestTakingATokenNeverMovesTheRung(t *testing.T) {
	t.Parallel()
	for _, at := range []TheBinding{Unbound, God} {
		t.Run(string(at), func(t *testing.T) {
			r := aTreeWithTheProcesses(t)
			tok := mintStandard(t, r, "work to take")
			if _, err := SetBinding(r, at, "the owner"); err != nil {
				t.Fatal(err)
			}
			if got := LoadBinding(r).At; got != at {
				t.Fatalf("the rung did not start at %s but at %s, so this proves nothing", at, got)
			}

			const actor = "main"
			if _, err := TakeUp(r, tok.ID, actor); err != nil {
				t.Fatalf("a named token could not be taken at %s: %v", at, err)
			}
			// THE TAKE HAS TO HAVE WORKED, or a rung that did not move proves only
			// that nothing happened at all.
			if held := TheyHold(r, actor); len(held) == 0 {
				t.Fatalf("the token was taken and the actor holds nothing at %s", at)
			}

			if now := LoadBinding(r).At; now != at {
				t.Errorf("the rung moved from %s to %s on taking a token", at, now)
			}
		})
	}
}

// AND THE QUEUE STILL DOES NOT CHOOSE FOR AN UNBOUND AGENT.
//
// The two are different and the engine separates them. Being handed the next
// token is the queue choosing your work, and that is the thing unbinding turns
// off. Naming a token and taking it is you choosing, and that stays open.
//
// THE REFUSAL NAMES THE DOOR, so an agent that asks the queue is not left
// thinking the queue is closed to it.
func TestAnUnboundQueueHandsOutNothingAndSaysHow(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	mintStandard(t, r, "work to take")
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}

	got := Pull(r, "main", RoleWorker, Payload{})
	if got.Token != nil {
		t.Fatalf("the queue chose work for an unbound agent: %+v", got.Token)
	}
	if !strings.Contains(got.Notice, "--on") {
		t.Errorf("the refusal does not name the door that is open: %q", got.Notice)
	}
}

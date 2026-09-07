package main

import "testing"

// THE DEPTH IS WHAT A PULL WOULD HAND OUT, AND NOTHING ELSE.
//
// QueueDepth is what the panel draws beside the filter box, so a person filing
// into a bucket can watch it empty. It counted by a rule of its own, Ended and
// the private process, and the queue skips more than that: a token in another
// hand, a token Blocked answers for, and a token waiting on a person.
//
// SO A BUCKET HOLDING ONE PARKED TOKEN NEVER EMPTIED. The person watched a
// number that could not reach zero and waited for something that had already
// happened. On a cloud box that number is the only thing they can see.
//
// MEASURED in September 2026 on this tree with no filter: se status said 214
// open, of which 24 were parked and 25 were on a person, and the depth counted
// every one of them.
//
// THE FOUR SHAPES ARE HERE TOGETHER, because a depth that skips one and counts
// another is the same wrong number. Only the plain token is work a pull would
// hand out, so the depth is one.
func TestTheDepthCountsOnlyWhatAPullWouldHandOut(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	save := func(tok Token) {
		t.Helper()
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
	}

	plain := mintStandard(t, r, "ordinary work")

	parked := mintStandard(t, r, "waits for the owner")
	parked.ReadyWhen = "the owner takes the backlog conversation up again"
	save(parked)

	held := mintStandard(t, r, "already in a hand")
	held.Holder = "worker-other"
	save(held)

	blocked := mintStandard(t, r, "waits on another")
	blocked.DependsOn = []string{parked.ID}
	save(blocked)

	// THE FIXTURE IS THE FOUR SHAPES, OR THE COUNT BELOW DECIDES NOTHING. A
	// blocker that ended, or a ready_when the reader trims away, would leave
	// this asserting one over one workable token and passing on anything.
	if why := WaitsForAPerson(parked); why == "" {
		t.Fatal("the parked token reads as work an agent may take, so nothing here is parked")
	}
	back, err := LoadToken(r, blocked.ID)
	if err != nil {
		t.Fatal(err)
	}
	if why := Blocked(r, back); why == "" {
		t.Fatal("the blocked token is not blocked, so nothing here is blocked")
	}

	if got := QueueDepth(r); got != 1 {
		t.Errorf("the depth says %d over four tokens, and a pull would hand out one, %s",
			got, plain.ID)
	}
}

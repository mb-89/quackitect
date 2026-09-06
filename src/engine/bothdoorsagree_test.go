package main

import "testing"

// THE STOP GUARD AND THE PULL READ ONE QUEUE.
//
// MEASURED, September 2026, on a cloud box. se_pull answered wait, saying no new
// work goes out while a person has the work on finishing. se_stop with because
// blocked answered that the queue would hand over wk-1108f223d2, one of 176
// standing. One door said stop and the other called the stop a lie, so the
// agent had no legal move and pulling again answered the same wait.
//
// THE GUARD COUNTED ROWS. anOffer walked every token and asked only whether the
// role could work it. The pull asks more: the tree's binding, the hold a person
// pressed, the filter narrowing the queue to one bucket, and what the fetched
// branch has archived. WouldHandOut carries this lesson for the staffing count
// already, in its own comment. The stop judge never got it.
func TestBothDoorsAgreeWhileFinishing(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-quiet"
	mintStandard(t, r, "work the queue has")

	// WITH NO HOLD THE TWO AGREE THERE IS WORK, so what is proved below is
	// about the hold rather than about an empty tree.
	said := Pull(r, actor, RoleWorker, Payload{})
	if said.Token == nil {
		t.Fatalf("this proves nothing: the queue handed nothing over with no hold on: %s", said.Notice)
	}
	if _, err := PutDown(r, said.Token.ID, actor); err != nil {
		t.Fatal(err)
	}
	if _, lied := BlockedIsFalse(r, actor); !lied {
		t.Fatal("this proves nothing: the guard grants blocked while the queue has work")
	}

	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}

	// AND WITH THE HOLD ON, BOTH SAY THE SAME THING.
	if said := Pull(r, actor, RoleWorker, Payload{}); said.Token != nil {
		t.Fatalf("the queue handed out %s while a person is finishing up", said.Token.ID)
	}
	if refusal, lied := BlockedIsFalse(r, actor); lied {
		t.Fatalf("the pull hands out nothing and the guard calls blocked a lie: %s", refusal)
	}
}

// AND THEY AGREE ABOUT A NARROWED QUEUE.
//
// A person points a box at one bucket. The pull offers that bucket and the
// guard counted the whole tree, so a box that drained its bucket was told to
// pull a token the queue would never hand it.
func TestBothDoorsAgreeOnANarrowedQueue(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	const actor = "worker-narrowed"
	mintStandard(t, r, "alpha one")
	mintStandard(t, r, "beta one")

	// THE WIDE QUEUE IS THE CONTROL. Both doors see work here.
	if _, lied := BlockedIsFalse(r, actor); !lied {
		t.Fatal("this proves nothing: the guard grants blocked over an unfiltered queue with work")
	}

	setFilter(t, r, "title: nothingatall")
	if got := QueueDepth(r); got != 0 {
		t.Fatalf("the filter left %d of two, so nothing here is about the filter", got)
	}
	if said := Pull(r, actor, RoleWorker, Payload{}); said.Token != nil {
		t.Fatalf("the queue handed out %s, which the filter excludes", said.Token.ID)
	}
	if refusal, lied := BlockedIsFalse(r, actor); lied {
		t.Fatalf("the filter empties the queue and the guard calls blocked a lie: %s", refusal)
	}
}

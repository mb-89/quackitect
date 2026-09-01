package main

import (
	"strings"
	"testing"
)

// A NUDGE ON THE WAY UP, ONCE PER STEP, AND DECLINING IS FINE.
//
// THE OWNER'S SHAPE: when three tokens are open where the walker is and none is
// in work, the engine says how about you spawn a subagent. At six it says it
// again. At nine again. Once each.
//
// IT IS A NUDGE AND NOT A REFUSAL. Sometimes work does not split, and declining
// is a legitimate answer, so nothing is refused and nothing has to be claimed.
func TestANudgeArrivesAtEachStepOnTheWayUp(t *testing.T) {
	r := lane(t)
	if len(NudgeSteps) == 0 {
		t.Fatal("there are no steps, so this guards nothing")
	}
	said := ""
	for i := 1; i <= NudgeSteps[len(NudgeSteps)-1]; i++ {
		mint(t, r, Token{Title: "one of many", Status: ImpOpen})
		got := Nudge(r, "main", RoleWorker)
		wanted := false
		for _, step := range NudgeSteps {
			if i == step {
				wanted = true
			}
		}
		if wanted && got == "" {
			t.Errorf("nothing was said at %d open, and %v are the steps", i, NudgeSteps)
		}
		if !wanted && got != "" {
			t.Errorf("something was said at %d open, which is not a step: %q", i, got)
		}
		if got != "" {
			said = got
		}
	}
	// IT SAYS WHAT TO DO AND HOW MANY THERE ARE, because a nudge that says
	// neither is a sentence an agent reads past.
	if !strings.Contains(said, "subagent") {
		t.Errorf("the nudge does not say what to do: %q", said)
	}
	if !strings.Contains(said, "9") {
		t.Errorf("the nudge does not say how many are open: %q", said)
	}
}

// ONCE PER STEP, so a queue sitting at seven does not nudge on every pull.
func TestANudgeIsSaidOncePerStep(t *testing.T) {
	r := lane(t)
	for i := 0; i < NudgeSteps[0]; i++ {
		mint(t, r, Token{Title: "one of many", Status: ImpOpen})
	}
	if Nudge(r, "main", RoleWorker) == "" {
		t.Fatalf("nothing was said at %d open", NudgeSteps[0])
	}
	for i := 0; i < 5; i++ {
		if got := Nudge(r, "main", RoleWorker); got != "" {
			t.Fatalf("it said it again at the same step: %q", got)
		}
	}
}

// AND IT FORGETS A STEP THE COUNT FALLS BELOW, so a queue that empties and
// fills again is nudged again. Only on the way up.
func TestAQueueThatEmptiesIsNudgedAgain(t *testing.T) {
	r := lane(t)
	var made []Token
	for i := 0; i < NudgeSteps[0]; i++ {
		made = append(made, mint(t, r, Token{Title: "one of many", Status: ImpOpen}))
	}
	if Nudge(r, "main", RoleWorker) == "" {
		t.Fatal("nothing was said the first time")
	}
	// The queue drains.
	for _, tok := range made {
		if _, err := Abort(r, tok.ID, "the queue drained", "person"); err != nil {
			t.Fatal(err)
		}
	}
	if got := Nudge(r, "main", RoleWorker); got != "" {
		t.Fatalf("an empty queue was nudged: %q", got)
	}
	// And it fills again.
	for i := 0; i < NudgeSteps[0]; i++ {
		mint(t, r, Token{Title: "one of many", Status: ImpOpen})
	}
	if Nudge(r, "main", RoleWorker) == "" {
		t.Fatal("a queue that emptied and filled again was not nudged")
	}
}

// NOTHING IS SAID WHILE SOMETHING IS IN WORK. The nudge is about a queue nobody
// is working, and an agent already holding one is working it.
func TestNothingIsSaidWhileSomethingIsInWork(t *testing.T) {
	r := lane(t)
	for i := 0; i < NudgeSteps[0]; i++ {
		mint(t, r, Token{Title: "one of many", Status: ImpOpen})
	}
	held := mint(t, r, Token{Title: "the one in hand", Status: ImpInWork})
	held.Holder = "main"
	if err := SaveToken(r, held); err != nil {
		t.Fatal(err)
	}
	if got := Nudge(r, "main", RoleWorker); got != "" {
		t.Fatalf("an agent with work in hand was nudged: %q", got)
	}
}

// THE REVIEWER'S QUEUE IS THE SAME MECHANISM AND A DIFFERENT COUNT: work
// waiting for a reviewer, with nothing in review.
func TestTheReviewerIsNudgedOnItsOwnQueue(t *testing.T) {
	r := lane(t)
	for i := 0; i < NudgeSteps[0]; i++ {
		tok := mint(t, r, Token{Title: "one submitted", Status: ImpSubmitted})
		_ = tok
	}
	if got := Nudge(r, "main", RoleWorker); got != "" {
		t.Fatalf("a worker was nudged about the reviewer's queue: %q", got)
	}
	said := Nudge(r, "rev", RoleReviewer)
	if said == "" {
		t.Fatalf("nothing was said with %d waiting for a reviewer", NudgeSteps[0])
	}
	if !strings.Contains(said, "reviewer") {
		t.Errorf("the nudge does not say what to do: %q", said)
	}
	// AND NOTHING WHILE ONE IS IN REVIEW.
	all := Tokens(r)
	all[0].Status, all[0].Holder = ImpInReview, "rev"
	if err := SaveToken(r, all[0]); err != nil {
		t.Fatal(err)
	}
	// A fresh step, so this is not the once-per-step rule answering.
	for i := 0; i < NudgeSteps[1]-NudgeSteps[0]; i++ {
		mint(t, r, Token{Title: "one submitted", Status: ImpSubmitted})
	}
	if got := Nudge(r, "rev", RoleReviewer); got != "" {
		t.Fatalf("a reviewer already reading was nudged: %q", got)
	}
}

// THE TWO QUEUES ARE COUNTED APART. One nudged at its step must not spend the
// other's, which is the same reason the obligation store is keyed by actor.
func TestTheTwoQueuesAreCountedApart(t *testing.T) {
	r := lane(t)
	for i := 0; i < NudgeSteps[0]; i++ {
		mint(t, r, Token{Title: "one of many", Status: ImpOpen})
		mint(t, r, Token{Title: "one submitted", Status: ImpSubmitted})
	}
	if Nudge(r, "main", RoleWorker) == "" {
		t.Fatal("the worker was not nudged")
	}
	if Nudge(r, "rev", RoleReviewer) == "" {
		t.Fatal("the reviewer's nudge was spent by the worker's")
	}
}

// AND IT RIDES ON THE PULL, because that is the one thing every agent calls.
// A fact delivered is worth more than a fact an agent is told to go and find.
func TestTheNudgeRidesOnThePull(t *testing.T) {
	r := lane(t)
	for i := 0; i < NudgeSteps[0]; i++ {
		mint(t, r, Token{Title: "one of many", Status: ImpOpen})
	}
	a := Pull(r, "main", RoleWorker, Payload{})
	if !strings.Contains(a.Notice, "subagent") {
		t.Fatalf("the pull said nothing about a queue of %d: %q", NudgeSteps[0], a.Notice)
	}
	// And the answer is still the work, because a nudge refuses nothing.
	if a.Pull != AnswerWork {
		t.Fatalf("the nudge changed the answer to %q", a.Pull)
	}
}

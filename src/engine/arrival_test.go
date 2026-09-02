package main

import "testing"

// A RECLAIM KNOWS BOTH HALVES OF THE MACHINE.
//
// FOUR STATES ARE HELD BY SOMEBODY. Two of them are a spec being drafted and a
// spec being reviewed, and the reclaim answered for neither, so a drafter or a
// spec reviewer that died holding one stranded it for good.
//
// MEASURED ON THE TREE: wk-2b78b911b1 sat spec_in_review, held by a reviewer
// that had been stopped, and nothing in the engine could return it.
func TestAReclaimReachesEveryHeldState(t *testing.T) {
	for _, at := range []struct {
		held, back Status
		role       string
	}{
		{SpecInWork, SpecOpen, RoleWorker},
		{SpecInReview, SpecSubmitted, RoleReviewer},
		{ImpInWork, ImpOpen, RoleWorker},
		{ImpInReview, ImpSubmitted, RoleReviewer},
	} {
		r := lane(t)
		tok := mint(t, r, Token{Title: "held and returned"})
		// THE HOLDER IS THE ACTOR THAT ARRIVES, which is the case a reclaim is
		// for: a process died and came back, and its own work is returned to it.
		// It used to be somebody else, and a reviewer took back ANY token: with
		// fifteen reviewers running that meant every arrival stole the token out
		// of the hands of one mid-review, and three of them lost whole reviews to
		// it in an afternoon. A reviewer now takes back its own and a dead
		// holder's, and this drives the first of those two.
		tok.Status, tok.Holder = at.held, "main"
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
		Reclaim(r, "main", at.role)
		now, err := LoadToken(r, tok.ID)
		if err != nil {
			t.Fatal(err)
		}
		if now.Status != at.back {
			t.Errorf("a token left at %s came back as %s, and it should be %s",
				at.held, now.Status, at.back)
		}
		if now.Holder != "" {
			t.Errorf("a token reclaimed from %s is still held by %q", at.held, now.Holder)
		}
	}
}

// WHICH STATES A PULL HANDS OUT IS THE ENGINE'S ANSWER, IN ONE PLACE.
//
// IT WAS WRITTEN OUT THREE TIMES IN THREE SHAPES. pull.go tests a token for
// spec_open or spec_in_work where it picks a draft. nudge.go's countQueue
// writes the whole set again, both halves, for both roles. And a view file
// typed two of them into a filter. Nothing said they were one set, so a twelfth
// state would have joined some of them and not others.
//
// THE VIEW ASKS THE ENGINE RATHER THAN REPEATING IT, which is what a token
// about a typed list standing in for a set needs to be able to do.
func TestTheStatesAPullHandsOutAreOneAnswer(t *testing.T) {
	for role, want := range map[string][]Status{
		RoleWorker:   {ImpOpen, SpecOpen},
		RoleReviewer: {ImpSubmitted, SpecSubmitted},
	} {
		got := HandedOut(role)
		if len(got) != len(want) {
			t.Fatalf("%s is handed %v and it should be %v", role, got, want)
		}
		for _, one := range want {
			if !containsStatus(got, one) {
				t.Errorf("%s is handed %v, which leaves out %s", role, got, one)
			}
		}
	}
	// AND WHAT SOMEBODY HOLDS IS THE OTHER HALF, so the two answers together
	// are every state an actor can be in on a queue.
	for role, want := range map[string][]Status{
		RoleWorker:   {ImpInWork, SpecInWork},
		RoleReviewer: {ImpInReview, SpecInReview},
	} {
		got := HeldBy(role)
		if len(got) != len(want) {
			t.Fatalf("%s holds %v and it should be %v", role, got, want)
		}
	}
	// AND NOTHING IS IN BOTH, because a state a pull hands out and a state
	// somebody already holds are different things to be in.
	for _, role := range []string{RoleWorker, RoleReviewer} {
		for _, one := range HandedOut(role) {
			if containsStatus(HeldBy(role), one) {
				t.Errorf("%s is both handed out and held for %s", one, role)
			}
		}
	}
}

// AN ARRIVING REVIEWER DOES NOT TAKE THE TOKEN OUT OF A LIVE REVIEWER'S HANDS.
//
// Reclaim ran on every arrival and its comment said a reviewer takes back ANY,
// because a review belongs to whichever reviewer is here now. That was written
// when one reviewer ran at a time.
//
// MEASURED, BY THE REVIEWERS IT ROBBED. With fifteen running, three reported the
// same thing in one afternoon: one reviewed four tokens fully and lost every one
// mid-verdict, one had a rejection ready and was told a newer reviewer holds this
// sphere, and one was cut off partway through and could not even send its verdict,
// because losing the token closes the write gate and a verdict goes in on a pipe.
// Every one of those reviews was work done and thrown away.
//
// THE ENGINE ALREADY KNOWS THE DIFFERENCE. StillPulling is what the investigate
// answer is built on and what the reviewer refusal uses. Reclaim was the one
// place that did not ask.
func TestAnArrivingReviewerLeavesALiveReviewersToken(t *testing.T) {
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: ImpOpen})
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID, Disposition: "done"}); done {
		t.Fatal("the submission was refused")
	}
	if got := next(r, "rev-live", RoleReviewer); got.Pull != AnswerReview {
		t.Fatalf("the first reviewer was handed nothing: %+v", got)
	}
	// A SECOND REVIEWER ARRIVES while the first is still pulling.
	Reclaim(r, "rev-new", RoleReviewer)

	got, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Holder != "rev-live" || got.Status != ImpInReview {
		t.Errorf("an arriving reviewer took a live reviewer's token: it is %s held by %q",
			got.Status, got.Holder)
	}

	// AND A REVIEWER STILL TAKES BACK ITS OWN, which is what the reclaim is for:
	// an agent whose process died and came back gets its own work returned.
	if back := Reclaim(r, "rev-live", RoleReviewer); len(back) == 0 {
		t.Error("a reviewer arriving again did not take back what it was holding")
	}
	if got, err := LoadToken(r, one.ID); err != nil {
		t.Fatal(err)
	} else if got.Status != ImpSubmitted || got.Holder != "" {
		t.Errorf("its own token came back as %s held by %q", got.Status, got.Holder)
	}
}

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
		tok := mint(t, r, Token{Title: "held by somebody gone"})
		tok.Status, tok.Holder = at.held, "gone"
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

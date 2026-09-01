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

package main

import (
	"strings"
	"testing"
)

// THE REVIEWER STAYS. The engine's own wait answer used to end with an order
// to stop, so every reviewer despawned the moment the queue was empty and the
// next submission found nobody. The answer now tells it to stay, the queue
// feeds the one who stayed, and the spawn ask under a submission is keyed on
// whether anybody is reading rather than said every time. wk-890febfb99.

// A REVIEWER WITH NOTHING WAITING IS TOLD TO STAY, NOT TO STOP. The fixture
// quotes the forbidden sentence in its plain spelling to assert its absence,
// which is why the criterion's search excepts test files.
func TestAReviewerWithNothingWaitingIsToldToStay(t *testing.T) {
	r := guidanceTree(t)
	a := Pull(r, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerWait {
		t.Fatalf("an empty queue answered %q", a.Pull)
	}
	if !strings.Contains(a.Notice, "Stay") {
		t.Fatalf("the wait answer does not tell the reviewer to stay: %q", a.Notice)
	}
	if strings.Contains(a.Notice, "Say so and stop") {
		t.Fatalf("the despawn order is still in the answer: %q", a.Notice)
	}
}

// A STAYING REVIEWER GETS THE NEXT SUBMISSION, because staying is only worth
// anything if the queue feeds the one who stayed.
func TestAStayingReviewerGetsTheNextSubmission(t *testing.T) {
	r := guidanceTree(t)
	// THE FIRST HALF IS THE STAY ITSELF: the reviewer is told to stay, which
	// is what makes the second half a reviewer that stayed rather than one
	// that happened to pull twice.
	if a := Pull(r, "rev", RoleReviewer, Payload{}); a.Pull != AnswerWait ||
		!strings.Contains(a.Notice, "Stay") {
		t.Fatalf("the empty queue did not answer a stay: %q %q", a.Pull, a.Notice)
	}
	tok, err := Mint(r, Token{Title: "the submitted thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	a := Pull(r, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerReview {
		t.Fatalf("the reviewer that stayed was not fed: %q %s", a.Pull, a.Notice)
	}
}

// THE SPAWN ASK IS KEYED ON LIVENESS, BOTH DIRECTIONS OVER THE SAME WORDING.
// A submission with nobody reading is answered with the ask by name, and one
// with a live reader carries no ask at all, so the line means something when
// it appears. Live is the readers count of deadReads, which is why the second
// direction takes a reviewer holding a review.
func TestTheSpawnAskIsKeyedOnLiveness(t *testing.T) {
	// NO READER: the submitter is told no reviewer is reading, spawn one now.
	r := guidanceTree(t)
	one, err := Mint(r, Token{Title: "the first thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	a := Pull(r, "main", RoleWorker, Payload{ID: one.ID, Disposition: "done"})
	if a.Pull != AnswerWait {
		t.Fatalf("the lone submission did not answer wait: %q %s", a.Pull, a.Notice)
	}
	if !strings.Contains(a.Notice, "no reviewer is reading") ||
		!strings.Contains(a.Notice, "Spawn one now") {
		t.Fatalf("nobody is reading and the answer does not ask by name: %q", a.Notice)
	}

	// A LIVE READER: the same submission shape carries no spawn ask.
	r2 := guidanceTree(t)
	first, err := Mint(r2, Token{Title: "the read thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	second, err := Mint(r2, Token{Title: "the next thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r2, "main", RoleWorker, Payload{})
	Pull(r2, "main", RoleWorker, Payload{ID: first.ID, Disposition: "done"})
	if rev := Pull(r2, "rev", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was not handed the first submission: %q", rev.Pull)
	}
	Pull(r2, "main", RoleWorker, Payload{})
	b := Pull(r2, "main", RoleWorker, Payload{ID: second.ID, Disposition: "done"})
	if b.Pull != AnswerWait {
		t.Fatalf("the second submission did not answer wait: %q %s", b.Pull, b.Notice)
	}
	if strings.Contains(b.Notice, "Spawn") {
		t.Fatalf("a reviewer is reading and the answer still asks for one: %q", b.Notice)
	}
}

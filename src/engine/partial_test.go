package main

import (
	"strings"
	"testing"
)

// A REDRAFT ANSWERS EVERY STANDING FINDING, NOT ONLY THE CHEAPEST. The
// fingerprint guard asks whether anything changed, and one changed character
// bought a redraft that answered nothing else: the founding case gave one
// criterion its own test and left two findings standing, and it reached a
// reviewer. So the draft path now asks the same question the implementation
// path asks, per finding, by name, and the answers land on the note.
func TestAPartialRedraftIsRefusedByName(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "the probe", Assignee: "main", Status: SpecOpen,
		Detail: "a problem worth stating",
		Criteria: []Criterion{
			{Says: "one thing holds", Runs: "exit 1"},
			{Says: "another thing holds", Runs: "exit 1"}}})

	// Draft it and send it to review.
	if _, done := settle(r, "main", RoleWorker, Payload{ID: tok.ID}); done {
		t.Fatal("the draft was refused")
	}
	// A reviewer rejects it with THREE findings, the lesson minted the way a
	// reviewer mints one.
	learned := mint(t, r, Token{Title: "learned: the class", Status: Backlogged})
	if a, _ := settle(r, "rev", RoleReviewer, takeForReview(t, r, tok.ID, Payload{
		Verdict: "reject",
		Findings: []Rejection{
			{Clause: "one", Wrong: "w1", Satisfies: "s1"},
			{Clause: "two", Wrong: "w2", Satisfies: "s2"},
			{Clause: "three", Wrong: "w3", Satisfies: "s3"}},
		Lesson:  Lesson{Class: "a class", Avoid: "instead", Prevents: "before"},
		Learned: learned.ID})); a.Pull == AnswerRefused {
		t.Fatalf("the rejection itself was refused: %+v", a.Findings)
	}

	// THE FOUNDING CASE: change ONE criterion's runs and resubmit with no
	// answers. The fingerprint moved, so the old guard is silent, and the
	// refusal has to come from the per-finding question, naming what went
	// unanswered.
	after, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Criteria[0].Runs = "exit 3"
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}
	a, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID})
	if a.Pull != AnswerRefused || len(a.Findings) == 0 {
		t.Fatalf("a redraft answering none of three findings reached a reviewer: %s", a.Pull)
	}
	said := a.Findings[0].Wrong
	if !strings.Contains(said, "finding 1") || !strings.Contains(said, "finding 3") {
		t.Fatalf("the refusal does not name the unanswered findings: %s", said)
	}

	// WITH EVERY FINDING ANSWERED THE REDRAFT GOES THROUGH, and the answers
	// land on the note, read back whole.
	a, _ = settle(r, "main", RoleWorker, Payload{ID: tok.ID, Evidence: map[string]string{
		"finding 1": "closed by the new runs",
		"finding 2": "not taken, and this names what owes it",
		"finding 3": "closed in the detail"}})
	if a.Pull == AnswerRefused {
		t.Fatalf("a redraft answering all three was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != SpecSubmitted {
		t.Fatalf("the answered redraft did not reach review: %s", back.Status)
	}
	if back.Findings[1].Answer != "not taken, and this names what owes it" {
		t.Fatalf("the drafter's answer did not land on the note: %q", back.Findings[1].Answer)
	}
}

// takeForReview pulls the submission into the reviewer's hands and returns the
// verdict payload with the id set, so the settle above judges the right token.
func takeForReview(t *testing.T, r Roots, id string, p Payload) Payload {
	t.Helper()
	a := Pull(r, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token == nil || a.Token.ID != id {
		t.Fatalf("the reviewer was not handed %s: %s %v", id, a.Pull, a.Token)
	}
	p.ID = id
	return p
}

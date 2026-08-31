package main

import (
	"strings"
	"testing"
)

// A REJECTION NAMES THE TOKEN THE REVIEWER MINTED FOR THE LESSON.
//
// A lesson is a judgment. Which class a finding belongs to, whether a second
// round is a new class or the one already written down, and whether it goes to
// the backlog or straight into what is open, are all things somebody reading
// the two decides. The engine cannot, and matching on the words would be a
// word list fitted to the cases already seen.
//
// SO THE ENGINE'S PART IS THE REFUSAL. A rejection carries the id, the engine
// checks that the id is a token, and one naming none is refused the way one
// with no finding is.
func TestARejectionNamesTheLessonsToken(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})

	const class = "a check built from the fix, which cannot go red"
	lesson := Lesson{Class: class, Avoid: "write the check first and watch it go red"}
	findings := []Rejection{{Clause: "the check", Wrong: "it cannot fail",
		Satisfies: "one that was watched failing"}}

	// NAMING NOTHING IS REFUSED.
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson})
	if a.Pull != AnswerRefused {
		t.Fatalf("a rejection that minted nothing was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong+a.Findings[0].Satisfies, "mint") {
		t.Fatalf("the refusal does not say what to do: %+v", a.Findings)
	}

	// AND SO IS NAMING SOMETHING THAT IS NOT A TOKEN.
	a = Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson, Learned: "wk-nothing"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a rejection naming a token nobody minted was accepted: %s", a.Pull)
	}

	// A REJECTION THAT NAMES ONE IS ACCEPTED, and the id is on the lesson.
	learned := mint(t, r, Token{Title: "learned: a check", Status: Backlogged,
		Detail: "THE CLASS: " + class})
	a = Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: findings, Lesson: lesson, Learned: learned.ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("a whole rejection was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if n := len(back.Lessons); n != 1 {
		t.Fatalf("the token carries %d lessons", n)
	}
	if back.Lessons[0].Learned != learned.ID {
		t.Fatalf("the lesson names %q rather than the token that was minted", back.Lessons[0].Learned)
	}
	// AND THE REVIEWER DECIDED WHERE IT GOES. The engine did not touch it.
	still, _ := LoadToken(r, learned.ID)
	if still.Status != Backlogged {
		t.Fatalf("the engine moved the reviewer's token to %s", still.Status)
	}
}

// learnedFrom mints the token a reviewer would mint for a lesson, so a test
// sending a rejection sends a whole one.
func learnedFrom(t *testing.T, r Roots, l Lesson) string {
	t.Helper()
	made, err := Mint(r, Token{Title: "learned: a class", Status: Backlogged,
		Detail: "THE CLASS: " + l.Class, Assignee: "main", MintedBy: "rev"})
	if err != nil {
		t.Fatal(err)
	}
	return made.ID
}

package main

import (
	"strings"
	"testing"
)

// A LESSON SAYS WHAT WOULD HAVE PREVENTED THE MISTAKE, NOT ONLY WHAT WOULD
// HAVE CAUGHT IT.
//
// THE OWNER'S WORDS: I do not only want the reviewer to tell us how we can find
// the mistakes in the future. I want the reviewer to write guidance on how to
// avoid them in the first place. What would have helped to just not make that
// mistake?
//
// TWO HALVES AND ONE FIELD HELD ONLY ONE. avoid is nearly always detection: run
// the sweep, follow the citation, put the defect back. That is read by somebody
// already suspicious. A prevention is read by somebody who has not started, and
// it has to be short enough to remember at the moment of writing rather than at
// the moment of reviewing.
//
// A FIELD RATHER THAN A LONGER SENTENCE, because the engine can refuse a
// missing field and cannot refuse a sentence that covers half of what it
// should.
func TestALessonCarriesWhatWouldHavePreventedIt(t *testing.T) {
	r := lane(t)
	tok := aRejectableToken(t, r)
	lesson := Lesson{
		Class:    "a check built from the fix, which cannot go red",
		Avoid:    "put the defect back and watch the check name it",
		Prevents: "write the check before the work and watch it red once",
	}
	learned := mint(t, r, Token{Title: "learned: a check", Status: Backlogged})
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: aFinding(), Lesson: lesson, Learned: learned.ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("a rejection carrying all three halves was refused: %v", a.Findings)
	}
	now, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(now.Lessons) == 0 {
		t.Fatal("the lesson did not land on the token")
	}
	// READ BACK WHOLE, because a field the note writes and cuts is the
	// failure wk-24be1c06ae exists for.
	if now.Lessons[0].Prevents != lesson.Prevents {
		t.Fatalf("what would have prevented it came back as %q", now.Lessons[0].Prevents)
	}
}

// AND A REJECTION THAT LEAVES IT EMPTY IS REFUSED, because a rule the engine
// refuses is a rule that holds where a rule a reviewer remembers lasts until
// the round somebody is tired.
func TestARejectionWithoutAPreventionIsRefused(t *testing.T) {
	r := lane(t)
	tok := aRejectableToken(t, r)
	learned := mint(t, r, Token{Title: "learned: a check", Status: Backlogged})
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: aFinding(), Learned: learned.ID,
		Lesson: Lesson{Class: "a check built from the fix",
			Avoid: "put the defect back and watch the check name it"}})
	if a.Pull != AnswerRefused {
		t.Fatalf("a lesson with no prevention was accepted: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "prevented") {
		t.Fatalf("the refusal does not say what is missing: %+v", a.Findings)
	}
	// AND IT SAYS WHAT BELONGS THERE, so a reviewer who has written a way to
	// catch the mistake can tell that a way to avoid it is what is wanted.
	if !strings.Contains(a.Findings[0].Satisfies, "before") {
		t.Fatalf("the refusal does not say what belongs in it: %q", a.Findings[0].Satisfies)
	}
}

// THE REFUSAL IS ASSERTED ON WHAT ONLY IT CAN SAY.
//
// IT STANDS IN A LINE WITH THREE OTHERS: no finding, no lesson, a lesson naming
// no token. A case asking only whether the call was refused passes with any of
// them deleted, which is the class this queue has rejected work over three
// times.
//
// SO THE CASE DELETES THIS ONE AND LEAVES THE OTHERS STANDING, by sending a
// rejection whole in every other respect and requiring it through.
func TestOnlyThePreventionRefusalCanSayIt(t *testing.T) {
	r := lane(t)
	tok := aRejectableToken(t, r)
	learned := mint(t, r, Token{Title: "learned: a check", Status: Backlogged})
	whole := Lesson{Class: "a check built from the fix",
		Avoid:    "put the defect back and watch the check name it",
		Prevents: "write the check before the work and watch it red once"}

	// WITH EVERY OTHER REFUSAL SATISFIED, the rejection goes through. If it
	// did not, this test would be passing on somebody else's refusal.
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: aFinding(), Lesson: whole, Learned: learned.ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("a whole rejection was refused, so this cannot tell which refusal fired: %v",
			a.Findings)
	}

	// AND THE PREVENTION IS THE ONLY THING TAKEN AWAY.
	other := aRejectableToken(t, r)
	short := whole
	short.Prevents = ""
	a = Pull(r, "rev", RoleReviewer, Payload{ID: other.ID, Verdict: "reject",
		Findings: aFinding(), Lesson: short, Learned: learned.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("the prevention was taken away and nothing refused it: %s", a.Pull)
	}
	if len(a.Findings) == 0 || !strings.Contains(a.Findings[0].Wrong, "prevented") {
		t.Fatalf("something other than the prevention refusal fired: %+v", a.Findings)
	}
}

// AND IT RIDES WITH A REVIEW PULL, so a reviewer reads the new half without
// being told. READ OUT OF THE ANSWER AND NOT OFF DISK, because what a reviewer
// is handed is the thing this claim is about.
func TestTheReviewMethodRidesWithAReview(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	a := Pull(r, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerReview {
		t.Fatalf("the reviewer got %q", a.Pull)
	}
	if !strings.Contains(a.Guidance, "Reviewing") {
		t.Fatalf("the method for reviewing did not ride with the review: %q",
			firstLines(a.Guidance, 2))
	}
}

// A TOKEN A REVIEWER CAN REJECT, built the way the queue builds one.
func aRejectableToken(t *testing.T, r Roots) Token {
	t.Helper()
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})
	return tok
}

func aFinding() []Rejection {
	return []Rejection{{Clause: "the check", Wrong: "it cannot fail",
		Satisfies: "one that was watched failing"}}
}

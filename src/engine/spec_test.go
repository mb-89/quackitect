package main

import (
	"strings"
	"testing"
)

func aSpec(t *testing.T, r Roots, title string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Title: title, Assignee: "main", Scope: SingleStep,
		Status: SpecOpen, Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{{Says: "the suite passes", Runs: "exit 1"}}})
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

// A TOKEN CARRIES WHAT DONE MEANS BEFORE ANYBODY WORKS ON IT. The reviewer kept
// telling the worker it had not done the work, and that is a fault in the token.
func TestADraftIsAgreedBeforeTheWorkStarts(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")

	// A DRAFT IS HANDED TO ITS DRAFTER, WITH THE METHOD, and it is not work
	// yet: the notice says to draft it rather than to do it. Nothing else will
	// draft it, so leaving it out of the queue meant remembering it.
	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWork || a.Token.ID != tok.ID {
		t.Fatalf("the draft was not handed to its drafter: %q", a.Pull)
	}
	if !strings.Contains(a.Notice, "DRAFT THIS BEFORE ANYBODY WORKS ON IT") {
		t.Fatalf("the notice does not say to draft it: %q", a.Notice)
	}
	if !strings.Contains(a.Guidance, "Work token") {
		t.Fatalf("the method for drafting did not ride with it: %q", firstLines(a.Guidance, 2))
	}
	// HANDING IT OUT IS WHAT MAKES IT IN WORK. A draft nobody had touched and
	// one somebody was writing used to be the same state.
	if now, _ := LoadToken(r, tok.ID); now.Status != SpecInWork {
		t.Fatalf("a draft handed to its drafter is %s", now.Status)
	}
	// The worker sends the draft to review.
	if a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID}); a.Pull == AnswerRefused {
		t.Fatalf("the draft was refused: %v", a.Findings)
	}
	// SUBMITTED IS WHERE A QUEUE IS COUNTED. A draft went from the drafter's
	// hands straight into a reviewer's with no state in between.
	if now, _ := LoadToken(r, tok.ID); now.Status != SpecSubmitted {
		t.Fatalf("a draft the drafter sent is %s", now.Status)
	}

	// A reviewer agrees it, and only then is it work.
	rev := Pull(r, "reviewer", RoleReviewer, Payload{})
	if rev.Pull != AnswerReview || rev.Token.ID != tok.ID {
		t.Fatalf("the reviewer got %q", rev.Pull)
	}
	// And a reviewer taking it is what makes it in review.
	if now, _ := LoadToken(r, tok.ID); now.Status != SpecInReview {
		t.Fatalf("a draft a reviewer took is %s", now.Status)
	}
	Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if now, _ := LoadToken(r, tok.ID); now.Status != ImpOpen {
		t.Fatalf("an agreed draft is %s rather than open", now.Status)
	}
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork || a.Token.ID != tok.ID {
		t.Fatalf("an agreed draft is not work: %q", a.Pull)
	}
}

// A SPEC WITH NO CRITERIA CANNOT GO TO REVIEW. A spec that says nothing about
// done is the thing this whole state exists to stop.
func TestADraftWithNoCriteriaIsRefused(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "a thing to build", Assignee: "main",
		Scope: SingleStep, Status: SpecOpen, Detail: "what the problem is", MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID})
	if a.Pull != AnswerRefused {
		t.Fatalf("a spec with no criteria went to review: %q", a.Pull)
	}
	if !strings.Contains(a.Findings[0].Wrong, "what done means") {
		t.Fatalf("the refusal does not say why: %v", a.Findings[0])
	}
}

// THE WORKER RUNS THE CRITERIA BEFORE SUBMITTING. Asking the reviewer to find
// out is what this replaces.
func TestASubmissionThatMeetsNoCriterionIsRefused(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "a thing to build", Assignee: "main",
		Scope: SingleStep, Detail: "what the problem is", MintedBy: "person",
		Criteria: []Criterion{
			{Says: "the suite passes", Runs: "exit 3"},
			{Says: "somebody read it"},
		}})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if a.Pull != AnswerRefused {
		t.Fatalf("a submission meeting nothing was accepted: %q", a.Pull)
	}
	said := a.Findings[0].Wrong
	if !strings.Contains(said, "the suite passes") {
		t.Fatalf("it does not name the command that failed: %s", said)
	}
	if !strings.Contains(said, "somebody read it") {
		t.Fatalf("it does not name the criterion nobody answered: %s", said)
	}

	// Meeting them lets it through: the command passes and the other is
	// answered by name in the evidence.
	tok.Criteria[0].Runs = "exit 0"
	tok.Criteria[0].Without, tok.Criteria[0].Red = "the suite", "it said no such suite"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	a = Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done",
		Evidence: map[string]string{"somebody read it": "I read it"}})
	if a.Pull == AnswerRefused {
		t.Fatalf("a submission meeting every criterion was refused: %v", a.Findings)
	}
}

// EVERY REJECTION CARRIES A LESSON. A finding teaches one token and a lesson
// teaches everything after it.
func TestARejectionWithoutALessonIsRefused(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "a thing to build", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	Pull(r, "reviewer", RoleReviewer, Payload{})

	bare := Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "a clause", Wrong: "it is wrong", Satisfies: "make it right"}}}
	a := Pull(r, "reviewer", RoleReviewer, bare)
	if a.Pull != AnswerRefused {
		t.Fatalf("a rejection with no lesson was accepted: %q", a.Pull)
	}
	if !strings.Contains(a.Findings[0].Wrong, "teaches this token and nothing after it") {
		t.Fatalf("the refusal does not say why: %v", a.Findings[0])
	}

	// With one, it lands, and the lesson is on the token beside the finding.
	whole := bare
	whole.Lesson = Lesson{Class: "a check built from the fix",
		Avoid: "write the check first and watch it go red", Prevents: "ask before writing the check whether it can fail"}
	whole.Learned = learnedFrom(t, r, whole.Lesson)
	if a := Pull(r, "reviewer", RoleReviewer, whole); a.Pull == AnswerRefused {
		t.Fatalf("a whole rejection was refused: %v", a.Findings)
	}
	now, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(now.Lessons) != 1 || now.Lessons[0].Class != "a check built from the fix" {
		t.Fatalf("the lesson is not on the token: %v", now.Lessons)
	}
	if now.Lessons[0].By != "reviewer" || now.Lessons[0].Round != 1 {
		t.Fatalf("the lesson does not say who taught it or when: %+v", now.Lessons[0])
	}
}

// A SUB-TOKEN DOES NOT DRAFT. It breaks down work whose criteria are already
// agreed, so drafting it again would agree the same thing twice.
func TestASubTokenDoesNotDraft(t *testing.T) {
	r := guidanceTree(t)
	parent, err := Mint(r, Token{Title: "the whole thing", Assignee: "main",
		Scope: MultiStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	child, err := Mint(r, Token{Title: "one piece of it", Assignee: "main",
		Scope: SingleStep, Parent: parent.ID, MintedBy: "main"})
	if err != nil {
		t.Fatal(err)
	}
	if NeedsSpec(child) {
		t.Fatal("a sub-token was asked to draft")
	}
	if !NeedsSpec(parent) {
		t.Fatal("a token nobody parented was not asked to draft")
	}
}

// A criterion and a lesson survive being written to the note and read back.
func TestCriteriaAndLessonsSurviveTheNote(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "a thing to build", Assignee: "main",
		Scope: SingleStep, MintedBy: "person",
		Criteria: []Criterion{
			{Says: "the suite passes", Runs: "go test ./..."},
			{Says: "somebody read it"},
		},
		Lessons: []Lesson{{Class: "a check built from the fix",
			Avoid: "write the check first", Round: 2, By: "reviewer"}}})
	if err != nil {
		t.Fatal(err)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(back.Criteria) != 2 {
		t.Fatalf("%d criteria came back", len(back.Criteria))
	}
	if back.Criteria[0].Runs != "go test ./..." || back.Criteria[1].Runs != "" {
		t.Fatalf("the commands came back as %+v", back.Criteria)
	}
	if back.Criteria[1].Says != "somebody read it" {
		t.Fatalf("a criterion with no command came back as %q", back.Criteria[1].Says)
	}
	if len(back.Lessons) != 1 || back.Lessons[0].Avoid != "write the check first" {
		t.Fatalf("the lesson came back as %v", back.Lessons)
	}
	if back.Lessons[0].Round != 2 || back.Lessons[0].By != "reviewer" {
		t.Fatalf("the lesson lost who taught it: %+v", back.Lessons[0])
	}
}

// A REVIEWER IS ASSIGNED NOTHING, so the stop check never saw it, and one
// walked away with a token still in its hands. That token then sat in review
// with nobody behind the name.
func TestAReviewerCannotStopHoldingWork(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "a thing to judge", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	// Nothing is submitted yet, so a reviewer may leave.
	if !AskToStop(r, "reviewer").Permitted {
		t.Fatal("a reviewer was held with nothing to judge")
	}

	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})

	// WORK MERELY WAITING DOES NOT HOLD ANYBODY. The engine does not know who
	// is a reviewer, so a rule about waiting work would hold the worker too.
	// That case has its own refusal, on the worker's pull.
	//
	// The worker here still holds nothing of its own, and it may leave.
	if !AskToStop(r, "somebody-else").Permitted {
		t.Fatal("an actor holding nothing was held because work was waiting")
	}

	// HOLDING ONE HOLDS IT, and the refusal names it.
	Pull(r, "reviewer", RoleReviewer, Payload{})
	said := AskToStop(r, "reviewer")
	if said.Permitted {
		t.Fatal("a reviewer left holding a token in review")
	}
	if !strings.Contains(said.Reason, "STILL HOLDING") || !strings.Contains(said.Reason, tok.ID) {
		t.Fatalf("the refusal does not name what it holds: %q", said.Reason)
	}

	// Ruling on it lets it go.
	Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	if !AskToStop(r, "reviewer").Permitted {
		t.Fatalf("a reviewer with nothing left was held: %q", AskToStop(r, "reviewer").Reason)
	}
}

// A DRAFT WAITING IS THE SAME AS WORK WAITING, and a reviewer holding a draft
// is held the same way.
func TestAReviewerCannotStopHoldingADraft(t *testing.T) {
	r := guidanceTree(t)
	tok := aSpec(t, r, "a thing to build")
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID})

	Pull(r, "reviewer", RoleReviewer, Payload{})
	said := AskToStop(r, "reviewer")
	if said.Permitted || !strings.Contains(said.Reason, "STILL HOLDING") {
		t.Fatalf("a reviewer holding a draft was let go: %+v", said)
	}
}

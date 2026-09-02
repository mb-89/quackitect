package main

import (
	"strings"
	"testing"
)

// EVERY REVIEW NOTICE LEADS WITH THE LEADING QUESTION AND CARRIES ITS THREE
// RULES. The old notice taught the contest: judge against the token's own
// rules and nothing else, every measurement reproduced. The record paid 186
// rejections to learn what that buys. The question and its rules ride the
// notice itself, on both halves, because the notice is what the reviewer
// acts on, and the method file carries the full form.
func TestTheReviewNoticeLeadsWithDamage(t *testing.T) {
	rules := []string{
		"Would the product be damaged if this were blessed as it stands?",
		"No damage means no rejection",
		"corrected by the reviewer itself",
		"not damage unless the decision rests on it",
	}

	// THE SPEC HALF. A draft submitted and pulled for review.
	r := lane(t)
	spec := mint(t, r, Token{Title: "the draft", Assignee: "main", Status: SpecOpen,
		Detail: "a problem worth stating",
		Criteria: []Criterion{{Says: "it holds", Runs: "exit 1"}}})
	if _, done := settle(r, "main", RoleWorker, Payload{ID: spec.ID}); done {
		t.Fatal("the draft was refused")
	}
	a := Pull(r, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerReview {
		t.Fatalf("the reviewer got %q", a.Pull)
	}
	if !strings.HasPrefix(a.Notice, rules[0]) {
		t.Fatalf("the spec review notice does not lead with the question: %q",
			firstLines(a.Notice, 1))
	}
	for _, want := range rules {
		if !strings.Contains(a.Notice, want) {
			t.Fatalf("the spec review notice does not carry %q", want)
		}
	}

	// THE IMPLEMENTATION HALF. Finished work submitted and pulled for review.
	r2 := lane(t)
	imp := mint(t, r2, Token{Title: "the work", Assignee: "main", Status: ImpOpen})
	if _, done := settle(r2, "main", RoleWorker, Payload{ID: imp.ID,
		Disposition: string(Done)}); done {
		t.Fatal("the submission was refused")
	}
	a = Pull(r2, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerReview {
		t.Fatalf("the reviewer got %q", a.Pull)
	}
	if !strings.HasPrefix(a.Notice, rules[0]) {
		t.Fatalf("the implementation review notice does not lead with the question: %q",
			firstLines(a.Notice, 1))
	}
	for _, want := range rules {
		if !strings.Contains(a.Notice, want) {
			t.Fatalf("the implementation review notice does not carry %q", want)
		}
	}
}

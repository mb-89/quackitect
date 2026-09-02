package main

import (
	"strings"
	"testing"
)

// ACCEPT WITH FINDINGS OPENS THE WORK. Point one okay, point two okay, point
// three not okay, overall accepted: the reviewer agrees the whole while a
// part is not okay, the work opens the way an accept opens it, and the open
// point lands on the token as an obligation instead of costing a round.
func TestAcceptWithFindingsOpensTheWork(t *testing.T) {
	r := lane(t)
	tok := aSubmittedSpec(t, r)

	a, _ := settle(r, "rev", RoleReviewer, Payload{ID: tok.ID,
		Verdict: "accept_with_findings",
		Rewatched: map[string]string{"it holds": "took the thing itself away and it said no"},
		Findings: []Rejection{{Clause: "the wording",
			Wrong: "one sentence is off", Satisfies: "say it plainly"}}})
	if a.Pull == AnswerRefused {
		t.Fatalf("the third verdict was refused on a spec: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != ImpOpen {
		t.Fatalf("the work did not open: %s", back.Status)
	}
	if len(back.Findings) != 1 || back.Findings[0].Round != back.Rounds {
		t.Fatalf("the finding did not land carrying the current round: %+v", back.Findings)
	}
}

// THE OBLIGATIONS ARE OWED AT THE NEXT GATE. The implementation submission
// that says nothing about the attached finding is refused naming it, which is
// the gate that already exists doing its job on findings this verdict
// attached.
func TestTheObligationsAreOwedAtSubmission(t *testing.T) {
	r := lane(t)
	tok := aSubmittedSpec(t, r)
	if a, _ := settle(r, "rev", RoleReviewer, Payload{ID: tok.ID,
		Verdict: "accept_with_findings",
		Rewatched: map[string]string{"it holds": "took the thing itself away and it said no"},
		Findings: []Rejection{{Clause: "the wording",
			Wrong: "one sentence is off", Satisfies: "say it plainly"}}}); a.Pull == AnswerRefused {
		t.Fatalf("the verdict was refused: %+v", a.Findings)
	}

	// The worker picks it up and submits with silent evidence.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork || a.Token.ID != tok.ID {
		t.Fatalf("the worker was not handed the opened work: %s", a.Pull)
	}
	a, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if a.Pull != AnswerRefused || len(a.Findings) == 0 ||
		!strings.Contains(a.Findings[0].Wrong, "finding 1") {
		t.Fatalf("a silent submission was not refused naming the obligation: %s %+v",
			a.Pull, a.Findings)
	}

	// Answered by name, it goes through to review.
	a, _ = settle(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{"finding 1": "said plainly now, and here is where"}})
	if a.Pull == AnswerRefused {
		t.Fatalf("an answered submission was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != ImpSubmitted {
		t.Fatalf("the answered submission did not reach review: %s", back.Status)
	}
}

// AN IMPLEMENTATION ACCEPT WITH FINDINGS IS REFUSED, and the refusal says
// why in as many words: the next gate is the closer and the closer is not
// built, so there is nowhere for the obligation to be owed. A decision on
// the page rather than an omission.
func TestAnImplementationAcceptWithFindingsIsRefused(t *testing.T) {
	r := lane(t)
	tok := aRejectableToken(t, r)

	a, _ := settle(r, "rev", RoleReviewer, Payload{ID: tok.ID,
		Verdict: "accept_with_findings",
		Findings: []Rejection{{Clause: "small", Wrong: "w", Satisfies: "s"}}})
	if a.Pull != AnswerRefused || len(a.Findings) == 0 {
		t.Fatalf("the third verdict went through on an implementation: %s", a.Pull)
	}
	if !strings.Contains(a.Findings[0].Wrong, "closer") {
		t.Fatalf("the refusal does not name the closer: %s", a.Findings[0].Wrong)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status.Ended() {
		t.Fatalf("the refused verdict still ended the token: %s", back.Status)
	}
}

// A SPEC IN A REVIEWER'S HANDS, built the way the queue builds one.
func aSubmittedSpec(t *testing.T, r Roots) Token {
	t.Helper()
	tok := mint(t, r, Token{Title: "the probe", Assignee: "main", Status: SpecOpen,
		Detail: "a problem worth stating",
		Criteria: []Criterion{{Says: "it holds", Runs: "exit 0",
			Without: "the thing itself", Red: "it said no"}}})
	if _, done := settle(r, "main", RoleWorker, Payload{ID: tok.ID}); done {
		t.Fatal("the draft was refused")
	}
	a := Pull(r, "rev", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token == nil || a.Token.ID != tok.ID {
		t.Fatalf("the reviewer was not handed the draft: %s", a.Pull)
	}
	return tok
}

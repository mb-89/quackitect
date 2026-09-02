package main

import (
	"strings"
	"testing"
)

// THE NEW DOOR CARRIES THE SAME REFUSALS THAT GUARD THE OLD ONE. A branch
// beside accept is a second way into the same state change, and the refusals
// standing in front of the first do not follow it unless somebody makes them.
// Four are driven here, each against accept_with_findings.
func TestAcceptWithFindingsCarriesTheSameRefusals(t *testing.T) {
	withFindings := func(p Payload) Payload {
		p.Verdict = "accept_with_findings"
		if p.Findings == nil {
			p.Findings = []Rejection{{Clause: "small", Wrong: "w", Satisfies: "s"}}
		}
		return p
	}

	// THE REVIEWER THAT DRAFTED IT is refused, sentBy asked and not the owner.
	r := lane(t)
	one := mint(t, r, Token{Title: "the probe", Assignee: "probeA", Status: SpecOpen,
		Detail: "a problem worth stating",
		Criteria: []Criterion{{Says: "it holds", Runs: "exit 0",
			Without: "the thing", Red: "no"}}})
	if _, done := settle(r, "probeA", RoleWorker, Payload{ID: one.ID}); done {
		t.Fatal("the draft was refused")
	}
	after, err := LoadToken(r, one.ID)
	if err != nil {
		t.Fatal(err)
	}
	after.Assignee, after.Holder, after.Status = "probeB", "probeA", SpecInReview
	if err := SaveToken(r, after); err != nil {
		t.Fatal(err)
	}
	a, _ := settle(r, "probeA", RoleReviewer, withFindings(Payload{ID: one.ID}))
	if a.Pull != AnswerRefused || len(a.Findings) == 0 ||
		!strings.Contains(a.Findings[0].Wrong, "drafted") {
		t.Fatalf("the drafter agreed its own spec through the new door: %s %+v", a.Pull, a.Findings)
	}

	// A TOKEN THAT IS NOT WITH THIS REVIEWER is refused the same way.
	r2 := lane(t)
	two := aSubmittedSpec(t, r2)
	a, _ = settle(r2, "somebody-else", RoleReviewer, withFindings(Payload{ID: two.ID,
		Rewatched: map[string]string{"it holds": "took it away, said no"}}))
	if a.Pull != AnswerRefused || len(a.Findings) == 0 ||
		!strings.Contains(a.Findings[0].Wrong, "not with you") {
		t.Fatalf("a reviewer not holding the spec agreed it: %s %+v", a.Pull, a.Findings)
	}

	// A DRAFT WHOSE CRITERIA ASK FOR A RE-WATCH AND GOT NONE is refused.
	r3 := lane(t)
	three := aSubmittedSpec(t, r3)
	a, _ = settle(r3, "rev", RoleReviewer, withFindings(Payload{ID: three.ID}))
	if a.Pull != AnswerRefused || len(a.Findings) == 0 ||
		!strings.Contains(a.Findings[0].Wrong, "re-watched") {
		t.Fatalf("a recorded red passed the new door unrewatched: %s %+v", a.Pull, a.Findings)
	}

	// AND NO FINDINGS IS AN ACCEPT WEARING ANOTHER NAME, refused saying so.
	r4 := lane(t)
	four := aSubmittedSpec(t, r4)
	a, _ = settle(r4, "rev", RoleReviewer, Payload{ID: four.ID,
		Verdict:   "accept_with_findings",
		Rewatched: map[string]string{"it holds": "took it away, said no"}})
	if a.Pull != AnswerRefused || len(a.Findings) == 0 ||
		!strings.Contains(a.Findings[0].Wrong, "longer name") {
		t.Fatalf("an empty accept_with_findings went through: %s %+v", a.Pull, a.Findings)
	}
}

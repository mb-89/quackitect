package main

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func lane(t *testing.T) Roots {
	t.Helper()
	return Roots{Method: t.TempDir(), Work: t.TempDir()}
}

func mint(t *testing.T, r Roots, tok Token) Token {
	t.Helper()
	if tok.Title == "" {
		tok.Title = "do the thing"
	}
	if tok.Assignee == "" {
		tok.Assignee = "main"
	}
	out, err := Mint(r, tok)
	if err != nil {
		t.Fatal(err)
	}
	return out
}

// The whole point of pulling: the agent names nothing and receives work.
func TestAPullWithNoPayloadHandsOutTheOldestOpenToken(t *testing.T) {
	r := lane(t)
	first := mint(t, r, Token{Title: "the first"})
	mint(t, r, Token{Title: "the second"})

	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWork {
		t.Fatalf("wanted work, got %s: %s", a.Pull, a.Notice)
	}
	if a.Token.ID != first.ID {
		t.Fatalf("the queue handed out %s, not the one that waited longest", a.Token.ID)
	}
	// Handing it out marks it taken, so a second agent cannot be given the
	// same piece of work.
	if a.Token.Status != InWork {
		t.Fatalf("a token that was handed out is %s", a.Token.Status)
	}
}

// An agent that pulls twice is not working two things at once.
func TestPullingAgainReturnsTheSameTokenUntilItIsSubmitted(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "the only one"})
	first := Pull(r, "main", RoleWorker, Payload{})
	again := Pull(r, "main", RoleWorker, Payload{})
	if again.Pull != AnswerWork || again.Token.ID != first.Token.ID {
		t.Fatalf("a second pull gave %s %v", again.Pull, again.Token)
	}
}

// Idleness is read from the tokens, and it is never read from anywhere else.
func TestAnActorWithNoTokenIsToldToWait(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Assignee: "somebody else"})
	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWait {
		t.Fatalf("wanted wait, got %s", a.Pull)
	}
}

// The rule the whole layer turns on. The worker submits and does not close.
func TestSubmittingDoesNotCloseTheTokenItSendsItToReview(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})

	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if a.Pull != AnswerWait {
		t.Fatalf("after a good submission the queue said %s: %s", a.Pull, a.Notice)
	}
	back, _ := LoadToken(r, tok.ID)
	if back.Status != Submitted {
		t.Fatalf("the worker left it %s, and only a reviewer may close", back.Status)
	}
	if back.Status == Closed {
		t.Fatal("the worker closed its own work")
	}
}

// The reviewer's queue is a different queue, and the worker's is empty of it.
func TestTheReviewerPullsFromTheOtherQueue(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})

	// Nothing is left for the worker.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWait {
		t.Fatalf("the worker still sees %s", a.Pull)
	}
	rev := Pull(r, "rev", RoleReviewer, Payload{})
	if rev.Pull != AnswerReview || rev.Token.ID != tok.ID {
		t.Fatalf("the reviewer got %s", rev.Pull)
	}
	// And the reviewer closes it.
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "accept"})
	back, _ := LoadToken(r, tok.ID)
	if back.Status != Closed || back.Disposition != Done {
		t.Fatalf("after an accept it is %s with disposition %q", back.Status, back.Disposition)
	}
}

// A rejection is typed, it lands on the token, and the work comes back.
func TestARejectionComesBackWithItsFindingsOnTheToken(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "write the thing"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	// A reviewer judges what was handed to it, so it pulls before it answers.
	Pull(r, "rev", RoleReviewer, Payload{})
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "voice", Wrong: "it uses a semicolon", Satisfies: "two sentences"}}})

	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWork || a.Token.ID != tok.ID {
		t.Fatalf("the rejected work did not come back: %s", a.Pull)
	}
	if len(a.Findings) != 1 || a.Findings[0].Clause != "voice" {
		t.Fatalf("the findings did not ride along: %v", a.Findings)
	}
	if a.Findings[0].Round != 1 || a.Findings[0].By != "rev" {
		t.Fatalf("a finding does not say which round or whose: %+v", a.Findings[0])
	}

	// A second rejection accumulates rather than replaces. A fresh reviewer
	// reads the token's history and not a colleague's memory.
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev2", RoleReviewer, Payload{})
	Pull(r, "rev2", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "evidence", Wrong: "no measurement", Satisfies: "a number"}}})
	back, _ := LoadToken(r, tok.ID)
	if len(back.Findings) != 2 || back.Rounds != 2 {
		t.Fatalf("%d findings over %d rounds", len(back.Findings), back.Rounds)
	}
}

// A rejection with nothing in it is the ping-pong the design refuses.
func TestARejectionWithNoFindingIsItselfRefused(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})
	a := Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject"})
	if a.Pull != AnswerRefused {
		t.Fatalf("an empty rejection was accepted: %s", a.Pull)
	}
}

// Everything the engine can check, the engine checks, before a reviewer is
// ever woken. Each case names the clause it must fail on.
func TestTheEngineRefusesWhatAProgramCanSee(t *testing.T) {
	r := lane(t)
	other := mint(t, r, Token{Title: "somebody else's", Assignee: "them"})
	filled := mint(t, r, Token{Title: "a form", Evidence: EvidenceSpec{Sections: []string{"what", "how"}}})
	parent := mint(t, r, Token{Title: "the parent"})
	mint(t, r, Token{Title: "the child", Parent: parent.ID, Scope: InToken})

	cases := []struct {
		name   string
		p      Payload
		clause string
	}{
		{"a token that is not yours",
			Payload{ID: other.ID, Disposition: string(Done)}, "assignee"},
		{"no disposition at all",
			Payload{ID: filled.ID}, "disposition"},
		{"became with no successor",
			Payload{ID: filled.ID, Disposition: string(Became)}, "disposition"},
		{"became naming a successor that does not exist",
			Payload{ID: filled.ID, Disposition: string(Became), Successors: []string{"wk-nothing"}}, "disposition"},
		{"dropped with no reason",
			Payload{ID: filled.ID, Disposition: string(Dropped)}, "disposition"},
		{"a section left empty",
			Payload{ID: filled.ID, Disposition: string(Done),
				Evidence: map[string]string{"what": "done", "how": "  "}}, "evidence"},
		{"an open sub-token",
			Payload{ID: parent.ID, Disposition: string(Done)}, "blocked"},
		{"an id nobody minted",
			Payload{ID: "wk-nothing", Disposition: string(Done)}, "the token"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			a := Pull(r, "main", RoleWorker, c.p)
			if a.Pull != AnswerRefused {
				t.Fatalf("it was allowed through: %s", a.Pull)
			}
			if a.Findings[0].Clause != c.clause {
				t.Fatalf("refused on %q, wanted %q", a.Findings[0].Clause, c.clause)
			}
			// Every refusal says what would satisfy it, so the worker acts
			// instead of guessing.
			if strings.TrimSpace(a.Findings[0].Satisfies) == "" {
				t.Fatal("the refusal does not say what would satisfy it")
			}
		})
	}
}

// A parent is held open by its children, and it is freed by closing them.
func TestClosingEverySubTokenFreesTheParent(t *testing.T) {
	r := lane(t)
	parent := mint(t, r, Token{Title: "the parent"})
	child := mint(t, r, Token{Title: "the child", Parent: parent.ID, Scope: InToken})

	// The child is the agent's own breakdown, so submitting closes it.
	Pull(r, "main", RoleWorker, Payload{ID: child.ID, Disposition: string(Done)})
	back, _ := LoadToken(r, child.ID)
	if back.Status != Closed {
		t.Fatalf("a self-closing token is %s after submission", back.Status)
	}
	if a := Pull(r, "main", RoleWorker, Payload{ID: parent.ID, Disposition: string(Done)}); a.Pull == AnswerRefused {
		t.Fatalf("the parent is still held: %+v", a.Findings)
	}
}

// The evidence script decides, and its output is what the worker is handed.
func TestAnEvidenceScriptThatFailsRefusesTheSubmission(t *testing.T) {
	r := lane(t)
	bad := "exit 3"
	good := "exit 0"
	if runtime.GOOS == "windows" {
		bad, good = "exit /b 3", "exit /b 0"
	}
	fails := mint(t, r, Token{Title: "run it", Evidence: EvidenceSpec{Script: bad}})
	passes := mint(t, r, Token{Title: "run it", Evidence: EvidenceSpec{Script: good}})

	a := Pull(r, "main", RoleWorker, Payload{ID: fails.ID, Disposition: string(Done)})
	if a.Pull != AnswerRefused || a.Findings[0].Clause != "evidence" {
		t.Fatalf("a failing script was accepted: %s", a.Pull)
	}
	b := Pull(r, "main", RoleWorker, Payload{ID: passes.ID, Disposition: string(Done)})
	if b.Pull == AnswerRefused {
		t.Fatalf("a passing script was refused: %+v", b.Findings)
	}
}

// Dropped work produced nothing, so there is nothing to show for it. The
// reason is the evidence, and the reason is already required.
func TestDroppedWorkNeedsAReasonAndNotAFilledForm(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "a form", Evidence: EvidenceSpec{Sections: []string{"what"}}})
	a := Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Dropped),
		Reason: "the requirement went away"})
	if a.Pull == AnswerRefused {
		t.Fatalf("a dropped token was asked for evidence: %+v", a.Findings)
	}
}

// The minter decides. Everything a token needs to be a token is refused when
// it is missing, because a half token is worse than none.
func TestMintingRefusesATokenThatDescribesNothing(t *testing.T) {
	r := lane(t)
	if _, err := Mint(r, Token{Assignee: "main"}); err == nil {
		t.Fatal("a token with no form was minted")
	}
	if _, err := Mint(r, Token{Title: "something"}); err == nil {
		t.Fatal("a token with no assignee was minted")
	}
	// The default scope is a single step, so a reviewer closes it and four
	// eyes hold without a policy.
	tok, err := Mint(r, Token{Title: "something", Assignee: "main"})
	if err != nil {
		t.Fatal(err)
	}
	if tok.Scope != SingleStep || tok.SelfClosing() {
		t.Fatalf("the default scope is %q and self-closing is %v", tok.Scope, tok.SelfClosing())
	}
	// A scope nobody declared is a scope nobody can act on.
	if _, err := Mint(r, Token{Title: "x", Assignee: "main", Scope: "somewhere"}); err == nil {
		t.Fatal("an unknown scope was minted")
	}
}

// A TOKEN IS A MARKDOWN NOTE, and which folder it lands in is decided by
// whether it is traced. The record travels. Scratch work does not.
func TestATracedTokenTravelsAndAnEphemeralOneDoesNot(t *testing.T) {
	r := lane(t)
	kept := mint(t, r, Token{Title: "the record", Traced: true})
	scratch := mint(t, r, Token{Title: "scratch", Scope: InToken})

	if _, err := os.Stat(filepath.Join(r.Work, "doc", "work", kept.ID+".md")); err != nil {
		t.Fatalf("a traced token is not in the travelling folder: %v", err)
	}
	if _, err := os.Stat(filepath.Join(r.Work, ".se", "work", scratch.ID+".md")); err != nil {
		t.Fatalf("an ephemeral token is not in the private folder: %v", err)
	}
	// Both are found, and neither knows where the other lives.
	for _, id := range []string{kept.ID, scratch.ID} {
		if _, err := LoadToken(r, id); err != nil {
			t.Fatalf("%s did not load: %v", id, err)
		}
	}
}

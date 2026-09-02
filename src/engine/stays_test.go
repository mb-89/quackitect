package main

import (
	"testing"
)

// THE REVIEWER STAYS. A token that comes back goes to the hand that judged it,
// and a fresh reviewer takes it only when that one is gone.
//
// ABSENT IS StillPulling AND NOTHING ELSE, so every fixture here runs inside a
// real session and moves the queue rather than asking whether somebody was ever
// seen. Arrived never goes false inside a session, and reading absence off it
// would freeze every token whose reviewer arrived, judged and stopped.

// A RETURNING SUBMISSION GOES TO THE REVIEWER WHO JUDGED IT, and both
// directions are one fixture: the second reviewer is not handed it, and then the
// first is. IT ASKS THE QUEUE, because a memory the queue does not obey is a
// field.
func TestAReturningSubmissionGoesToItsReviewer(t *testing.T) {
	r := aLaneWithASession(t)
	tok := aSubmission(t, r)
	rejectAsReviewer(t, r, tok.ID, "rev-1")
	resubmit(t, r, tok.ID)

	if a := Pull(r, "rev-2", RoleReviewer, Payload{}); a.Pull == AnswerReview {
		t.Fatalf("a second reviewer was handed a submission rev-1 had already judged: %s",
			a.Token.ID)
	}
	a := Pull(r, "rev-1", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token.ID != tok.ID {
		t.Fatalf("the reviewer that judged it was not handed it back: %s %s", a.Pull, a.Notice)
	}
}

// A FRESH SUBMISSION TAKES ANY REVIEWER, because a token nobody has judged has
// no reviewer to remember. A guard that refuses both is a guard nobody passes.
func TestAFreshSubmissionTakesAnyReviewer(t *testing.T) {
	r := aLaneWithASession(t)
	tok := aSubmission(t, r)
	a := Pull(r, "rev-1", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token.ID != tok.ID {
		t.Fatalf("a submission nobody has judged was handed to nobody: %s %s", a.Pull, a.Notice)
	}
}

// A GONE REVIEWER FREES THE TOKEN BECAUSE THE QUEUE HAS MOVED PAST THE WINDOW,
// never because the session has not seen it.
//
// StillPulling trusts a remembered reviewer with no entry until the session's
// own pull count passes the staleness window, which is the same trust the hold
// reclaim gives a holder carried across a restart. So this fixture remembers a
// reviewer that never pulls and moves the queue past that window with other
// actors' pulls.
func TestAGoneReviewerFreesTheToken(t *testing.T) {
	r := aLaneWithASession(t)
	tok := aSubmission(t, r)
	remember(t, r, tok.ID, "rev-gone")

	stale := LoadConfig(r).PullsBeforeHoldIsStale
	// WHILE THE QUEUE HAS NOT MOVED, THE MEMORY HOLDS. Without this the test
	// would pass on an implementation that never remembers anybody.
	if a := Pull(r, "rev-2", RoleReviewer, Payload{}); a.Pull == AnswerReview {
		t.Fatalf("the memory let go before the queue had moved at all: %s", a.Token.ID)
	}
	movePast(r, stale)
	if StillPulling(r, currentSession(r), "rev-gone", stale) {
		t.Fatalf("the fixture did not move the queue past the window, so StillPulling "+
			"still answers yes for a reviewer that never pulled")
	}
	a := Pull(r, "rev-2", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token.ID != tok.ID {
		t.Fatalf("a reviewer the queue has left behind still holds the token: %s %s",
			a.Pull, a.Notice)
	}
}

// A STOPPED REVIEWER FREES THE TOKEN. This is the one that tells StillPulling
// from Arrived: the remembered reviewer ARRIVES and judges, so it is in the
// arrival record for good, and then the queue moves past it.
func TestAStoppedReviewerFreesTheToken(t *testing.T) {
	r := aLaneWithASession(t)
	tok := aSubmission(t, r)
	rejectAsReviewer(t, r, tok.ID, "rev-1")
	resubmit(t, r, tok.ID)

	stale := LoadConfig(r).PullsBeforeHoldIsStale
	movePast(r, stale)
	if !HasPulled(r, currentSession(r), "rev-1") {
		t.Fatal("the fixture's reviewer never arrived, so this cannot tell StillPulling from Arrived")
	}
	if StillPulling(r, currentSession(r), "rev-1", stale) {
		t.Fatal("the fixture did not move the queue past the window")
	}
	a := Pull(r, "rev-2", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token.ID != tok.ID {
		t.Fatalf("a reviewer that arrived, judged and stopped held the token forever: %s %s",
			a.Pull, a.Notice)
	}
}

// THE MEMORY NEVER OVERRIDES FOUR EYES, and it never strands the work either.
//
// A remembered reviewer that is also the submitter could never judge this token,
// so keeping it for that hand would keep it for nobody. sentBy is asked after
// the memory and wins, and the memory stands aside.
func TestTheMemoryDoesNotOverrideFourEyes(t *testing.T) {
	r := aLaneWithASession(t)
	tok := aSubmission(t, r)
	// Forced directly, the way the bypass probe writes an assignee, because the
	// engine writes this field and would never write it to the submitter.
	remember(t, r, tok.ID, "main")
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if sentBy(back) != "main" {
		t.Fatalf("the fixture did not put the submitter in the memory: sent by %q", sentBy(back))
	}

	if a := Pull(r, "main", RoleReviewer, Payload{}); a.Pull == AnswerReview {
		t.Fatal("the memory handed a token to the actor that submitted it")
	}
	a := Pull(r, "rev-2", RoleReviewer, Payload{})
	if a.Pull != AnswerReview || a.Token.ID != tok.ID {
		t.Fatalf("a memory nobody could act on stranded the token: %s %s", a.Pull, a.Notice)
	}
}

// ---- the fixtures ----

// aLaneWithASession is a lane the engine has started in, because absence is
// answered from the session's own pull count and a lane with no session answers
// nothing.
func aLaneWithASession(t *testing.T) Roots {
	t.Helper()
	r := guidanceTree(t)
	l, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()
	if !Named(currentSession(r)) {
		t.Fatal("the fixture has no session, so nothing here can ask whether a reviewer is gone")
	}
	return r
}

// aSubmission is one token, submitted by main and waiting for a reviewer.
func aSubmission(t *testing.T, r Roots) Token {
	t.Helper()
	tok := mint(t, r, Token{Title: "build the thing", Assignee: "main", Status: ImpOpen})
	a, _ := settle(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if a.Pull == AnswerRefused {
		t.Fatalf("the submission this fixture rests on was refused: %+v", a.Findings)
	}
	return tok
}

// rejectAsReviewer has one reviewer pull the submission and reject it, which is
// how the engine writes the memory.
func rejectAsReviewer(t *testing.T, r Roots, id, rev string) {
	t.Helper()
	if a := Pull(r, rev, RoleReviewer, Payload{}); a.Pull != AnswerReview {
		t.Fatalf("%s was handed nothing to judge: %s %s", rev, a.Pull, a.Notice)
	}
	a, _ := settle(r, rev, RoleReviewer, Payload{ID: id, Verdict: "reject",
		Findings: []Rejection{{Clause: "the check", Wrong: "it cannot fail",
			Satisfies: "one that was watched failing"}},
		Lesson:  Lesson{Class: "a class", Avoid: "catch it", Prevents: "stop it"},
		Learned: mint(t, r, Token{Title: "learned", Status: Backlogged}).ID})
	if a.Pull == AnswerRefused {
		t.Fatalf("the rejection this fixture rests on was refused: %+v", a.Findings)
	}
	back, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	if back.ReviewedBy != rev {
		t.Fatalf("a verdict landed and the token remembers %q rather than %s",
			back.ReviewedBy, rev)
	}
}

// resubmit sends the work back, answering the round's finding.
func resubmit(t *testing.T, r Roots, id string) {
	t.Helper()
	if a := next(r, "main", RoleWorker); a.Pull != AnswerWork {
		t.Fatalf("the worker was handed nothing: %+v", a)
	}
	a, _ := settle(r, "main", RoleWorker, Payload{ID: id, Disposition: string(Done),
		Evidence: map[string]string{"finding 1": "closed: the check names what it is short of"}})
	if a.Pull == AnswerRefused {
		t.Fatalf("the resubmission was refused: %+v", a.Findings)
	}
}

// remember writes the memory directly, for the two fixtures that need a
// reviewer the engine never saw judge.
func remember(t *testing.T, r Roots, id, who string) {
	t.Helper()
	tok, err := LoadToken(r, id)
	if err != nil {
		t.Fatal(err)
	}
	tok.ReviewedBy = who
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
}

// movePast drives the session's pull count past the staleness window with
// somebody else's pulls, which is what makes the queue its own clock.
func movePast(r Roots, stale int) {
	for i := 0; i <= stale+1; i++ {
		Pull(r, "somebody-else", RoleWorker, Payload{})
	}
}

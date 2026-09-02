package main

import (
	"fmt"
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
	if a.Token.Status != ImpInWork {
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

// WAIT MEANS THERE IS NO OPEN WORK, AND IT USED TO MEAN NONE WITH YOUR NAME ON.
//
// THIS TEST ASSERTED THE OLD RULE AND THE OWNER REVERSED IT: every agent can
// take every open token, and a token assigned to somebody else is now handed
// out. So the fixture that used to prove wait is the fixture that now proves
// work, and it moved to anyagent_test.go under that name.
//
// WHAT WAIT STILL MEANS, AND IT IS WHY THIS TEST STAYS. Idleness is read from
// the tokens and never from anywhere else. A lane with nothing open answers
// wait, whoever pulls.
func TestAnActorIsToldToWaitWhenNothingIsOpen(t *testing.T) {
	r := lane(t)
	mint(t, r, Token{Title: "somebody is holding it", Assignee: "somebody else",
		Status: ImpInWork, Holder: "somebody else"})
	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWait {
		t.Fatalf("nothing is open and the pull answered %s, so an agent is handed work "+
			"that is in somebody else's hands", a.Pull)
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
	if back.Status != ImpSubmitted {
		t.Fatalf("the worker left it %s, and only a reviewer may close", back.Status)
	}
	if back.Status == ImpDone {
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
	if back.Status != ImpDone || back.Disposition != Done {
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
	one := Lesson{Class: "a check built from the fix", Avoid: "write the check first and watch it go red", Prevents: "ask before writing the check whether it can fail"}
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "voice", Wrong: "it uses a semicolon", Satisfies: "two sentences"}},
		Lesson:   one, Learned: learnedFrom(t, r, one)})

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
	// THE FINDING IS ANSWERED BEFORE THE WORK GOES BACK, because a submission
	// silent about one is refused now.
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done),
		Evidence: map[string]string{"finding 1": "closed: the check names it now"}})
	Pull(r, "rev2", RoleReviewer, Payload{})
	two := Lesson{Class: "a number that was not read from a run", Avoid: "state no number you have not just read", Prevents: "ask before writing the check whether it can fail"}
	Pull(r, "rev2", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "evidence", Wrong: "no measurement", Satisfies: "a number"}},
		Lesson:   two, Learned: learnedFrom(t, r, two)})
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
	if back.Status != ImpDone {
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

// ONE TOKEN AT A TIME, AND ALWAYS A VERDICT FOR IT. A reviewer that reads
// three and rules on them together makes the person wait for the third to
// hear about the first.
func TestAReviewerHoldingOneGetsNoSecond(t *testing.T) {
	r := guidanceTree(t)
	mint := func(title string) Token {
		tok, err := Mint(r, Token{Title: title, Assignee: "main", Scope: SingleStep,
			MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		// Mint opens a token, so the submission is the worker's own pull.
		if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
			t.Fatalf("the worker was not given work: %q", a.Pull)
		}
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
		tok, _ = LoadToken(r, tok.ID)
		if tok.Status != ImpSubmitted {
			t.Fatalf("%s is %s rather than submitted", tok.ID, tok.Status)
		}
		return tok
	}
	a, b := mint("the first one"), mint("the second one")

	first := Pull(r, "reviewer", RoleReviewer, Payload{})
	if first.Pull != AnswerReview {
		t.Fatalf("the first pull answered %q", first.Pull)
	}
	held := first.Token.ID

	// A second pull, with no verdict on the first, hands back the same token.
	again := Pull(r, "reviewer", RoleReviewer, Payload{})
	if again.Token == nil || again.Token.ID != held {
		t.Fatalf("a reviewer holding %s was handed something else", held)
	}
	if !strings.Contains(again.Notice, "YOU ALREADY HOLD") {
		t.Fatalf("it did not say why: %q", again.Notice)
	}

	// A VERDICT IS WHAT RELEASES IT, and the engine sees that as a state change
	// rather than by asking the reviewer whether it finished.
	out := Pull(r, "reviewer", RoleReviewer, Payload{ID: held, Verdict: "accept"})
	if out.Pull != AnswerReview {
		t.Fatalf("after a verdict the reviewer got %q", out.Pull)
	}
	other := a.ID
	if held == a.ID {
		other = b.ID
	}
	if out.Token.ID != other {
		t.Fatalf("it handed back %s rather than %s", out.Token.ID, other)
	}
}

// EVERY VERDICT IS IN THE RECORD, WITH ITS REASONS. A move line says a token
// went from in_review to open, and that is the fact without the reason.
func TestAVerdictLandsInTheRecordWithItsReasons(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	tok, err := Mint(r, Token{Title: "a thing to judge", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	Pull(r, "reviewer", RoleReviewer, Payload{})
	taught := Lesson{Class: "a check built from the fix", Avoid: "write the check first and watch it go red", Prevents: "ask before writing the check whether it can fail"}
	Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "the total", Wrong: "it is still on the bar",
			Satisfies: "no count outside a group heading"}},
		Lesson: taught, Learned: learnedFrom(t, r, taught)})

	b, err := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if err != nil {
		t.Fatal(err)
	}
	log := string(b)
	for _, want := range []string{"rejected", "the total", "it is still on the bar",
		"no count outside a group heading", `"actor":"reviewer"`} {
		if !strings.Contains(log, want) {
			t.Fatalf("the record does not carry %q", want)
		}
	}
}

// THE PERSON'S ORDER WINS. An agent that picked up the wrong token has to be
// reachable, or a person saying which one is next says it to nobody.
func TestThePersonsOrderReachesAnAgentThatAlreadyPulled(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()
	mint := func(title string) Token {
		tok, err := Mint(r, Token{Title: title, Assignee: "main", MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		return tok
	}
	old, wanted := mint("the older one"), mint("what they want")

	if a := Pull(r, "main", RoleWorker, Payload{}); a.Token.ID != old.ID {
		t.Fatalf("the queue gave %s rather than the oldest", a.Token.ID)
	}
	// Without a person saying otherwise, the held token comes back.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Token.ID != old.ID {
		t.Fatalf("a second pull gave %s rather than what is held", a.Token.ID)
	}

	if _, err := PutFirst(r, wanted.ID); err != nil {
		t.Fatal(err)
	}
	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Token == nil || a.Token.ID != wanted.ID {
		t.Fatalf("the person's choice did not reach the agent: %v", a.Token)
	}
	// THE ONE PUT DOWN GOES BACK TO THE QUEUE UNTOUCHED, so nothing is lost.
	back, err := LoadToken(r, old.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != ImpOpen || back.Holder != "" {
		t.Fatalf("%s is %s held by %q", old.ID, back.Status, back.Holder)
	}
	if back.Disposition != NoDisposition {
		t.Fatalf("putting it down gave it a disposition: %s", back.Disposition)
	}
	// And the record says it happened, because a token changing hands is a
	// state change and every one of those is in the record.
	b, _ := os.ReadFile(filepath.Join(r.Private("log"), Current))
	if !strings.Contains(string(b), old.ID+" put down") {
		t.Fatalf("the record does not say %s was put down", old.ID)
	}
}

// NOTHING PULLS A PARENT. It is in work because a child is, so the queue must
// hand back the child the agent picked up and not the parent above it.
func TestTheQueueHandsBackTheChildAndNotTheParent(t *testing.T) {
	r := guidanceTree(t)
	// The ordinary order: the parent is minted first, so it sits ahead.
	parent, err := Mint(r, Token{Title: "the whole thing", Assignee: "main", MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	child, err := Mint(r, Token{Title: "one part", Assignee: "main",
		Parent: parent.ID, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	if parent.Seq >= child.Seq {
		t.Fatalf("the parent is not ahead: %d and %d", parent.Seq, child.Seq)
	}
	child.Status, child.Holder = ImpInWork, "main"
	if err := SaveToken(r, child); err != nil {
		t.Fatal(err)
	}
	if got, _ := LoadToken(r, parent.ID); got.Status != ImpInWork {
		t.Fatalf("the parent did not follow: %s", got.Status)
	}

	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Token == nil || a.Token.ID != child.ID {
		t.Fatalf("the queue handed back %v rather than the child", a.Token)
	}
}

// A PARENT AN AGENT REALLY IS HOLDING IS NOT LOWERED BY A CHILD. Only what
// this rule raised is put back, and the empty holder is the mark.
func TestAHeldParentIsNotLoweredByItsChild(t *testing.T) {
	r := guidanceTree(t)
	parent, err := Mint(r, Token{Title: "the whole thing", Assignee: "main", MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Token == nil || a.Token.ID != parent.ID {
		t.Fatalf("the pull did not give the parent: %v", a.Token)
	}
	sub, err := Mint(r, Token{Title: "one part", Assignee: "main",
		Parent: parent.ID, MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	sub.Status, sub.Holder = ImpInWork, "main"
	SaveToken(r, sub)
	sub.Status, sub.Holder = ImpSubmitted, ""
	SaveToken(r, sub)

	got, err := LoadToken(r, parent.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Status != ImpInWork || got.Holder != "main" {
		t.Fatalf("a held parent is now %s held by %q", got.Status, got.Holder)
	}
}

// THE METHOD IS DELIVERED, NOT REMEMBERED. A reviewer told to go and find the
// method reviews from whatever it happens to think.
func TestAReviewCarriesTheMethod(t *testing.T) {
	r := guidanceTree(t)
	method := filepath.Join(r.Method, "doc", "guidance", "reviewing.md")
	if err := os.MkdirAll(filepath.Dir(method), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(method, []byte("# Reviewing\n\nfour rounds, and every measurement reproduced\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	tok, err := Mint(r, Token{Title: "a thing to judge", Assignee: "main", MintedBy: "person"})
	if err != nil {
		t.Fatal(err)
	}
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})

	a := Pull(r, "reviewer", RoleReviewer, Payload{})
	if a.Pull != AnswerReview {
		t.Fatalf("the reviewer got %q", a.Pull)
	}
	if !strings.Contains(a.Guidance, "every measurement reproduced") {
		t.Fatalf("the answer does not carry the method: %q", a.Guidance)
	}
	// The same token handed back still carries it.
	if again := Pull(r, "reviewer", RoleReviewer, Payload{}); !strings.Contains(again.Guidance, "four rounds") {
		t.Fatalf("a held token came back without the method: %q", again.Guidance)
	}

	// A METHOD THAT WILL NOT READ IS SAID AND NEVER FATAL.
	os.Remove(method)
	gone := Pull(r, "reviewer", RoleReviewer, Payload{})
	if gone.Pull != AnswerReview {
		t.Fatalf("a missing method broke the pull: %q", gone.Pull)
	}
	if !strings.Contains(gone.Guidance, "could not be read") {
		t.Fatalf("it did not say the method is missing: %q", gone.Guidance)
	}
}

// NOTHING STARTS A REVIEWER. The engine said spawn one if you have not, in a
// notice, and a notice is a suggestion. Seven tokens sat submitted with none in
// review while the queue went on handing out work.
func TestUnreviewedWorkBlocksTheQueue(t *testing.T) {
	r := guidanceTree(t)
	submit := func(title string) Token {
		tok, err := Mint(r, Token{Title: title, Assignee: "main", Scope: SingleStep,
			MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
		return tok
	}
	limit := TheFloor().UnreviewedBeforeBlocked
	for i := 0; i <= limit; i++ {
		submit(fmt.Sprintf("thing number %d", i))
	}
	// One more to be handed out, so a refusal is the only thing stopping it.
	if _, err := Mint(r, Token{Title: "the next thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"}); err != nil {
		t.Fatal(err)
	}

	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWait {
		t.Fatalf("the queue handed out %q with %d waiting for review", a.Pull, limit+1)
	}
	if !strings.Contains(a.Notice, "NO REVIEWER IS RUNNING") {
		t.Fatalf("the refusal does not say why: %q", a.Notice)
	}
	if !strings.Contains(a.Notice, "Spawn a reviewer") {
		t.Fatalf("the refusal does not say what clears it: %q", a.Notice)
	}

	// A REVIEWER IS NEVER REFUSED. It is the thing that clears this.
	rev := Pull(r, "reviewer", RoleReviewer, Payload{})
	if rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q %s", rev.Pull, rev.Notice)
	}

	// AND ONE TOKEN IN REVIEW IS A REVIEWER READING. The worker goes on.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("the worker is still blocked with a reviewer reading: %q %s", a.Pull, a.Notice)
	}
}

// A SUBMISSION IS SETTLED FIRST. Refusing it would lose the work, and settling
// one is progress.
func TestASubmissionIsSettledEvenWhenTheQueueIsBlocked(t *testing.T) {
	r := guidanceTree(t)
	limit := TheFloor().UnreviewedBeforeBlocked
	var last Token
	for i := 0; i <= limit; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		if i < limit {
			Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
		}
		last = tok
	}
	// The last one is held rather than submitted, and submitting it works even
	// though the answer that comes back is a refusal to hand out more.
	a := Pull(r, "main", RoleWorker, Payload{ID: last.ID, Disposition: "done"})
	if a.Pull != AnswerWait {
		t.Fatalf("the pull answered %q", a.Pull)
	}
	after, err := LoadToken(r, last.ID)
	if err != nil {
		t.Fatal(err)
	}
	if after.Status != ImpSubmitted {
		t.Fatalf("the submission was lost: %s is %s", last.ID, after.Status)
	}
}

// A REFUSAL SAYS HOW MANY, AND THE COUNT IS THE NUMBER ACTUALLY HELD. A
// shortened list left standing beside the function that shortens told an agent
// holding seven that it held three, and dropped the tail that says how many
// more.
func TestAStopRefusalCountsWhatIsHeldAndSaysHowManyMore(t *testing.T) {
	r := guidanceTree(t)
	const held = 7
	for i := 0; i < held; i++ {
		if _, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"}); err != nil {
			t.Fatal(err)
		}
	}
	said := AskToStop(r, "main").Reason
	if !strings.Contains(said, fmt.Sprintf("You hold %d piece(s)", held)) {
		t.Fatalf("the count is not the number held:\n%s", said)
	}
	if !strings.Contains(said, fmt.Sprintf("and %d more", held-3)) {
		t.Fatalf("it does not say how many more:\n%s", said)
	}
}

// The other caller says it too, from the same owner.
func TestTheReviewerRefusalSaysHowManyMore(t *testing.T) {
	r := guidanceTree(t)
	waiting := TheFloor().UnreviewedBeforeBlocked + 4
	for i := 0; i < waiting; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	}
	a := Pull(r, "main", RoleWorker, Payload{})
	if !strings.Contains(a.Notice, fmt.Sprintf("%d PIECES OF WORK", waiting)) {
		t.Fatalf("the count is not the number waiting:\n%s", a.Notice)
	}
	if !strings.Contains(a.Notice, fmt.Sprintf("and %d more", waiting-3)) {
		t.Fatalf("it does not say how many more:\n%s", a.Notice)
	}
}

// A HOLD IS NOT A READER.
//
// A token in review carries the name of whoever took it, and that name outlives
// the process behind it. A reviewer whose process died left a token held
// forever, and the refusal read that hold as somebody reading, so one dead
// reviewer turned it off for good. The owner watched a token sit in review for
// a long time with nobody behind the name.
func TestAStaleHoldIsNotAReviewerReading(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	limit := TheFloor().UnreviewedBeforeBlocked
	for i := 0; i <= limit; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	}
	// One more to hand out, so a refusal is the only thing stopping it.
	if _, err := Mint(r, Token{Title: "the next thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"}); err != nil {
		t.Fatal(err)
	}

	// A DEAD REVIEWER'S HOLD, WRITTEN THE WAY ONE WOULD BE LEFT. The token is in
	// review with a name on it and nothing behind the name.
	all := Tokens(r)
	var held Token
	for _, x := range all {
		if x.Status == ImpSubmitted {
			held = x
			break
		}
	}
	held.Status, held.Holder = ImpInReview, "a reviewer that died"
	if err := SaveToken(r, held); err != nil {
		t.Fatal(err)
	}

	// THE SESSION HAS TO HAVE RUN. A holder with no entry is trusted until the
	// queue has moved further than the staleness allows, because that is what a
	// hold looks like on the first pull after a restart. Past that, nobody is
	// behind it.
	var a Answer
	for i := 0; i <= TheFloor().PullsBeforeHoldIsStale; i++ {
		a = Pull(r, "main", RoleWorker, Payload{})
	}
	if a.Pull != AnswerWait {
		t.Fatalf("a stale hold turned the refusal off: the queue answered %q", a.Pull)
	}
	if !strings.Contains(a.Notice, "NO REVIEWER IS RUNNING") {
		t.Fatalf("the refusal does not say why: %q", a.Notice)
	}
	if !strings.Contains(a.Notice, "a reviewer that died") {
		t.Fatalf("it does not name the stale hold: %q", a.Notice)
	}

	// A LIVE HOLD IS A READER. The moment a reviewer pulls, its hold counts.
	if rev := Pull(r, "reviewer", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q", rev.Pull)
	}
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("a live reviewer did not clear it: %q %s", a.Pull, a.Notice)
	}
}

// A REVIEWER THAT ARRIVED AND THEN DIED IS NOT A READER EITHER.
//
// The first fix read the arrival record: a holder that had pulled in this
// session was counted as reading. An arrival is written once and never
// unwritten, so it stays true for the rest of the session after the process
// behind it is gone. That is the same shape as the status flag it replaced,
// one scope smaller.
//
// THE STATE IS BUILT THROUGH THE ENGINE'S OWN VERBS. Here the reviewer really
// pulls, really takes a token, and then does nothing, which is what a dead
// process looks like from the outside.
//
// A holder with no entry at all is a different state and the engine produces it
// every restart, because arrivals reset and a hold lives on the token.
// TestAHoldCarriedAcrossARestartIsNotCalledStopped is that one.
func TestAReviewerThatStopsPullingGoesStale(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	limit := TheFloor().UnreviewedBeforeBlocked
	for i := 0; i <= limit; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	}
	for i := 0; i < 40; i++ {
		if _, err := Mint(r, Token{Title: fmt.Sprintf("the next thing %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"}); err != nil {
			t.Fatal(err)
		}
	}

	// A REVIEWER ARRIVES AND TAKES ONE. Everything after this is what a live
	// reviewer and a dead one have in common.
	if rev := Pull(r, "reviewer", RoleReviewer, Payload{}); rev.Pull != AnswerReview {
		t.Fatalf("the reviewer was refused: %q %s", rev.Pull, rev.Notice)
	}

	// A REVIEWER THAT KEEPS PULLING IS NEVER STALE, so the fix cannot pass by
	// refusing everybody.
	stale := TheFloor().PullsBeforeHoldIsStale
	for i := 0; i < stale*2; i++ {
		Pull(r, "reviewer", RoleReviewer, Payload{})
		if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
			t.Fatalf("a reviewer that is pulling was called stale after %d turns: %q %s",
				i, a.Pull, a.Notice)
		}
	}

	// AND THEN IT DIES. Nothing pulls as a reviewer again.
	var a Answer
	for i := 0; i <= stale; i++ {
		a = Pull(r, "main", RoleWorker, Payload{})
	}
	if a.Pull != AnswerWait {
		t.Fatalf("a hold nobody is behind turned the refusal off: the queue answered %q", a.Pull)
	}
	if !strings.Contains(a.Notice, "NO REVIEWER IS RUNNING") {
		t.Fatalf("the refusal does not say why: %q", a.Notice)
	}
}

// A TOKEN WAITING FOR A REVIEWER IS NOT HELD BY ANYBODY.
//
// A draft goes to spec_in_review the moment its drafter sends it, and nobody
// holds it until a reviewer takes it. The refusal described that as held by
// nobody, who has stopped pulling, which names a person who does not exist and
// reads as an accusation against an empty string.
func TestSomethingWaitingWithNoHolderIsNotCalledHeld(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	limit := TheFloor().UnreviewedBeforeBlocked
	for i := 0; i <= limit; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	}
	if _, err := Mint(r, Token{Title: "the next thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"}); err != nil {
		t.Fatal(err)
	}
	// One of them sent for review and not yet taken, which is what a draft
	// looks like between the drafter sending it and a reviewer arriving.
	for _, x := range Tokens(r) {
		if x.Status == ImpSubmitted {
			x.Status, x.Holder = SpecInReview, ""
			if err := SaveToken(r, x); err != nil {
				t.Fatal(err)
			}
			break
		}
	}

	a := Pull(r, "main", RoleWorker, Payload{})
	if a.Pull != AnswerWait {
		t.Fatalf("the queue answered %q", a.Pull)
	}
	if strings.Contains(a.Notice, "held by ,") {
		t.Fatalf("it names a holder that is not there: %q", a.Notice)
	}
}

// A HOLD CARRIED ACROSS A RESTART IS NOT A REVIEWER THAT STOPPED.
//
// Arrivals are keyed by the session and reset when the engine restarts. A hold
// lives on the token on disk. So every hold that survives a restart is a holder
// with no entry at all, which is a different fact from a holder that has fallen
// behind, and the engine holds both.
//
// It called the first one stopped. The notice's one instruction is to spawn a
// reviewer, and a second reviewer's arrival reclaims every token in review, so
// the false cause evicted the reviewer that was already reading.
func TestAHoldCarriedAcrossARestartIsNotCalledStopped(t *testing.T) {
	r := guidanceTree(t)
	l, _ := OpenLog(r.Private("log"))
	l.Write("engine", "start", "engine", "started", Yes(), nil)
	l.Close()

	limit := TheFloor().UnreviewedBeforeBlocked
	for i := 0; i <= limit; i++ {
		tok, err := Mint(r, Token{Title: fmt.Sprintf("thing number %d", i),
			Assignee: "main", Scope: SingleStep, MintedBy: "person"})
		if err != nil {
			t.Fatal(err)
		}
		Pull(r, "main", RoleWorker, Payload{})
		Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	}
	if _, err := Mint(r, Token{Title: "the next thing", Assignee: "main",
		Scope: SingleStep, MintedBy: "person"}); err != nil {
		t.Fatal(err)
	}
	// A hold on disk, and a session that has just started. That is what the
	// engine sees on the first pull after a restart.
	for _, x := range Tokens(r) {
		if x.Status == ImpSubmitted {
			x.Status, x.Holder = ImpInReview, "reviewer1"
			if err := SaveToken(r, x); err != nil {
				t.Fatal(err)
			}
			break
		}
	}
	os.Remove(arrivalPath(r))

	a := Pull(r, "main", RoleWorker, Payload{})
	if strings.Contains(a.Notice, "has stopped pulling") {
		t.Fatalf("a holder that has never pulled is called stopped: %q", a.Notice)
	}
	if a.Pull != AnswerWork {
		t.Fatalf("the first pull of a session refused because of a hold it cannot judge: %q %s",
			a.Pull, a.Notice)
	}

	// AND IT GOES STALE ONCE THE SESSION HAS RUN. The hold is not trusted
	// forever, it is trusted until the queue has moved further than the
	// staleness allows.
	var later Answer
	for i := 0; i <= TheFloor().PullsBeforeHoldIsStale; i++ {
		later = Pull(r, "main", RoleWorker, Payload{})
	}
	if later.Pull != AnswerWait {
		t.Fatalf("a hold nobody came back for never went stale: %q", later.Pull)
	}
	if !strings.Contains(later.Notice, "reviewer1") {
		t.Fatalf("the refusal does not name the hold: %q", later.Notice)
	}
}

// AN AGENT THAT PICKED UP THE WRONG THING CAN SET IT DOWN.
//
// THE GAP. A held token comes back on every pull, because work already picked up
// comes back first. The only thing that releases one is something else open
// sitting ahead of it, which is a person putting work first. When nothing else
// is open the token cannot be released at all, and the queue shows an agent
// working on something it is not.
//
// THAT IS WHAT HAPPENED. A helper pulled until the queue handed over the token
// it wanted, picked up the shutdown token on the way, and then every pull
// answered with the shutdown. The person read the queue and asked why the
// machine shuts down was being implemented. Nothing was.
//
// PUTTING DOWN IS NOT ABORTING. The work is not ended, nothing became of it, and
// it goes back exactly where it was so the next puller finds it.
func TestWorkCanBePutDown(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "one picked wrongly", Status: ImpOpen})
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("the work was not handed out: %q", a.Pull)
	}
	if now, _ := LoadToken(r, tok.ID); now.Status != ImpInWork || now.Holder != "main" {
		t.Fatalf("it is %s held by %q", now.Status, now.Holder)
	}
	// AND IT COMES BACK ON EVERY PULL UNTIL IT IS PUT DOWN, which is the whole
	// reason the verb exists.
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Token == nil || a.Token.ID != tok.ID {
		t.Fatal("a held token did not come back")
	}

	put, err := PutDown(r, tok.ID, "main")
	if err != nil {
		t.Fatal(err)
	}
	if put.Status != ImpOpen || put.Holder != "" {
		t.Fatalf("a token put down is %s held by %q", put.Status, put.Holder)
	}
	// NOTHING BECAME OF IT. Putting down is not an ending.
	if put.Disposition != NoDisposition || put.Reason != "" {
		t.Fatalf("putting it down gave it a disposition %q and a reason %q",
			put.Disposition, put.Reason)
	}

	// A DRAFT GOES BACK TO A DRAFT, not to open. The two halves stay apart.
	draft := mint(t, r, Token{Title: "a draft picked up", Status: SpecInWork})
	draft.Holder = "main"
	if err := SaveToken(r, draft); err != nil {
		t.Fatal(err)
	}
	back, err := PutDown(r, draft.ID, "main")
	if err != nil {
		t.Fatal(err)
	}
	if back.Status != SpecOpen || back.Holder != "" {
		t.Fatalf("a draft put down is %s held by %q", back.Status, back.Holder)
	}
}

// ONLY THE HOLDER PUTS IT DOWN, and a token nobody is holding is not put down
// twice.
func TestOnlyTheHolderPutsItDown(t *testing.T) {
	r := lane(t)
	tok := mint(t, r, Token{Title: "one in hand", Status: ImpOpen})
	Pull(r, "main", RoleWorker, Payload{})

	// EACH REFUSAL IS ASSERTED ON WHAT ONLY IT CAN SAY. Three of these stand
	// one behind another: an ended token has no entry in the table either, and
	// a token nobody holds fails the holder check too. A test that only asked
	// whether the call was refused would pass with any one of them deleted.
	_, err := PutDown(r, tok.ID, "somebody else")
	if err == nil {
		t.Fatal("somebody who is not holding it put it down")
	}
	if !strings.Contains(err.Error(), "in main's hands rather than yours") {
		t.Fatalf("the refusal does not say whose hands it is in: %v", err)
	}
	if now, _ := LoadToken(r, tok.ID); now.Status != ImpInWork {
		t.Fatalf("the refused putdown moved it to %s", now.Status)
	}
	if _, err := PutDown(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}
	// AND A TOKEN THAT IS NOT IN ANYBODY'S HANDS IS REFUSED, rather than
	// quietly answering that it did something.
	// PUT DOWN TWICE, and the second time its state is nobody's hands at all.
	_, err = PutDown(r, tok.ID, "main")
	if err == nil {
		t.Fatal("a token nobody holds was put down")
	}
	if !strings.Contains(err.Error(), "nobody's hands to let go of") {
		t.Fatalf("the refusal does not name the state: %v", err)
	}

	// AND A TOKEN IN A HOLDING STATE THAT NOBODY HOLDS, which is the refusal
	// the one above would otherwise cover. A restart leaves exactly this.
	loose := mint(t, r, Token{Title: "one nobody holds", Status: ImpInWork})
	if err := SaveToken(r, loose); err != nil {
		t.Fatal(err)
	}
	_, err = PutDown(r, loose.ID, "main")
	if err == nil {
		t.Fatal("a token in nobody's hands was put down")
	}
	if !strings.Contains(err.Error(), "not in anybody's hands") {
		t.Fatalf("the refusal does not say it is in nobody's hands: %v", err)
	}
	// A TOKEN THAT HAS ENDED IS NOT PUT DOWN EITHER.
	done := mint(t, r, Token{Title: "one that ended", Status: ImpOpen})
	done.Status, done.Disposition, done.Holder = ImpDone, Done, "main"
	if err := SaveToken(r, done); err != nil {
		t.Fatal(err)
	}
	_, err = PutDown(r, done.ID, "main")
	if err == nil {
		t.Fatal("a token that had ended was put back into the queue")
	}
	if !strings.Contains(err.Error(), "already ended") {
		t.Fatalf("the refusal does not say it had ended: %v", err)
	}

}

// The engine hands an agent the Actionables chapter and nothing else. A file
// without that chapter is handed out whole, as before.
func TestTheMethodIsTheActionablesChapterAlone(t *testing.T) {
	r := lane(t)
	dir := GuidanceDir(r.Method)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	three := "# Reviewing\n\n## Motivation\n\nWhy this exists.\n\n" +
		"## Actionables\n\n- Verify, do not read.\n- Run the criteria.\n\n" +
		"## Discussion\n\n### A case\n\nOnce, on wk-1, something happened.\n"
	if err := os.WriteFile(filepath.Join(dir, "reviewing.md"), []byte(three), 0o644); err != nil {
		t.Fatal(err)
	}
	got := ReviewMethod(r)
	want := "## Actionables\n\n- Verify, do not read.\n- Run the criteria.\n"
	if got != want {
		t.Fatalf("the method is not the Actionables chapter alone:\n%q", got)
	}
	flat := "# Work token\n\nOne rule, no chapters.\n"
	if err := os.WriteFile(filepath.Join(dir, "work-token.md"), []byte(flat), 0o644); err != nil {
		t.Fatal(err)
	}
	if got := SpecMethod(r); got != flat {
		t.Fatalf("a file with no Actionables chapter is not handed out whole:\n%q", got)
	}
}

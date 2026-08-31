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
		Findings: []Rejection{{Clause: "voice", Wrong: "it uses a semicolon", Satisfies: "two sentences"}}, Lesson: Lesson{Class: "a check built from the fix", Avoid: "write the check first and watch it go red"}})

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
		Findings: []Rejection{{Clause: "evidence", Wrong: "no measurement", Satisfies: "a number"}}, Lesson: Lesson{Class: "a check built from the fix", Avoid: "write the check first and watch it go red"}})
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
		if tok.Status != Submitted {
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
	Pull(r, "reviewer", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "the total", Wrong: "it is still on the bar",
			Satisfies: "no count outside a group heading"}}, Lesson: Lesson{Class: "a check built from the fix", Avoid: "write the check first and watch it go red"}})

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
	if back.Status != Open || back.Holder != "" {
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
	child.Status, child.Holder = InWork, "main"
	if err := SaveToken(r, child); err != nil {
		t.Fatal(err)
	}
	if got, _ := LoadToken(r, parent.ID); got.Status != InWork {
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
	sub.Status, sub.Holder = InWork, "main"
	SaveToken(r, sub)
	sub.Status, sub.Holder = Submitted, ""
	SaveToken(r, sub)

	got, err := LoadToken(r, parent.ID)
	if err != nil {
		t.Fatal(err)
	}
	if got.Status != InWork || got.Holder != "main" {
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
	if after.Status != Submitted {
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

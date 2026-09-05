package main

import (
	"strings"
	"testing"
	"time"
)

// A TOKEN WITH SUB-TOKENS IS A SCOPE, AND A SCOPE IS NOT LEFT WHILE ANYTHING
// IN IT IS OPEN.
//
// The parent is refused every ending until its sub-tokens have ended, the
// queue hands the sub-tokens out first, and an abort is an ending like any
// other. Without the barrier a parent closed on top of open work, and the
// open work was found later by accident.

func mintTask(t *testing.T, r Roots, title, parent string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Tracked: tracked(), Process: "task", Title: title, Status: "open",
		Detail: "minted by the test", Parent: parent})
	if err != nil {
		t.Fatalf("minting %q: %v", title, err)
	}
	// A TRACKED TOKEN NEEDS A CLAIM FROM THIS BOX BEFORE IT CAN BE WORKED.
	if _, err := Claim(r, Claimant(r, "main"), []string{tok.ID}, time.Now().UTC()); err != nil {
		t.Fatalf("claiming %q: %v", title, err)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	return back
}

func TestAParentCannotCloseWhileASubTokenIsOpen(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	parent := mintTask(t, r, "the whole", "")
	child := mintTask(t, r, "a part", parent.ID)

	got := Pull(r, "a", RoleWorker, Payload{ID: parent.ID, Disposition: "done"})
	if got.Pull != AnswerRefused {
		t.Fatalf("the parent closed over an open sub-token: %s", got.Pull)
	}
	if f := got.Findings[0]; f.Clause != "blocked" || !strings.Contains(f.Wrong, child.ID) {
		t.Fatalf("it was refused for something else: %+v", f)
	}

	// THE SUB-TOKEN ENDS, AND THEN THE PARENT MAY. The order is the rule.
	if got := Pull(r, "a", RoleWorker, Payload{ID: child.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("the sub-token was refused: %+v", got.Findings)
	}
	if got := Pull(r, "a", RoleWorker, Payload{ID: parent.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("the parent was refused with its sub-token ended: %+v", got.Findings)
	}
	ended, err := LoadToken(r, parent.ID)
	if err != nil || ended.Disposition != Done {
		t.Fatalf("the parent did not end as done: %v %q", err, ended.Disposition)
	}
}

func TestTheQueueHandsOutSubTokensBeforeTheirParent(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	parent := mintTask(t, r, "the whole", "")
	child := mintTask(t, r, "a part", parent.ID)

	got := Pull(r, "a", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token.ID != child.ID {
		t.Fatalf("the first pull handed out %s, not the sub-token %s", got.Pull, child.ID)
	}
	if got := Pull(r, "a", RoleWorker, Payload{ID: child.ID, Disposition: "done"}); got.Pull == AnswerRefused {
		t.Fatalf("closing the sub-token was refused: %+v", got.Findings)
	}
	// With the sub-token ended the parent is the next thing, and a submission
	// hands the next thing back in the same answer.
	got = Pull(r, "a", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token.ID != parent.ID {
		t.Fatalf("after the sub-token, the pull handed out %s rather than the parent", got.Pull)
	}
}

func TestAHeldScopeHandsOutWhatIsInsideIt(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	parent := mintTask(t, r, "the whole", "")
	parent.Holder = "a"
	if err := SaveToken(r, parent); err != nil {
		t.Fatal(err)
	}
	child := mintTask(t, r, "a part", parent.ID)

	// THE SCOPE STAYS HELD AND THE STEP INSIDE IT IS HANDED OUT.
	got := Pull(r, "a", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token.ID != child.ID {
		t.Fatalf("holding a scope, the pull answered %s rather than the sub-token", got.Pull)
	}
	still, _ := LoadToken(r, parent.ID)
	if still.Holder != "a" {
		t.Fatalf("handing out the sub-token let go of the scope: holder %q", still.Holder)
	}

	// A SUB-TOKEN IN SOMEBODY ELSE'S HANDS IS NOT HANDED OUT, and the answer
	// says what the scope waits on.
	child, _ = LoadToken(r, child.ID)
	child.Holder = "b"
	if err := SaveToken(r, child); err != nil {
		t.Fatal(err)
	}
	got = Pull(r, "a", RoleWorker, Payload{})
	if got.Pull != AnswerWait || !strings.Contains(got.Notice, child.ID) {
		t.Fatalf("with the sub-token held elsewhere the pull answered %s: %s", got.Pull, got.Notice)
	}
}

func TestAnAbortIsRefusedWhileASubTokenIsOpen(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	parent := mintTask(t, r, "the whole", "")
	child := mintTask(t, r, "a part", parent.ID)

	if _, err := Abort(r, Aborting{ID: parent.ID, By: "person", Why: "obsolete"}); err == nil || !strings.Contains(err.Error(), child.ID) {
		t.Fatalf("the abort went through, or did not name the sub-token: %v", err)
	}
	if _, err := Abort(r, Aborting{ID: child.ID, By: "person", Why: "obsolete"}); err != nil {
		t.Fatalf("the sub-token could not be aborted: %v", err)
	}
	if _, err := Abort(r, Aborting{ID: parent.ID, By: "person", Why: "obsolete"}); err != nil {
		t.Fatalf("the parent could not be aborted after its sub-token: %v", err)
	}
}

func TestAParentNothingCanBePartOfIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	ended := mintTask(t, r, "already over", "")
	if _, err := Abort(r, Aborting{ID: ended.ID, By: "person", Why: "obsolete"}); err != nil {
		t.Fatal(err)
	}
	top := mintTask(t, r, "the top", "")
	middle := mintTask(t, r, "the middle", top.ID)

	cases := []struct {
		name   string
		parent string
		wants  string
	}{
		{"one that does not exist", "wk-0000000000", "does not exist"},
		{"one that has ended", ended.ID, "already ended"},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			_, err := Mint(r, Token{Tracked: tracked(), Process: "task", Title: "a part", Status: "open", Parent: c.parent})
			if err == nil || !strings.Contains(err.Error(), c.wants) {
				t.Fatalf("got %v, want a refusal saying %q", err, c.wants)
			}
		})
	}

	// A LOOP IS REFUSED WHERE IT WOULD CLOSE. The top cannot be made a part of
	// the middle, because the middle is already a part of the top.
	top.Parent = middle.ID
	if err := checkParent(r, top.ID, top.Parent); err == nil {
		t.Fatal("a loop of parents was accepted")
	}
}

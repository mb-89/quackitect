package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// EVERY UNCLAIMED STOP IS REFUSED, and open work is not what decides.
//
// The commonest bad stop is the agent with nothing open that ends the turn to
// say what it did. A rule that bites only over open work never sees that one.
func TestAStopIsRefusedUntilAReasonIsClaimed(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	first := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if !strings.Contains(first, `"decision":"block"`) {
		t.Fatalf("an unclaimed stop passed with nothing open: %s", first)
	}
	for _, want := range []string{"SANCTIONED", "decision", "broken", "plan", "se_stop"} {
		if !strings.Contains(first, want) {
			t.Fatalf("the refusal does not carry %q: %s", want, first)
		}
	}

	// A RETRY IS NOT A CLAIM. The harness sets that flag by itself, so asking
	// twice proves the harness retried and nothing about what was decided.
	again := hookSays(t, exe, r.Method, "Stop",
		map[string]any{"cwd": r.Work, "stop_hook_active": true})
	if !strings.Contains(again, `"decision":"block"`) {
		t.Fatalf("a bare retry granted the stop: %s", again)
	}
}

// The refusal names the work, because an agent told only that it may not stop
// has to guess what to do instead.
func TestARefusedStopNamesTheWorkTheActorHolds(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	tok, err := Mint(r, Token{Title: "write the thing", Assignee: "main"})
	if err != nil {
		t.Fatal(err)
	}
	out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if !strings.Contains(out, tok.ID) || !strings.Contains(out, "write the thing") {
		t.Fatalf("the refusal does not name the work: %s", out)
	}
}

// Work that is somebody else's is not named at somebody else's stop.
func TestARefusalDoesNotNameAnotherActorsWork(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	if _, err := Mint(r, Token{Title: "the scribe's own", Assignee: "scribe-1"}); err != nil {
		t.Fatal(err)
	}
	out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if strings.Contains(out, "the scribe's own") {
		t.Fatalf("main was shown work assigned to a scribe: %s", out)
	}
}

// A name nobody registered names nothing, so it is refused where it is made
// rather than accepted and quietly meaning nothing.
func TestAStopClaimNamesSomethingSanctioned(t *testing.T) {
	r := guidanceTree(t)
	if err := ClaimStop(r, "main", "i felt like it", "because"); err == nil {
		t.Fatal("an unsanctioned reason was accepted")
	}
	if err := ClaimStop(r, "main", "broken", "  "); err == nil {
		t.Fatal("a claim with no why was accepted")
	}
	// The list is assembled from what each level registered, so Level 1's
	// entry stands beside Level 0's.
	var ids []string
	for _, s := range Sanctioned() {
		ids = append(ids, s.ID)
	}
	for _, want := range []string{"decision", "broken", "plan", "blocked"} {
		if !strings.Contains(strings.Join(ids, " "), want) {
			t.Fatalf("the list is %v and does not hold %q", ids, want)
		}
	}
}

// ANYTHING THE AGENT DOES AFTER CLAIMING ERASES THE CLAIM. A claim says the
// next thing is stopping. Carrying on is changing your mind.
func TestAnyActionSpendsTheClaim(t *testing.T) {
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := OpenLog(r.Private("log"))
	l.Close()

	if err := ClaimStop(r, "main", "broken", "the build will not run here"); err != nil {
		t.Fatal(err)
	}
	hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Read",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	})
	if _, ok := StandingClaim(r, "main"); ok {
		t.Fatal("the claim survived an action")
	}

	// Claimed and used straight away, it is honoured.
	if err := ClaimStop(r, "main", "broken", "the build will not run here"); err != nil {
		t.Fatal(err)
	}
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
		t.Fatalf("a claimed stop was refused: %s", out)
	}

	// AND IT STANDS WHILE THE AGENT IS STOPPED. A harness sends turns nobody
	// asked for, and every one of them ends in a stop. An agent that has
	// stopped and done nothing since is still stopped, so the same claim is
	// still true.
	for i := 0; i < 3; i++ {
		if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
			t.Fatalf("stop %d was refused while the claim still stood: %s", i+2, out)
		}
	}

	// Acting ends it, and the stop after that is refused again.
	hookSays(t, exe, r.Method, "PreToolUse", map[string]any{
		"cwd": r.Work, "tool_name": "Read",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	})
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out == "" {
		t.Fatal("a stop was granted after the agent went back to work")
	}
}

// Submitted work is with a reviewer, so the worker has nothing left to do on
// it and the refusal should not name it.
func TestSubmittedWorkIsNotNamedAsWorkInHand(t *testing.T) {
	r := guidanceTree(t)
	tok, err := Mint(r, Token{Title: "write the thing", Assignee: "main"})
	if err != nil {
		t.Fatal(err)
	}
	if AskToStop(r, "main").Permitted {
		t.Fatal("open work should be named")
	}
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	if !AskToStop(r, "main").Permitted {
		t.Fatal("work that is with a reviewer was named as work in hand")
	}
}

// A rejected token comes back, and it is work in hand again. That is the whole
// point of it coming back.
func TestRejectedWorkIsWorkInHandAgain(t *testing.T) {
	r := guidanceTree(t)
	tok, _ := Mint(r, Token{Title: "write the thing", Assignee: "main"})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "main", RoleWorker, Payload{ID: tok.ID, Disposition: string(Done)})
	Pull(r, "rev", RoleReviewer, Payload{})
	Pull(r, "rev", RoleReviewer, Payload{ID: tok.ID, Verdict: "reject",
		Findings: []Rejection{{Clause: "voice", Wrong: "a semicolon", Satisfies: "two sentences"}}})

	if AskToStop(r, "main").Permitted {
		t.Fatal("rejected work should be work in hand again")
	}
	// And the reviewer is not shown somebody else's token.
	if !AskToStop(r, "rev").Permitted {
		t.Fatal("the reviewer was shown work it does not hold")
	}
}

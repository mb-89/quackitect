package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// EVERY UNCLAIMED STOP IS REFUSED, and open work is not what decides.
//
// The commonest bad stop is the agent with nothing open that ends the turn to
// say what it did. A rule that bites only over open work never sees that one.
func TestAStopIsRefusedUntilAReasonIsClaimed(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	// THE FIRST STOP OF THE SESSION IS GRANTED, so it is spent before the rule
	// under test can be seen.
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); strings.Contains(out, `"decision":"block"`) {
		t.Fatalf("the first stop of the session was refused: %s", out)
	}

	first := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if !strings.Contains(first, `"decision":"block"`) {
		t.Fatalf("an unclaimed stop passed with nothing open: %s", first)
	}
	for _, want := range []string{"SANCTIONED", "decision", "broken", "plan", "se_stop"} {
		if !strings.Contains(first, want) {
			t.Fatalf("the refusal does not carry %q: %s", want, first)
		}
	}

	// A RETRY IS NOT A CLAIM. A harness retries a blocked stop by itself, so
	// asking twice proves the harness retried and nothing about what was decided.
	// The engine reads no flag saying a stop is a retry, so a second ask arrives
	// as the first one did.
	again := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if !strings.Contains(again, `"decision":"block"`) {
		t.Fatalf("a bare retry granted the stop: %s", again)
	}
}

// A name nobody registered names nothing, so it is refused where it is made
// rather than accepted and quietly meaning nothing.
func TestAStopClaimNamesSomethingSanctioned(t *testing.T) {
	t.Parallel()
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

// THE FIRST STOP OF A SESSION IS GRANTED, AND ONLY THE FIRST. A window that
// has just started says it is ready and waits, because the person asked it
// to. Refusing that stop made the agent claim a reason for doing what it was
// told, twice, on every start.
func TestTheFirstStopOfASessionIsGranted(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
		t.Fatalf("the first stop of the session was answered %q, want it granted in silence", out)
	}
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); !strings.Contains(out, `"decision":"block"`) {
		t.Fatalf("the second unclaimed stop passed: %s", out)
	}
}

// A BLOCKED CLAIM MEETS THE QUEUE. Blocked means everything you hold waits on
// somebody else, and the engine knows when that is false: the same code that
// answers a pull knows what it would hand you. The refusal carries the offer.
func TestABlockedClaimIsRefusedWhileTheQueueWouldHandWork(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	// The first stop of the session is granted; spend the grace first.
	hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})

	// The fixture declares its own process, so the queue has a rule to hand
	// work out by.
	procs := filepath.Join(r.Method, "src", "processes")
	if err := os.MkdirAll(procs, 0o755); err != nil {
		t.Fatal(err)
	}
	proc := "name: task\ndescription: a fixture process\nsections:\n  required:\n    - detail\nstates:\n  - name: open\n    description: waiting\n  - name: closed\n    description: finished\nactivities:\n  - name: mint\n    does: write it down\n    to: open\n  - name: do\n    does: do it\n    from: open\n    to: closed\ndispositions:\n  - name: done\n    description: it was done\n"
	if err := os.WriteFile(filepath.Join(procs, "task.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	tok, err := Mint(r, Token{Tracked: local(), Title: "work that stands", Process: "task", Status: "open",
		Detail: "minted by the test"})
	if err != nil {
		t.Fatal(err)
	}
	// THE FIRST DOOR: the claim is refused as it is made, carrying the offer.
	err = ClaimStop(r, "main", "blocked", "waiting on agents")
	if err == nil {
		t.Fatal("a false blocked claim was accepted")
	}
	if !strings.Contains(err.Error(), tok.ID) {
		t.Fatalf("the claim refusal does not carry the offer %s: %v", tok.ID, err)
	}

	// THE SECOND DOOR: a claim that got in anyway is judged again at the stop.
	if err := saveClaims(r, claims{Claims: map[string]StopClaim{"main": {
		Session: currentSession(r), Actor: "main", Because: "blocked", Why: "stale", At: now()}}}); err != nil {
		t.Fatal(err)
	}
	out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if !strings.Contains(out, `"decision":"block"`) {
		t.Fatalf("a blocked claim passed with work standing: %s", out)
	}
	if !strings.Contains(out, tok.ID) {
		t.Fatalf("the refusal does not carry the offer %s: %s", tok.ID, out)
	}
}

// AND WITH NOTHING TO HAND, BLOCKED IS TRUE AND THE STOP IS GRANTED.
func TestABlockedClaimStandsWhenTheQueueIsEmpty(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if err := ClaimStop(r, "main", "blocked", "the queue is dry"); err != nil {
		t.Fatal(err)
	}
	// NOTHING IS HELD AND NOTHING IS OFFERED, which is both halves of the
	// evidence blocked is judged on, so the claim is still true at the stop and
	// BlockedIsFalse has nothing to refuse it with.
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
		t.Fatalf("a true blocked claim with a dry queue was refused: %s", out)
	}
}

// ANYTHING THE AGENT DOES AFTER CLAIMING ERASES THE CLAIM. A claim says the
// next thing is stopping. Carrying on is changing your mind.
func TestAnyActionSpendsTheClaim(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	// The first stop of the session is granted, and the claim rule is what is
	// under test, so that grace is spent first.
	hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})

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

	// Claimed again, and with nothing in hand it is honoured at once.
	if err := ClaimStop(r, "main", "broken", "the build will not run here"); err != nil {
		t.Fatal(err)
	}
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
		t.Fatalf("a claim with nothing in hand was refused: %s", out)
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

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
	t.Parallel()
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

// ANYTHING THE AGENT DOES AFTER CLAIMING ERASES THE CLAIM. A claim says the
// next thing is stopping. Carrying on is changing your mind.
func TestAnyActionSpendsTheClaim(t *testing.T) {
	t.Parallel()
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

package main

import (
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// A PERSON PUT EVERYTHING DOWN, and nothing the agent asks for is allowed.
// The button is the grant, so no claim is wanted for the stop that follows.
func TestNothingIsAllowedWhileEverythingIsOnHold(t *testing.T) {
	t.Parallel()
	exe := buildEngine(t)
	r := guidanceTree(t)
	Project(r)
	l, _ := sessionlog.Open(r.Private("log"))
	l.Close()

	read := map[string]any{
		"cwd": r.Work, "tool_name": "Read",
		"tool_input": map[string]any{"file_path": filepath.Join(r.Work, "notes.md")},
	}
	// Before the hold, an ordinary read is allowed and a stop is refused.
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); strings.Contains(out, `"deny"`) {
		t.Fatalf("a read was refused with no hold: %s", out)
	}
	// The first stop of the session is granted, so it is spent before the
	// rule under test can be seen.
	hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work})
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out == "" {
		t.Fatal("an unclaimed stop passed with no hold")
	}

	if _, err := SetHold(r, HoldHeld, "person"); err != nil {
		t.Fatal(err)
	}

	out := hookSays(t, exe, r.Method, "PreToolUse", read)
	if !strings.Contains(out, `"permissionDecision":"deny"`) {
		t.Fatalf("a read was allowed while everything was on hold: %s", out)
	}
	if !strings.Contains(out, "on hold") {
		t.Fatalf("the refusal does not say why: %s", out)
	}
	// AND THE STOP IS GRANTED WITH NO CLAIM. Asking the agent to name a reason
	// for somebody else's decision is asking it to explain a thing it did not
	// decide.
	if out := hookSays(t, exe, r.Method, "Stop", map[string]any{"cwd": r.Work}); out != "" {
		t.Fatalf("the stop was refused while on hold: %s", out)
	}

	// Lifted, and work goes on.
	if _, err := SetHold(r, HoldOff, "person"); err != nil {
		t.Fatal(err)
	}
	if out := hookSays(t, exe, r.Method, "PreToolUse", read); strings.Contains(out, `"deny"`) {
		t.Fatalf("a read was refused after the hold was lifted: %s", out)
	}
}

// It is a file, so it outlives the process that set it and every process that
// reads it.
func TestTheHoldSurvivesTheProcessThatSetIt(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	if LoadHold(r).On {
		t.Fatal("it started on")
	}
	h, err := SetHold(r, HoldHeld, "person")
	if err != nil {
		t.Fatal(err)
	}
	if !h.On || h.By != "person" || h.At == "" || h.Says == "" {
		t.Fatalf("it says %+v", h)
	}
	if again := LoadHold(r); !again.On || again.Says != h.Says {
		t.Fatalf("read back as %+v", again)
	}
	SetHold(r, HoldOff, "person")
	if LoadHold(r).On {
		t.Fatal("it stayed on after being lifted")
	}
}

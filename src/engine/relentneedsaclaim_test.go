package main

import (
	"bytes"
	"encoding/json"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// A STOP IS GRANTED ON A CLAIM, AND NEVER ON PERSISTENCE.
//
// THE OWNER WATCHED IT GO QUIET MID-SESSION. The hook refused, the agent
// stopped again, and after a few rounds the engine let it through with nothing
// claimed. An agent that keeps stopping was released for stopping often enough,
// which is not a decision anybody made.
//
// v3 REMOVED THIS EXACT VALVE and wrote down why: stop_hook_active is not a
// claim, the harness sets it when it retries a blocked stop, so the valve
// released itself and the log read block, pass, block, pass. From outside that
// is indistinguishable from a hook that does not work.
//
// decideStop's own header already said it: a claim is what grants it, and not a
// retry. The code below that comment relented on a count anyway.
func TestAStopWithNoClaimIsRefusedHoweverOftenItIsAsked(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	tok := mintStandard(t, r, "work left standing")
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}

	stop := func() string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "Stop", "cwd": r.Work,
			"session_id": "s-1"})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}

	// THE FIRST STOP OF THE SESSION IS GRANTED, and that is its own rule.
	stop()

	// EVERY ONE AFTER IT IS REFUSED, however often it is asked. Nothing in the
	// payload says which of these is a retry, because the engine reads no such
	// flag: the harness sets one for its own reasons, and the field it would
	// arrive in is gone.
	for i := 0; i < 6; i++ {
		if said := stop(); !strings.Contains(said, "block") {
			t.Fatalf("stop %d with nothing claimed was granted: %s", i+2, said)
		}
	}
}

// AND A CLAIM GRANTS ONE STOP, WHICH THE NEXT PULL SPENDS.
func TestAClaimGrantsOneStopAndThePullSpendsIt(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	mintStandard(t, r, "work to return to")
	stop := func() string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "Stop", "cwd": r.Work,
			"session_id": "s-1"})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	stop() // the first of the session, granted on its own rule

	// A CLAIM GRANTS THE STOP, and a standing claim naming one of the five
	// reasons is the whole of it. decideStop grants it outright; the only claim
	// it judges again at the stop is blocked, against the record.
	if err := ClaimStop(r, "main", "asked", "they told me to"); err != nil {
		t.Fatal(err)
	}
	if said := stop(); strings.Contains(said, "block") {
		t.Fatalf("a claim with nothing in hand was refused: %s", said)
	}

	// THE NEXT CALL SPENDS IT, so one claim releases one stop and never the one
	// after it. v3 spent it on the next pull; this engine spends it on the next
	// tool call, which is the same rule drawn tighter: SpendClaim runs before
	// every one. It has to go through the guard, because that is where it is
	// spent, and calling the verb underneath would leave the claim standing.
	body, _ := json.Marshal(map[string]any{"hook_event_name": "PreToolUse", "cwd": r.Work,
		"session_id": "s-1", "tool_name": "Read", "tool_input": map[string]any{"file_path": "x.md"}})
	var spent bytes.Buffer
	answerHook(t.Context(), body, []string{"--method", r.Method}, &spent, log)

	if said := stop(); !strings.Contains(said, "block") {
		t.Fatalf("the same claim granted a second stop after a call: %s", said)
	}
}

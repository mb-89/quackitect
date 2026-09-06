package main

import (
	"bytes"
	"encoding/json"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// ONE CLAIM IS THE STOP.
//
// THE OWNER'S WORDS: I do not want you to have to stop two times. If you claim,
// you can stop next. If the reason is valid, you stop.
//
// THE ENGINE USED TO ARGUE. Over work in hand it pushed back twice and granted
// the third claim, on the owner's earlier word that a reason given three times
// is a position somebody is holding. Weighed against what it cost in turns,
// they decided the other way, and the argument was deleted with its file.
//
// WHAT IT PROTECTED IS NOT LOST. A stop still needs a claim, the claim still
// names one of five sanctioned reasons, and a false blocked is still refused
// where it is typed. TestAValidClaimStopsAtOnce holds the rule over open work,
// and this holds it with nothing in hand.
func TestAClaimWithEmptyHandsIsGrantedAtOnce(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	stop := func() string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "Stop", "cwd": r.Work,
			"session_id": "s-1", "stop_hook_active": true})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	stop() // the first of the session, granted on its own rule

	// NOTHING IS MINTED, so nothing is held and the engine has no answer to give
	// back. One claim is the whole of it.
	if err := ClaimStop(r, "main", "broken", "the toolchain will not build and no remedy gets past it"); err != nil {
		t.Fatal(err)
	}
	if said := stop(); strings.Contains(said, "block") {
		t.Fatalf("a claim with nothing in hand was argued with: %s", said)
	}
}

// AND A REFUSAL WITH NOTHING CLAIMED ASKS THE SAME QUESTIONS.
func TestTheRefusalAsksBeforeItLists(t *testing.T) {
	t.Parallel()
	said := TheList("")
	for _, asks := range []string{"only they can", "carry on"} {
		if !strings.Contains(said, asks) {
			t.Errorf("the refusal does not ask about %q: %s", asks, said)
		}
	}
}

// THE PERSON'S WORD IS NOT ARGUED WITH.
//
// THE OWNER'S WORDS: if the user tells you that you stop, I don't give a shit
// about your sub tokens. You stop.
//
// Every other reason is the agent's own judgement, and the engine tests that by
// pushing back twice. asked is not the agent's judgement, so pushing back tests
// the person, which the engine has no business doing. An agent told to stop
// claimed asked, the engine asked whether asked was the nearest of five words,
// and the person watched it take another turn to say yes.
//
// IT IS HELD HERE BECAUSE NOTHING HELD IT. The rule was written into the stop
// decision and the tests around it went on claiming asked while asserting an
// argument, so the carve-out and its own coverage were the same three tests
// pulling opposite ways.
func TestThePersonsWordIsNotArguedWith(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	// WORK IS IN HAND, which is the only thing the engine ever argues with. Any
	// other reason would be pushed back on twice here.
	tok := mintStandard(t, r, "work being interrupted")
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}
	stop := func() string {
		t.Helper()
		body, _ := json.Marshal(map[string]any{"hook_event_name": "Stop", "cwd": r.Work,
			"session_id": "s-1", "stop_hook_active": true})
		var out bytes.Buffer
		answerHook(t.Context(), body, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	stop() // the first of the session, granted on its own rule

	if err := ClaimStop(r, "main", "asked", "they told me to stop"); err != nil {
		t.Fatal(err)
	}
	if said := stop(); strings.Contains(said, "block") {
		t.Fatalf("the person's word was argued with over open work: %s", said)
	}
}

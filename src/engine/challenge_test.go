package main

import (
	"bytes"
	"encoding/json"
	"strings"
	"testing"
)

// A CLAIM IS ARGUED WITH, AND THE THIRD ONE GOES.
//
// THE OWNER'S WORDS: the agent says I'm blocked, and the engine says, well, but
// I still have work to do. Then the agent can say again, yeah, but I'm blocked.
// If he has a reason three times, then it stops.
//
// NAMING A REASON WAS STOPPING. The claim was read and the stop granted in the
// same breath, so the reason cost nothing and any of the five words did.
//
// THE REASON HERE IS NOT asked, AND THAT IS THE POINT OF THE CHOICE. The
// person's word is granted on the claim that names it, whatever is in the
// agent's hands, so an argument test claiming asked argues with nothing and
// asserts that it did. These three did, and went on passing until the carve-out
// landed and then failed together for a rule they were never about.
// TestThePersonsWordIsNotArguedWith holds that rule, so it is tested where it
// lives rather than by accident here.
func TestAClaimIsArguedWithAndTheThirdIsGranted(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	tok := mintStandard(t, r, "work still standing")
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
	claim := func() {
		t.Helper()
		if err := ClaimStop(r, "main", "broken", "the toolchain will not build and no remedy gets past it"); err != nil {
			t.Fatal(err)
		}
	}
	stop() // the first of the session, granted on its own rule

	// THE FIRST TWO CLAIMS ARE ARGUED WITH, and the argument names the work.
	for i := 1; i <= claimsBeforeAStopIsGranted-1; i++ {
		claim()
		said := stop()
		if !strings.Contains(said, "block") {
			t.Fatalf("claim %d was taken at face value: %s", i, said)
		}
		for _, asks := range []string{"only they can", "carry on", tok.ID} {
			if !strings.Contains(said, asks) {
				t.Errorf("the argument does not name %q: %s", asks, said)
			}
		}
	}

	// AND THE THIRD IS GRANTED, whatever is still open.
	claim()
	if said := stop(); strings.Contains(said, "block") {
		t.Fatalf("the third claim was refused: %s", said)
	}
}

// AND WITH NOTHING TO PUSH BACK WITH, ONE CLAIM IS THE STOP.
//
// THE OWNER'S RULE, IN FULL: the agent stops with no reason and is refused, it
// claims one of the five, and if the reason is good AND NOTHING ELSE IS
// BLOCKING the claim just goes. The argument above is for when the engine has
// something to argue with, which is work still in the agent's hands.
//
// ARGUING WITH EVERY CLAIM was the mistake. It made the count the rule and the
// state of the tree irrelevant, so an agent with empty hands was refused twice
// for nothing. Persistence is the price of leaving work behind, not the price
// of stopping.
func TestAClaimWithEmptyHandsIsGrantedAtOnce(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

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

// AND CARRYING ON PUTS THE COUNT BACK. Two claims and then a tool call is
// changing your mind, so the next stop is claim one again.
func TestCarryingOnStartsTheArgumentAgain(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	// THE ARGUMENT ONLY HAPPENS OVER WORK IN HAND, so the token is taken up. With
	// empty hands the first claim would be granted and there would be no count to
	// put back.
	tok := mintStandard(t, r, "work to return to")
	if _, err := TakeUp(r, tok.ID, "main"); err != nil {
		t.Fatal(err)
	}

	tell := func(event string, more map[string]any) string {
		t.Helper()
		body := map[string]any{"hook_event_name": event, "cwd": r.Work, "session_id": "s-1"}
		for k, v := range more {
			body[k] = v
		}
		raw, _ := json.Marshal(body)
		var out bytes.Buffer
		answerHook(t.Context(), raw, []string{"--method", r.Method}, &out, log)
		return out.String()
	}
	tell("Stop", nil) // the first of the session

	for i := 0; i < claimsBeforeAStopIsGranted-1; i++ {
		if err := ClaimStop(r, "main", "broken", "the toolchain will not build and no remedy gets past it"); err != nil {
			t.Fatal(err)
		}
		tell("Stop", nil)
	}
	// CARRYING ON.
	tell("PreToolUse", map[string]any{"tool_name": "Read",
		"tool_input": map[string]any{"file_path": "notes.md"}})

	// THE NEXT CLAIM IS CLAIM ONE, so it is argued with rather than granted.
	if err := ClaimStop(r, "main", "broken", "the toolchain will not build and no remedy gets past it"); err != nil {
		t.Fatal(err)
	}
	if said := tell("Stop", nil); !strings.Contains(said, "block") {
		t.Fatalf("the count survived an action, so a stop was bought before it was argued: %s", said)
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
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

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

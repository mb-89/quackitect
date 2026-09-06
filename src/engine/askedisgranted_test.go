package main

import (
	"bytes"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// THE PERSON'S WORD IS NOT ARGUED WITH.
//
// THE OWNER'S WORDS: if the user tells you that you stop, I don't give a shit
// about your sub tokens. You stop.
//
// An agent was told to stop, claimed asked, and the engine asked whether asked
// was the nearest of five words that fits. It held work, so the claim was
// argued with twice. Every answer the agent gave was itself a call, and a call
// clears the claim, so the count went back to one and the argument never ended.
// The person watched eleven turns of it.
//
// THE ARGUMENT TESTS THE AGENT'S JUDGEMENT, NOT THEIRS. blocked, broken,
// decision and plan are the agent's own reading of the tree, and holding work
// is something to push back with. asked is a fact about what the person said.
func TestAskedIsGrantedOnTheFirstClaim(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	const actor = "main"
	tok := mintStandard(t, r, "work still in hand")
	if _, err := TakeUp(r, tok.ID, actor); err != nil {
		t.Fatal(err)
	}
	if held := TheyHold(r, actor); len(held) == 0 {
		t.Fatal("this proves nothing: the actor holds nothing to be argued with")
	}

	// THE SESSION'S FIRST STOP IS GRANTED WHATEVER IT SAYS, so it is spent here
	// rather than mistaken for the rule under test.
	aStopIsGranted(t, r, log, actor, "broken")
	forgetRefusedStops(r, "claimed:"+actor)

	// EVERY OTHER REASON IS STILL ARGUED WITH, so the guard is not simply off.
	//
	// blocked is not among them, because it is refused at the claim itself when
	// the work waits on nobody. It never reaches the argument.
	for _, because := range []string{"broken", "decision", "plan"} {
		if granted := aStopIsGranted(t, r, log, actor, because); granted {
			t.Errorf("%s was granted on the first claim over open work, so the argument is gone", because)
		}
		forgetRefusedStops(r, "claimed:"+actor)
	}

	// AND asked IS GRANTED AT ONCE, whatever is in hand.
	if granted := aStopIsGranted(t, r, log, actor, "asked"); !granted {
		t.Error("the person said stop and the engine argued, which is the engine testing their judgement")
	}
}

// aStopIsGranted drives one claim through the stop decision and answers whether
// the engine let it go.
func aStopIsGranted(t *testing.T, r Roots, log *sessionlog.Log, actor, because string) bool {
	t.Helper()
	if err := ClaimStop(r, actor, because, "the person said so"); err != nil {
		t.Fatal(err)
	}
	var said bytes.Buffer
	g := &guard{out: &said}
	decideStop(g, r, LoadConfig(r), log, hookIn{SessionID: "s-1"}, actor)
	return !strings.Contains(said.String(), `"decision":"block"`)
}

// THE NOTICE SAYS WHICH CLAIM THIS IS, so a repeat is not read as a refusal.
//
// "Do anything and it is gone" was read as "do work and it is gone". An agent
// claimed, asked the engine for its status, and the status cleared the claim.
// The notice came back unchanged, so the agent read a cleared claim as a
// refused one and went round forty times.
func TestTheChallengeSaysWhichClaimThisIs(t *testing.T) {
	said := TheChallenge(StopClaim{Because: "blocked", Why: "it waits on somebody else"}, 1,
		[]Token{{ID: "wk-1", Title: "held"}})
	for _, want := range []string{"claim 1 of 3", "wk-1"} {
		if !strings.Contains(said, want) {
			t.Errorf("the challenge does not say %q:\n%s", want, said)
		}
	}
}

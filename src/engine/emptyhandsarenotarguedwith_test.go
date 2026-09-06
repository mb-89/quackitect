package main

import (
	"bytes"
	"quackitect/engine/internal/sessionlog"
	"testing"
)

// AN AGENT HOLDING NOTHING IS NOT ARGUED WITH.
//
// The argument needs something to argue with, and that is work still in the
// agent's hands. A good reason with nothing blocking is granted on the claim
// that names it. Arguing with every claim made the count the rule and the state
// of the tree irrelevant, so an agent holding nothing was refused twice with
// nothing to say back to it.
//
// THE HALF WITH A TEST WAS THE OTHER HALF. TestAskedIsGrantedOnTheFirstClaim
// drives an actor that holds a token, and proves the argument still happens for
// every reason but asked. Nothing drove an actor with empty hands, so the
// condition that reads the hands could have gone and the suite would have
// stayed green.
//
// GRANTED MEANS THE GUARD SAYS NOTHING AT ALL. A refusal is a decision written
// to the guard's output. So the assertion here is on the whole of what it wrote
// rather than on the word block, and an empty answer is the grant.
func TestEmptyHandsAreNotArguedWith(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	const actor = "worker-empty"
	// THE SESSION'S FIRST STOP IS GRANTED WHATEVER IT SAYS, so it is spent here
	// rather than mistaken for the rule under test.
	whatTheStopSaid(t, r, log, actor, "broken")
	forgetRefusedStops(r, "claimed:"+actor)
	if held := TheyHold(r, actor); len(held) != 0 {
		t.Fatalf("this proves nothing: the actor holds %d token(s)", len(held))
	}

	// EVERY REASON, BECAUSE THE HANDS DECIDE AND NOT THE WORD. asked is granted
	// whatever is held, and the other three are argued with only over open work.
	//
	// blocked is left out: it is refused at the claim itself when the work waits
	// on nobody, and never reaches the argument this is about.
	for _, because := range []string{"asked", "broken", "decision", "plan"} {
		if said := whatTheStopSaid(t, r, log, actor, because); said != "" {
			t.Errorf("%s was argued with by an actor holding nothing:\n%s", because, said)
		}
		forgetRefusedStops(r, "claimed:"+actor)
	}
}

// whatTheStopSaid drives one claim through the stop decision and answers
// everything the guard wrote, which is nothing when the stop was granted.
func whatTheStopSaid(t *testing.T, r Roots, log *sessionlog.Log, actor, because string) string {
	t.Helper()
	if err := ClaimStop(r, actor, because, "the work is done and nothing is in hand"); err != nil {
		t.Fatal(err)
	}
	var said bytes.Buffer
	g := &guard{out: &said}
	decideStop(g, r, LoadConfig(r), log, hookIn{SessionID: "s-1"}, actor)
	return said.String()
}

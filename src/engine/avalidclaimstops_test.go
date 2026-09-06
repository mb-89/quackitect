package main

import (
	"quackitect/engine/internal/sessionlog"
	"testing"
)

// A CLAIM WITH A SANCTIONED REASON STOPS, ONCE.
//
// THE OWNER'S WORDS: I do not want you to have to stop two times. If you claim,
// you can stop next. If the reason is valid, you stop.
//
// THIS REVERSES A MEASUREMENT. The engine used to push back twice over open
// work and grant the third claim, on the owner's earlier word that a reason
// given three times is a position somebody is holding. Weighed against what it
// costs in turns, the owner decided the other way.
//
// WHAT THE ARGUMENT PROTECTED IS NOT LOST. A stop still needs a claim, the
// claim still names one of five sanctioned reasons, and a false blocked is
// still refused where it is typed.
func TestAValidClaimStopsAtOnce(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	const actor = "main"
	tok := mintStandard(t, r, "work in hand")
	if _, err := TakeUp(r, tok.ID, actor); err != nil {
		t.Fatal(err)
	}
	if held := TheyHold(r, actor); len(held) == 0 {
		t.Fatal("this proves nothing: the actor holds nothing to argue over")
	}

	// THE SESSION'S FIRST STOP IS GRANTED WHATEVER IT SAYS, so it is spent here
	// rather than mistaken for the rule under test.
	aStopIsGranted(t, r, log, actor, "broken")

	// EVERY REASON IS GRANTED ON THE CLAIM THAT NAMES IT, with work in hand.
	//
	// blocked is not among them, because it is refused where it is claimed when
	// the work waits on nobody. It never reaches the stop.
	for _, because := range []string{"broken", "decision", "plan", "asked"} {
		if !aStopIsGranted(t, r, log, actor, because) {
			t.Errorf("%s was argued with, and a valid claim is meant to stop at once", because)
		}
	}

	// AND NOTHING CLAIMED IS STILL REFUSED. Deleting the argument does not
	// delete the claim.
	SpendClaim(r, actor)
	if aStopWithNoClaim(t, r, log, actor) {
		t.Error("a stop went through with no claim standing")
	}
}

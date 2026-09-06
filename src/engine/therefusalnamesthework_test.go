package main

import (
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// THE REFUSAL NAMES THE WORK, AND A REGISTERED CHECK IS WHERE THAT COMES FROM.
//
// decideStop returns above the checks on god, on unbound, on a standing claim
// and on the session's first stop. So a reading of the rungs alone says the
// checks decide nothing, and one hand wrote a token saying they are dead.
//
// THEY ARE NOT DEAD, AND THEY WERE NEVER DECIDING. The last rung refuses the
// stop itself and asks the authority for the words: what else this agent holds,
// so the refusal names the work rather than only the rule. AskToStop is that
// authority, and this is the path that reaches it.
//
// SO THE COVER IS HERE RATHER THAN ON THE CHECK. A test calling AskToStop
// directly proves the function and not that anything reaches it. Remove the
// registration in pull.go and this reddens.
func TestTheRefusalNamesTheWorkInHand(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	log.Close()

	const actor = "main"
	tok := mintStandard(t, r, "work still in hand")
	if _, err := TakeUp(r, tok.ID, actor); err != nil {
		t.Fatal(err)
	}
	if held := TheyHold(r, actor); len(held) == 0 {
		t.Fatal("this proves nothing: the actor holds nothing to be named")
	}

	said := theStopJudgeSays(t, r, actor)
	if !strings.Contains(said, `"decision":"block"`) {
		t.Fatalf("an unclaimed stop was granted, so this proves nothing: %s", said)
	}
	if !strings.Contains(said, tok.ID) {
		t.Errorf("the refusal does not name the work in hand, so nothing reached the authority: %s", said)
	}
}

package main

import (
	"bytes"
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// GOD IS THE ENGINE OUT OF THE WAY, AND THE STOP HOOK IS THE ENGINE.
//
// THE OWNER'S WORDS: in god mode the stop hook doesn't fire. You are not
// supposed to keep running in the loop unsupervised. It is only to fix stuff.
//
// Every other refusal was already gone in god: decidePreToolUse returns at its
// own god check before a single guard is reached. The stop was the one left,
// so an agent fixing the engine still had to claim a reason and then hold to it
// three times while a person watched.
func TestGodSilencesTheStopHook(t *testing.T) {
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
		t.Fatal("this proves nothing: the actor holds nothing to be argued with")
	}

	// THE SESSION'S FIRST STOP IS GRANTED WHATEVER IT SAYS, so it is spent here
	// rather than mistaken for the rule under test.
	aStopWithNoClaim(t, r, log, actor)

	// BOUND WANTS A CLAIM. The queue chose this work, so putting it down is a
	// decision the queue is owed a reason for.
	if _, err := SetBinding(r, Bound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if aStopWithNoClaim(t, r, log, actor) {
		t.Error("a bound stop went through with no claim standing")
	}

	// UNBOUND DOES NOT. The queue did not choose this work and will not choose
	// the next, so it has no standing to ask why the person's agent is stopping.
	//
	// THE OWNER'S WORDS: a bound agent needs a good reason to stop and an
	// unbound agent not.
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !aStopWithNoClaim(t, r, log, actor) {
		t.Error("an unbound agent was asked for a reason by a queue that chose it nothing")
	}

	// AND GOD LETS IT GO, with work in hand and nothing claimed.
	if _, err := SetBinding(r, God, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !aStopWithNoClaim(t, r, log, actor) {
		t.Error("the engine argued with an agent in god mode, which is what god exists to switch off")
	}
}

// aStopWithNoClaim drives one stop through the decision with nothing claimed,
// and answers whether the engine let it go.
func aStopWithNoClaim(t *testing.T, r Roots, log *sessionlog.Log, actor string) bool {
	t.Helper()
	var said bytes.Buffer
	g := &guard{out: &said}
	decideStop(g, r, LoadConfig(r), log, hookIn{SessionID: "s-1"}, actor)
	return !strings.Contains(said.String(), `"decision":"block"`)
}

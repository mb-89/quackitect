package main

import (
	"strings"
	"testing"
)

// AN UNBOUND TREE HANDS OUT NO WORK, WHICH IS WHAT THE BUTTON SAYS IT DOES.
//
// Its own tooltip says take the queue off. Nothing in the pull path read the
// rung, so an unbound agent that called se pull was handed a token exactly as a
// bound one was. What unbound actually turned off was one thing, the staffing
// shortfall, so nobody was told to spawn.
//
// THE COST IS THAT A PERSON TAKES THE QUEUE OFF TO WORK ON ONE THING, and the
// next pull hands their agent something else. Naming a token still takes it up,
// which is how an unbound agent gets work.
//
// GOD IS NOT ASKED HERE. Every refusal is off there, so a queue that refused
// would be a new one. See unbound.go, and wk-b750954b82.
func TestAnUnboundPullIsHandedNothing(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "work nobody asked for")
	if _, err := SetBinding(r, Unbound, "the owner"); err != nil {
		t.Fatal(err)
	}
	if !Unleashed(r) {
		t.Fatal("the rung did not take, so this test asks nothing")
	}

	said := Pull(r, "worker-unbound", RoleWorker, Payload{})
	if said.Token != nil {
		t.Errorf("unbound, the queue handed out %s", said.Token.ID)
	}
	if said.Pull != AnswerWait {
		t.Errorf("unbound, the pull answered %q, want %q", said.Pull, AnswerWait)
	}
	if !strings.Contains(said.Notice, "unbound") {
		t.Errorf("the notice does not name the rung: %q", said.Notice)
	}

	// AND THE TOKEN THE AGENT NAMES IS STILL TAKEN UP.
	if _, err := TakeUp(r, tok.ID, "worker-unbound"); err != nil {
		t.Fatalf("unbound, naming a token did not take it up: %v", err)
	}
	if held, _ := LoadToken(r, tok.ID); held.Holder != "worker-unbound" {
		t.Fatalf("the named token is held by %q, want worker-unbound", held.Holder)
	}

	// AND A BOUND TREE ANSWERS WITH WORK, THE WAY IT ALWAYS HAS.
	bound := aTreeWithTheProcesses(t)
	mintStandard(t, bound, "work for whoever asks")
	if got := Pull(bound, "worker-bound", RoleWorker, Payload{}); got.Token == nil {
		t.Fatalf("bound, the queue handed nothing: %s", got.Notice)
	}
}

package main

import (
	"strings"
	"testing"
)

// aGhost registers a helper, gives it the name it pulls with, and hands it a
// token. It answers the harness id, which is what a stop arrives under.
func aGhost(t *testing.T, r Roots, id, actor, token string) string {
	t.Helper()
	NoteAgent(r, id, "general-purpose", "s-1")
	NoteTheNameItPullsWith(r, id, ".bin/se pull --actor "+actor)
	if _, err := TakeUp(r, token, actor); err != nil {
		t.Fatal(err)
	}
	if held, _ := LoadToken(r, token); held.Holder != actor {
		t.Fatalf("this proves nothing: %s is held by %q", token, held.Holder)
	}
	return id
}

// AN AGENT THAT GOES PUTS DOWN WHAT IT WAS HOLDING.
//
// THE OWNER'S WORDS: why can an agent even go if his token isn't done? These
// agents didn't give back their token, but they died. This shouldn't happen.
//
// Nine tokens sat behind agents that no longer existed. The panel drew a row for
// each, because a row is drawn for whoever holds a token, so the dead looked
// busy and the queue counted their work as in hand. AgentGone wrote down that
// the identity went and touched no token.
func TestAnAgentThatGoesPutsDownItsWork(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	tok := mintStandard(t, r, "held when it dies")
	id := aGhost(t, r, "general-purpose-1", "worker-ghost", tok.ID)

	AgentGone(r, id)

	back, _ := LoadToken(r, tok.ID)
	if back.Holder != "" {
		t.Errorf("the agent is gone and %s is still held by %q, so the work is parked "+
			"behind a hand that does not exist", tok.ID, back.Holder)
	}
	// AND NOBODY DRAWS A ROW FOR IT, because the row is the hold.
	for _, d := range WhatIsHappening(r).Present {
		if d.Actor == "worker-ghost" {
			t.Errorf("an agent that has gone is still in the table, holding %q", d.Holding)
		}
	}
}

// AND A TURN'S END TAKES THE WORK WITH THE HELPERS.
//
// SubagentStop reaches some helpers and never others, which is why the turn's
// end sweeps them. A sweep that leaves the tokens held is the same defect by a
// second door.
func TestATurnsEndPutsItsHelpersWorkDown(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	tok := mintStandard(t, r, "held at turn end")
	aGhost(t, r, "general-purpose-2", "worker-swept", tok.ID)

	HelpersGoneWith(r, "s-1")

	if back, _ := LoadToken(r, tok.ID); back.Holder != "" {
		t.Errorf("the turn ended and %s is still held by %q", tok.ID, back.Holder)
	}
}

// AND THE SESSION'S END TAKES THE WORK WITH THE HELPERS TOO.
//
// THE THIRD DOOR. AgentGone and HelpersGoneWith both put the work back before
// they mark an identity gone. AgentsGoneWith, which SessionEnd calls, marked
// every agent of the session gone and touched no token. A helper still alive
// when its session ends, with no turn end before it, kept its token: the queue
// counted that work as in hand and handed it to nobody until the next engine
// start swept it.
//
// AND THE SESSION'S OWN HOLD STAYS. It is meant to survive a restart, so the
// put-down is for the helpers of the session alone.
func TestASessionsEndPutsItsHelpersWorkDown(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	helpers := mintStandard(t, r, "held at session end")
	aGhost(t, r, "general-purpose-4", "worker-ended", helpers.ID)

	// THE SESSION HOLDS ONE OF ITS OWN, under the name it pulls with.
	sessions := mintStandard(t, r, "the session's work")
	NoteSession(r, "s-1")
	NoteTheNameItPullsWith(r, "s-1", ".bin/se pull --actor main")
	if _, err := TakeUp(r, sessions.ID, "main"); err != nil {
		t.Fatal(err)
	}

	AgentsGoneWith(r, "s-1")

	if back, _ := LoadToken(r, helpers.ID); back.Holder != "" {
		t.Errorf("the session ended and %s is still held by %q, so the work is parked "+
			"behind a helper that does not exist", helpers.ID, back.Holder)
	}
	if back, _ := LoadToken(r, sessions.ID); back.Holder != "main" {
		t.Errorf("the session's own work reads as held by %q, and it is meant to "+
			"survive its session ending", back.Holder)
	}
}

// AND ITS STOP IS REFUSED WHILE IT STILL HOLDS ONE, so a helper finishes or
// puts the work down deliberately rather than the engine tidying up after it.
func TestAHelperCannotStopHoldingOpenWork(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	tok := mintStandard(t, r, "work walked away from")
	id := aGhost(t, r, "general-purpose-3", "worker-walker", tok.ID)

	why, refuse := AHelperStopHoldingWork(r, id)
	if !refuse {
		t.Fatal("a helper holding open work was allowed to stop")
	}
	if !strings.Contains(why, tok.ID) {
		t.Errorf("the refusal does not name the token it is about: %s", why)
	}

	// AND IT IS GRANTED ONCE THE WORK IS PUT DOWN.
	if _, err := PutDown(r, tok.ID, "worker-walker"); err != nil {
		t.Fatal(err)
	}
	if why, refuse := AHelperStopHoldingWork(r, id); refuse {
		t.Errorf("a helper holding nothing was refused its stop: %s", why)
	}
}

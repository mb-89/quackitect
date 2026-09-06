package main

import (
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// RELENTING LETS A HELPER GO. IT DOES NOT LET IT GO WITH THE WORK.
//
// The budget guard runs first at SubagentStop, and when it had refused enough
// times it recorded the relent and broke out of the switch. break leaves the
// case, so everything below it was skipped: the holding-work refusal, the
// forgetting of the counts, the release of what the helper held, and AgentGone.
//
// So a helper both over budget and holding an open token was let go with the
// token still in its hands, and neither door the release opened was reached.
// What was left was the sweep at the next engine start, so the row sat in the
// panel until then.
//
// THE TWO DOORS ARE DRIVEN IN ORDER, through the hook the way the harness
// drives it, because where the bug lived was the control flow between them and
// nothing that asks either door on its own can see that.
func TestAnOverBudgetRelentDoesNotWalkOffWithTheWork(t *testing.T) {
	exe := buildEngine(t)
	r := aTreeWithTheProcesses(t)
	Project(r)
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	l.Write("engine", "start", "engine", "engine started", sessionlog.Yes(), nil)
	l.Close()

	tok := mintStandard(t, r, "held over budget")
	id := aGhost(t, r, "general-purpose-relent", "worker-overbudget", tok.ID)

	// AN ANSWER OVER BUDGET. A helper that read nothing gets the floor, which
	// is the budget's own answer for that case, so one byte past it is over.
	over := strings.Repeat("y", TheFloor().HelperFloorBytes+1)
	stop := func() string {
		return hookSays(t, exe, r.Method, "SubagentStop", map[string]any{"cwd": r.Work,
			"agent_id": id, "agent_type": "general-purpose", "last_assistant_message": over})
	}

	// THE BUDGET GUARD REFUSES, up to its bound.
	for i := 1; i < helperRefusalsBeforeRelenting; i++ {
		if d, out := decisionOf(t, stop()); d != "block" {
			t.Fatalf("an answer over budget was answered %q on turn %d: %v", d, i, out)
		}
	}

	// AND ON THE TURN IT RELENTS, THE NEXT DOOR IS REACHED. The helper is
	// holding an open token, so the stop is still refused, and for that reason.
	d, out := decisionOf(t, stop())
	if d != "block" {
		t.Fatalf("the budget guard relented and let a helper walk away holding %s: %q %v", tok.ID, d, out)
	}
	if back, _ := LoadToken(r, tok.ID); back.Holder == "" {
		t.Errorf("the stop was refused and %s was put down anyway", tok.ID)
	}

	// AND WHEN THAT DOOR RELENTS TOO, the work goes back to the queue and the
	// identity goes with it.
	for i := 0; i < helperRefusalsBeforeRelenting; i++ {
		stop()
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Holder != "" {
		t.Errorf("both guards relented and %s is still held by %q, so the work is parked "+
			"behind a helper that has gone", tok.ID, back.Holder)
	}
	for _, one := range WhatIsHappening(r).Present {
		if one.Actor == "worker-overbudget" {
			t.Errorf("the helper stopped and is still in the table, holding %q", one.Holding)
		}
	}
}

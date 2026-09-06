package main

import (
	"quackitect/engine/internal/sessionlog"
	"strings"
	"testing"
)

// A HAND THAT HAS GONE HOME IS NOT A HAND.
//
// The count read every actor that had pulled in the session and never took one
// out again. On this tree that was thirteen actors with three here, so the
// queue looked well staffed while one session worked a hundred open tokens.
//
// TWO WAYS AN AGENT LEAVES, AND BOTH COUNT AS LEAVING. It claims a stop, which
// is the sanctioned end and what the stop hook makes it do. Or the harness says
// it is gone, which is what happens to one that is killed.
func TestAHandThatWentHomeIsNotAHand(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	noEngineHere(t, r)
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	cfg := TheFloor()
	cfg.ParallelAgents = 3
	for i := 0; i < 6; i++ {
		mintStandard(t, r, "open work")
	}
	NoteSession(r, "s-1")

	// TWO HELPERS ARRIVE AND PULL, so with the session the queue has the three
	// hands it wants.
	for _, one := range []struct{ id, actor string }{
		{"general-purpose-1", "worker-one"},
		{"general-purpose-2", "worker-two"},
	} {
		NoteAgent(r, one.id, "general-purpose", "s-1")
		NoteTheNameItPullsWith(r, one.id, ".bin/se pull --actor "+one.actor)
		ArrivedAs(r, currentSession(r), one.actor, RoleWorker)
	}
	if s := StaffingOf(r, cfg); s.WorkersHere != 3 {
		t.Fatalf("the session and two helpers are %d hands: %+v", s.WorkersHere, s)
	}
	if why, refuse := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_apply", ""); refuse {
		t.Fatalf("the hands are here and the guard still refuses: %s", why)
	}

	// ONE CLAIMS A STOP, WHICH IS HOW A HELPER ENDS.
	if err := ClaimStop(r, "worker-one", "asked", "the brief was one token, and it is submitted"); err != nil {
		t.Fatal(err)
	}
	if s := StaffingOf(r, cfg); s.WorkersHere != 2 {
		t.Errorf("a helper that claimed a stop is still counted: %+v", s)
	}

	// AND THE OTHER IS TAKEN OUT BY THE HARNESS.
	AgentGone(r, "general-purpose-2")
	s := StaffingOf(r, cfg)
	if s.WorkersHere != 1 {
		t.Errorf("both helpers have left and the count says %d hand(s): %+v", s.WorkersHere, s)
	}

	// SO THE GUARD ASKS FOR THEM AGAIN, and says how many.
	why, refuse := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_apply", "")
	if !refuse {
		t.Fatalf("six tokens are open with one hand here, and nothing was refused: %+v", s)
	}
	if !strings.Contains(why, "spawn 2 subagents") {
		t.Errorf("the refusal does not ask for the two that left:\n%s", why)
	}

	// AND A THIRD HELPER THE REGISTER NEVER HEARD OF.
	//
	// The register is filled by SessionStart and SubagentStart. On a harness
	// where SubagentStart never arrives, a spawned helper is only ever a name
	// that pulled, so this is the ordinary shape of a helper rather than a
	// corner. It cannot leave by the register's gone list either, because it
	// was never in the register, so the stop claim is its only sanctioned end.
	// That made the line that drops it the one line nothing here reached.
	ArrivedAs(r, currentSession(r), "worker-three", RoleWorker)
	if s := StaffingOf(r, cfg); s.WorkersHere != 2 {
		t.Fatalf("a helper that pulled without being registered is not counted as a hand: %+v", s)
	}
	if err := ClaimStop(r, "worker-three", "asked", "the brief was one token, and it is submitted"); err != nil {
		t.Fatal(err)
	}
	if s := StaffingOf(r, cfg); s.WorkersHere != 1 {
		t.Errorf("an unregistered helper that claimed a stop is still counted: %+v", s)
	}
}

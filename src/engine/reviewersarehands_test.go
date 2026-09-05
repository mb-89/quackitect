package main

import "testing"

// A REVIEWER IS A HAND, AND THE COUNT OF THEM HAD NO TEST.
//
// StaffingOf raises ReviewersHere in two places: once over the register, on a
// present agent whose role is reviewer, and once over the actors that pulled,
// on a name the register never heard of. Every staffing test asserted
// ReviewersHere was 0, so a coverage profile over the fifteen of them reported
// count 0 at both lines.
//
// WHAT AN UNCOUNTED REVIEWER COSTS. The guard spawns reviewers off this number.
// One here and not counted is a spawn nobody needed. One counted that is not
// here is a verdict queue that never gets a hand.
//
// THE TWO SHAPES ARE BOTH ORDINARY. The register is filled by SessionStart and
// SubagentStart, and on a harness where SubagentStart never arrives a spawned
// reviewer is only ever a name that pulled.
func TestAReviewerIsAHandWhetherOrNotItIsRegistered(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", Yes(), nil)

	cfg := TheFloor()
	cfg.ParallelAgents = 3
	NoteSession(r, "s-1")
	if s := StaffingOf(r, cfg); s.ReviewersHere != 0 {
		t.Fatalf("nobody has arrived and %d reviewers are here: %+v", s.ReviewersHere, s)
	}

	// ONE THE REGISTER KNOWS, which is the shape a harness with SubagentStart
	// gives.
	NoteAgent(r, "general-purpose-1", "general-purpose", "s-1")
	NoteTheNameItPullsWith(r, "general-purpose-1", ".bin/se pull --actor reviewer-one")
	ArrivedAs(r, currentSession(r), "reviewer-one", RoleReviewer)
	if s := StaffingOf(r, cfg); s.ReviewersHere != 1 {
		t.Errorf("a registered reviewer is here and %d are counted: %+v", s.ReviewersHere, s)
	}

	// AND ONE IT NEVER HEARD OF, which is the shape without it.
	ArrivedAs(r, currentSession(r), "reviewer-two", RoleReviewer)
	if s := StaffingOf(r, cfg); s.ReviewersHere != 2 {
		t.Errorf("a reviewer that pulled without being registered is not counted: %+v", s)
	}

	// THE SESSION IS A WORKER AND NEVER A REVIEWER, so the two counts do not
	// borrow from each other.
	if s := StaffingOf(r, cfg); s.WorkersHere != 1 {
		t.Errorf("the session is the one worker here and %d are counted: %+v", s.WorkersHere, s)
	}

	// AND EACH STOPS BEING A HAND WHEN IT CLAIMS A STOP.
	if err := ClaimStop(r, "reviewer-one", "asked", "the verdicts owed are given"); err != nil {
		t.Fatal(err)
	}
	if s := StaffingOf(r, cfg); s.ReviewersHere != 1 {
		t.Errorf("a registered reviewer that claimed a stop is still counted: %+v", s)
	}
	if err := ClaimStop(r, "reviewer-two", "asked", "the verdicts owed are given"); err != nil {
		t.Fatal(err)
	}
	if s := StaffingOf(r, cfg); s.ReviewersHere != 0 {
		t.Errorf("an unregistered reviewer that claimed a stop is still counted: %+v", s)
	}
}

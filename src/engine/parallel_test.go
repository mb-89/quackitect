package main

import (
	"quackitect/engine/internal/sessionlog"
	"testing"
)

// ONE NUMBER STAFFS EVERY ROLE, AND IT IS A MAXIMUM RATHER THAN A RATIO.
//
// THE OWNER'S RULING: one control, and it goes for every role. The engine wants
// that many of each role as long as there is work for them, never more than the
// number, and holds the main agent until they are here.
//
// IT WAS FOUR DIALS. One worker per four workable tokens, one reviewer per five
// verdicts owed, each under its own ceiling, with a nudge and a wall speaking
// beside them about the same queue. Nobody could say what the machine would do
// without working it out, and two of the four could be set to contradict the
// other two.
//
// THE CASE THAT SEPARATES THE TWO RULES IS TWO OPEN TOKENS. A ratio of one per
// four wants one hand for them; a maximum of three wants two, because there is
// work for two.
func TestOneNumberStaffsEveryRole(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	cfg := TheFloor()
	cfg.ParallelAgents = 3

	// ONE OPEN TOKEN WANTS ONE WORKER.
	mintStandard(t, r, "open work")
	if s := StaffingOf(r, cfg); s.OpenWork != 1 || s.WorkersWanted != 1 {
		t.Fatalf("one open token: %+v", s)
	}

	// TWO WANT TWO, which is where a ratio and a maximum part company.
	mintStandard(t, r, "open work")
	if s := StaffingOf(r, cfg); s.OpenWork != 2 || s.WorkersWanted != 2 {
		t.Fatalf("two open tokens: %+v", s)
	}

	// TWELVE WANT THREE, because three is the most there may be.
	for i := 0; i < 10; i++ {
		mintStandard(t, r, "open work")
	}
	if s := StaffingOf(r, cfg); s.OpenWork != 12 || s.WorkersWanted != 3 {
		t.Fatalf("twelve open tokens: %+v", s)
	}

	// AND THE NUMBER AT ZERO WANTS NONE, which is how the holding is turned off.
	none := TheFloor()
	none.ParallelAgents = 0
	if s := StaffingOf(r, none); s.WorkersWanted != 0 || s.ReviewersWanted != 0 {
		t.Fatalf("the number at zero wants %d worker(s) and %d reviewer(s)",
			s.WorkersWanted, s.ReviewersWanted)
	}
}

// THE MAIN AGENT IS A HAND, AND IT IS A WORKER.
//
// THE OWNER'S RULING: the number is how many workers there are, counting the
// main agent. At three that is the session and two spawned, and the guard used
// to ask for three spawned beside it, which is four hands for a number saying
// three.
//
// IT IS NEVER A REVIEWER, because a verdict is never the author's, so the same
// number at three still wants three reviewer spawns.
func TestTheMainAgentCountsAsAWorker(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	// THE RUN IS NAMED BY THE FIRST LINE OF ITS LOG, and the register holds
	// only this run's agents, so nobody is present until the log is opened.
	log, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	record(log, "engine", "start", "engine", "engine started", sessionlog.Yes(), nil)

	cfg := TheFloor()
	cfg.ParallelAgents = 3
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "open work")
	}

	// NOBODY IS HERE UNTIL SOMEBODY ARRIVES.
	if s := StaffingOf(r, cfg); s.WorkersHere != 0 {
		t.Fatalf("an empty register counted %d worker(s): %+v", s.WorkersHere, s)
	}

	// AND THE SESSION IS ONE OF THEM. This is the red: skipping the session
	// agent leaves this at nought while the person watches one agent work.
	NoteSession(r, "s-1")
	s := StaffingOf(r, cfg)
	if s.WorkersHere != 1 {
		t.Fatalf("the main agent is here and the count says %d worker(s): %+v", s.WorkersHere, s)
	}
	if s.ReviewersHere != 0 {
		t.Fatalf("the main agent was counted as a reviewer: %+v", s)
	}

	// FIVE VERDICTS OWED STILL WANT THREE REVIEWERS, AND NONE IS HERE, because
	// every reviewer is spawned.
	for i := 0; i < 5; i++ {
		tok := mintStandard(t, r, "waiting on a verdict")
		tok.Status, tok.Author = "done", "worker-1"
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
	}
	if s := StaffingOf(r, cfg); s.AwaitingVerdict != 5 || s.ReviewersWanted != 3 || s.ReviewersHere != 0 {
		t.Fatalf("five verdicts owed with the main agent here: %+v", s)
	}
}

// AND A VERDICT OWED WANTS A REVIEWER UNDER THE SAME NUMBER, because the ruling
// is one control for every role and not one for workers with another beside it.
func TestOneNumberStaffsTheReviewersToo(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	cfg := TheFloor()
	cfg.ParallelAgents = 3

	for i := 0; i < 5; i++ {
		tok := mintStandard(t, r, "waiting on a verdict")
		tok.Status, tok.Author = "done", "worker-1"
		if err := SaveToken(r, tok); err != nil {
			t.Fatal(err)
		}
	}
	s := StaffingOf(r, cfg)
	if s.AwaitingVerdict != 5 {
		t.Fatalf("five tokens await a verdict: %+v", s)
	}
	if s.ReviewersWanted != 3 {
		t.Fatalf("five verdicts owed under a number of three want %d reviewer(s): %+v",
			s.ReviewersWanted, s)
	}
}

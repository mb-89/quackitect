package main

import (
	"fmt"
	"strings"
)

// THE QUEUE SAYS HOW MANY HANDS IT WANTS, AND THE ENGINE HOLDS THE MAIN AGENT
// UNTIL THEY ARE HERE.
//
// THE OWNER'S WORDS: I see that only one agent is running right now, and we
// have so much backlog that we should have more agents running. The engine
// can block the main agent until he spawned them.
//
// The nudge said how about spawning another agent, and declining was fine,
// so the backlog sat with one agent on it. This is not a nudge. While fewer
// hands are here than the queue wants, the main agent is refused everything
// but spawning them and answering the person. A spawned agent is here the
// moment it pulls.
//
// ONE NUMBER, FOR EVERY ROLE. The owner's ruling: one control, a maximum. The
// engine wants that many of each role as long as there is work for them, never
// more. It was four dials and a ratio, with a nudge and a wall speaking beside
// them about the same queue, and four dials that interact are four ways to be
// wrong about one question.
//
// THE ENGINE CANNOT START A SESSION ITSELF, so it tells the main agent to,
// with the instruction written out, and the refusal is what makes the
// telling stick.

// Staffing is what the queue wants and what it has.
type Staffing struct {
	OpenWork        int `json:"open_work"`
	AwaitingVerdict int `json:"awaiting_verdict"`
	WorkersHere     int `json:"workers_here"`
	ReviewersHere   int `json:"reviewers_here"`
	WorkersWanted   int `json:"workers_wanted"`
	ReviewersWanted int `json:"reviewers_wanted"`
}

// StaffingOf counts the queue and the hands on it.
func StaffingOf(r Roots, cfg Config) Staffing {
	var s Staffing
	for _, t := range Tokens(r) {
		// A PARKED TOKEN WANTS NO HANDS. It waits on a person, so counting it
		// as open work spawns workers for something no worker may be handed.
		if t.Ended() || t.Holder != "" || Blocked(r, t) != "" || WaitsForAPerson(t) != "" {
			continue
		}
		switch {
		case WorkableBy(r, t, RoleWorker):
			s.OpenWork++
		case WorkableBy(r, t, RoleReviewer):
			s.AwaitingVerdict++
		}
	}
	roles := loadArrivals(r).Roles
	present := AgentsPresent(r)
	for _, a := range present {
		// THE MAIN AGENT IS ONE OF THE HANDS. The owner's ruling: the number is
		// how many workers there are, counting it. At three that is the session
		// and two spawned. It was skipped here as the one being asked to spawn
		// rather than a hand, so a number that said three bought four, and with
		// two spawned workers and the main agent working the guard still
		// refused every call and asked for a third spawn.
		//
		// IT IS A WORKER AND NEVER A REVIEWER, because a verdict is never the
		// author's and the main agent is the one that works. So three means
		// three reviewer spawns and only two worker spawns.
		if a.Kind == "session" {
			s.WorkersHere++
			continue
		}
		switch roles[a.Actor] {
		case RoleWorker:
			s.WorkersHere++
		case RoleReviewer:
			s.ReviewersHere++
		}
	}
	// AN AGENT THAT PULLED IS HERE, WHETHER OR NOT THE REGISTER HEARD OF IT.
	//
	// The register is filled by SessionStart and SubagentStart. On a harness
	// where SubagentStart does not arrive, a spawned agent is never registered
	// and this counted none of them, however many pulled. The guard holds the
	// main agent's work until the hands are here and names spawning as the
	// remedy, so a number that spawning cannot move is a session with no way
	// out: four workers were spawned, all four pulled, and it went on saying
	// two workers are here.
	//
	// THE ARRIVAL RECORD IS THE OTHER WITNESS, and WhatIsHappening already
	// merges it with the register. This is the count reading the same tree the
	// same way. A record from an earlier run answers nothing, so an actor that
	// pulled then is not a hand now.
	for _, actor := range ActorsThatPulled(r) {
		registered := false
		for _, p := range present {
			if p.answersTo(actor) {
				registered = true
				break
			}
		}
		if registered {
			continue
		}
		switch roles[actor] {
		case RoleWorker:
			s.WorkersHere++
		case RoleReviewer:
			s.ReviewersHere++
		}
	}
	s.WorkersWanted = wanted(s.OpenWork, cfg.ParallelAgents)
	s.ReviewersWanted = wanted(s.AwaitingVerdict, cfg.ParallelAgents)
	return s
}

// wanted is how many hands there is work for, and never more than the number.
//
// THE NUMBER IS A MAXIMUM, NOT A RATIO. Every workable token could have a hand
// on it, so the work is what supplies the answer and the number is what bounds
// it. Zero wants none, which is how the holding is turned off.
func wanted(n, most int) int {
	if most <= 0 || n <= 0 {
		return 0
	}
	if n > most {
		return most
	}
	return n
}

// A STAFF SHORTFALL IS ANSWERED BY SPAWNING, so what is held back meanwhile is
// the work itself. Everything else passes.
//
// IT WAS A LIST OF WHAT IS ALLOWED, AND THAT COMPOSED INTO A DEADLOCK.
// Anything nobody thought to name was refused, and three of those mattered.
// It refused se_pull, which is the escape the refusal's own last line names:
// a spawned agent is here the moment it pulls, and the pull was refused. It
// refused Read, so an agent could not read the guard that was refusing it. And
// the stop hook demands a claim through se_stop, which this refused too, so an
// agent that could neither work, nor look, nor pull, nor stop had no legal move
// at all. It was measured from a subagent, which could not escape it either.
//
// SO THE DENY SIDE IS NAMED. A tool this list has never heard of is let
// through, because the cost of missing one is a main agent doing one call of a
// worker's job, and the cost of refusing one is a session with no move.
var heldDuringShortfall = map[string]bool{
	"Bash": true, "Write": true, "Edit": true, "MultiEdit": true, "NotebookEdit": true,
	"mcp__quackitect__se_apply": true, "mcp__quackitect__se_run": true,
	"mcp__quackitect__se_test": true,
	"se_apply":                 true, "se_run": true, "se_test": true,
}

// AStaffShortfall answers whether this call by the main agent is refused
// until the hands the queue wants have pulled, and says how to spawn them.
func AStaffShortfall(r Roots, cfg Config, actor, tool, command string) (string, bool) {
	if actor != "main" || !heldDuringShortfall[tool] {
		return "", false
	}
	// A SHELL COMMAND THAT IS ONLY THE ENGINE IS NOT WORK, whatever verb it
	// carries. On a box with no lane, the pull and the stop this guard tells
	// the agent to make are Bash calls, and holding Bash held those too.
	if runsTheEngine(command) && !engineWork(command) {
		return "", false
	}
	s := StaffingOf(r, cfg)
	moreWorkers := s.WorkersWanted - s.WorkersHere
	moreReviewers := s.ReviewersWanted - s.ReviewersHere
	if moreWorkers <= 0 && moreReviewers <= 0 {
		return "", false
	}
	var b strings.Builder
	b.WriteString("THE QUEUE WANTS MORE HANDS, AND NOTHING ELSE IS ALLOWED UNTIL THEY HAVE PULLED.\n\n")
	if moreWorkers > 0 {
		fmt.Fprintf(&b, "%d tokens are open and workable, %d workers are here, and the engine wants %d: "+
			"spawn %d subagents now. Tell each one: pull with se_pull, actor worker-<a name>, role worker, "+
			"and work what it is handed until the queue answers wait. Give it nothing else.\n\n",
			s.OpenWork, s.WorkersHere, s.WorkersWanted, moreWorkers)
	}
	if moreReviewers > 0 {
		fmt.Fprintf(&b, "%d standard tokens await a verdict, %d reviewers are here, and the engine wants %d: "+
			"spawn %d subagent. Tell it: read doc/guidance/methods/reviewing.md, then pull with se_pull, "+
			"actor reviewer-<a name>, role reviewer, and give one verdict per token until the queue answers wait.\n\n",
			s.AwaitingVerdict, s.ReviewersHere, s.ReviewersWanted, moreReviewers)
	}
	b.WriteString("A spawned agent is here the moment it pulls. What was asked: " + tool + ".\n\n")
	b.WriteString(theShellDoor("pull --actor <a name> --role worker"))
	return b.String(), true
}

// engineWork answers whether an engine command is the work itself rather than
// asking the engine something. Those are held during a shortfall the same way
// their lane tools are, so a shortfall cannot be walked round with a shell.
func engineWork(command string) bool {
	separators, _ := theQuotings(command)
	for _, w := range strings.Fields(separators) {
		switch w {
		case "apply", "run", "test":
			return true
		}
	}
	return false
}

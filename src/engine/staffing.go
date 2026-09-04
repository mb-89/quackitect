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
		if t.Ended() || t.Holder != "" || Blocked(r, t) != "" {
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
	for _, a := range AgentsPresent(r) {
		if a.Kind == "session" {
			continue // the main agent is the one being asked to spawn, not a hand
		}
		switch roles[a.Actor] {
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

// A STAFF SHORTFALL IS ANSWERED BY SPAWNING, and nothing else is allowed
// meanwhile except the tools that spawn and the tools that answer the person.
var allowedDuringShortfall = map[string]bool{
	"Agent": true, "Task": true,
	"mcp__quackitect__se_answer": true, "mcp__quackitect__se_said": true, "mcp__quackitect__se_status": true,
}

// AStaffShortfall answers whether this call by the main agent is refused
// until the hands the queue wants have pulled, and says how to spawn them.
func AStaffShortfall(r Roots, cfg Config, actor, tool string) (string, bool) {
	if actor != "main" || allowedDuringShortfall[tool] {
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
	b.WriteString("A spawned agent is here the moment it pulls. What was asked: " + tool + ".")
	return b.String(), true
}

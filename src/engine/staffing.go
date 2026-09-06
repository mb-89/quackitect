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
	// THE COUNT IS WHAT THE QUEUE WOULD HAND OUT, never how many rows exist.
	//
	// It walked the tokens itself and applied its own reading of what is
	// workable. That reading knew nothing of what the branch had archived, nor
	// of the caps the record puts on a note, so it counted work the pull would
	// pass over. The guard then held the main agent until hands arrived for
	// work no hand could be given, and each one spawned was told wait and
	// left. WouldHandOut is the pull's own question, asked here.
	//
	// AND WHAT A PERSON NARROWED THE QUEUE TO IS PART OF THAT QUESTION. The
	// filter is applied by next() a layer above WouldHandOut, so asking
	// WouldHandOut alone missed it: a queue narrowed to twenty-two was counted
	// as a hundred and forty-three, and the guard sized its demand off that.
	// TheQueueWouldHandOut is the whole question, narrowing included.
	s.OpenWork, s.AwaitingVerdict = TheQueueWouldHandOut(r)
	roles := loadArrivals(r).Roles
	present := AgentsPresent(r)
	left := namesThatLeft(r)
	for _, a := range present {
		// AN AGENT THAT HAS CLAIMED A STOP IS NOT A HAND. It is here in the
		// register until the harness says otherwise, and it is doing nothing.
		// Counting it is how a queue of a hundred looked fully staffed.
		if a.State == Stopped {
			continue
		}
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
		// AND A HAND THAT HAS GONE HOME IS NOT ONE EITHER.
		//
		// This list is every actor that has pulled in the session, and nothing
		// took one out of it again. Thirteen actors had pulled on this tree
		// and three were here, so the count answered eight workers, wanted
		// three, and the guard never fired while one session worked a hundred
		// open tokens.
		//
		// TWO WAYS TO LEAVE, AND BOTH ARE READ. A stop claim is the sanctioned
		// one, which the stop hook makes every agent give. The register's gone
		// is the other, written when the harness says a subagent has ended.
		if left[actor] {
			continue
		}
		if _, stopped := StandingClaim(r, actor); stopped {
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

// namesThatLeft is every name an agent of this run has gone under: the one the
// register knows it by, and each name it pulled with.
//
// A ROW FROM ANOTHER RUN SAYS NOTHING. The register outlives the run that
// filled it, and an agent of an earlier run is neither here nor a hand that
// left this queue short.
func namesThatLeft(r Roots) map[string]bool {
	out := map[string]bool{}
	run := TheRunNow(r)
	if !Named(run) {
		return out
	}
	aliases := TheNamesItPullsWith(r)
	for id, a := range LoadEvidence(r).Agents {
		if a.Run != run || a.Gone.IsZero() {
			continue
		}
		out[a.Name] = true
		for _, n := range aliases[a.Name] {
			out[n] = true
		}
		for _, n := range aliases[id] {
			out[n] = true
		}
	}
	return out
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

// A STAFF SHORTFALL IS ANSWERED BY SPAWNING, AND WHAT IS HELD MEANWHILE IS THE
// QUEUE. Everything else passes, at every rung.
//
// IT HELD THE WORK, AND THAT REACHED PAST ITS OWN RULE. The rule is that the
// main agent must not take more from the queue while the hands the queue wants
// are missing. Holding every write, every run and every test held a
// conversation too: the owner asked a question and the answer came back as a
// demand to spawn subagents nobody had asked for. Twice in one session,
// measured on 2026-09-06.
//
// THE OWNER'S WORDS: even if you are bound, I do not want the agent to have to
// spawn subagents just because I want to talk to him.
//
// SO IT HOLDS THE PULL AND NOTHING ELSE. A write, a run, a test and a read are
// not the queue, and refusing them never made a hand appear. The binding is not
// the answer either: this holds at every rung, so unbinding was the only way to
// have a conversation, and climbing a rung to ask a question is the wrong shape.
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
	"mcp__quackitect__se_pull": true, "se_pull": true,
	// A BOX WITH NO LANE PULLS THROUGH THE SHELL, so Bash is named here and
	// then narrowed below to the one command that is a pull. Naming it without
	// that narrowing would hold every shell call again, which is the defect.
	"Bash": true,
}

// AStaffShortfall answers whether this call by the main agent is refused
// until the hands the queue wants have pulled, and says how to spawn them.
func AStaffShortfall(r Roots, cfg Config, actor, tool, command, id, disposition string) (string, bool) {
	if actor != "main" || !heldDuringShortfall[tool] {
		return "", false
	}
	// HANDING WORK IN IS NOT ASKING FOR MORE. A submit is an se_pull call, and
	// the guard read only the tool name, so it refused both. An agent that had
	// finished its work could not record it.
	//
	// MEASURED, September 2026. A token was finished, green and written up, and
	// its submit answered THE QUEUE WANTS MORE HANDS with 144 tokens open and
	// one worker here. On a cloud box that is worse than a delay: the agent is
	// told to spawn two hands so that it may file work it has already done, and
	// a box that cannot spawn loses the work when it is reclaimed.
	//
	// A SUBMIT NAMES A TOKEN AND HOW IT ENDED. Half of one is not a submit:
	// letting a bare id or a bare disposition through would be a way round the
	// guard rather than a narrowing of it.
	if id != "" && disposition != "" {
		return "", false
	}
	// A SHELL CALL IS HELD ONLY WHEN IT IS THE PULL ITSELF. On a box with no
	// lane the pull is a Bash call, and that is the one shell command this
	// guard has any business stopping. Every other Bash call goes through,
	// including the spawn and the stop the refusal below tells the agent to make.
	if tool == "Bash" && !(runsTheEngine(command) && aPull(command)) {
		return "", false
	}
	// AND THE SHELL DOOR READS THE SAME RULE, because a box with no lane files
	// its work there and holding that one would move the deadlock rather than
	// end it.
	if tool == "Bash" && aSubmitAtTheShell(command) {
		return "", false
	}
	// A PERSON WHO PUT THE WORK DOWN IS NOT ASKED FOR MORE HANDS.
	//
	// While finishing, a spawned hand may take nothing up, so the demand would
	// send the main agent to spawn agents with no legal move. Held is quiet for
	// the same reason: nothing it spawned could act either.
	if h := LoadHold(r); h.Held() || h.Finishing() {
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

// aSubmitAtTheShell answers whether a shell pull hands work in rather than
// asking for more.
//
// THE REAL DOOR IS --from. A submission is one JSON object, and a box with no
// lane hands it over in a file: se pull --actor main --from .se/scratchpad/x.json.
// Every submit this engine's own sessions make goes that way.
//
// THE FLAG PAIR IS READ TOO, because the lane's fields are id and disposition
// and a shell caller may spell them out rather than write a file.
func aSubmitAtTheShell(command string) bool {
	separators, _ := theQuotings(command)
	names, ended := false, false
	for _, w := range strings.Fields(separators) {
		switch {
		case w == "--from" || strings.HasPrefix(w, "--from="):
			return true
		case w == "--id" || w == "--on" || strings.HasPrefix(w, "--id=") || strings.HasPrefix(w, "--on="):
			names = true
		case w == "--disposition" || strings.HasPrefix(w, "--disposition="):
			ended = true
		}
	}
	return names && ended
}

// aPull answers whether an engine command is the pull. That is the one verb a
// shortfall holds: everything else the engine does is work, or a question, and
// neither takes anything from the queue.
func aPull(command string) bool {
	separators, _ := theQuotings(command)
	for _, w := range strings.Fields(separators) {
		if w == "pull" {
			return true
		}
	}
	return false
}

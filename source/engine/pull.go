package main

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"time"
)

// THE PULL. The agent's one verb for receiving work.
//
// The agent never names a target, never chooses a token, and never learns how
// the queue is ordered. It pulls, it does what came back, and it pulls again.
// A submission is a pull with a payload, so finishing one piece of work and
// receiving the next are one act and cannot come apart.
//
// TWO QUEUES, one engine. A worker pulls tokens assigned to it. A reviewer
// pulls tokens somebody has submitted. The reviewer never talks to the worker,
// and the worker never learns who reviewed it. Both talk to the engine, which
// is what keeps the reviewer out of the worker's framing.
//
// THE AGENT CANNOT CLOSE ITS OWN WORK. It submits, the engine checks what a
// program can check, and a reviewer settles it. The one exception is a token in
// its own scope that is ephemeral, which is an agent's breakdown of work it
// already holds — four eyes belong at the boundary of delegated work.

// The four answers. The pull field names which one came back, so an agent
// branches on one field and never has to infer.
const (
	AnswerWork    = "work"    // here is a token: do it
	AnswerReview  = "review"  // here is a submission: judge it
	AnswerRefused = "refused" // the submission failed a check a program could make
	AnswerWait    = "wait"    // nothing to do, and the notice says why
)

// The roles a puller can hold. A role decides which queue answers, and nothing
// else. Level 0 knows none of these words.
const (
	RoleWorker   = "worker"
	RoleReviewer = "reviewer"
)

// Payload is what a pull carries back. Empty means give me work.
type Payload struct {
	ID string `json:"id,omitempty"`

	// A worker's submission.
	Evidence    map[string]string `json:"evidence,omitempty"`
	Disposition string            `json:"disposition,omitempty"`
	Successors  []string          `json:"successors,omitempty"`
	Reason      string            `json:"reason,omitempty"`

	// A reviewer's answer.
	Verdict  string      `json:"verdict,omitempty"` // accept or reject
	Findings []Rejection `json:"findings,omitempty"`
}

type Answer struct {
	Pull     string      `json:"pull"`
	Token    *Token      `json:"token,omitempty"`
	Findings []Rejection `json:"findings,omitempty"`
	Notice   string      `json:"notice"`

	// What this machine has, on the first pull of a session and never again.
	// It rides on the pull because that is the one thing every agent calls,
	// and a fact delivered is worth more than a fact an agent is told to
	// go and look for.
	Tools []Tool `json:"tools,omitempty"`
}

// Pull is the whole protocol. One function, because the order of its parts is
// the protocol: an arrival reclaims before a payload is settled, and a payload
// is settled before a queue is read.
func Pull(r Roots, actor, role string, p Payload) Answer {
	if role == "" {
		role = RoleWorker
	}
	session := currentSession(r)

	// AN ARRIVAL IS NOT AN ORDINARY PULL. Whoever held this actor's work
	// before is gone, so what they held comes back before anything is handed
	// out. Nothing else in the protocol reclaims, on purpose.
	var reclaimed []string
	first := Arrived(r, session, actor)
	if first {
		reclaimed = Reclaim(r, actor, role)
	}

	a := answerFor(r, actor, role, p)
	a.Notice += reclaimNotice(reclaimed)
	if first {
		if a.Tools = KnownTools(r, session); len(a.Tools) > 0 {
			a.Notice += " This machine's tools ride in this answer, with what each one is for." +
				" Write a helper script in one of those and nothing else."
		}
	}
	return a
}

func answerFor(r Roots, actor, role string, p Payload) Answer {
	if p.ID != "" {
		if a, done := settle(r, actor, role, p); done {
			return a
		}
	}
	return next(r, actor, role)
}

// The session is named in the first record of the current log. A pull that
// happens with no engine running has no session, and then nothing arrives and
// no tool list is handed out, because nothing probed the machine.
func currentSession(r Roots) string {
	return sessionOf(filepath.Join(r.Private("log"), Current))
}

// settle applies a payload. It returns done=false when the payload was
// accepted and the agent should be handed its next piece of work.
func settle(r Roots, actor, role string, p Payload) (Answer, bool) {
	t, err := LoadToken(r, p.ID)
	if err != nil {
		return refuse(nil, Rejection{Clause: "the token", Wrong: err.Error(),
			Satisfies: "an id the engine minted"}), true
	}
	if role == RoleReviewer {
		return judge(r, actor, t, p)
	}
	return submit(r, actor, t, p)
}

// submit runs every check a program can make, and stops at the first one that
// fails. A refusal names the clause, what is wrong, and what would satisfy it,
// so the worker acts rather than guesses.
func submit(r Roots, actor string, t Token, p Payload) (Answer, bool) {
	if t.Assignee != actor {
		return refuse(&t, Rejection{Clause: "assignee", Wrong: "this token is not yours",
			Satisfies: "submit a token assigned to " + actor}), true
	}
	if t.Status == Closed {
		return refuse(&t, Rejection{Clause: "status", Wrong: "this token is already closed",
			Satisfies: "a token that is open or in work"}), true
	}
	if t.Status == Submitted || t.Status == InReview {
		return refuse(&t, Rejection{Clause: "status", Wrong: "this token is already with a reviewer",
			Satisfies: "wait for the verdict"}), true
	}
	if why := Blocked(r, t); why != "" {
		return refuse(&t, Rejection{Clause: "blocked", Wrong: why,
			Satisfies: "close what holds it first"}), true
	}
	if f := checkDisposition(r, p); f != nil {
		return refuse(&t, *f), true
	}
	if f := checkEvidence(r, t, p); f != nil {
		return refuse(&t, *f), true
	}

	t.Submission = p.Evidence
	t.Disposition = Disposition(p.Disposition)
	t.Successors = p.Successors
	t.Reason = p.Reason

	// The agent settles its own breakdown and nothing else. Everything else
	// goes to a reviewer, which is what the scope decides.
	if t.SelfClosing() {
		t.Status, t.Holder, t.ClosedAt = Closed, "", now()
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		return Answer{}, false
	}
	t.Status, t.Holder, t.SentAt = Submitted, "", now()
	if err := SaveToken(r, t); err != nil {
		return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
			Satisfies: "a writable .se/work"}), true
	}
	return Answer{}, false
}

// judge applies a reviewer's verdict. A reviewer closes, and it is the only
// role that does.
func judge(r Roots, actor string, t Token, p Payload) (Answer, bool) {
	// A REVIEWER MAY NOT JUDGE WHAT IT SUBMITTED. Otherwise an agent reviews
	// itself by pulling with the other role, and four eyes become two.
	if t.Assignee == actor {
		return refuse(&t, Rejection{Clause: "the reviewer",
			Wrong:     "you submitted this token, so you cannot judge it",
			Satisfies: "a submission from somebody else"}), true
	}
	if t.Status != InReview {
		return refuse(&t, Rejection{Clause: "status", Wrong: "this token is not with you",
			Satisfies: "pull for a review, and judge what comes back"}), true
	}
	if t.Holder != actor {
		return refuse(&t, Rejection{Clause: "the reviewer",
			Wrong:     "a newer reviewer holds this sphere, and this token is theirs now",
			Satisfies: "stop. One sphere has one reviewer"}), true
	}
	switch p.Verdict {
	case "accept":
		t.Status, t.Holder, t.ClosedAt = Closed, "", now()
		if t.Disposition == NoDisposition {
			t.Disposition = Done
		}
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		return Answer{}, false
	case "reject":
		if len(p.Findings) == 0 {
			return refuse(&t, Rejection{Clause: "the rejection",
				Wrong:     "a rejection with no finding tells the worker nothing",
				Satisfies: "at least one finding, with clause, wrong and satisfies"}), true
		}
		t.Rounds++
		for _, f := range p.Findings {
			f.Round, f.By, f.At = t.Rounds, actor, now()
			t.Findings = append(t.Findings, f)
		}
		t.Status, t.Holder, t.SentAt = Open, "", ""
		t.Submission = nil
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		return Answer{}, false
	}
	return refuse(&t, Rejection{Clause: "the verdict", Wrong: "a verdict is accept or reject",
		Satisfies: "verdict: accept, or verdict: reject with findings"}), true
}

func refuse(t *Token, f Rejection) Answer {
	return Answer{Pull: AnswerRefused, Token: t, Findings: []Rejection{f},
		Notice: "The submission was refused by the engine, before any reviewer saw it. " +
			"Fix what the finding names and pull again with the same id."}
}

// A token cannot close without saying what became of it. Three values, and
// there is no fourth, so vanishing is impossible.
func checkDisposition(r Roots, p Payload) *Rejection {
	switch Disposition(p.Disposition) {
	case Done:
		return nil
	case Became:
		if len(p.Successors) == 0 {
			return &Rejection{Clause: "disposition", Wrong: "became names no successor",
				Satisfies: "the ids of the tokens this became"}
		}
		for _, id := range p.Successors {
			if _, err := LoadToken(r, id); err != nil {
				return &Rejection{Clause: "disposition", Wrong: "no such successor: " + id,
					Satisfies: "successors that exist"}
			}
		}
		return nil
	case Dropped:
		if strings.TrimSpace(p.Reason) == "" {
			return &Rejection{Clause: "disposition", Wrong: "dropped carries no reason",
				Satisfies: "why the work stopped"}
		}
		return nil
	}
	return &Rejection{Clause: "disposition", Wrong: "a token cannot close without one",
		Satisfies: "done, became, or dropped"}
}

// Evidence is a form or a script. A form is filled section by section. A
// script is run, and its exit code is the answer.
func checkEvidence(r Roots, t Token, p Payload) *Rejection {
	// Work that was dropped produced nothing, so there is nothing to show.
	// The reason is the evidence, and checkDisposition already required it.
	if Disposition(p.Disposition) == Dropped || t.Evidence.Empty() {
		return nil
	}
	for _, s := range t.Evidence.Sections {
		if strings.TrimSpace(p.Evidence[s]) == "" {
			return &Rejection{Clause: "evidence", Wrong: "the section " + s + " is empty",
				Satisfies: "fill every section the token asks for: " +
					strings.Join(t.Evidence.Sections, ", ")}
		}
	}
	if t.Evidence.Script != "" {
		out, err := runEvidence(r, t.Evidence.Script)
		if err != nil {
			return &Rejection{Clause: "evidence", Wrong: "the evidence script failed: " + err.Error(),
				Satisfies: strings.TrimSpace(firstLines(out, 20))}
		}
	}
	return nil
}

// The script runs in the folder being worked on, through a shell, because a
// token's evidence is written by a person as a command line.
func runEvidence(r Roots, script string) (string, error) {
	name, args := "sh", []string{"-c", script}
	if runtime.GOOS == "windows" {
		name, args = "cmd", []string{"/c", script}
	}
	cmd := exec.Command(name, args...)
	cmd.Dir = r.Work
	done := make(chan struct{})
	var out []byte
	var err error
	go func() { out, err = cmd.CombinedOutput(); close(done) }()
	select {
	case <-done:
		return string(out), err
	case <-time.After(5 * time.Minute):
		if cmd.Process != nil {
			_ = cmd.Process.Kill()
		}
		return string(out), fmt.Errorf("it did not finish in five minutes")
	}
}

func firstLines(s string, n int) string {
	lines := strings.Split(s, "\n")
	if len(lines) > n {
		lines = lines[:n]
	}
	return strings.Join(lines, "\n")
}

// next reads the queue the role names. An agent is idle when no token is
// assigned to it, and that is answered from the ledger rather than from the
// harness, because the ledger is the thing that can be checked.
func next(r Roots, actor, role string) Answer {
	all := Tokens(r)
	if role == RoleReviewer {
		// A reviewer that already holds one gets it back rather than a second.
		// Nobody judges two things at once.
		for i := range all {
			if all[i].Status == InReview && all[i].Holder == actor {
				return Answer{Pull: AnswerReview, Token: &all[i], Notice: reviewNotice()}
			}
		}
		for i := range all {
			if all[i].Status == Submitted && all[i].Assignee != actor {
				all[i].Status, all[i].Holder = InReview, actor
				if err := SaveToken(r, all[i]); err != nil {
					return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
				}
				return Answer{Pull: AnswerReview, Token: &all[i], Notice: reviewNotice()}
			}
		}
		return Answer{Pull: AnswerWait,
			Notice: "Nothing is waiting for review. Say so and stop."}
	}

	// Work already picked up comes back first. An agent that pulled, was
	// interrupted, and pulled again gets the same token, not a second one.
	for i := range all {
		if all[i].Assignee == actor && all[i].Status == InWork {
			return Answer{Pull: AnswerWork, Token: &all[i], Findings: all[i].Findings,
				Notice: workNotice(all[i])}
		}
	}
	// THE OLDEST THAT IS NOT BLOCKED. A token waiting on something else is
	// not work anybody can do, so it is not offered.
	var held []string
	for i := range all {
		if all[i].Assignee != actor || all[i].Status != Open {
			continue
		}
		if why := Blocked(r, all[i]); why != "" {
			held = append(held, all[i].ID+": "+why)
			continue
		}
		all[i].Status, all[i].Holder, all[i].TakenAt = InWork, actor, now()
		if err := SaveToken(r, all[i]); err != nil {
			return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
		}
		return Answer{Pull: AnswerWork, Token: &all[i], Findings: all[i].Findings,
			Notice: workNotice(all[i])}
	}
	return Answer{Pull: AnswerWait, Notice: waitNotice(r, actor, held)}
}

func reviewNotice() string {
	return "Judge this submission against the token's own rules and nothing else. " +
		"Answer with verdict: accept, or verdict: reject and findings, each naming " +
		"the clause, what is wrong, and what would satisfy it."
}

func workNotice(t Token) string {
	var b strings.Builder
	b.WriteString("Do this token. When the evidence is produced, pull again with id and evidence.")
	if len(t.Findings) > 0 {
		fmt.Fprintf(&b, " It came back from review %d time(s): every finding below has to be answered.", t.Rounds)
	}
	if t.SelfClosing() {
		b.WriteString(" This one closes on submission, because it is your own breakdown of work you hold.")
	} else {
		b.WriteString(" You cannot close it. A reviewer settles it after the engine's checks pass.")
	}
	return b.String()
}

// WHY THERE IS NOTHING TO DO, and it is never only "nothing".
//
// An agent that knows the reason tells the person something true. An agent
// handed a bare wait says "there is no work" when the truth was that everything
// it holds waits on somebody else.
func waitNotice(r Roots, actor string, held []string) string {
	if len(held) > 0 {
		return fmt.Sprintf("Nothing you can start. %d piece(s) are yours and every one is blocked:\n  %s\n\n"+
			"Say which one waits and on what, then stop.", len(held), strings.Join(held, "\n  "))
	}
	var waiting int
	for _, t := range Tokens(r) {
		if (t.Status == Submitted || t.Status == InReview) && t.Assignee == actor {
			waiting++
		}
	}
	if waiting > 0 {
		return fmt.Sprintf("No open tokens. %d of yours wait for review. "+
			"Spawn a reviewer if you have not, then pull again in a minute to see whether it finished.", waiting)
	}
	return "No token is assigned to you, which is what idle means here. " +
		"Tell the person plainly that there is no work, and stop."
}

// THE AUTHORITY, ON STOPPING.
//
// Level 0 asks whether an agent may stop and carries the answer. It never
// learns what a token is, and it must not: the word does not appear in the
// guard. Level 1 registers this check, so the guard runs a reason it cannot
// read. That is the channel every level above uses, and this is the first
// thing to speak on it.
//
// A scope cannot be left while its work is open. Stopping is leaving.
func init() {
	RegisterStopCheck(AskToStop)
	RegisterStopReason(StopReason{"blocked",
		"Every piece of work you hold waits on somebody else, and nothing you do releases it."})
}

// AskToStop refuses once when the actor holds work it could still do, and
// names it. It refuses once and not forever, because escaping is not
// abandonment: the tokens stay open and visible, and an agent that must stop
// has to be able to.
//
// BLOCKED WORK DOES NOT HOLD ANYBODY. Nothing the actor does releases it, so
// refusing its stop would be refusing it for somebody else's reason.
func AskToStop(r Roots, actor string) Ruling {
	var mine []string
	for _, t := range Tokens(r) {
		if t.Assignee != actor {
			continue
		}
		if t.Status != Open && t.Status != InWork {
			continue
		}
		if Blocked(r, t) != "" {
			continue
		}
		mine = append(mine, t.ID+" "+t.Form)
	}
	if len(mine) == 0 {
		return Ruling{Permitted: true}
	}
	n := len(mine)
	if n > 3 {
		mine = mine[:3]
	}
	lines := "  " + strings.Join(mine, "\n  ")
	if n > 3 {
		lines += fmt.Sprintf("\n  and %d more", n-3)
	}
	return Ruling{Reason: fmt.Sprintf(
		"You hold %d piece(s) of work that nothing else will do:\n%s\n\n"+
			"Pull to pick one up.", n, lines)}
}

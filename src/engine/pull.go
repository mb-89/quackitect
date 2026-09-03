package main

import (
	"fmt"
	"os"
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

// The answers. The pull field names which one came back, so an agent branches
// on one field and never has to infer.
const (
	AnswerWork    = "work"    // here is a token: do it
	AnswerRefused = "refused" // the submission failed a check a program could make
	AnswerWait    = "wait"    // nothing to do, and the notice says why
	// The fifth. A hold nobody is behind is worth more than the next token.
)

// The roles a puller can hold. A role decides which queue answers, and nothing
// else. Level 0 knows none of these words.
const (
	RoleWorker = "worker"
)

// Payload is what a pull carries back. Empty means give me work.
type Payload struct {
	ID string `json:"id,omitempty"`

	// A worker's submission.
	Evidence map[string]string `json:"evidence,omitempty"`

	Disposition string   `json:"disposition,omitempty"`
	Successors  []string `json:"successors,omitempty"`
	Reason      string   `json:"reason,omitempty"`
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

	// THE METHOD FOR THIS ANSWER, DELIVERED RATHER THAN REMEMBERED. A reviewer
	// told to go and read the method reviews from whatever it happens to think.
	// It rides on the answer for the same reason the tool list does.
	// Guidance is the rules, sent the first time this actor is handed them.
	// GuidanceAt is where they are, said every time, so an agent that has lost
	// them knows what to open.
	Guidance   string `json:"guidance,omitempty"`
	GuidanceAt string `json:"guidance_at,omitempty"`

	// THE TOKEN THE LESSON MINTED, so the reviewer can name it. A rejection
	// that produces no id is one the engine did not accept, and the reviewer
	// is not asked to remember to mint anything.
	Learned string `json:"learned,omitempty"`
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
		reclaimed = Reclaim(r, actor)
	}

	// THE QUEUE IS COUNTED BEFORE THE HAND-OUT, because a pull that gives this
	// agent a token makes it busy by definition, and the owner's condition is
	// three open with nothing in work. Counted afterwards the nudge could only
	// ever land on a wait.
	said := Nudge(r, actor, role)

	a := answerFor(r, actor, role, p)
	a.Notice += reclaimNotice(reclaimed)
	// A NUDGE RIDES ON THE ANSWER RATHER THAN BEING A THING TO GO AND LOOK FOR.
	// It refuses nothing: it says the queue is long and nothing is in hand, and
	// declining is a fine answer.
	if said != "" {
		a.Notice += nl + nl + said
	}
	if first {
		if a.Tools = KnownTools(r, session); len(a.Tools) > 0 {
			a.Notice += " This machine's tools ride in this answer, with what each one is for." +
				" Write a helper script in one of those and nothing else."
		}
	}
	return a
}

func answerFor(r Roots, actor, role string, p Payload) Answer {
	// THE TOKEN A REJECTION MINTED RIDES ON WHATEVER IS ANSWERED NEXT, so the
	// reviewer is handed its id without having to ask for it.
	learned := ""
	if p.ID != "" {
		a, done := settle(r, actor, p)
		if done {
			return a
		}
		learned = a.Learned
	}
	// A HOLD NOBODY IS BEHIND SENDS SOMEBODY TO LOOK, before new work is handed
	// out. A walker given another token goes on working while the stuck one
	// stays stuck, which is what happened.
	if role == RoleWorker {
		// PULLING AGAIN IS THE WALKER'S ANSWER. Being sent to look is the first
		// ask; coming back is the walker saying the holder is gone, which is the
		// one thing the engine cannot find out for itself. The notice promised
		// this and did not do it: Reclaim runs on an arrival, and an agent that
		// has already arrived never arrives again, so the second pull answered
		// the same notice as the first and nothing moved.
		if back := TakeBackWhatWasLookedAt(r, actor); len(back) > 0 {
			a := next(r, actor)
			a.Learned = learned
			a.Notice += reclaimNotice(back)
			return a
		}
		if t, quiet := quietHold(r, actor); quiet {
			Looked(r, actor, t.ID)
			a := investigate(r, t)
			a.Learned = learned
			return a
		}
	}
	a := next(r, actor)
	a.Learned = learned
	return a
}

func currentSession(r Roots) string {
	return sessionOf(filepath.Join(r.Private("log"), Current))
}

// settle applies a payload. It returns done=false when the payload was
// accepted and the agent should be handed its next piece of work.
func settle(r Roots, actor string, p Payload) (Answer, bool) {
	t, err := LoadToken(r, p.ID)
	if err != nil {
		return refuse(nil, Rejection{Clause: "the token", Wrong: err.Error(),
			Satisfies: "an id the engine minted"}), true
	}
	return submit(r, actor, t, p)
}

// submit runs every check a program can make, and stops at the first one that
// fails. A refusal names the clause, what is wrong, and what would satisfy it,
// so the worker acts rather than guesses.
func submit(r Roots, actor string, t Token, p Payload) (Answer, bool) {
	// WHO HOLDS IT, NOT WHO IT WAS ASSIGNED TO. Assignment was a hint that
	// read as a lock. A hold is what says somebody picked this up.
	if t.Holder != "" && t.Holder != actor {
		return refuse(&t, Rejection{Clause: "holder", Wrong: "somebody else is on this",
			Satisfies: "submit a token you hold"}), true
	}
	if t.Ended() {
		return refuse(&t, Rejection{Clause: "status", Wrong: "this token is already closed",
			Satisfies: "a token that is open or in work"}), true
	}
	if why := Blocked(r, t); why != "" {
		return refuse(&t, Rejection{Clause: "blocked", Wrong: why,
			Satisfies: "close what holds it first"}), true
	}
	if f := checkDisposition(r, t, p); f != nil {
		return refuse(&t, *f), true
	}
	if f := checkEvidence(r, t, p); f != nil {
		return refuse(&t, *f), true
	}
	t.Submission = p.Evidence
	t.Disposition = Disposition(p.Disposition)
	t.Successors = p.Successors
	t.Reason = p.Reason

	// A WORKER CLOSES ITS OWN WORK. There is no second actor, so a submission
	// that met every criterion and answered every checklist is the ending.
	// What a reviewer used to hold is now held by the checks above.
	if proc, err := LoadProcess(r.Method, t.Process); err == nil {
		if a, found := proc.ActivityFrom(t.Status); found {
			t.Status = a.To
		}
	}
	t.Holder = ""
	// CLOSING ENDS THE STRETCH, so the change is the diffs between began and
	// ended, pair by pair.
	t = closeStretch(r, t)
	if err := SaveToken(r, t); err != nil {
		return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
			Satisfies: "a writable .se/work"}), true
	}
	return Answer{}, false
}

// A token cannot close without saying what became of it. Three values, and
// there is no fourth, so vanishing is impossible.
func checkDisposition(r Roots, t Token, p Payload) *Rejection {
	said := strings.TrimSpace(p.Disposition)
	proc, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return &Rejection{Clause: "the process", Wrong: err.Error(),
			Satisfies: "a token naming a process this copy has"}
	}
	// WHICH ENDINGS EXIST IS THE PROCESS'S, and so is which of them needs a
	// reason. It read three names written here and a hardcoded rule that
	// dropped carries one, while note.process.yaml declared exactly the same
	// three and marked one `reason: required` — two answers to one question,
	// and the file's was the one nothing read.
	var spec *DispositionSpec
	for i, d := range proc.Dispositions {
		if d.Name == said {
			spec = &proc.Dispositions[i]
			break
		}
	}
	if spec == nil {
		return &Rejection{Clause: "disposition",
			Wrong:     "a token cannot close without one, and " + proc.Name + " does not end " + quoted(said),
			Satisfies: "one of: " + strings.Join(proc.DispositionNames(), ", ")}
	}
	if spec.NeedsReason && strings.TrimSpace(p.Reason) == "" {
		return &Rejection{Clause: "disposition", Wrong: said + " carries no reason",
			Satisfies: "why the work stopped"}
	}
	// SUCCESSORS ARE THE ENGINE'S OWN RULE AND STAY HERE. Naming a token that
	// does not exist is not a thing a process can declare: it is a claim about
	// the record, and the record is what this reads.
	if Disposition(said) == Became {
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
	}
	return nil
}

// quoted puts a word in quotes, and answers "nothing" for an empty one, so a
// refusal about a missing value does not read as a refusal about an empty pair
// of quotes.
func quoted(s string) string {
	if s == "" {
		return "nothing"
	}
	return `"` + s + `"`
}

// checkEvidence refuses a move while the step's checklist is unanswered.
//
// THE PROCESS OWNS THE CHECKLIST AND THE TOKEN CARRIES THE ANSWERS. Every row
// is ticked. A row the process marked evidence: required carries a sentence
// too, because a tick there would be an assertion and nothing more.
//
// THE GATE READS THE PROCESS, NOT THE DASH. A row written with a dash in the
// evidence column is a hint to whoever is filling it in, so deleting the hint
// changes nothing about what is refused.
func checkEvidence(r Roots, t Token, p Payload) *Rejection {
	// Work that was dropped produced nothing, so there is nothing to show.
	// The reason is the evidence, and checkDisposition already required it.
	if Disposition(p.Disposition) == Dropped {
		return nil
	}
	proc, err := LoadProcess(r.Method, t.Process)
	if err != nil {
		return nil
	}
	// THE STEP BEING SUBMITTED IS THE ONE THAT LEAVES WHERE THE TOKEN STANDS.
	doing, found := proc.ActivityFrom(t.Status)
	if !found {
		return &Rejection{Clause: "the process", Wrong: fmt.Sprintf(
			"%s says %s, and no step of %s leaves that state", t.ID, t.Status, proc.Name),
			Satisfies: "a token standing where a step can take it"}
	}
	through := proc.StepOf(doing.Name)
	for i, a := range proc.Activities {
		if len(a.Criteria) == 0 {
			continue
		}
		table := evidenceTable(t, i+1, a.Name)
		// A STEP THE TOKEN HAS NOT REACHED IS NOT TICKED YET. Its checklist is
		// in the note from the beginning so the whole process is readable, and
		// a tick on it is somebody saying work is done that has not started.
		if i+1 > through {
			for _, c := range a.Criteria {
				if done, _ := evidenceFor(table, c.Says); done {
					return &Rejection{Clause: "the checklist", Wrong: fmt.Sprintf(
						"step %d, %s, is ticked, and this token has only reached step %d, %s",
						i+1, a.Name, through, doing.Name),
						Satisfies: "ticks on the step you are on, and none after it"}
				}
			}
			continue
		}
		for _, c := range a.Criteria {
			done, said := evidenceFor(table, c.Says)
			if !done {
				return &Rejection{Clause: "the checklist",
					Wrong:     fmt.Sprintf("step %d, %s: this is not ticked: %s", i+1, a.Name, c.Says),
					Satisfies: "walk every line of the " + a.Name + " checklist and answer it"}
			}
			if c.NeedsEvidence && strings.TrimSpace(said) == "" {
				return &Rejection{Clause: "the checklist",
					Wrong: fmt.Sprintf("step %d, %s: this is ticked and says nothing: %s",
						i+1, a.Name, c.Says),
					Satisfies: "a sentence saying what you saw, not only a tick"}
			}
		}
	}
	return nil
}

// evidenceTable finds one step's checklist among the sections the note kept.
// The heading carries the number and the name, and either identifies it, so a
// step renamed after a token was minted is still found by its number.
func evidenceTable(t Token, step int, name string) string {
	byName, byStep := "", ""
	for head, text := range t.Submission {
		head = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(head), "evidence:"))
		if strings.HasSuffix(head, name) {
			byName = text
		}
		num, _, isNumbered := strings.Cut(head, ".")
		num = strings.TrimSpace(strings.TrimPrefix(strings.TrimSpace(num), "step"))
		if isNumbered && num == itoa(step) {
			byStep = text
		}
	}
	if byName != "" {
		return byName
	}
	return byStep
}

func itoa(n int) string { return fmt.Sprintf("%d", n) }

// evidenceFor reads one row of the checklist table: whether it is ticked, and
// what the evidence column says.
func evidenceFor(table, says string) (done bool, evidence string) {
	for _, line := range strings.Split(table, nl) {
		if !strings.Contains(line, says) {
			continue
		}
		cells := strings.Split(strings.Trim(strings.TrimSpace(line), "|"), "|")
		if len(cells) < 3 {
			continue
		}
		tick := strings.ToLower(strings.TrimSpace(cells[0]))
		got := strings.TrimSpace(cells[2])
		if got == "—" || got == "-" {
			got = ""
		}
		return tick == "[x]", got
	}
	return false, ""
}

// The script runs in the folder being worked on, through a shell, because a
// token's evidence is written by a person as a command line.
func runEvidence(r Roots, script string) (string, error) {
	cmd := evidenceCommand(r, script)
	done := make(chan struct{})
	var out []byte
	var err error
	go func() { out, err = cmd.CombinedOutput(); close(done) }()
	select {
	case <-done:
		return string(out), err
	case <-time.After(5 * time.Minute):
		if cmd.Process != nil {
			_ = cmd.Process.Kill() // it has already finished, which is the only way this fails
		}
		// THE OUTPUT IS READ AFTER THE GOROUTINE HAS WRITTEN IT. Killing the
		// process makes CombinedOutput return, and reading out before that
		// return was a race the detector names: one goroutine writing the
		// slice while this one reads it.
		<-done
		return string(out), fmt.Errorf("it did not finish in five minutes")
	}
}

// evidenceCommand builds the command a criterion runs. It is its own function
// so a check can ask what the runner made rather than only what it printed.
func evidenceCommand(r Roots, script string) *exec.Cmd {
	name, args := "sh", []string{"-c", script}
	if runtime.GOOS == "windows" {
		name, args = "cmd", []string{"/c", script}
	}
	cmd := TheScriptVerbatim(Quietly(exec.Command(name, args...)), script)
	cmd.Dir = r.Work
	return cmd
}

// briefly lists a few of something and says how many more there are. A notice
// that prints forty ids is a notice nobody reads to the end.
func briefly(all []string) string {
	shown := all
	if len(shown) > 3 {
		shown = shown[:3]
	}
	out := "  " + strings.Join(shown, "\n  ")
	if len(all) > len(shown) {
		out += fmt.Sprintf("\n  and %d more", len(all)-len(shown))
	}
	return out
}

func firstLines(s string, n int) string {
	lines := strings.Split(s, "\n")
	if len(lines) > n {
		lines = lines[:n]
	}
	return strings.Join(lines, "\n")
}

// next hands out the work this actor may take, or says why there is none.
//
// THE PROCESS SAYS WHICH STATE IS WORKABLE, AND THE ENGINE SAYS WHICH TOKEN.
// A token sits in a state, and an activity of its process moves it from that
// state to another. So work exists when some activity can run from where the
// token stands, and the engine picks among those.
//
// WHAT THE AGENT ALREADY HOLDS COMES BACK FIRST. An agent that pulled, was
// interrupted, and pulled again gets the same token rather than a second one.
//
// A STEP THE ENGINE DOES NOT HAND OUT IS SKIPPED. Triage is a person reading
// the backlog and deciding, so the activity says pulled: false and the queue
// passes over it. Nothing else in the process decides queue order: that is the
// engine's, and it is oldest-unblocked-first among what is workable.
//
// A SCOPE IS NOT A STEP. A held token whose sub-tokens are open is a scope the
// agent stands in, and the step it can take is a sub-token. So a held scope is
// passed over for a held token without open sub-tokens, and when everything
// held is a scope, an unheld sub-token of one of them is handed out inside
// it, with the scope staying held. A parent with open sub-tokens is blocked
// for everybody, so the general queue hands sub-tokens out before their
// parents without a rule of its own.
func next(r Roots, actor string) Answer {
	all := Tokens(r)

	var scopes []Token
	for i := range all {
		if all[i].Holder != actor || all[i].Ended() {
			continue
		}
		if len(OpenSubTokens(r, all[i].ID)) > 0 {
			scopes = append(scopes, all[i])
			continue
		}
		return handed(r, actor, all[i])
	}

	for _, scope := range scopes {
		for i := range all {
			t := all[i]
			if t.Parent != scope.ID || t.Ended() || t.Holder != "" || !Workable(r, t) {
				continue
			}
			if why := Blocked(r, t); why != "" {
				continue
			}
			return take(r, actor, t)
		}
	}

	var held []string
	for i := range all {
		t := all[i]
		if t.Ended() || t.Holder != "" {
			if t.Holder != "" {
				held = append(held, t.ID)
			}
			continue
		}
		if !Workable(r, t) {
			continue
		}
		if why := Blocked(r, t); why != "" {
			continue
		}
		return take(r, actor, t)
	}
	if len(scopes) > 0 {
		return Answer{Pull: AnswerWait, Notice: scopeNotice(r, scopes)}
	}
	return Answer{Pull: AnswerWait, Notice: waitNotice(r, actor, held)}
}

// take puts a token in the actor's hands and answers it.
func take(r Roots, actor string, t Token) Answer {
	t.Holder = actor
	// HANDING OUT OPENS A STRETCH, with the tree as it stands as its before.
	t = openStretch(r, t)
	if err := SaveToken(r, t); err != nil {
		return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
	}
	return handed(r, actor, t)
}

// handed answers a token the actor holds, with the guidance for it.
func handed(r Roots, actor string, t Token) Answer {
	text, says := TheGuidanceFor(r, actor, t.Guidance)
	return Answer{Pull: AnswerWork, Token: &t,
		Notice: workNotice(t), Guidance: text, GuidanceAt: says}
}

// scopeNotice says why nothing was handed out inside a scope the actor holds:
// every open sub-token is in somebody else's hands, or is waiting on a person.
func scopeNotice(r Roots, scopes []Token) string {
	var lines []string
	for _, s := range scopes {
		lines = append(lines, fmt.Sprintf("%s holds open sub-token(s) you cannot take: %s",
			s.ID, strings.Join(OpenSubTokens(r, s.ID), ", ")))
	}
	return "Nothing you can start inside what you hold. " + strings.Join(lines, "; ") +
		". A scope cannot close while a sub-token is open. Say what it waits on, then stop."
}

// method hands out the Actionables chapter of a guidance file, and the whole
// file when it has no such chapter. The agent opens the file when it wants the
// reason, and the other chapters are never paid for on a pull.
func method(r Roots, name string) string {
	b, err := os.ReadFile(filepath.Join(GuidanceDir(r.Method), name))
	if err != nil {
		return "doc/guidance/" + name + " could not be read: " + err.Error()
	}
	if only, found := chapter(string(b), "Actionables"); found {
		return only
	}
	return string(b)
}

// chapter cuts one chapter out of a markdown file: the line reading
// "## heading" and everything up to the next line that starts with "## ". It
// says whether the chapter was there at all.
func chapter(text, heading string) (string, bool) {
	lines := strings.Split(text, "\n")
	for i, line := range lines {
		depth := headingDepth(line)
		if depth == 0 || strings.TrimSpace(line[depth:]) != heading {
			continue
		}
		// It ends at the next heading of the same level or shallower. A deeper
		// one is inside this chapter.
		end := len(lines)
		for j := i + 1; j < len(lines); j++ {
			if d := headingDepth(lines[j]); d > 0 && d <= depth {
				end = j
				break
			}
		}
		return strings.TrimRight(strings.Join(lines[i:end], "\n"), "\n") + "\n", true
	}
	return "", false
}

// headingDepth answers how many hashes open a heading line, or zero.
//
// IT READS THE LEVEL RATHER THAN ASSUMING ONE. This matched "## " alone, so
// moving the guidance chapters up to one hash left every projection unable to
// find the chapter it assembles, and the cage went with it.
func headingDepth(line string) int {
	n := 0
	for n < len(line) && line[n] == '#' {
		n++
	}
	if n == 0 || n >= len(line) || line[n] != ' ' {
		return 0
	}
	return n
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
	// A STEP THE ENGINE DOES NOT HAND OUT IS NOT NOTHING. Notes sit in the
	// backlog waiting for a person to triage them, and an agent told there is
	// no work when forty notes are waiting has been told something false.
	var waiting int
	for _, t := range Tokens(r) {
		if !t.Ended() && t.Holder == "" && !Workable(r, t) {
			waiting++
		}
	}
	if waiting > 0 {
		return fmt.Sprintf("Nothing the engine hands out. %d piece(s) wait for a person "+
			"to decide what happens to them. Say so, and stop.", waiting)
	}
	return "Nothing is open. Tell the person plainly that there is no work, and stop."
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

// refuse is how the engine says no: what clause, what is wrong, and what would
// satisfy it, so the worker acts rather than guesses.
func refuse(t *Token, f Rejection) Answer {
	return Answer{Pull: AnswerRefused, Token: t, Findings: []Rejection{f}}
}

// workNotice is what rides with a token handed to a worker.
func workNotice(t Token) string {
	return "This is yours now. Do what the detail asks and nothing next to it. " +
		"Walk the checklist for this step and answer every line, then submit."
}

// AskToStop refuses once when the actor holds work it could still do, and
// names it, so a stop is a decision rather than a drift.
func AskToStop(r Roots, actor string) Ruling {
	var mine []string
	for _, t := range Tokens(r) {
		if t.Ended() || t.Holder != actor {
			continue
		}
		if Blocked(r, t) != "" {
			continue
		}
		mine = append(mine, t.ID+" "+t.Title)
	}
	if len(mine) == 0 {
		return Ruling{}
	}
	return Ruling{Reason: fmt.Sprintf(
		"You hold %d piece(s) of work that nothing else will do:\n%s\n\n"+
			"Pull to pick one up.", len(mine), briefly(mine))}
}

// PutDown sets a held token back, so work picked up by mistake is released.
func PutDown(r Roots, id, actor string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	if t.Holder != actor {
		return t, fmt.Errorf("%s is not held by %s", id, actor)
	}
	// A PUT-DOWN ENDS THE STRETCH, so what this holding did is a pair of its
	// own, and what other hands do before the next take-up stays out of it.
	t = closeStretch(r, t)
	t.Holder = ""
	if err := SaveToken(r, t); err != nil {
		return t, err
	}
	inSession(r, "work", actor, t.ID+" put down", Yes(), map[string]any{"id": t.ID})
	return t, nil
}

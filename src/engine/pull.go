package main

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"quackitect/engine/internal/sessionlog"
	"runtime"
	"sort"
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
// its own scope that is local, which is an agent's breakdown of work it
// already holds — four eyes belong at the boundary of delegated work.
// Who closes what, and why the reviewer is the default, is
// [[every-token-names-its-closer]].

// The answers. The pull field names which one came back, so an agent branches
// on one field and never has to infer.
const (
	AnswerWork    = "work"    // here is a token: do it
	AnswerRefused = "refused" // the submission failed a check a program could make
	AnswerSettled = "settled" // the submission was taken and no work was handed on
	AnswerWait    = "wait"    // nothing to do, and the notice says why
	// The fifth. A hold nobody is behind is worth more than the next token.
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
	Evidence map[string]string `json:"evidence,omitempty"`

	Disposition string   `json:"disposition,omitempty"`
	Successors  []string `json:"successors,omitempty"`
	Reason      string   `json:"reason,omitempty"`

	// settleOnly says this submission wants no token back, which is a person at
	// a shell rather than an agent in a lane.
	//
	// IT IS UNEXPORTED BECAUSE IT IS NOT THE PAYLOAD'S TO SAY. Which door an ask
	// came through is the engine's own reading, and a field the JSON could set
	// would let a lane opt out of being handed work.
	settleOnly bool
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

	// claimed says the queue wrote the claim on the token it is handing over,
	// so the verb that answered can put it on the claims branch.
	//
	// IT IS UNEXPORTED BECAUSE IT IS NOT THE AGENT'S TO READ, the way the
	// payload's settleOnly is not the caller's to set. The claim is on the token
	// in the answer, and this says only whether this call is the one that wrote
	// it, which is the difference between publishing once and publishing on
	// every pull for ever.
	claimed bool
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
	// THE ARRIVAL IS KEYED ON THE HARNESS SESSION, not the engine's: the
	// engine outlives agents, so a harness restart is a new agent even when
	// the run is the same one.
	first := ArrivedAs(r, ArrivalSession(r), actor, role)
	if first {
		reclaimed = Reclaim(r, actor)
	}

	// THE NUDGE IS GONE, AND THE STAFFING SAYS IT INSTEAD.
	//
	// It said the queue was long and nothing was in hand, and declining was a
	// fine answer, so a backlog sat with one agent on it. The owner's ruling put
	// one number in its place: the engine wants that many hands of each role
	// while there is work for them, and holds the main agent until they pull.
	// A suggestion and a refusal about the same queue are two machines, and the
	// refusal is the one that works.
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
	// THE TOKEN A REJECTION MINTED RIDES ON WHATEVER IS ANSWERED NEXT, so the
	// reviewer is handed its id without having to ask for it.
	//
	// AND SO DOES WHAT THE SUBMISSION LEFT OVER. A close whose archive could
	// not be written is still a close, and the notice is the whole of how the
	// agent hears about it, so it is carried onto whatever comes back rather
	// than dropped with the settled payload.
	learned, over := "", ""
	if p.ID != "" {
		a, done := settle(r, actor, p)
		if done {
			return a
		}
		learned, over = a.Learned, a.Notice
		// A SUBMISSION AT A SHELL IS ONE THING ASKED FOR, AND ONE THING ANSWERED,
		// AND THE QUEUE IS NOT READ AT ALL.
		//
		// It used to be read and the token it handed out put back a moment later.
		// Handing out opens a stretch and a put-down closes one, so every shell
		// submission wrote a began and an ended onto whatever token the queue
		// would have handed on, with two snapshot commits behind them. That
		// token's record then said it had been in a hand it was never in.
		if p.settleOnly {
			return Answer{Pull: AnswerSettled, Notice: p.ID + " is settled. The next token goes to a " +
				"lane, because an agent that submits is asking for more. Ask for work again when " +
				"you want it."}
		}
	}
	// A HOLD ON YOUR OWN VERDICT IS NOT WORK IN HAND. The submission put the
	// token down, and naming it again through se run or se apply took it back
	// up, so the queue handed the author its own done token with the verdict's
	// checklist. It comes off here, before the queue reads what is held, and a
	// reviewer pull by the author is refused the way its submission is.
	down, refused := ownVerdictOffTheHand(r, actor, role)
	if refused != nil {
		return *refused
	}
	a := whatComesNext(r, actor, role)
	a.Learned = learned
	a.Notice += over + down
	return a
}

// ownVerdictOffTheHand puts down every token this actor holds whose next step
// is a verdict on its own work. It answers what it said about that, and the
// refusal when the pull was for a verdict, since the verdict is never the
// author's.
func ownVerdictOffTheHand(r Roots, actor, role string) (string, *Answer) {
	var down []string
	var own *Token
	for _, t := range Tokens(r) {
		if t.Holder != actor || t.Ended() || t.Author != actor || roleAt(r, t) != RoleReviewer {
			continue
		}
		t.Holder = ""
		if err := SaveToken(r, t); err != nil {
			continue
		}
		inSession(r, "work", actor, t.ID+" put back: its next step is a verdict, and the verdict is never the author's",
			sessionlog.Yes(), map[string]any{"id": t.ID})
		down = append(down, t.ID)
		if own == nil {
			first := t
			own = &first
		}
	}
	if len(down) == 0 {
		return "", nil
	}
	if role == RoleReviewer {
		a := refuse(own, Rejection{Clause: "author",
			Wrong:     "you did the work on " + own.ID + ", so the verdict is not yours. It is put back for a reviewer",
			Satisfies: "a verdict from another actor. Pull with role worker for work of your own"})
		return "", &a
	}
	return " Put back, because its next step is a verdict and the verdict is never the author's: " +
		strings.Join(down, ", ") + ".", nil
}

// whatComesNext is the queue's answer to an actor with nothing in hand.
func whatComesNext(r Roots, actor, role string) Answer {
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
		back, refused := TakeBackWhatWasLookedAt(r, actor)
		if len(back) > 0 {
			a := next(r, actor, role)
			a.Notice += reclaimNotice(back)
			return a
		}
		if t, quiet := quietHold(r, actor); quiet {
			Looked(r, actor, t.ID)
			a := investigate(r, t)
			// AND IF THE WALKER ALREADY ANSWERED, SAY WHY IT DID NOT LAND.
			// The same notice arriving twice reads as the engine not listening.
			a.Notice += refusedNotice(refused)
			return a
		}
	}
	return next(r, actor, role)
}

func currentSession(r Roots) string {
	return sessionlog.SessionOf(filepath.Join(r.Private("log"), sessionlog.Current))
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
	// A SUBMISSION SAYS WHAT IT BRINGS. IT DOES NOT SAY WHAT THE NOTE NO LONGER
	// HOLDS.
	//
	// AND THE GATE READS WHAT IT BRINGS. This merge sat after checkEvidence,
	// which reads the tables on the token, so a first submission whose answers
	// were in the payload alone was refused naming a blank line, and the
	// refusal returned before the merge, dropping the answers it carried. The
	// only way in was to write the note first, and the evidence argument on
	// the door was decoration. A refusal saves nothing, so a merge that is
	// then refused leaves the note as it was.
	t.Submission = keepingWhatWasNotSent(t.Submission, p.Evidence)
	if f := checkEvidence(r, t, p); f != nil {
		return refuse(&t, *f), true
	}

	// A WORKER CLOSES ITS OWN WORK, and a standard token's verdict is the one
	// step a second actor takes. Whoever did the work step is written down as
	// the author, and the author is refused the verdict.
	ends := true
	if proc, err := LoadProcess(r.Method, t.Process); err == nil {
		if a, found := proc.ActivityFrom(t.Status); found {
			if a.Role == RoleReviewer && t.Author != "" && t.Author == actor {
				return refuse(&t, Rejection{Clause: "author", Wrong: "you did the work on this token, so the verdict is not yours",
					Satisfies: "a verdict from another actor"}), true
			}
			if a.Role != RoleReviewer {
				t.Author = actor
			}
			t.Status = a.To
			ends = proc.Ends(a.To)
		}
	}
	// THE DISPOSITION IS THE ENDING'S, AND ONLY THE ENDING'S.
	//
	// MEASURED. It was written on every submission, including the standard
	// process's work step, which goes open to done and owes a verdict. Ended()
	// is Disposition != "", so the token read as ended while its status still
	// read done, and every check that asks Ended() shut it against the reviewer
	// meant to rule on it: submit refused the verdict as "this token is already
	// closed", and TakeUp refused se run and se apply naming it, so a reviewer
	// could not even run a criterion's command against what it was reviewing.
	// The verdict activity is declared from done to closed and nothing could
	// reach it: every standard token that got to done stranded there.
	if ends {
		t.Disposition = Disposition(p.Disposition)
		t.Successors = p.Successors
		t.Reason = p.Reason
	}
	t.Holder = ""
	// AND THE CLAIM GOES BACK WITH THE HOLD.
	//
	// A SUBMISSION HANDS THE TOKEN ON, SO IT HANDS THE CLAIM BACK. The next step
	// is worked by somebody else, and on the standard process it must be: the
	// author is refused its own verdict a few lines above. The hold was released
	// here and the claim was not, so a token at done stayed claimed by the actor
	// who had finished with it, for the whole three hours a claim stands.
	//
	// MEASURED on 2026-09-05, working the verdict queue. Four tokens stood at
	// done and every one was refused to the reviewer, each naming its own
	// worker. Three were claimed on this box, so it is not the cloud push. The
	// queue read empty while it was full, and two reviewers spent a session
	// polling it.
	//
	// IT IS THE NOTE'S CLAIM THAT IS DROPPED, not a release published to git.
	// The next actor's claim publishes in the ordinary way, and a submission
	// that had to reach the network to finish would fail where the network does.
	DropClaim(&t)
	// CLOSING ENDS THE STRETCH, so the change is the diffs between began and
	// ended, pair by pair.
	t = closeStretch(r, t)
	if err := SaveToken(r, t); err != nil {
		if !TheCloseStood(err) {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		// THE CLOSE STOOD, AND THE ANSWER SAYS WHAT IS LEFT OVER. Refusing here
		// told the worker its submission had failed, under a clause naming a
		// folder that was written and not the archive that was not.
		return Answer{Notice: "\n\n" + err.Error()}, false
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
	// A STEP THAT DOES NOT END THE TOKEN NEEDS NO DISPOSITION. The standard
	// process moves a token from open to done and only the verdict closes it,
	// so the work step is submitted with nothing to say about the ending.
	//
	// AND ONE SENT THERE ANYWAY IS NOT AN ENDING EITHER. submit drops it, so a
	// worker's habitual "done" on the work step cannot end a token the process
	// still owes a verdict on. Dropping it in silence would swallow an ending
	// somebody meant, so a submission carrying one is refused instead. Which
	// dispositions carry an ending is the process's to say and not this file's,
	// so this asks what the submission brings rather than what it is called: a
	// reason, which the process marks required on the ones that need it, or the
	// successors a became names. Ending a token early is se stop's, which moves
	// the status to where the process stops instead of leaving it standing.
	if a, found := proc.ActivityFrom(t.Status); found && !proc.Ends(a.To) {
		if strings.TrimSpace(p.Reason) != "" || len(p.Successors) > 0 {
			return &Rejection{Clause: "disposition",
				Wrong: "this step leaves the token at " + a.To + ", which " + proc.Name +
					" does not end, so it cannot carry an ending",
				Satisfies: "submit this step with no disposition, and end the token early with se stop"}
		}
		return nil
	}
	return theEnding(r, proc, said, p.Reason, p.Successors)
}

// theEnding says whether an ending a caller names is one this token can carry.
//
// EVERY DOOR THAT ENDS A TOKEN ASKS THIS ONE. The submission asks it and so
// does the abort, which is the door that ends a token from wherever it stands.
// The abort wrote dropped whatever had happened, so a token that turned out
// larger and was split could only be recorded as one nobody wanted, and a
// second copy of these rules beside it would be a second answer to the same
// question.
func theEnding(r Roots, proc Process, said, reason string, successors []string) *Rejection {
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
	if spec.NeedsReason && strings.TrimSpace(reason) == "" {
		return &Rejection{Clause: "disposition", Wrong: said + " carries no reason",
			Satisfies: "why the work stopped"}
	}
	// SUCCESSORS ARE THE ENGINE'S OWN RULE AND STAY HERE. Naming a token that
	// does not exist is not a thing a process can declare: it is a claim about
	// the record, and the record is what this reads.
	if Disposition(said) == Became {
		if len(successors) == 0 {
			return &Rejection{Clause: "disposition", Wrong: "became names no successor",
				Satisfies: "the ids of the tokens this became"}
		}
		for _, id := range successors {
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

// keepingWhatWasNotSent lays a submission's evidence over the note's own, and
// keeps every section the submission did not name.
//
// MEASURED on wk-00c162f56e. This was an assignment, so a submission carrying
// no evidence carried nil, and SaveToken rebuilt the note from the struct with
// all three of the author's tables gone while the frontmatter came out
// current. checkEvidence had just read those tables off the note to let the
// move through, so the engine deleted the only copy of the answers it had
// itself accepted, and the reviewer who came next had nothing to rule on.
//
// A section the payload names wins, because that is the submission speaking. A
// section it says nothing about is the author's, and silence is not deletion.
func keepingWhatWasNotSent(had, sent map[string]string) map[string]string {
	if len(sent) == 0 {
		return had
	}
	out := make(map[string]string, len(had)+len(sent))
	for name, text := range had {
		out[name] = text
	}
	for name, text := range sent {
		out[name] = text
	}
	return out
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
				if _, done, _ := evidenceFor(table, c.Says); done {
					return &Rejection{Clause: "the checklist", Wrong: fmt.Sprintf(
						"step %d, %s, is ticked, and this token has only reached step %d, %s",
						i+1, a.Name, through, doing.Name),
						Satisfies: "ticks on the step you are on, and none after it"}
				}
			}
			continue
		}
		// A SECTION THAT IS GONE IS NOT A ROW SOMEBODY FORGOT TO TICK. The
		// checklist is written onto the note at the mint, so an empty one here
		// means the note has lost it, and every row read unticked. Told to tick
		// a row, a worker goes looking for a row that is not there, and a
		// reviewer is asked to tick the author's answers, which are not its to
		// give. Saying what actually happened is what lets either of them act.
		if strings.TrimSpace(table) == "" {
			return &Rejection{Clause: "the checklist", Wrong: fmt.Sprintf(
				"the note carries no %q section, so there is no checklist here to answer. "+
					"It was written onto the note when the token was minted",
				headEvidence+fmt.Sprintf("step %d. %s", i+1, a.Name)),
				Satisfies: "that section back on the note with the answers it held. " +
					"git log -p on the note is where the last copy of them is"}
		}
		for _, c := range a.Criteria {
			found, done, said := evidenceFor(table, c.Says)
			// A CRITERION WITH NO ROW IS NOT AN UNTICKED ROW EITHER. The note
			// freezes its wording at the mint and this loads the process fresh,
			// so a criterion renamed since can never match any row, and no
			// amount of ticking will move the token.
			if !found {
				return &Rejection{Clause: "the checklist", Wrong: fmt.Sprintf(
					"step %d, %s: the checklist on this note has no row for this: %s",
					i+1, a.Name, c.Says),
					Satisfies: "that row on the note, worded the way the process words it now. " +
						"The note was minted before the process said this, so the wording moved " +
						"underneath it"}
			}
			// A LINE HAS THREE STATES AND THE GATE HELD TWO: met, not met, and not
			// looked at. It refused on the tick before it ever read the evidence
			// cell, so a worker who answered a line honestly with why the criterion
			// does not hold could not close at all, and the only way out was to tick
			// a line they had just written was false. That is the outcome rule 15 of
			// the work-token guidance exists to prevent: the knowledge thrown away
			// and the tick kept.
			//
			// MEASURED on wk-437137c7a1. Two answered lines, refused one per pull,
			// then ticked with the qualification left in the sentence and accepted.
			// Only the boxes changed, so a reader of that token cannot tell a line
			// that was met from a line the gate forced.
			//
			// So an UNANSWERED line is what is refused. A line with something in its
			// evidence cell has been looked at, and whether it was met is the
			// reviewer's to rule on rather than the gate's to extort a tick over.
			answered := strings.TrimSpace(said) != ""
			if !done && !answered {
				return &Rejection{Clause: "the checklist",
					Wrong: fmt.Sprintf("step %d, %s: this is not answered: %s", i+1, a.Name, c.Says),
					Satisfies: "walk every line of the " + a.Name + " checklist and answer it. " +
						"A line you judge unmet is answered by saying so in the evidence column, " +
						"and the token closes carrying that answer"}
			}
			if done && c.NeedsEvidence && !answered {
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

// evidenceFor reads one row of the checklist table: whether the row is there at
// all, whether it is ticked, and what the evidence column says.
//
// WHETHER A ROW EXISTS IS A SEPARATE ANSWER FROM WHETHER IT IS TICKED. It said
// false to both, so a row that was never on the note and a row somebody had not
// got to yet were indistinguishable, and the refusal for the first sent people
// to tick something that is not there.
func evidenceFor(table, says string) (found, done bool, evidence string) {
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
		return true, tick == "[x]", got
	}
	return false, false, ""
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
	cmd := quiet.TheScriptVerbatim(quiet.Quietly(exec.Command(name, args...)), script)
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
// Why a scope cannot be left is [[a-scope-cannot-be-left-while-its-tokens-are-open]].
//
// WHAT THE FETCHED BRANCH HAS ARCHIVED IS NOT WORK, whatever this tree's copy
// of the note says. It comes out of the list before any walk, and the answer
// names it. See pullbehind.go.
func next(r Roots, actor, role string) Answer {
	all, behind, branch := offTheFetchedBranch(r, actor, urgentFirst(Tokens(r)))
	a := nextAmong(r, actor, role, all)
	a.Notice += behindNotice(branch, behind)
	return a
}

// nextAmong is next over the tokens the fetched branch has not already closed.
func nextAmong(r Roots, actor, role string, all []Token) Answer {
	// WHO IS ASKING, AND ON WHICH BOX. Two questions and two answers. Whether
	// this box may touch the token at all is the box's, and ClaimedHere answers
	// it. Who is handed it first is the agent's, because a claim is an agent
	// saying these are the ones it is working through. See claim.go.
	me := Claimant(r, actor)
	now := time.Now().UTC()

	// WHAT THE RECORD WOULD NOT WRITE. Handing a token out saves it, and a
	// token the save refuses cannot be handed to anybody. That refusal used to
	// be the pull's whole answer, so one chapter past its bound answered wait
	// to every puller and everything behind it in the queue went unseen.
	// The queue passes over it and says so at the end, the way it passes over
	// a token waiting on a person.
	var unwritable []string

	var scopes []Token
	var setBack []string
	for i := range all {
		if all[i].Holder != actor || all[i].Ended() {
			continue
		}
		if len(OpenSubTokens(r, all[i].ID)) > 0 {
			scopes = append(scopes, all[i])
			continue
		}
		// WHAT IS ALREADY IN A HAND IS STILL ASKED WHETHER IT MAY GO BACK.
		//
		// MEASURED. A token carrying needs_human was released, and the next
		// pull handed it straight back within the minute. This walk asked one
		// door and not the other, while every other path in this function asks
		// both, and staffing and the stop judge ask them too.
		//
		// THE HOLD COMES OFF AND THE TOKEN STAYS OPEN, so a person can still
		// close it and the queue can offer it once it is free. The holder is
		// cleared in this copy as well, so everything read from it below agrees
		// with the disk rather than calling a token yours after it left.
		if why := whyNotNow(r, all[i]); why != "" {
			_, _ = PutDown(r, all[i].ID, actor)
			setBack = append(setBack, all[i].ID+": "+why)
			all[i].Holder = ""
			continue
		}
		return handed(r, actor, all[i])
	}

	for _, scope := range scopes {
		for i := range all {
			t := all[i]
			if t.Parent != scope.ID || t.Ended() || t.Holder != "" || !WorkableBy(r, t, role) {
				continue
			}
			if role == RoleReviewer && t.Author == actor {
				continue // never the author
			}
			if why := Blocked(r, t); why != "" {
				continue
			}
			if why := WaitsForAPerson(t); why != "" {
				continue
			}
			a, ok := take(r, actor, t)
			if ok {
				return a
			}
			unwritable = append(unwritable, a.Notice)
		}
	}

	held := theirOwnHeld(all, actor)
	for _, wantMine := range []bool{true, false} {
		for i := range all {
			t := all[i]
			if t.Ended() || t.Holder != "" {
				continue
			}
			if !WorkableBy(r, t, role) {
				continue
			}
			if role == RoleReviewer && t.Author == actor {
				continue // never the author
			}
			if why := Blocked(r, t); why != "" {
				continue
			}
			// A PARKED TOKEN IS NOT HANDED OUT. It waits on a person, and an agent
			// that takes one cannot put it down: the queue would answer it again.
			if why := WaitsForAPerson(t); why != "" {
				continue
			}
			// A CLAIM SOMEBODY ELSE HOLDS IS NOT WORK YOU CAN START. It reads as
			// blocked because that is what it is: nothing you do releases it, and
			// it releases itself when it lapses. See claim.go.
			if by := ClaimedNow(r, t, now); by != "" && !ClaimedHere(r, by) {
				continue
			}
			// WHAT YOU CLAIMED COMES BEFORE WHAT NOBODY HAS. A claim is an agent
			// saying these are the ones I am working through, so handing it
			// something else would make the claim mean nothing.
			if wantMine != (ClaimedNow(r, t, now) == me) {
				continue
			}
			a, ok := take(r, actor, t)
			if ok {
				return a
			}
			unwritable = append(unwritable, a.Notice)
		}
	}
	if len(scopes) > 0 {
		return Answer{Pull: AnswerWait,
			Notice: scopeNotice(r, scopes) + setBackNotice(setBack) + unwritableNotice(unwritable)}
	}
	return Answer{Pull: AnswerWait,
		Notice: waitNotice(r, actor, held) + setBackNotice(setBack) + unwritableNotice(unwritable)}
}

// urgentFirst puts what a person marked urgent at the head of the list, and
// leaves everything else in the order it came in.
//
// ONE SORT SERVES EVERY PASS. The queue walks this list four times over: what
// is held, what is inside a held scope, what this box claimed, and what nobody
// has. A rule written into each of those walks is the same rule written four
// times, and the fourth copy is the one somebody forgets.
//
// IT IS STABLE, so among the urgent and among the rest the order is still
// oldest first. Urgent is a flag rather than a rank: it says before the others,
// and it says nothing about which of two urgent tokens comes first.
//
// IT DOES NOT REACH PAST THE OTHER RULES. A parked token, a blocked one and a
// claim another box holds are each passed over further down, whatever this
// says: the flag moves a token up the queue and takes nothing out of its way.
func urgentFirst(all []Token) []Token {
	sort.SliceStable(all, func(i, j int) bool { return all[i].Urgent && !all[j].Urgent })
	return all
}

// unwritableNotice names every token the queue passed over because the record
// would not write it, so the chapter that has to be shortened can be found.
// A pull that hands work out says nothing about them: the notice belongs to
// the answer that has nothing better to say.
func unwritableNotice(said []string) string {
	if len(said) == 0 {
		return ""
	}
	return fmt.Sprintf("\n\nPassed over, because the record will not write them:\n  %s\n\n"+
		"Shorten what each refusal names. Until then nobody can be handed these.",
		strings.Join(said, "\n  "))
}

// take puts a token in the actor's hands and answers it. It answers false when
// the record will not write the token, and the notice then says which token and
// why, for the queue to carry to whoever gets the wait.
//
// THE REFUSAL IS THE WRITE'S, NOT THE QUEUE'S. The save holds a token to the
// bounds the schema puts on its chapters, and that stands: a record that took
// whatever was handed to it would hold tickets nobody reads. What does not
// stand is one such token answering for every other: it is skipped, and the
// caps stay where they are.
func take(r Roots, actor string, t Token) (Answer, bool) {
	t.Holder = actor
	// THE QUEUE CLAIMS WHAT IT HANDS OVER.
	//
	// A tracked token is not worked without a claim, and the queue handed one
	// out carrying none, so the agent's first run or apply on it was refused for
	// want of a claim on the work it had been handed a moment before. It
	// happened to two tokens in one session. Claiming it here is one more field
	// on the save the handout already makes.
	//
	// A LOCAL TOKEN TAKES NONE, and one another box has claimed is not taken
	// from it. Both are the gate's own rules, asked here rather than repeated:
	// NoClaimHere says this box may not work it, and ClaimedNow says whether
	// anybody has it.
	claimed := false
	if now := time.Now().UTC(); NoClaimHere(r, t, now) != "" && ClaimedNow(r, t, now) == "" {
		t.ClaimedBy, t.ClaimedAt = Claimant(r, actor), now.Format(ClaimStamp)
		claimed = true
	}
	// HANDING OUT OPENS A STRETCH, with the tree as it stands as its before.
	t = openStretch(r, t)
	if err := SaveToken(r, t); err != nil {
		return Answer{Pull: AnswerWait,
			Notice: t.ID + ": the record will not take a write: " + err.Error()}, false
	}
	a := handed(r, actor, t)
	a.claimed = claimed
	return a, true
}

// handed answers a token the actor holds, with the guidance for it.
//
// AND WITH WHAT THIS BOX CANNOT SHOW IT. A travelled token names snapshots
// taken somewhere else, and the reviewer's own step asks for every hunk of
// git diff began..ended. That diff answers bad object here and says nothing
// about why, so the hand-over says it instead. See travelNotice.
func handed(r Roots, actor string, t Token) Answer {
	text, says := TheGuidanceFor(r, actor, t.Guidance)
	return Answer{Pull: AnswerWork, Token: &t,
		Notice: workNotice(t) + travelNotice(r, t), Guidance: text, GuidanceAt: says}
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

// whyNotNow answers why a token cannot be worked now, or nothing.
//
// IT IS THE TWO DOORS IN ONE PLACE. Both were written out at every path that
// hands work out, five times over, and the copy that mattered most is the one
// that forgot half of them.
func whyNotNow(r Roots, t Token) string {
	if why := Blocked(r, t); why != "" {
		return why
	}
	return WaitsForAPerson(t)
}

// setBackNotice says what the queue took out of this actor's hands, and why.
// Work that leaves a hand without a word leaves the agent wondering where it
// went, and looking for it is how a session is spent.
func setBackNotice(setBack []string) string {
	if len(setBack) == 0 {
		return ""
	}
	return "\n\nSet back out of your hands, each waiting on something:\n  " +
		strings.Join(setBack, "\n  ")
}

// theirOwnHeld answers the open tokens this actor holds, for the notice that
// calls them theirs.
//
// IT IS BUILT ONCE, AND IT IS THE ACTOR'S OWN.
//
// MEASURED, PULLING AS reviewer-poplar ON 2026-09-05. The notice read "12
// piece(s) are yours and every one is blocked", listed six ids, then listed the
// same six again. There were six, and not one of them was the puller's.
//
// The list was gathered inside the pass that runs once for what this actor
// claimed and once for what nobody has, and what it appended did not depend on
// which pass it was in, so every held token landed twice. And it took a token
// whenever anybody held it, while the notice calls the list yours.
//
// A TOKEN THAT HAS ENDED IS NOBODY'S WORK. One that closed still carrying a
// holder was named as a piece somebody still had to answer for.
func theirOwnHeld(all []Token, actor string) []string {
	var held []string
	for i := range all {
		if all[i].Holder == actor && !all[i].Ended() {
			held = append(held, all[i].ID)
		}
	}
	return held
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
		if Blocked(r, t) != "" || WaitsForAPerson(t) != "" {
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
	inSession(r, "work", actor, t.ID+" put down", sessionlog.Yes(), map[string]any{"id": t.ID})
	return t, nil
}

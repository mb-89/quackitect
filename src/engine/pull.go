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
	AnswerReview  = "review"  // here is a submission: judge it
	AnswerRefused = "refused" // the submission failed a check a program could make
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

	// WHAT THE REVIEWER WATCHED GO RED, per criterion, after the work landed.
	Rewatched   map[string]string `json:"rewatched,omitempty"`
	Disposition string            `json:"disposition,omitempty"`
	Successors  []string          `json:"successors,omitempty"`
	Reason      string            `json:"reason,omitempty"`

	// A reviewer's answer.
	Verdict  string      `json:"verdict,omitempty"` // accept or reject
	Findings []Rejection `json:"findings,omitempty"`

	// WHAT THE CLASS OF MISTAKE IS, and what to do instead. A rejection
	// without one is refused.
	Lesson Lesson `json:"lesson,omitempty"`

	// The token the reviewer minted for the lesson, on a rejection.
	Learned string `json:"learned,omitempty"`

	// A draft's criteria, when the payload is a spec.
	Criteria []Criterion `json:"criteria,omitempty"`
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
	Guidance string `json:"guidance,omitempty"`

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
		reclaimed = Reclaim(r, actor, role)
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
		a, done := settle(r, actor, role, p)
		if done {
			return a
		}
		learned = a.Learned
	}
	// THE WORK PILES UP AND NOBODY IS JUDGING IT. A submission is settled first,
	// because settling one is progress and refusing it would lose the work.
	// Asking for the next piece is what gets refused.
	if a, blocked := reviewerMissing(r, role); blocked {
		a.Learned = learned
		return a
	}
	// A HOLD NOBODY IS BEHIND SENDS SOMEBODY TO LOOK, before new work is handed
	// out. A walker given another token goes on working while the stuck one
	// stays stuck, which is what happened.
	if role == RoleWorker {
		if t, quiet := quietHold(r, actor); quiet {
			a := investigate(r, t)
			a.Learned = learned
			return a
		}
	}
	a := next(r, actor, role)
	a.Learned = learned
	return a
}

// reviewerMissing refuses a worker's pull when the review queue has grown and
// nothing is reading it.
//
// NOTHING STARTS A REVIEWER. The engine said spawn one if you have not, in a
// notice, and a notice is a suggestion. Seven tokens sat submitted with none in
// review while the queue went on handing out work.
//
// A REFUSAL IS THE ONLY THING THAT WORKS. The hold refuses and the owed answer
// refuses, and those two hold. So this one refuses too, and it names the one
// thing that clears it.
//
// A REVIEWER IS NEVER REFUSED. It is the thing that clears this, and refusing
// it would be a trap nobody could escape.
func reviewerMissing(r Roots, role string) (Answer, bool) {
	config := LoadConfig(r)
	limit, stale := config.UnreviewedBeforeBlocked, config.PullsBeforeHoldIsStale
	if role == RoleReviewer || limit <= 0 {
		return Answer{}, false
	}
	session := currentSession(r)
	var waiting []string
	for _, t := range Tokens(r) {
		switch t.Status {
		case ImpInReview, SpecInReview:
			// A HOLD IS NOT A READER. A token in review carries the name of
			// whoever took it, and that name outlives the process behind it. A
			// reviewer whose process died left a token held forever, and this
			// read that hold as somebody reading, so one dead reviewer turned
			// the refusal off for good.
			//
			// A HOLDER THAT IS STILL PULLING IS READING, and one that has
			// fallen behind the queue is not. An arrival is recorded once and
			// never unwritten, so it stayed true after the reviewer died. The
			// count of pulls is refreshed by pulling, which is the only thing
			// a live reviewer does that a dead one cannot.
			//
			// WITH NO NAMED SESSION THE HOLD IS TAKEN AT ITS WORD. Nothing
			// arrives when no engine is running, so the engine cannot tell a
			// live hold from a stale one, and refusing on a fact it cannot
			// check would block a queue for a reason nobody could act on.
			if !Named(session) || StillPulling(r, session, t.Holder, stale) {
				return Answer{}, false
			}
			// NOBODY HOLDS A DRAFT ITS DRAFTER HAS SENT. It sits in review
			// waiting for a reviewer to take it, so it is waiting work like
			// any other and naming a holder would name an empty string.
			if t.Holder == "" {
				waiting = append(waiting, t.ID+" "+t.Title)
				continue
			}
			why := ", who has not pulled since the engine started"
			if HasPulled(r, session, t.Holder) {
				why = ", who has stopped pulling"
			}
			waiting = append(waiting, t.ID+" "+t.Title+" (held by "+t.Holder+why+")")
		case ImpSubmitted:
			waiting = append(waiting, t.ID+" "+t.Title)
		}
	}
	if len(waiting) <= limit {
		return Answer{}, false
	}
	return Answer{Pull: AnswerWait, Notice: fmt.Sprintf(
		"NO REVIEWER IS RUNNING AND %d PIECES OF WORK ARE WAITING FOR ONE. "+
			"Nothing new is handed out until one is.\n\n%s\n\n"+
			"Spawn a reviewer. It pulls with --as reviewer, judges one token, "+
			"answers, and pulls again. This clears the moment its first pull moves "+
			"a token into review.", len(waiting), briefly(waiting))}, true
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
		if t.Status == SpecInReview {
			return judgeSpec(r, actor, t, p)
		}
		return judge(r, actor, t, p)
	}
	if t.Status.Drafting() {
		return submitSpec(r, actor, t, p)
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
	if t.Status.Ended() {
		return refuse(&t, Rejection{Clause: "status", Wrong: "this token is already closed",
			Satisfies: "a token that is open or in work"}), true
	}
	if t.Status == ImpSubmitted || t.Status == ImpInReview {
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
	// THE WORKER RUNS THE CRITERIA BEFORE SUBMITTING. Asking the reviewer to
	// find out is what this replaces, so the engine runs them here and a
	// submission that does not meet them never reaches a reviewer.
	if unmet := UnmetCriteria(r, t, p); len(unmet) > 0 {
		return refuse(&t, Rejection{Clause: "the criteria",
			Wrong: fmt.Sprintf("%d of the %d criteria this token agreed are not met:\n\n  %s",
				len(unmet), len(t.Criteria), strings.Join(unmet, "\n  ")),
			Satisfies: "every criterion met, or a reviewer agreeing a change to them"}), true
	}

	t.Submission = p.Evidence
	t.Disposition = Disposition(p.Disposition)
	t.Successors = p.Successors
	t.Reason = p.Reason

	// The agent settles its own breakdown and nothing else. Everything else
	// goes to a reviewer, which is what the scope decides.
	if t.SelfClosing() {
		t.Status, t.Holder = EndsAt(t.Disposition), ""
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		return Answer{}, false
	}
	t.Status, t.Holder = ImpSubmitted, ""
	if err := SaveToken(r, t); err != nil {
		return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
			Satisfies: "a writable .se/work"}), true
	}
	return Answer{}, false
}

// submitSpec sends a draft to a reviewer. The work does not start until one
// agrees it, which is the whole point of the state.
func submitSpec(r Roots, actor string, t Token, p Payload) (Answer, bool) {
	if t.Assignee != actor {
		return refuse(&t, Rejection{Clause: "assignee", Wrong: "this token is not yours",
			Satisfies: "draft a token assigned to " + actor}), true
	}
	if err := DraftReady(t); err != nil {
		return refuse(&t, Rejection{Clause: "the spec", Wrong: err.Error(),
			Satisfies: "a detail saying what the problem is, and criteria saying what done means"}), true
	}
	// WHERE IT BITES FIRST. A spec whose criteria already pass does not go to
	// review. A criterion that passes before the work cannot report on the
	// work, and nothing is built yet to argue about.
	if green := CriteriaThatAlreadyPass(r, t); len(green) > 0 {
		return refuse(&t, Rejection{Clause: "the criteria",
			Wrong: fmt.Sprintf("%d of the %d criteria pass with the work not done:\n\n  %s",
				len(green), len(t.Criteria), strings.Join(green, "\n  ")),
			Satisfies: "a command that is red today and goes green when the work lands"}), true
	}
	// SUBMITTED IS WHERE A QUEUE IS COUNTED. A draft went from the drafter's
	// hands straight into a reviewer's with no state in between, so nothing
	// could say how much was waiting for a reviewer.
	t.Status, t.Holder = SpecSubmitted, ""
	if err := SaveToken(r, t); err != nil {
		return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
			Satisfies: "a writable .se/work"}), true
	}
	return Answer{}, false
}

// judgeSpec applies a reviewer's verdict on a draft. Accepting it opens the
// token, which is when the work starts.
func judgeSpec(r Roots, actor string, t Token, p Payload) (Answer, bool) {
	if t.Assignee == actor {
		return refuse(&t, Rejection{Clause: "the reviewer",
			Wrong:     "you drafted this spec, so you cannot agree it",
			Satisfies: "a draft from somebody else"}), true
	}
	if t.Holder != actor {
		return refuse(&t, Rejection{Clause: "the reviewer",
			Wrong:     "this spec is not with you",
			Satisfies: "pull for a review, and judge what comes back"}), true
	}
	switch p.Verdict {
	case "accept":
		if f := somethingWasRewatched(t, p, "the draft"); f != nil {
			return refuse(&t, *f), true
		}
		t.Rewatched = alsoWatched(t.Rewatched, p.Rewatched)
		t.Status, t.Holder = ImpOpen, ""
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		noteVerdict(r, actor, t, "spec agreed", nil)
		return Answer{}, false
	case "reject":
		if f := rejectionIsWhole(r, p); f != nil {
			return refuse(&t, *f), true
		}
		t.Rounds++
		for _, f := range p.Findings {
			f.Round, f.By = t.Rounds, actor
			t.Findings = append(t.Findings, f)
		}
		t.Status, t.Holder = SpecOpen, ""

		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		learned, err := KeepLesson(r, t, actor, p.Lesson, p.Learned)
		if err != nil {
			return refuse(&t, Rejection{Clause: "the lesson", Wrong: err.Error(),
				Satisfies: "a writable backlog"}), true
		}
		noteVerdict(r, actor, t, "spec rejected", p.Findings)
		return Answer{Learned: learned}, false
	}
	return refuse(&t, Rejection{Clause: "the verdict", Wrong: "a verdict is accept or reject",
		Satisfies: "verdict: accept, or verdict: reject with findings and a lesson"}), true
}

// EVERY REJECTION CARRIES A LESSON, NOT ONLY A FINDING. A finding teaches one
// token. A lesson names the class and teaches everything after it.
func rejectionIsWhole(r Roots, p Payload) *Rejection {
	if len(p.Findings) == 0 {
		return &Rejection{Clause: "the rejection",
			Wrong:     "a rejection with no finding tells the worker nothing",
			Satisfies: "at least one finding, with clause, wrong and satisfies"}
	}
	if p.Lesson.Empty() {
		return &Rejection{Clause: "the lesson",
			Wrong: "a rejection with no lesson teaches this token and nothing after it. " +
				"One token took five rounds because every round fixed the instance and left the class standing",
			Satisfies: "a lesson naming the class of mistake and what to do instead"}
	}
	// AND IT SAYS WHAT WOULD HAVE STOPPED THE MISTAKE BEING MADE, which is a
	// different sentence from what would have caught it.
	//
	// THE OWNER ASKED FOR IT BY NAME. What would have helped to just not make
	// that mistake? A lesson that ships only the catching half teaches the
	// more expensive of the two: detection is read by somebody already
	// suspicious, and a prevention is read by somebody who has not started.
	if trimmed(p.Lesson.Prevents) == "" {
		return &Rejection{Clause: "the lesson",
			Wrong: "this lesson says how the mistake would be caught and not what would have " +
				"prevented it. Those are different sentences, and the second is the one a " +
				"worker reads before they start",
			Satisfies: "prevents, saying the practice that would have stopped it being made, " +
				"which is what somebody does before the mistake rather than after it"}
	}
	// AND THE LESSON HAS A TOKEN, MINTED BY WHOEVER JUDGED IT.
	//
	// A lesson that is only a sentence on a note is a sentence somebody has to
	// remember to act on. The reviewer mints it, because which class a finding
	// belongs to and whether it goes to the backlog or straight into what is
	// open are judgments the engine cannot make. The engine's part is this
	// refusal.
	if strings.TrimSpace(p.Learned) == "" {
		return &Rejection{Clause: "the lesson",
			Wrong: "the lesson names no token, so it is a sentence on a note somebody " +
				"has to remember to act on",
			Satisfies: "mint a token for the lesson with se work, backlogged or open as " +
				"you judge, and name its id in learned"}
	}
	if _, err := LoadToken(r, p.Learned); err != nil {
		return &Rejection{Clause: "the lesson",
			Wrong:     "learned names " + p.Learned + ", which is not a token: " + err.Error(),
			Satisfies: "the id of a token you minted for the lesson"}
	}
	return nil
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
	if t.Status != ImpInReview {
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
		if f := somethingWasRewatched(t, p, "this token"); f != nil {
			return refuse(&t, *f), true
		}
		t.Rewatched = alsoWatched(t.Rewatched, p.Rewatched)
		if t.Disposition == NoDisposition {
			t.Disposition = Done
		}
		// WHERE IT ENDS FOLLOWS WHAT BECAME OF IT. A dropped token stops at
		// aborted, which is where an abort ends, and everything else at done.
		t.Status, t.Holder = EndsAt(t.Disposition), ""
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		noteVerdict(r, actor, t, "accepted", nil)
		return Answer{}, false
	case "reject":
		if f := rejectionIsWhole(r, p); f != nil {
			return refuse(&t, *f), true
		}
		t.Rounds++
		for _, f := range p.Findings {
			f.Round, f.By = t.Rounds, actor
			t.Findings = append(t.Findings, f)
		}
		t.Status, t.Holder = ImpOpen, ""
		t.Submission = nil
		if err := SaveToken(r, t); err != nil {
			return refuse(&t, Rejection{Clause: "the record", Wrong: err.Error(),
				Satisfies: "a writable .se/work"}), true
		}
		learned, err := KeepLesson(r, t, actor, p.Lesson, p.Learned)
		if err != nil {
			return refuse(&t, Rejection{Clause: "the lesson", Wrong: err.Error(),
				Satisfies: "a writable backlog"}), true
		}
		noteVerdict(r, actor, t, "rejected", p.Findings)
		return Answer{Learned: learned}, false
	}
	return refuse(&t, Rejection{Clause: "the verdict", Wrong: "a verdict is accept or reject",
		Satisfies: "verdict: accept, or verdict: reject with findings"}), true
}

// EVERY VERDICT IS IN THE RECORD, WITH ITS REASONS.
//
// A move line says a token went from in_review to open, and that is the fact
// without the reason. The person watching the log is the one who decides what
// to do next, and they were being shown the state change with the finding kept
// inside the token file.
//
// It is written here rather than beside the move, because the move loses who
// judged: a verdict clears the holder, so by the time it is saved the only
// name left on the token is the worker's.
func noteVerdict(r Roots, actor string, t Token, verdict string, found []Rejection) {
	data := map[string]any{"id": t.ID, "verdict": verdict, "round": t.Rounds}
	msg := t.ID + " " + verdict + ": " + t.Title
	if len(found) > 0 {
		var b strings.Builder
		b.WriteString(msg)
		for _, f := range found {
			fmt.Fprintf(&b, "\n\n%s: %s\nit passes with: %s", f.Clause, f.Wrong, f.Satisfies)
		}
		msg = b.String()
		data["findings"] = len(found)
	}
	inSession(r, "review", actor, msg, Yes(), data)
}

// A CRITERION THE ENGINE NO LONGER RUNS FOR ITSELF IS READ BY SOMEBODY OR BY
// NOBODY. The spec gate takes a criterion that passes on the strength of its
// recorded red, so the whole weight of it sits on a string, and the reviewer is
// the only reader of that string.
//
// TWO VERDICTS AND BOTH ASK, because there are two acceptance paths and the
// loosened gate runs on the one that was left out. Counted off the log: 41
// acceptances, 33 through judge and 8 through judgeSpec, so about one in five
// went through with nothing asked and nothing recorded.
//
// WHAT COUNTS DIFFERS BY PATH, AND IT IS THE SAME QUESTION EACH TIME. On an
// implementation, a criterion with a command, because the work has landed and
// the reviewer can run it. On a draft, a criterion carrying a recorded
// observation, because that is exactly the set the gate waves through: a
// criterion the engine ran red for itself needs no second reader.
//
// AT LEAST ONE, NOT ALL OF THEM. Re-watching every criterion on every
// acceptance is a cost nobody would pay, and a rule nobody pays is a rule that
// gets turned off. One is the difference between having looked and not.
//
// A TOKEN WITH NONE OF THEM ASKS FOR NOTHING, and a refusal that fired on those
// would be a gate with no way through.
func somethingWasRewatched(t Token, p Payload, half string) *Rejection {
	says := map[string]bool{}
	owed := 0
	for _, c := range t.Criteria {
		says[trimmed(c.Says)] = true
		if half == "the draft" {
			if c.Runs != "" && c.Watched() {
				owed++
			}
			continue
		}
		if trimmed(c.Runs) != "" {
			owed++
		}
	}
	// THE KEY NAMES A CRITERION ON THE TOKEN. This once took the first
	// non-blank value under any key at all, so one word under a key naming
	// nothing satisfied it. The map is keyed by the criterion, so the key is
	// held against what the token carries.
	said := 0
	for key, what := range p.Rewatched {
		if trimmed(what) == "" {
			continue
		}
		if !says[trimmed(key)] {
			return &Rejection{Clause: "the criteria",
				Wrong: fmt.Sprintf("what you re-watched is filed under %q, and this "+
					"token carries no criterion of that name", firstLines(key, 1)),
				Satisfies: "rewatched, keyed by the criterion's own sentence"}
		}
		said++
	}
	if owed == 0 || said > 0 {
		return nil
	}
	return &Rejection{Clause: "the criteria",
		Wrong: fmt.Sprintf("%s carries %d criteria the gate takes on a recorded red and "+
			"none was re-watched. The worker's red proves the check can fail. Yours "+
			"proves it is still the check that guards the behaviour", half, owed),
		Satisfies: "rewatched, keyed by the criterion, saying what you took away and what it said"}
}

// alsoWatched adds what this reviewer watched to what an earlier one did.
//
// TWO ACCEPTANCES, TWO OBSERVATIONS, ONE FIELD. A draft is agreed by one
// reviewer and the work by another, and an assignment made the second erase the
// first, or erase it with nothing when the second sent none. The record then
// lost the very thing the gate was built to keep, silently.
//
// A SECOND LOOK AT THE SAME CRITERION IS KEPT BESIDE THE FIRST, because they
// were taken at different moments and each says something the other cannot: one
// before the work and one after it.
func alsoWatched(had, said map[string]string) map[string]string {
	if len(said) == 0 {
		return had
	}
	if had == nil {
		had = map[string]string{}
	}
	for k, v := range said {
		if trimmed(v) == "" {
			continue
		}
		if was := trimmed(had[k]); was != "" && was != trimmed(v) {
			had[k] = had[k] + nl + nl + v
			continue
		}
		had[k] = v
	}
	return had
}

func refuse(t *Token, f Rejection) Answer {
	return Answer{Pull: AnswerRefused, Token: t, Findings: []Rejection{f},
		Notice: "Fix what the finding names and pull again with the same id."}
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
	cmd := Quietly(exec.Command(name, args...))
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

// aheadOf answers the index of an open token of this actor's that a person put
// ahead of seq, or -1. Only a person writes an order, so anything ahead of
// what the agent holds is a person saying which one is next.
func aheadOf(r Roots, all []Token, actor string, seq int) int {
	best := -1
	for i := range all {
		if all[i].Assignee != actor || all[i].Status != ImpOpen || all[i].Seq >= seq {
			continue
		}
		if Blocked(r, all[i]) != "" {
			continue
		}
		if best < 0 || all[i].Seq < all[best].Seq {
			best = i
		}
	}
	return best
}

// next reads the queue the role names. An agent is idle when no token is
// assigned to it, and that is answered from the ledger rather than from the
// harness, because the ledger is the thing that can be checked.
func next(r Roots, actor, role string) Answer {
	all := Tokens(r)
	if role == RoleReviewer {
		// ONE TOKEN AT A TIME, AND ALWAYS A VERDICT FOR IT.
		//
		// A reviewer that already holds one gets that one back rather than a
		// second. A reviewer reading three and ruling on them together makes
		// the person wait for the third to hear about the first, and the first
		// was something they could have acted on.
		//
		// A TOKEN IS DONE WHEN ITS STATE CHANGED. Nothing asks the reviewer
		// whether it finished, because a verdict moves the token out of
		// in_review and that is a fact the engine can see.
		for i := range all {
			if all[i].Status == SpecInReview && all[i].Holder == actor {
				return Answer{Pull: AnswerReview, Token: &all[i], Notice: heldNotice(),
					Guidance: ReviewMethod(r)}
			}
		}
		for i := range all {
			if all[i].Status == ImpInReview && all[i].Holder == actor {
				return Answer{Pull: AnswerReview, Token: &all[i], Notice: heldNotice(),
					Guidance: ReviewMethod(r)}
			}
		}
		// A DRAFT IS JUDGED BEFORE THE WORK STARTS, and it comes first: a spec
		// waiting is somebody blocked from starting, and a submission waiting
		// is work already done.
		for i := range all {
			if all[i].Status == SpecSubmitted && all[i].Holder == "" && all[i].Assignee != actor {
				all[i].Status, all[i].Holder = SpecInReview, actor
				if err := SaveToken(r, all[i]); err != nil {
					return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
				}
				return Answer{Pull: AnswerReview, Token: &all[i], Notice: specNotice(),
					Guidance: ReviewMethod(r)}
			}
		}
		for i := range all {
			if all[i].Status == ImpSubmitted && all[i].Assignee != actor {
				all[i].Status, all[i].Holder = ImpInReview, actor
				if err := SaveToken(r, all[i]); err != nil {
					return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
				}
				return Answer{Pull: AnswerReview, Token: &all[i], Notice: reviewNotice(),
					Guidance: ReviewMethod(r)}
			}
		}
		return Answer{Pull: AnswerWait,
			Notice: "Nothing is waiting for review. Say so and stop."}
	}

	// A DRAFT COMES BEFORE WORK. A token in spec is not work yet, and nothing
	// else will draft it: whoever minted it has to say what done means before
	// anybody can start. Leaving it out meant a spec was minted and then had to
	// be remembered, which is the class of failure this whole queue replaces.
	//
	// THE METHOD FOR DRAFTING RIDES WITH IT, the way the method for reviewing
	// rides with a review.
	for i := range all {
		if all[i].Assignee != actor || (all[i].Status != SpecOpen && all[i].Status != SpecInWork) {
			continue
		}
		// HANDING IT OUT IS WHAT MAKES IT IN WORK. Before, a draft nobody had
		// touched and one somebody was writing were the same state, so nothing
		// could say how much drafting was in flight.
		if all[i].Status == SpecOpen {
			all[i].Status, all[i].Holder = SpecInWork, actor
			if err := SaveToken(r, all[i]); err != nil {
				return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
			}
		}
		return Answer{Pull: AnswerWork, Token: &all[i], Findings: all[i].Findings,
			Notice: draftNotice(all[i]), Guidance: SpecMethod(r)}
	}

	// Work already picked up comes back first. An agent that pulled, was
	// interrupted, and pulled again gets the same token, not a second one.
	//
	// THE PERSON'S ORDER WINS. Unless something open now sits ahead of what
	// the agent holds, which only happens because a person put it there. Then
	// the held token goes back to the queue untouched and the person's choice
	// is handed out.
	//
	// It is decided here because the pull is the only thing that moves a token
	// between states, and a person saying which is next has to be able to
	// reach an agent that already picked up the wrong one.
	for i := range all {
		// THE HOLDER IS WHAT SAYS THE AGENT PICKED IT UP. A parent is in work
		// because a child is, with no holder, and nothing pulls a parent. Left
		// out, the queue handed back the parent instead of the child.
		if all[i].Assignee != actor || all[i].Status != ImpInWork || all[i].Holder != actor {
			continue
		}
		ahead := aheadOf(r, all, actor, all[i].Seq)
		if ahead < 0 {
			return Answer{Pull: AnswerWork, Token: &all[i], Findings: all[i].Findings,
				Notice: workNotice(all[i])}
		}
		put := all[i]
		put.Status, put.Holder = ImpOpen, ""
		if err := SaveToken(r, put); err != nil {
			return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
		}
		inSession(r, "work", actor, put.ID+" put down: "+all[ahead].ID+" was put ahead of it", Yes(),
			map[string]any{"id": put.ID, "for": all[ahead].ID})
		break
	}
	// THE OLDEST THAT IS NOT BLOCKED. A token waiting on something else is
	// not work anybody can do, so it is not offered.
	var held []string
	for i := range all {
		if all[i].Assignee != actor || all[i].Status != ImpOpen {
			continue
		}
		if why := Blocked(r, all[i]); why != "" {
			held = append(held, all[i].ID+": "+why)
			continue
		}
		all[i].Status, all[i].Holder = ImpInWork, actor
		if err := SaveToken(r, all[i]); err != nil {
			return Answer{Pull: AnswerWait, Notice: "the record will not take a write: " + err.Error()}
		}
		return Answer{Pull: AnswerWork, Token: &all[i], Findings: all[i].Findings,
			Notice: workNotice(all[i])}
	}
	return Answer{Pull: AnswerWait, Notice: waitNotice(r, actor, held)}
}

// heldNotice goes to a reviewer that pulled while still holding one.
func heldNotice() string {
	return "THIS IS THE TOKEN YOU ALREADY HOLD, and you get nothing new until you " +
		"rule on it. One token at a time, and a verdict for every one.\n\n" + reviewNotice()
}

// specNotice goes to a reviewer judging a draft rather than finished work.
func specNotice() string {
	return "THIS IS A DRAFT, NOT FINISHED WORK. Judge whether the problem is stated " +
		"and whether the criteria say what done means.\n\n" +
		"A criterion that can be a command has to be one, because a command fails and " +
		"a sentence does not. A criterion nobody could check is not a criterion.\n\n" +
		"Answer with verdict: accept to let the work start, or verdict: reject with " +
		"findings and a lesson."
}

func reviewNotice() string {
	return "Judge this submission against the token's own rules and nothing else. " +
		"Answer with verdict: accept, or verdict: reject and findings, each naming " +
		"the clause, what is wrong, and what would satisfy it. " +
		"The guidance field carries the method: four rounds, and every measurement reproduced."
}

// ReviewMethod is the method a reviewer works to. It is read from the method
// root and sent with every review, because a reviewer told to go and find it
// reviews from whatever it happens to think.
//
// A METHOD THAT WILL NOT READ IS SAID AND NEVER FATAL. The review is worth
// less without it and worth nothing if the pull refuses.
func ReviewMethod(r Roots) string { return method(r, "reviewing.md") }

// THE METHOD FOR DRAFTING RIDES WITH THE DRAFT, for the same reason the method
// for reviewing rides with a review: an agent told to go and read the method
// drafts from whatever it happens to think.
func SpecMethod(r Roots) string { return method(r, "specifying.md") }

func method(r Roots, name string) string {
	b, err := os.ReadFile(filepath.Join(GuidanceDir(r.Method), name))
	if err != nil {
		return "doc/guidance/" + name + " could not be read: " + err.Error()
	}
	return string(b)
}

// draftNotice goes to whoever has to say what done means before the work starts.
func draftNotice(t Token) string {
	var b strings.Builder
	b.WriteString("DRAFT THIS BEFORE ANYBODY WORKS ON IT. Say what the problem is and " +
		"what done means, then pull again with the id to send it for review.")
	if len(t.Findings) > 0 {
		fmt.Fprintf(&b, " The draft came back %d time(s): every finding below has to be answered.", t.Rounds)
	}
	b.WriteString(" A criterion that can be a command has to be one, because a command " +
		"fails and a sentence does not. The guidance field carries the method.")
	return b.String()
}

func workNotice(t Token) string {
	var b strings.Builder
	b.WriteString("Do this token. When the evidence is produced, pull again with id and evidence.")
	if len(t.Findings) > 0 {
		fmt.Fprintf(&b, " It came back from review %d time(s): every finding below has to be answered.", t.Rounds)
	}
	if t.SelfClosing() {
		b.WriteString(" This one closes on submission.")
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
		if (t.Status == ImpSubmitted || t.Status == ImpInReview) && t.Assignee == actor {
			waiting++
		}
	}
	if waiting > 0 {
		return fmt.Sprintf("No open tokens. %d of yours wait for review. "+
			"Spawn a reviewer if you have not, then pull again in a minute to see whether it finished.", waiting)
	}
	return "No token is assigned to you. Tell the person plainly that there is no work, and stop."
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
		// Backlogged work is not work anybody was asked to do, so it holds
		// nobody. That is what separates a note from a task.
		if t.Status != ImpOpen && t.Status != ImpInWork {
			continue
		}
		if Blocked(r, t) != "" {
			continue
		}
		mine = append(mine, t.ID+" "+t.Title)
	}
	if len(mine) == 0 {
		return reviewerAskingToStop(r, actor)
	}
	return Ruling{Reason: fmt.Sprintf(
		"You hold %d piece(s) of work that nothing else will do:\n%s\n\n"+
			"Pull to pick one up.", len(mine), briefly(mine))}
}

// A REVIEWER IS ASSIGNED NOTHING, so the check above never saw it.
//
// A worker holds work by being its assignee. A reviewer holds a token by being
// its holder while the token is in review, and it is assigned nothing at all.
// So the check found no work and let a reviewer walk away with a token in its
// hands, and that token then sat in review with nobody behind the name.
//
// WHAT HOLDS IT IS WHAT IT IS HOLDING, and nothing else.
//
// A first version also held an actor while anything waited for a reviewer. That
// held the WORKER too, because the engine does not know who is a reviewer: a
// role is an argument to a pull rather than a property of an actor. The
// queue-full case already has its own refusal, on the worker's pull, so this
// covers the case that had no cover at all.
func reviewerAskingToStop(r Roots, actor string) Ruling {
	var holding []string
	for _, t := range Tokens(r) {
		if (t.Status == ImpInReview || t.Status == SpecInReview) && t.Holder == actor {
			holding = append(holding, t.ID+" "+t.Title)
		}
	}
	if len(holding) == 0 {
		return Ruling{Permitted: true}
	}
	return Ruling{Reason: fmt.Sprintf(
		"YOU ARE STILL HOLDING %d PIECE(S) OF WORK TO JUDGE:\n%s\n\n"+
			"Rule on it. Nobody else can, and it sits in review with your name on it "+
			"until you do.", len(holding), briefly(holding))}
}

// PutDown sets a token back where it was, and answers what it looks like now.
//
// THE GAP THIS FILLS. Work already picked up comes back on every pull, which is
// right: an agent that pulled, was interrupted and pulled again gets the same
// token rather than a second one. The only thing that released one was a person
// putting something else first, so an agent that picked up the wrong thing with
// nothing else open could not set it down at all, and the queue showed it
// working on something it was not.
//
// PUTTING DOWN IS NOT ABORTING. Nothing became of the work, it has no reason,
// and it goes back exactly where it came from so the next puller finds it.
//
// EACH HALF GOES BACK TO ITS OWN OPEN. A draft in hand returns to a draft, not
// to work, because the two halves stay apart.
func PutDown(r Roots, id, actor string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	if t.Status.Ended() {
		return t, fmt.Errorf("%s already ended as %s. Putting down is for work in "+
			"somebody's hands, and an ending is not written over", t.ID, t.Status)
	}
	back, ok := whereItCameFrom[t.Status]
	if !ok {
		return t, fmt.Errorf("%s is %s, which is nobody's hands to let go of", t.ID, t.Status)
	}
	if t.Holder != actor {
		if t.Holder == "" {
			return t, fmt.Errorf("%s is not in anybody's hands", t.ID)
		}
		return t, fmt.Errorf("%s is in %s's hands rather than yours", t.ID, t.Holder)
	}
	t.Status, t.Holder = back, ""
	if err := SaveToken(r, t); err != nil {
		return t, err
	}
	inSession(r, "work", actor, t.ID+" put down", Yes(), map[string]any{"id": t.ID})
	return t, nil
}

// WHERE A HELD TOKEN GOES BACK TO. In review returns to submitted, because a
// reviewer letting go leaves work waiting for one rather than sending it back
// to its author.
var whereItCameFrom = map[Status]Status{
	ImpInWork:    ImpOpen,
	SpecInWork:   SpecOpen,
	ImpInReview:  ImpSubmitted,
	SpecInReview: SpecSubmitted,
}

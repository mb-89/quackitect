package main

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"strings"
	"time"
)

// THE WORK TOKEN. Level 1's one description of work.
//
// If something is being done, a token says so. There is no side channel: no
// verbal instruction, no plan in an agent's head, no task that exists only in
// a conversation. Work that is not a token is work nothing can see.
//
// A token is one file, and the file is the record. One file per token rather
// than one ledger, because two agents submit at the same time and a single
// ledger makes that a lock. It is also what a person reads six months later,
// and a person reads a file better than a line in a stream.

// THE SIX STATES. A token is in exactly one of them.
//
// BACKLOGGED IS NOT OPEN, and that is the whole point of it. A note somebody
// asked for is work that exists, is visible, and is not being done. It never
// reaches the queue and it never holds anybody from stopping. Draining the
// backlog is a separate act, and it is somebody's decision rather than a
// consequence of having written the note down.
//
// Submitted and in review are separate because a reviewer has to be able to
// take one back. Without the split there is nothing to reclaim from a reviewer
// that died holding it.
type Status string

// TWO HALVES, ONE SHAPE. Each half runs open, in work, submitted, in review, so
// somebody who has learned one half has learned the other and the engine
// carries one set of rules rather than two.
//
// THERE IS NO SPEC DONE, because a spec that is agreed IS implementation open.
//
// ELEVEN STATES. The owner named ten and the eleventh is aborted, which is the
// engine's: the owner named where work goes and this is where a dropped token
// stops.
const (
	Backlogged Status = "backlogged" // minted, and not work anybody is asked to do yet

	// A TOKEN CARRIES WHAT DONE MEANS BEFORE ANYBODY WORKS ON IT.
	//
	// The reviewer kept telling the worker it had not done the work, and that
	// is a fault in the token rather than in the review. Nothing said what done
	// meant, so nothing could be checked before the submission and the review
	// became the first place anybody looked.
	SpecOpen      Status = "spec_open"      // nobody has picked the drafting up
	SpecInWork    Status = "spec_in_work"   // a drafter holds it
	SpecSubmitted Status = "spec_submitted" // the draft is in, and it waits for a reviewer
	SpecInReview  Status = "spec_in_review" // a reviewer holds the draft

	ImpOpen      Status = "imp_open"      // the draft is agreed. Nobody has picked it up
	ImpInWork    Status = "imp_in_work"   // an actor holds it
	ImpSubmitted Status = "imp_submitted" // the evidence is in, and it waits for a reviewer
	ImpInReview  Status = "imp_in_review" // a reviewer holds it
	ImpDone      Status = "imp_done"      // finished, with a disposition saying how

	// AN ABORT COMES OFF ANY STATE AND CARRIES WHY. It is where a dropped token
	// stops, and dropped already refuses to be without a reason. Deferring is
	// not an ending at all: a deferred token goes back to backlogged.
	Aborted Status = "aborted"
)

// THE STATES, IN THE ORDER WORK PASSES THROUGH THEM. One list, so an abort
// walks the engine's own rather than one written out beside it.
func States() []Status {
	return []Status{Backlogged,
		SpecOpen, SpecInWork, SpecSubmitted, SpecInReview,
		ImpOpen, ImpInWork, ImpSubmitted, ImpInReview, ImpDone, Aborted}
}

// Ended answers whether a token has stopped, either way.
func (s Status) Ended() bool { return s == ImpDone || s == Aborted }

// WHERE A DISPOSITION LANDS. A state and a disposition are two fields and they
// stay two: the state says which half of the machine a token ended in, the
// disposition says what became of it.
//
//	done      imp_done   stays as it is
//	became    imp_done   stays, with its successors
//	dropped   aborted    stays, and its reason is the abort's
//
// An abort is where a dropped token stops rather than a fourth exit, and
// dropped already refuses to be without a reason.
func EndsAt(d Disposition) Status {
	if d == Dropped {
		return Aborted
	}
	return ImpDone
}

// WHAT A NAME USED TO BE. Every token already on disk keeps what it says, and
// this is what reads it. No note is rewritten by hand.
//
// spec_in_review keeps its name, so it is not here.
var wasCalled = map[Status]Status{
	"spec":       SpecOpen,
	"open":       ImpOpen,
	"in_work":    ImpInWork,
	"submitted":  ImpSubmitted,
	"in_review":  ImpInReview,
	"closed":     ImpDone,
	"spec_ready": SpecSubmitted,
}

// ReadStatus answers the state a note names, under whatever name it used.
func ReadStatus(said string) Status {
	s := Status(said)
	if now, older := wasCalled[s]; older {
		return now
	}
	return s
}

// THE SCOPE. The barrier a token sits behind, and the one thing Level 1 reads
// from it is who may close.
//
// Multi-step and single-step behave identically here. That is the point rather
// than a gap: if they behaved differently, Level 1 would know what a step is.
// It carries the word and hands the meaning upward.
type Scope string

const (
	MultiStep  Scope = "multi-step"  // a barrier supplied from above
	SingleStep Scope = "single-step" // a barrier supplied from above
	InToken    Scope = "token"       // inside another token: a step of somebody's own breakdown
)

// The word a drop uses to say "no bucket". A person can type it, and a group
// with no name answers to it.
const Cleared = ""

// A status is the engine's word, so a group named after one is a derived group
// and a drop into it clears the bucket rather than setting one.
func (s Status) Known() bool {
	for _, k := range States() {
		if s == k {
			return true
		}
	}
	return false
}

func (s Scope) Known() bool {
	return s == MultiStep || s == SingleStep || s == InToken
}

// The three exits, and there is no fourth. A token that closes without saying
// what became of it is how work disappears — v3 lost 25 that way.
type Disposition string

const (
	NoDisposition Disposition = ""
	Done          Disposition = "done"
	Became        Disposition = "became"
	Dropped       Disposition = "dropped"
)

// A rejection is typed so the worker acts mechanically instead of
// re-interpreting prose. Findings accumulate on the token across rounds, so a
// fresh reviewer reads the token's history rather than a colleague's memory.
type Rejection struct {
	Round     int    `json:"round"`
	By        string `json:"by"`
	Clause    string `json:"clause"`    // what rule it fails
	Wrong     string `json:"wrong"`     // what is wrong with it
	Satisfies string `json:"satisfies"` // what would satisfy the clause
}

// The evidence a token demands: a filled form, or a script that runs. Two
// kinds, because completion is either judged or measured and nothing else.
//
// The Go name carries SpecOpen because read evidence already holds the plain word
// in this package. In the token, in JSON, and in prose it is evidence.
type EvidenceSpec struct {
	Sections []string `json:"sections,omitempty"` // a form: every named section must be filled
	Script   string   `json:"script,omitempty"`   // a command: its exit code decides
}

func (e EvidenceSpec) Empty() bool { return len(e.Sections) == 0 && e.Script == "" }

// WHAT DONE MEANS, WRITTEN BEFORE THE WORK.
//
// One line saying what has to be true. Where that can be a command, it is one,
// and it passes when it exits zero. Where it cannot, the worker answers it by
// name in the evidence and a reviewer judges the answer.
//
// A CRITERION THAT CAN BE A COMMAND IS ONE. The difference between a criterion
// a program runs and a sentence somebody reads is the difference between a
// check that fails and a claim that does not.
type Criterion struct {
	Says string `json:"says"`           // what has to be true, in one line
	Runs string `json:"runs,omitempty"` // the command that decides it, if one can

	// WHAT WAS TAKEN AWAY TO MAKE IT FAIL, AND WHAT IT SAID WHEN IT DID.
	//
	// A criterion nobody has watched fail is a criterion nobody has tested. The
	// observation is two fields rather than a paragraph near them, because the
	// note is re-rendered from the parsed token on every save and prose written
	// beside a criterion is dropped the next time anybody writes the note.
	Without string `json:"without,omitempty"` // what was absent when it went red
	Red     string `json:"red,omitempty"`     // what it said when it went red

	Ran string `json:"ran,omitempty"` // what it answered when the worker ran it
	Met bool   `json:"met,omitempty"` // whether it passed
}

// Watched answers whether somebody has seen this criterion fail.
//
// A CRITERION WITH NO COMMAND IS NOT WATCHED AND IS NOT ASKED TO BE. It is
// answered by name in the evidence and a reviewer judges the answer.
func (c Criterion) Watched() bool {
	return c.Runs == "" || (trimmed(c.Without) != "" && trimmed(c.Red) != "")
}

type Token struct {
	ID string `json:"id"`

	// What work is to be done. There is no work without one.
	Title string `json:"title"`

	// The whole instruction, in the words it was asked in. The title is one line
	// and this is everything the next hand needs that the line cannot carry.
	Detail string `json:"detail,omitempty"`

	// Method travels with the work: inline for small, by reference for shared.
	Guidance    string `json:"guidance,omitempty"`
	GuidanceRef string `json:"guidance_ref,omitempty"`

	// What completion has to demonstrate. Asserting done is not evidence.
	Evidence EvidenceSpec `json:"evidence"`

	// WHAT DONE MEANS, AGREED BEFORE THE WORK. A token with none cannot leave
	// spec, and a submission runs every criterion that is a command.
	Criteria []Criterion `json:"criteria,omitempty"`

	// WHAT EACH ROUND TAUGHT. A finding says what is wrong with this token and
	// a lesson says what class of mistake it is, so a reader finds both where
	// the round happened.
	Lessons []Lesson `json:"lessons,omitempty"`

	Assignee string `json:"assignee"`
	Scope    Scope  `json:"scope"`

	// Decided at minting, by the minter. Ephemeral is scratch work that the
	// record has no use for. It is not a way out of review: see SelfClosing.
	Traced bool `json:"traced"`

	// A GROUPING A PERSON MADE, and the only thing here they name themselves.
	//
	// EMPTY MEANS THE DERIVED GROUP. A token carrying a bucket groups under it,
	// and one without groups under what the view falls back to. That fallback
	// lives in the view, as if(bucket, bucket, ...), so the note stays honest:
	// an absent bucket is absent rather than a copy that drifts.
	//
	// THE DERIVED GROUP IS THE ENGINE'S AND A BUCKET IS THE PERSON'S. A bucket
	// is a name somebody typed, so it can be renamed and it can be emptied.
	// Dropping work onto a derived group clears it, because saying where the
	// work belongs is stronger than the grouping it was filed under.
	Bucket string `json:"bucket,omitempty"`

	Parent string   `json:"parent,omitempty"`
	Subs   []string `json:"subs,omitempty"`

	// Work that has to close before this can start. Containment is the parent
	// holding its children. This is order between peers, which is a different
	// relation and gets its own field.
	DependsOn []string `json:"depends_on,omitempty"`

	Status      Status      `json:"status"`
	Disposition Disposition `json:"disposition,omitempty"`
	Successors  []string    `json:"successors,omitempty"` // became names these, and they must exist
	Reason      string      `json:"reason,omitempty"`     // dropped carries this

	// WHERE THE ABORT CAME FROM. An abort comes off any state, so aborted on
	// its own says a token stopped without saying what it stopped in the
	// middle of. A draft nobody agreed and a build somebody half finished are
	// different things to read six weeks later.
	AbortedFrom Status `json:"aborted_from,omitempty"`

	Submission map[string]string `json:"submission,omitempty"`
	Findings   []Rejection       `json:"findings,omitempty"`
	Rounds     int               `json:"rounds"`

	// Who holds it now. A worker while it is in work, a reviewer while it is
	// in review. It is what an arriving agent reclaims against.
	Holder string `json:"holder,omitempty"`

	// WHEN THINGS HAPPENED IS NOT ON THE TOKEN. A traced token travels, and a
	// timestamp on it says when somebody was at their desk. The record holds
	// every change, and the record never travels.
	//
	// WHAT ORDER THEY WERE MINTED IN IS NOT A TIME. The queue hands out the
	// thing that waited longest, and a plain number answers that while saying
	// nothing about when anybody was working.
	Seq      int    `json:"seq"`
	MintedBy string `json:"minted_by"`
}

// WHO MAY CLOSE, AND IT IS NOT A FIELD.
//
// The creator closes its own breakdown, and nothing else. Both conditions are
// set at minting and neither moves afterwards, so an agent cannot talk its way
// past a reviewer by editing one.
//
// Minting an ephemeral step is not an escape from review. A token scope exists
// only inside a parent the agent already holds, that parent is closed by a
// reviewer, and it cannot close while a child is open. The barrier is the
// parent, and the parent was never the agent's to settle.
func (t Token) SelfClosing() bool { return t.Scope == InToken && !t.Traced }

// THE TITLE IS FOUR WORDS AT MOST. It is what a person reads down a column,
// and a column of sentences is a column nobody reads. Everything the four
// words cannot carry goes in the detail, which is where the whole instruction
// belongs anyway.
//
// PADDING IS NOT A WAY ROUND IT. Joining words with an underscore or a slash
// makes one word of four and reads worse than the sentence it was hiding.
const TitleWords = 4

func checkTitle(title string) error {
	title = strings.TrimSpace(title)
	if title == "" {
		return fmt.Errorf("a token needs a title: say what the work is, in %d words", TitleWords)
	}
	words := strings.Fields(title)
	if len(words) > TitleWords {
		return fmt.Errorf("a title is %d words at most, and this is %d. Put the rest in the detail: %q",
			TitleWords, len(words), title)
	}
	for _, w := range words {
		if strings.ContainsAny(w, "_/\\") && len(w) > 12 {
			return fmt.Errorf("%q joins words to get under the limit. Put them in the detail instead", w)
		}
	}
	return nil
}

func newID() string {
	b := make([]byte, 5)
	if _, err := rand.Read(b); err != nil {
		// A clock is a worse identity than random bytes and a better one than
		// nothing. It is only ever reached when the machine has no entropy.
		return "wk-" + fmt.Sprintf("%010x", time.Now().UnixNano()&0xffffffffff)
	}
	return "wk-" + hex.EncodeToString(b)
}

func now() string { return time.Now().UTC().Format(time.RFC3339Nano) }

// The next number in the ledger. Two mints at the same instant can read the
// same one, and the cost of that is a tie in the queue's order rather than a
// token that is lost.
func nextSeq(r Roots) int {
	high := 0
	for _, t := range Tokens(r) {
		if t.Seq > high {
			high = t.Seq
		}
	}
	return high + 1
}

// Mint writes a new token. The caller decides everything the token carries,
// because the caller is the minter and the minter is who those decisions
// belong to.
func Mint(r Roots, t Token) (Token, error) {
	if err := checkTitle(t.Title); err != nil {
		return t, err
	}
	if t.Assignee == "" {
		return t, fmt.Errorf("a token needs an assignee: every token is somebody's")
	}
	if t.Scope == "" {
		t.Scope = SingleStep
	}
	if !t.Scope.Known() {
		return t, fmt.Errorf("a scope is %s, %s or %s", MultiStep, SingleStep, InToken)
	}
	// A dependency that does not exist never closes, so the token it holds
	// waits forever. Refusing here is cheaper than finding it in the queue.
	for _, id := range t.DependsOn {
		if _, err := LoadToken(r, id); err != nil {
			return t, fmt.Errorf("it depends on %s, which does not exist", id)
		}
	}
	t.ID = newID()
	t.Seq = nextSeq(r)
	// THE MINTER SAYS WHERE IT STARTS, and with nothing said it is open. Which
	// tokens draft first is the verb's policy rather than this function's: see
	// StartsAt, which se work calls.
	if !t.Status.Known() || t.Status.Ended() {
		t.Status = ImpOpen
	}
	// A sub-token is a token. The parent holds the list, because a parent
	// cannot close while a child is open and that is the parent's rule.
	if t.Parent != "" {
		p, err := LoadToken(r, t.Parent)
		if err != nil {
			return t, fmt.Errorf("no such parent: %s", t.Parent)
		}
		if err := SaveToken(r, t); err != nil {
			return t, err
		}
		p.Subs = append(p.Subs, t.ID)
		return t, SaveToken(r, p)
	}
	return t, SaveToken(r, t)
}

// Blocked says what holds a token back, in words, or nothing.
//
// TWO RELATIONS, and they are not the same thing. A parent is held by its open
// children, which is containment. A token is held by its open dependencies,
// which is order between peers. One predicate reads both, because the queue
// only ever asks the one question.
func Blocked(r Roots, t Token) string {
	if open := OpenSubs(r, t); len(open) > 0 {
		return "its sub-tokens are open: " + strings.Join(open, ", ")
	}
	var waiting []string
	for _, id := range t.DependsOn {
		d, err := LoadToken(r, id)
		if err != nil {
			waiting = append(waiting, id+" (which does not exist)")
			continue
		}
		if !d.Status.Ended() {
			waiting = append(waiting, id)
		}
	}
	if len(waiting) > 0 {
		return "it waits on " + strings.Join(waiting, ", ")
	}
	return ""
}

// Activate moves a backlogged token into the queue. Draining the backlog is a
// decision somebody makes, and it is not a consequence of having written the
// note down.
func Activate(r Roots, id string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	if t.Status != Backlogged {
		return t, fmt.Errorf("%s is %s, and only a backlogged token is opened this way", id, t.Status)
	}
	t.Status = ImpOpen
	return t, SaveToken(r, t)
}

// OpenSubs names the children still holding a parent open. A parent that
// cannot close is not an error, it is the barrier doing its job.
func OpenSubs(r Roots, t Token) []string {
	var open []string
	for _, id := range t.Subs {
		s, err := LoadToken(r, id)
		if err != nil || !s.Status.Ended() {
			open = append(open, id)
		}
	}
	return open
}

// PutFirst moves one token to the front of the queue.
//
// WHAT A PERSON OWNS IS THE ORDER. The queue hands out the oldest open token,
// oldest means the lowest seq, and nothing could change that, so a person who
// wanted a different thing done next had no way to say it. An agent holding
// the wrong token could not put it down and a person could not pull another
// forward.
//
// IT WRITES SEQ AND NOTHING ELSE. Which state a token is in stays with the
// pull, which is why a status written by hand is refused.
func PutFirst(r Roots, id string) (Token, error) {
	t, err := LoadToken(r, id)
	if err != nil {
		return t, err
	}
	if t.Status.Ended() {
		return t, fmt.Errorf("%s is closed, and the queue does not hand out closed work", id)
	}
	low := t.Seq
	for _, o := range Tokens(r) {
		if !o.Status.Ended() && o.Seq < low {
			low = o.Seq
		}
	}
	if low == t.Seq {
		return t, nil // already first, and a write that changes nothing is noise
	}
	t.Seq = low - 1
	return t, SaveToken(r, t)
}

func trimmed(s string) string {
	for len(s) > 0 && (s[0] == ' ' || s[0] == '\t' || s[0] == '\n' || s[0] == '\r') {
		s = s[1:]
	}
	for len(s) > 0 && (s[len(s)-1] == ' ' || s[len(s)-1] == '\t' || s[len(s)-1] == '\n' || s[len(s)-1] == '\r') {
		s = s[:len(s)-1]
	}
	return s
}

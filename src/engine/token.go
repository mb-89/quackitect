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

// A STATE IS A WORD THE PROCESS OWNS.
//
// The engine held eleven of them and named every one: backlogged, spec_open,
// imp_in_review, and so on down. That was a second process, written in Go,
// which every real process then had to be bent into. Now the states are in
// src/processes/<name>.process.yaml, the engine reads them from there, and a
// process with two states carries two.
//
// SO THE TYPE IS A STRING AND IT STAYS ONE. Nothing here decides which words
// are legal, because the file the token names decides that, and validation
// reads that file rather than a list beside it.
type Status = string

// WHERE A TOKEN ENDS IS THE DISPOSITION, NOT THE STATE. A token has ended when
// it says what became of it, so the two questions have one answer and no
// process has to declare a terminal state to be readable.

// The three exits, and there is no fourth. A token that closes without saying
// what became of it is how work disappears — v3 lost 25 that way.
type Disposition string

const (
	Done    Disposition = "done"
	Became  Disposition = "became"
	Dropped Disposition = "dropped"
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

	// THE DRAFTER'S ANSWER, written from the payload the way evidence is on
	// the implementation path. Empty means the finding stands unanswered, and
	// a redraft is refused while any standing finding's answer is empty.
	Answer string `json:"answer,omitempty"`
}

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

}

type Token struct {
	ID string `json:"id"`

	// WHICH PROCESS SHAPES THIS TOKEN. It says which sections and fields
	// apply, which states exist, and how the work moves. The engine owns none
	// of that any more.
	Process string `json:"process"`

	// The guidance for filling this kind, written by the template so a reader
	// is one click from the rules.
	Guidance string `json:"guidance,omitempty"`

	// WHEN IT NEEDS A PERSON, IT SAYS SO. There is no assignee: which agent
	// does the work was never a thing anybody read.
	NeedsHuman bool `json:"needs_human,omitempty"`

	// What you think should happen about it, beside what is wrong.
	ProposedAction string `json:"proposed_action,omitempty"`

	// What work is to be done. There is no work without one.
	Title string `json:"title"`

	// The whole instruction, in the words it was asked in. The title is one line
	// and this is everything the next hand needs that the line cannot carry.
	Detail string `json:"detail,omitempty"`

	// WHAT DONE MEANS, AGREED BEFORE THE WORK. One line each, and each one a
	// thing somebody can check.
	//
	// A CRITERION IS A SENTENCE AND NOT A COMMAND ANY MORE. It carried a shell
	// line the engine ran, plus what was taken away to watch it fail and what
	// it said when it did. The checklist on the process replaced all of that:
	// what a step demands belongs to the step, so every token of a process
	// answers the same questions rather than each one inventing its own.
	Criteria []Criterion `json:"criteria,omitempty"`

	// Work that has to close before this can start. Containment is the parent
	// holding its children. This is order between peers, which is a different
	// relation and gets its own field.
	DependsOn []string `json:"depends_on,omitempty"`

	// The other blocker, and the one only a person can judge: a date, or a
	// condition in whatever words fit. Triage passes over a token that is not
	// ready, so deciding not to decide leaves no history on the token.
	ReadyWhen string `json:"ready_when,omitempty"`

	Status      Status      `json:"status"`
	Disposition Disposition `json:"disposition,omitempty"`
	Successors  []string    `json:"successors,omitempty"` // became names these, and they must exist
	Reason      string      `json:"reason,omitempty"`     // dropped carries this

	Submission map[string]string `json:"submission,omitempty"`

	// THE PERSON'S OWN NAME FOR A GROUP, and it does not move the work.
	//
	// A STATE IS THE ENGINE READING THE PROCESS AND A BUCKET IS SOMEBODY
	// DECIDING. The view groups by this, so a person can sweep a handful of
	// tokens into a heading of their own without any of them changing where
	// they stand. A query in the view file is the other kind of group, and it
	// is a filter rather than a place.
	//
	// ONLY A PERSON WRITES ONE. See field.go: a name nobody asked for is a
	// grouping nobody meant, and two agents inventing two names for one idea
	// is how a list stops being readable.
	Bucket string `json:"bucket,omitempty"`

	// Who holds it now. A worker while it is in work, a reviewer while it is
	// in review. It is what an arriving agent reclaims against.
	Holder string `json:"holder,omitempty"`

	// WHAT THE READER DID NOT UNDERSTAND, KEPT SO THE WRITER CAN PUT IT BACK.
	//
	// The file is rendered from this struct, so anything absent here is absent
	// from the file after the next save. That is fine for a field nobody
	// wrote. It is not fine for a section a person added on purpose.
	//
	// It is out of the JSON because it is about the file rather than about the
	// work, and a caller handing the engine a token should not have to carry
	// somebody else's prose to avoid deleting it.
	Kept []KeptSection `json:"-"`
}

// Ended answers whether a token has stopped, either way. It reads the
// disposition rather than the state, because the disposition is the engine's
// field and the state is the process's.
func (t Token) Ended() bool { return t.Disposition != "" }

// KeptSection is one section of a note the reader has no field for.
type KeptSection struct {
	Head string
	Text string
}

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

// Blocked says what holds a token back, in words, or nothing.
//
// ONE RELATION NOW. Containment went with the parent field: a token is held by
// what it says it depends on, and an order somebody decided is the only order
// there is.
func Blocked(r Roots, t Token) string {
	var waiting []string
	for _, id := range t.DependsOn {
		d, err := LoadToken(r, id)
		if err != nil {
			waiting = append(waiting, id+" (which does not exist)")
			continue
		}
		if !d.Ended() {
			waiting = append(waiting, id)
		}
	}
	if len(waiting) > 0 {
		return "it waits on " + strings.Join(waiting, ", ")
	}
	return ""
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

// Mint writes a new token. The caller decides everything the token carries,
// because the caller is the minter and the minter is who those decisions
// belong to.
//
// WHAT IT REFUSES IS WHAT NOTHING DOWNSTREAM CAN RECOVER FROM: a title nobody
// can read down a column, and a dependency that does not exist. A dependency
// that does not exist never closes, so the token it holds waits forever, and
// refusing here is cheaper than finding it in the queue.
//
// EVERYTHING ELSE IS THE SCHEMA'S. Which fields a process allows, which
// sections it wants, and which states are legal are all in the files, and this
// asking them again would be a second answer to a question already answered.
func Mint(r Roots, t Token) (Token, error) {
	if err := checkTitle(t.Title); err != nil {
		return t, err
	}
	for _, id := range t.DependsOn {
		if _, err := LoadToken(r, id); err != nil {
			return t, fmt.Errorf("it depends on %s, which does not exist", id)
		}
	}
	t.ID = newID()
	return t, SaveToken(r, t)
}

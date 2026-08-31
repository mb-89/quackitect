package main

import (
	"encoding/json"
	"os"
	"strings"
	"time"
)

// AN ANSWER THAT IS OWED, BY THE AGENT IT WAS SAID TO.
//
// A prompt going in flips this. An answer going in clears it. Nothing reads
// the log back to work it out: the engine was told the prompt arrived, and a
// program that re-derives a fact it was handed will disagree with itself the
// first time the record and the events part company.
//
// WHILE ONE IS OWED, THAT AGENT DOES NOTHING ELSE. The order was a rule the
// agent kept, and a rule the agent keeps is a rule the agent can forget. It
// forgot twice, once by answering before recording and once by working first.
// So it is a refusal instead.
//
// IT IS KEYED BY ACTOR, because several agents run here at once. One flag for
// the project blocked every one of them on a message given to one, and let any
// of them clear it by answering. That drew three answers to one question.
//
// IT IS A FILE for the same reason the hold is one. The guard is a fresh
// process per event and holds nothing between them.
type Owed map[string][]string

// WHO A MESSAGE IS OWED BY, when nobody said.
//
// A person types into one window. Whichever agent's tool call reaches the
// transcript first is the one that copies the message, and it was the one told
// to answer it. So a reviewer was refused every call it made until it answered
// a message about the walker's work, and the walker that could act on it
// answered unrefused. Three answers reached one question, twice in one
// afternoon, which is the failure this store was keyed by actor to prevent.
//
// SO A MID-TURN MESSAGE IS THE WALKER'S. The person is talking to the walker,
// the walker is the one that can act on what they said, and a crew member
// refused for a message it cannot act on is a refusal nobody can clear.
//
// AN AGENT THAT NAMES ITSELF IS STILL ANSWERED TO. This is the default for a
// message nobody attributed, not a rule that every obligation is the walker's.
const Walker = "main"

func owedPath(r Roots) string { return r.Private("owed.json") }

// TheyAsked is called where a prompt arrives, and nowhere else.
//
// IT APPENDS. A person who asks two things before either is answered has asked
// two things, and a slot that held one erased the first. The refusal then
// showed the newest question and the older one was handed to nobody.
func TheyAsked(r Roots, actor, said string) error {
	return changeOwed(r, func(o Owed) { o[actor] = append(o[actor], said) })
}

// TheyWereAnswered is called where an answer arrives, and nowhere else. It
// clears one agent's obligation and leaves everybody else's.
func TheyWereAnswered(r Roots, actor string) error {
	return changeOwed(r, func(o Owed) { delete(o, actor) })
}

// THE READ AND THE WRITE ARE ONE OPERATION.
//
// The store was read whole, one key changed, and the whole map written back.
// The guard is a fresh process on every tool call of every agent, so the gap
// between the read and the write is not a rare event: two agents overlapping
// lost one of the two obligations every time, and a lost obligation is a
// question in the record that nobody is refused for.
//
// A LOCK FILE IS WHAT TWO PROCESSES CAN AGREE ON. They share nothing else: no
// memory, no parent, and not even a start time. Creating a file exclusively is
// the one thing the filesystem promises only one of them can do.
func changeOwed(r Roots, change func(Owed)) error {
	unlock, err := lockOwed(r)
	if err != nil {
		return err
	}
	defer unlock()
	o := loadOwed(r)
	change(o)
	return writeOwed(r, o)
}

// A LOCK NOBODY CAN RELEASE IS WORSE THAN A LOST WRITE. A process that dies
// holding it would block every agent for good, so a lock that is older than
// the time any of these writes can take is taken from whoever left it.
func lockOwed(r Roots) (func(), error) {
	path := owedPath(r) + ".lock"
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return nil, err
	}
	for tries := 0; ; tries++ {
		f, err := os.OpenFile(path, os.O_CREATE|os.O_EXCL|os.O_WRONLY, 0o644)
		if err == nil {
			f.Close()
			return func() { os.Remove(path) }, nil
		}
		if st, err := os.Stat(path); err == nil && time.Since(st.ModTime()) > lockIsStale {
			os.Remove(path)
			continue
		}
		if tries > lockTries {
			// The write matters more than the lock. Going ahead can lose a
			// write, and refusing loses one for certain.
			return func() {}, nil
		}
		time.Sleep(lockWait)
	}
}

// How long a lock is waited for, and when one is taken from whoever left it.
// These are this file's to decide: the write they guard is a few hundred bytes
// of JSON, so any holder that has not finished in a second has died.
//
// THE WAITER HAS TO OUTLAST THE STALENESS. It did not: a waiter gave up after
// one second and a lock went stale after five, so no waiter ever lived long
// enough to steal one. Every one of them went ahead without the lock instead,
// which is the unsynchronised write the lock exists to stop, and it did that
// for the whole five seconds after a process died holding it.
//
// SO STEALING IS WHAT RESOLVES A DEAD LOCK and going ahead is the last resort.
// A second is long enough that a live holder is never robbed, and the budget
// is three times that, so a waiter always sees the steal first.
// TestTheWaiterOutlastsTheStaleness holds these three to that.
const (
	lockWait    = 2 * time.Millisecond
	lockTries   = 1500
	lockIsStale = 1 * time.Second
)

// AnswerOwed answers everything this agent was told and whether it still owes.
// One answer settles the lot, because a person waiting on two questions is
// waiting for one reply that covers both.
func AnswerOwed(r Roots, actor string) (string, bool) {
	said := loadOwed(r)[actor]
	if len(said) == 0 {
		return "", false
	}
	return strings.Join(said, "\n\n"), true
}

// WHERE THIS LIVES, AND WHY IT IS THE ENGINE.
//
// The owner asked whether the flag belongs in the stub instead, since the stub
// is what an agent talks to. It stays in the engine, for now, and wk-4b67d7126a
// settles it.
//
// THE GUARD IS WHAT ENFORCES IT, AND THE GUARD IS THE ENGINE. The stub sees
// only the calls an agent chooses to make through it, and this refusal has to
// reach every call, including the ones that go nowhere near the stub. A flag in
// the stub would be a flag the guard cannot read.
//
// WHAT CHANGES IF A RESIDENT ENGINE LANDS: this file goes away. The obligation
// becomes a field in memory, the guard asks over the port, and .se/owed.json
// stops existing. Nothing about who owns the rule changes, only where the state
// sits, which is the whole point of that token.
// AN OBLIGATION DOES NOT OUTLIVE THE SESSION IT WAS MADE IN.
//
// This had no lifetime, so a question from three hours ago was still owed by an
// agent that had been gone since the engine restarted. Agent names are handed
// out per session and reused, so the first thing a fresh agent of that name was
// told was to answer a message the owner moved past hours before.
//
// arrivals.json had the same problem and settled it: a record from an earlier
// session says nothing about this one. The same sentence is true here.
//
// A FILE WITH NO SESSION IS ANOTHER SESSION'S. That is the shape this file had
// before, so the first read after the change drops what it was holding, which
// is the right answer for every entry it could be holding.
type owedFile struct {
	Session string `json:"session"`
	Owed    Owed   `json:"owed"`
}

func loadOwed(r Roots) Owed {
	var f owedFile
	b, err := os.ReadFile(owedPath(r))
	if err != nil || json.Unmarshal(b, &f) != nil || f.Owed == nil {
		return Owed{}
	}
	if f.Session != currentSession(r) {
		return Owed{}
	}
	return f.Owed
}

func writeOwed(r Roots, o Owed) error {
	if err := os.MkdirAll(r.Private(), 0o755); err != nil {
		return err
	}
	b, err := json.MarshalIndent(owedFile{Session: currentSession(r), Owed: o}, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(owedPath(r), append(b, '\n'), 0o644)
}

// AN OBLIGATION IS WRITTEN BY WHOEVER KNOWS WHOSE IT IS, AND BY NOBODY ELSE.
//
// The said and answer verbs cannot know. The stub runs them for every agent
// with no actor named, so a default named one agent: every agent's answer
// discharged that one's obligation, and every agent's message landed on it. A
// message given to a reviewer blocked main, which was never shown it and can
// never answer it, while the reviewer that was told went on unblocked.
//
// SO WITH NO ACTOR NAMED THEY WRITE THE LOG AND TOUCH THIS NOT AT ALL. Nothing
// is lost. The guard calls both of these on every tool call with the actor it
// computes, so the obligation is created and cleared one call later, which is
// how it already works for every agent going through the stub.
// A MESSAGE NOBODY ATTRIBUTED IS THE WALKER'S, HERE AS EVERYWHERE.
//
// This wrote nobody's, so a message recorded through the fallback verb left
// nobody owing and the guard refused nothing. The stub runs this verb with no
// actor, and the guidance names it as what to use whenever you are unsure, so
// the one path named for the case the copier cannot see was the one path that
// created no obligation.
//
// NOTHING DOUBLE-COUNTS IN EITHER ORDER. If the copier gets there first, the
// verb returns on AlreadySaid before it reaches this. If this gets there first,
// the copier's own count sees the words are already in the record and skips
// the line.
func TheyAskedIfNamed(r Roots, actor, said string) error {
	if strings.TrimSpace(actor) == "" {
		actor = Walker
	}
	return TheyAsked(r, actor, said)
}

// AN UNNAMED ANSWER STILL CLEARS NOBODY'S, and that half is unchanged. A verb
// with no actor cannot know who answered, and the guard clears it one call
// later with the actor it computes. The asymmetry is real: a message has an
// obvious owner and an answer does not.
func TheyWereAnsweredIfNamed(r Roots, actor string) error {
	if strings.TrimSpace(actor) == "" {
		return nil
	}
	return TheyWereAnswered(r, actor)
}

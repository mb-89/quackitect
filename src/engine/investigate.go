package main

import (
	"encoding/json"
	"fmt"
	"os"
)

// A HOLD NOBODY IS BEHIND SENDS SOMEBODY TO LOOK.
//
// A reviewer that stopped left a token held, and nothing said so. The refusal
// built for a queue that has grown fires only when the queue is over its limit,
// so under the limit a token held by somebody who is gone sat there and nothing
// noticed.
//
// AN ALARM, NOT A TIMEOUT. Nothing moves. The token stays exactly where it is,
// with the same status and the same holder, until somebody rules on it. A
// timeout guesses how long work takes and gets it wrong in both directions, and
// a person looking is what a stuck token actually needs.
//
// ONE NUMBER DECIDES A QUIET HOLD, and the engine already has it:
// limits.pulls_before_hold_is_stale. The queue is its own clock, so a holder
// that stops falls behind while the work it is holding up goes on asking. A
// second number in seconds would be a second answer to one question, and
// somebody would have to reconcile them at the moment they disagreed.
//
// WHICH STATUSES. A token in review, a draft in review, and work held by
// somebody other than the walker. THE DRAFT IS THE ONE THAT REALLY SITS
// FOREVER: Reclaim frees a token in review and a token in work when a fresh
// actor arrives, and it does not cover a draft.

// AnswerInvestigate is the fifth answer. A pull that would have handed out work
// hands out an instruction to go and look instead.
const AnswerInvestigate = "investigate"

// quietHold answers the first hold nobody is behind, or nothing.
//
// THE HOLDER IS NEVER SENT TO INVESTIGATE ITSELF. That is an instruction nobody
// can act on, and a sub-walker that has gone quiet is not going to read it.
func quietHold(r Roots, actor string) (Token, bool) {
	stale := LoadConfig(r).PullsBeforeHoldIsStale
	session := currentSession(r)
	// WITH NO NAMED SESSION NOTHING IS INVESTIGATED. The engine cannot tell a
	// live hold from a dead one, and sending somebody to look at a hold it
	// cannot check is the same mistake as refusing on one.
	if !Named(session) || stale <= 0 {
		return Token{}, false
	}
	for _, t := range Tokens(r) {
		if !holdWorthWatching(t) || t.Holder == "" || t.Holder == actor {
			continue
		}
		if StillPulling(r, session, t.Holder, stale) {
			continue
		}
		return t, true
	}
	return Token{}, false
}

// A HOLD WORTH WATCHING IS A HOLD ON WORK THAT HAS NOT ENDED. It used to name
// three states, which meant the watcher knew the engine's old vocabulary and
// would have gone silent the first time a process invented its own word.
func holdWorthWatching(t Token) bool { return !t.Ended() }

// investigate is the answer. It says what is stuck, who left it, and what to do
// about it, so the walker does not have to look any of that up.
// HOW FAR BEHIND IS A NUMBER THE ENGINE HAS. Saying only that a holder is
// behind leaves the person it woke to go and find out, and the difference
// between one pull and thirty is the difference between reading and gone.
func investigate(r Roots, t Token) Answer {
	behind, everSeen := HowFarBehind(r, currentSession(r), t.Holder)
	howFar := fmt.Sprintf("%d pulls have gone past since they last pulled", behind)
	if !everSeen {
		howFar = fmt.Sprintf(
			"they have not pulled at all this session, and %d pulls have gone past", behind)
	}
	return Answer{Pull: AnswerInvestigate, Notice: fmt.Sprintf(
		"GO AND LOOK AT %s %s. It is %s, held by %s, who has stopped pulling: %s.\n\n"+
			"Nothing has been moved. It is exactly where it was and it stays there "+
			"until you rule on it, because a timeout guesses and a person looking "+
			"does not.\n\n"+
			"Find out whether %s is still working. If it is gone, pull again "+
			"with se pull, and the engine puts it back in the queue for you. If it "+
			"is working, leave it where it is and come back to se pull. This "+
			"notice stands until they move.",
		t.ID, t.Title, t.Status, t.Holder, howFar, t.Holder)}
}

// PULLING AGAIN IS THE WALKER'S ANSWER, AND THE NOTICE PROMISES IT WORKS.
//
// The notice says: if it is gone, pull again with se pull, and the engine takes
// it back for you. It did not. Reclaim runs on an ARRIVAL, and an agent that has
// already arrived this session never arrives again, so the second pull answered
// the same notice as the first and the token stayed held by a name that was gone.
//
// MEASURED. A reviewer died on an API error holding a token in review. The
// engine sent the walker to look, the walker looked, knew it was gone, and
// pulled again twenty-eight times. Nothing moved.
//
// SO THE ENGINE REMEMBERS WHO IT SENT WHERE. Being sent to look is the first
// ask. Pulling again after that is the walker saying the holder is gone, which
// is the one thing the engine cannot find out for itself, and it is exactly what
// the notice asks the walker to do.

func lookedPath(r Roots) string { return r.Private("looked.json") }

// Looked records that this actor was sent to look at this token.
func Looked(r Roots, actor, id string) {
	_ = locked(lookedPath(r), func() error { // a walker it cannot remember is sent to look again
		seen := lookedAt(r)
		seen[actor] = id
		return saveLooked(r, seen)
	})
}

func saveLooked(r Roots, seen map[string]string) error {
	b, err := json.MarshalIndent(seen, "", "  ")
	if err != nil {
		return err
	}
	return writeAtomic(lookedPath(r), b, 0o644)
}

func lookedAt(r Roots) map[string]string {
	out := map[string]string{}
	b, err := os.ReadFile(lookedPath(r))
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out) // a file that will not read is an empty answer
	return out
}

// TakeBackWhatWasLookedAt returns what this actor was sent to look at, if the
// holder is still not pulling. It answers the ids it moved.
//
// IT TAKES BACK ONE TOKEN AND ONLY THE ONE THE WALKER WAS SENT TO. A pull that
// swept up every stale hold would be the timeout this whole answer exists to
// refuse.
func TakeBackWhatWasLookedAt(r Roots, actor string) []string {
	var id string
	_ = locked(lookedPath(r), func() error { // a walker it cannot remember is sent to look again
		seen := lookedAt(r)
		id = seen[actor]
		if id == "" {
			return nil
		}
		delete(seen, actor)
		return saveLooked(r, seen)
	})
	if id == "" {
		return nil
	}
	t, err := LoadToken(r, id)
	if err != nil {
		return nil
	}
	if t.Ended() || t.Holder == "" || t.Holder == actor {
		return nil
	}
	// ONLY THE HOLD IS RELEASED. Where the token stands is the process's
	// business, and a walker taking a hold back is not a step of anybody's
	// process.
	heldBefore := t.Holder
	t.Holder = ""
	if err := SaveToken(r, t); err != nil {
		return nil
	}
	inSession(r, "work", actor, t.ID+" taken back from "+heldBefore+
		", who was looked at and is gone", Yes(),
		map[string]any{"id": t.ID, "from": heldBefore})
	return []string{t.ID + " from " + heldBefore}
}

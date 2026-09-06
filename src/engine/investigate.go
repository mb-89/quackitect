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
// A QUIET HOLD IS ONE NOBODY HAS BEEN HEARD FROM, and HasGone in gone.go is the
// one function that answers it, for this notice and for the start sweep alike.
// The pull count used to answer it here, and it is a proxy for a worker that
// stops BETWEEN tokens: a worker on one long token pulls once and then says
// nothing to the queue for as long as the work takes, while the room goes on
// pulling around it. Every holder deep in a twenty-minute token had therefore
// stopped pulling by the engine's measure, the queue answered investigate
// instead of handing out work, and ONE ALARM STOPPED EVERY WORKER: twelve agents
// sent to one hold, five of them parked on it in looked.json.
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
//
// WITH NO RECORD NOTHING IS INVESTIGATED, which HasGone answers for: a tree the
// engine has never run in cannot tell a live hold from a dead one, and sending
// somebody to look at a hold it cannot check is the same mistake as refusing on
// one.
func quietHold(r Roots, actor string) (Token, bool) {
	for _, t := range Tokens(r) {
		if !holdWorthWatching(t) || t.Holder == "" || t.Holder == actor {
			continue
		}
		if _, gone := HasGone(r, t.Holder); !gone {
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
//
// HOW LONG THE SILENCE IS, AND HOW LONG IT MAY BE, ARE NUMBERS THE ENGINE HAS,
// so it says both. Saying only that a holder has gone quiet leaves the person it
// woke to go and find out, and the difference between eleven minutes and an hour
// is the difference between a long build and a hand that is not coming back.
func investigate(r Roots, t Token) Answer {
	silent, _ := HasGone(r, t.Holder)
	howFar := fmt.Sprintf("nothing of theirs has reached the record for %s, past a silence of %s",
		briefSilence(silent), briefSilence(SilenceBeforeGone(r)))
	// TWO GESTURES, because coming back to se pull used to mean both answers
	// and the engine could not hear the difference.
	return Answer{Pull: AnswerInvestigate, Notice: fmt.Sprintf(
		"GO AND LOOK AT %s %s. It is %s, held by %s, who has gone quiet: %s.\n\n"+
			"Nothing has been moved. It is exactly where it was and it stays there "+
			"until you rule on it, because a timeout guesses and a person looking "+
			"does not.\n\n"+
			"Find out whether %s is still working. If it is gone, say so by pulling "+
			"again with se pull, and the engine takes the hold back for you. If it "+
			"is working, leave it: name your own work again with se work --on and "+
			"carry on. This notice stands until they move.",
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

// A look is at one token IN ONE PAIR OF HANDS. The holder is written down so
// a token that changed hands since is recognised as somebody else's work.
type look struct {
	ID     string `json:"id"`
	Holder string `json:"holder"`
}

// Looked records that this actor was sent to look at this token, and who was
// holding it at the time.
func Looked(r Roots, actor, id string) {
	holder := ""
	if t, err := LoadToken(r, id); err == nil {
		holder = t.Holder
	}
	_ = locked(lookedPath(r), func() error { // a walker it cannot remember is sent to look again
		seen := lookedAt(r)
		seen[actor] = look{ID: id, Holder: holder}
		return saveLooked(r, seen)
	})
}

func saveLooked(r Roots, seen map[string]look) error {
	b, err := json.MarshalIndent(seen, "", "  ")
	if err != nil {
		return err
	}
	return writeAtomic(lookedPath(r), b, 0o644)
}

func lookedAt(r Roots) map[string]look {
	out := map[string]look{}
	b, err := os.ReadFile(lookedPath(r))
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out) // a file that will not read is an empty answer
	return out
}

// refusedNotice is what the walker is told when its answer did not land. An
// empty reason says nothing, because a first look has refused nothing yet.
func refusedNotice(why string) string {
	if why == "" {
		return ""
	}
	return "\n\nAND YOUR LAST ANSWER DID NOT LAND: " + why +
		". Your look still stands, so you are not being asked from nothing. " +
		"Rule on what that says rather than answering the same way again."
}

// TakeBackWhatWasLookedAt returns what this actor was sent to look at, if the
// holder is still not pulling. It answers the ids it moved, and where it moved
// nothing, why: a refusal that says nothing cannot be acted on, and the walker
// gets the identical notice until it can.
//
// IT TAKES BACK ONE TOKEN AND ONLY THE ONE THE WALKER WAS SENT TO. A pull that
// swept up every stale hold would be the timeout this whole answer exists to
// refuse.
func TakeBackWhatWasLookedAt(r Roots, actor string) ([]string, string) {
	// THE LOOK IS READ, NOT SPENT. It used to be deleted here, inside the lock,
	// before anything had been decided, so all five refusals below spent the
	// walker's answer and pull.go wrote it straight back. The alarm could never
	// be cleared and the same notice returned word for word.
	var sent look
	_ = locked(lookedPath(r), func() error { // a walker it cannot remember is sent to look again
		sent = lookedAt(r)[actor]
		return nil
	})
	if sent.ID == "" {
		return nil, ""
	}
	t, err := LoadToken(r, sent.ID)
	if err != nil {
		return nil, sent.ID + " will not load, so there is no hold to hand back"
	}
	// EACH REFUSAL SAYS WHICH ONE IT WAS. A guard that returns in silence leaves
	// the walker with the same notice and no way to tell what to do instead.
	switch {
	case t.Ended():
		return nil, t.ID + " has already ended, so its hold holds nothing up"
	case t.Holder == "":
		return nil, "nobody is holding it now: " + t.ID + " is already free"
	case t.Holder == actor:
		return nil, "you are holding it yourself: " + t.ID + " is your own work"
	}
	// NOT FROM WHOEVER TOOK IT SINCE. The look was at one holder, and a token
	// that changed hands in the meantime is somebody else's work now.
	if t.Holder != sent.Holder {
		return nil, t.ID + " changed hands since you looked, from " + sent.Holder +
			" to " + t.Holder + ", so it is somebody else's work now"
	}
	// AND NOT FROM A HOLDER WHO IS STILL CALLING, by the same silence the quiet
	// hold was found with. The comment above promised this and the code did not
	// do it, which is how a look stole live work twice on 2026-09-01.
	if _, gone := HasGone(r, t.Holder); !gone {
		return nil, t.Holder + " is still calling, so " + t.ID + " is live work"
	}
	// ONLY THE HOLD IS RELEASED. Where the token stands is the process's
	// business, and a walker taking a hold back is not a step of anybody's
	// process.
	heldBefore := t.Holder
	// AND NOT THROUGH THE TOKEN. SaveToken weighs every bounded section before
	// it writes, and a release writes no prose at all. wk-963dbf6898 carried an
	// ask of 249 words and a do of 219, against a cap of 200, so every release
	// of it was refused and the walker was told only that it would not save.
	// Four pulls in a row answered that same notice, and a look must be ruled
	// on before work is handed out, so the queue gave out nothing else.
	//
	// The hold is the engine's own store, keyed by token, so it is put down
	// there and the file is left exactly as its holder wrote it.
	// See wk-c2f9d39ea7.
	if err := recordHold(r, t.ID, ""); err != nil {
		return nil, t.ID + " would not let go of its hold: " + err.Error()
	}
	t.Holder = ""
	// AND THE LOOK IS SPENT HERE, on the one path that moved something, so a
	// second pull does not release a token somebody has since picked up.
	_ = locked(lookedPath(r), func() error {
		seen := lookedAt(r)
		delete(seen, actor)
		return saveLooked(r, seen)
	})
	inSession(r, "work", actor, t.ID+" taken back from "+heldBefore+
		", who was looked at and is gone", Yes(),
		map[string]any{"id": t.ID, "from": heldBefore})
	return []string{t.ID + " from " + heldBefore}, ""
}

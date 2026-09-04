package main

import (
	"encoding/json"
	"os"
)

// THE HOLD IS THE ENGINE'S, AND IT IS NOT WRITTEN ON THE TOKEN.
//
// Owner ruling: the holder is engine state, not token content. It was written
// into the token's frontmatter, so a take-up that was never put down left a
// name in a file nothing had a reason to revisit, and the name outlived the
// agent that earned it. Nine tokens in this tree carry a holder from a session
// that has ended, and the queue answers investigate on one of them rather than
// handing out work.
//
// The engine already keeps what it knows about who is alive under .se, keyed by
// the thing it is about: arrivals.json, looked.json. The hold goes with them,
// keyed by token and carrying the actor. The token file is then the ask and the
// evidence, and says nothing about whose hands it is in.
func holdsPath(r Roots) string { return r.Private("holds.json") }

// A SESSION OF ITS OWN, the way arrivals and the nudge have one.
//
// A HOLD BELONGS TO AN AGENT, AND THE AGENTS OF A SESSION THAT ENDED ARE GONE.
// The store outlived them: a fresh editor showed worker-heron holding a token
// from the night before, on a machine where nothing was running. That is the
// same defect the holder came off the token for, moved into the store, and
// moving it was supposed to end it rather than relocate it.
//
// So the store says which session it belongs to. A store from another one is
// nobody holding anything, and the tokens are back in the queue with no walker
// having to rule anybody dead.
type theHolds struct {
	Session string            `json:"session"`
	Held    map[string]string `json:"held"`
}

// heldNow is every hold this session is keeping, token to actor.
func heldNow(r Roots) map[string]string {
	all := loadHolds(r)
	return all.Held
}

func loadHolds(r Roots) theHolds {
	out := theHolds{Session: currentSession(r), Held: map[string]string{}}
	b, err := os.ReadFile(holdsPath(r))
	if err != nil {
		return out
	}
	var was theHolds
	if json.Unmarshal(b, &was) != nil || was.Held == nil {
		return out // a store that will not read is nobody holding anything
	}
	if was.Session != out.Session {
		return out // it belongs to a session that has ended
	}
	return was
}

// HeldBy answers who holds this token. It is the one place that decides, so a
// name written on a page is read by nobody.
func HeldBy(r Roots, id string) string { return heldNow(r)[id] }

// recordHold writes the hold as the token now says it. An actor of nothing
// removes the entry, so the store carries the holds there are rather than a
// history of the holds there were.
//
// A HOLD THAT HAS NOT MOVED IS NOT WRITTEN. Every save comes through here, and
// most of them move prose rather than hands.
func recordHold(r Roots, id, actor string) error {
	if id == "" || heldNow(r)[id] == actor {
		return nil
	}
	return locked(holdsPath(r), func() error {
		all := loadHolds(r)
		if all.Held[id] == actor {
			return nil
		}
		if actor == "" {
			delete(all.Held, id)
		} else {
			all.Held[id] = actor
		}
		b, err := json.MarshalIndent(all, "", "  ")
		if err != nil {
			return err
		}
		return writeAtomic(holdsPath(r), b, 0o644)
	})
}

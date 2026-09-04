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

// heldNow is every hold the engine is keeping, token to actor.
func heldNow(r Roots) map[string]string {
	out := map[string]string{}
	b, err := os.ReadFile(holdsPath(r))
	if err != nil {
		return out
	}
	_ = json.Unmarshal(b, &out) // a store that will not read is nobody holding anything
	return out
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
		all := heldNow(r)
		if all[id] == actor {
			return nil
		}
		if actor == "" {
			delete(all, id)
		} else {
			all[id] = actor
		}
		b, err := json.MarshalIndent(all, "", "  ")
		if err != nil {
			return err
		}
		return writeAtomic(holdsPath(r), b, 0o644)
	})
}

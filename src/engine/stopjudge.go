package main

import (
	"fmt"
	"time"
)

// THE CLAIM MEETS THE RECORD. The owner's words: the guard should be really
// strict, you do not get to just say you are blocked, give evidence. Blocked
// has mechanical evidence: everything in your hands waits on somebody else,
// and the queue would hand you nothing. Both halves are the engine's own
// facts, so a false claim is refused with the fact that falsifies it.
//
// IT JUDGES AT BOTH DOORS. se stop refuses a false claim as it is made, and
// the stop hook judges it again, because the queue moves between the two.

// BlockedIsFalse answers the refusal when a blocked claim contradicts the
// record, and nothing when the claim stands.
func BlockedIsFalse(r Roots, actor string) (string, bool) {
	for _, t := range InWorkFor(r, actor) {
		if WaitsForAPerson(t) != "" || Blocked(r, t) != "" {
			continue
		}
		if len(OpenSubTokens(r, t.ID)) > 0 {
			continue // a scope waits on its children, and the pull judges those
		}
		return t.ID + " " + t.Title + " is in your hands and waits on nobody. " +
			"Work it, or put it down and claim what is true.", true
	}
	if offer, n, ok := anOffer(r, actor); ok {
		return fmt.Sprintf("the queue would hand you %s %s, one of %d standing. "+
			"Pull it, or claim what is true.", offer.ID, offer.Title, n), true
	}
	return "", false
}

// anOffer answers the first token a pull would be willing to hand this actor,
// and how many stand, without handing one.
//
// IT ASKS WHAT THE PULL ASKS, AND NOTHING OF ITS OWN. It used to walk every
// token and ask only whether the role could work it, so it knew nothing of the
// rungs above the queue or of the queue's own narrowing.
//
// MEASURED, September 2026, on a cloud box. The pull answered wait, saying no new
// work goes out while a person is finishing up. This guard answered that the
// queue would hand over one of 176 standing. One door said stop and the other
// called the stop a lie, and pulling again answered the same wait, so the
// session had no legal move at all.
//
// WouldHandOut carries the same lesson for the staffing count, in its own
// comment, and for the same reason: two readers of one queue disagree, and the
// agent is caught between them.
func anOffer(r Roots, actor string) (Token, int, bool) {
	// THE RUNGS ABOVE THE QUEUE HAND OUT NOTHING, whatever stands behind them.
	// An unbound tree and a person finishing up are both a person saying stop,
	// and a guard that counts through them calls their own word a lie.
	if h := LoadHold(r); h.Finishing() || h.Held() {
		return Token{}, 0, false
	}
	if LoadBinding(r).At == Unbound {
		return Token{}, 0, false
	}
	// AND THE QUEUE IS THE NARROWED ONE, less what the fetched branch has
	// archived. A person who points a box at one bucket has emptied the queue
	// when that bucket is empty, whatever the rest of the tree holds.
	all, _, _ := offTheFetchedBranch(r, actor, theQueueOffers(r, actor, Tokens(r)))
	var first Token
	n := 0
	now := time.Now().UTC()
	for _, t := range all {
		if !WouldHandOut(r, t, actor, RoleWorker, nil, now) {
			continue
		}
		if n == 0 {
			first = t
		}
		n++
	}
	return first, n, n > 0
}

package main

import (
	"fmt"
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
func anOffer(r Roots, actor string) (Token, int, bool) {
	var first Token
	n := 0
	for _, t := range Tokens(r) {
		if t.Ended() || t.Holder != "" || !WorkableBy(r, t, RoleWorker) {
			continue
		}
		if Blocked(r, t) != "" {
			continue
		}
		if n == 0 {
			first = t
		}
		n++
	}
	return first, n, n > 0
}

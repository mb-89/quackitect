package main

import "fmt"

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

func holdWorthWatching(t Token) bool {
	switch t.Status {
	case ImpInReview, SpecInReview, ImpInWork:
		return true
	}
	return false
}

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
			"with se pull, and the engine takes it back to %s for you. If it "+
			"is working, leave it where it is and come back to se pull. This "+
			"notice stands until they move.",
		t.ID, t.Title, t.Status, t.Holder, howFar, t.Holder, freeAgain(t))}
}

// freeAgain answers where a held token goes when nobody is behind the hold.
//
// ONE TABLE, IN arrival.go, BECAUSE THE RECLAIM IS WHAT ACTUALLY MOVES IT. This
// was a second switch saying the same thing and it disagreed with the first:
// it sent a spec in review back to spec_open, where the reclaim sends it to
// spec_submitted, so the notice named a state the engine would not have used.
func freeAgain(t Token) Status {
	if to, held := whereItGoesBack[t.Status]; held {
		return to
	}
	return ImpOpen
}

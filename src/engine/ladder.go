package main

import "fmt"

// THE AUTHORITY LADDER. With every failing round the reviewer gains authority,
// and the ladder ends at the person, so no token can eat eleven rounds again.
//
// MEASURED OVER THE WHOLE RECORD ON 2026-09-01: 200 rejections against 79
// acceptances over 74 tokens that reached a review, which is what
// python util/checks/count-reviews.py . answered. wk-1412093cd8 took 11
// rejections and wk-24be1c06ae took 10, and nothing mechanical stood in the
// way, because rounds only ever counted upward.
//
// THREE RUNGS.
//
//	one    the review as it works today: findings, a lesson, a rejection
//	two    full authority, once for the whole token, with two verbs behind it
//	three  the person, and no agent's verdict is taken
//
// THE COUNT IS PER HALF AND IT RESETS. A spec rejection counts against the spec
// half, an implementation rejection against the implementation half, and an
// accept sets its own half back to zero. Token.Rounds is none of those things:
// it is cumulative, it is never reset, and everyFindingAnswered keys the owed
// findings off it, so the ladder keeps its own two ints rather than borrowing
// the one a gate already runs on.
const (
	RungOne   = 1
	RungTwo   = 2
	RungThree = 3
)

// TheRung answers which rung this token stands on now.
//
// THE SPENT FLAG IS WHAT SEPARATES THE SECOND RUNG FROM THE THIRD, and one
// condition serves both: rounds-per-rung consecutive failures on either half
// grants the second rung, and the same count again, after the grant has been
// taken and the counters set back, reaches the person.
func TheRung(t Token, roundsPerRung int) int {
	if roundsPerRung <= 0 {
		return RungOne
	}
	climbed := t.SpecFails >= roundsPerRung || t.ImpFails >= roundsPerRung
	if !climbed {
		return RungOne
	}
	if t.RungTwoSpent {
		return RungThree
	}
	return RungTwo
}

// TakeTheRung reads the ladder for a review that is being handed out and writes
// what the reviewer holds onto the token.
//
// THE SECOND RUNG IS SPENT AS IT IS HANDED OVER, and the counters go back to
// zero with it. Zeroing is what makes the third rung mean rounds-per-rung
// FURTHER consecutive failures rather than twice the count on one half, which
// is the other ladder and not the one the person settled.
func TakeTheRung(t *Token, roundsPerRung int) {
	rung := TheRung(*t, roundsPerRung)
	t.Rung = rung
	if rung == RungTwo {
		t.RungTwoSpent = true
		t.SpecFails, t.ImpFails = 0, 0
	}
}

// TheRungNotice is what a reviewer is told about the authority it holds, or
// nothing at the first rung, where a review works as it always has.
//
// IT PROMISES EXACTLY THE TWO POWERS THAT HAVE VERBS, repairing the draft and
// sending the work back to specification, and no third. An announced power with
// no verb costs the round it was made to save: the reviewer is told it may act,
// tries, finds nothing, and spends the round the grant existed to save.
func TheRungNotice(t Token, roundsPerRung int) string {
	switch t.Rung {
	case RungTwo:
		return fmt.Sprintf("THE SECOND RUNG: YOU HOLD FULL AUTHORITY ON THIS TOKEN. "+
			"It has failed %d consecutive rounds on one half, so judging it again the "+
			"same way is the thing this ladder exists to stop. Judge as you see fit, "+
			"through the verdict you already write, and you hold two powers besides."+
			nl+nl+
			"REPAIR THE DRAFT: answer with criteria, and they replace the criteria on "+
			"the note as the verdict lands."+nl+nl+
			"SEND THE WORK BACK TO SPECIFICATION: answer with verdict: %s, and the token "+
			"goes to %s with nobody holding it."+nl+nl+
			"There is no third power. This rung is spent once for the whole token, and "+
			"%d further consecutive failures on either half reach the person.",
			roundsPerRung, VerdictSpecify, SpecOpen, roundsPerRung)
	case RungThree:
		return fmt.Sprintf("THE LADDER ENDS HERE, AND IT ENDS AT THE PERSON. This token "+
			"has failed %d consecutive rounds since the second rung was spent, so no "+
			"agent's verdict is taken on it now. Say to the person that this one is "+
			"theirs to decide, and stop.", roundsPerRung)
	}
	return ""
}

// VerdictSpecify is the send-back: the second rung's verdict on an
// implementation review, which puts the token back where done is decided.
const VerdictSpecify = "specify"

// TheLadderRefusesAnAgent is the third rung, in the one place a rung can stop
// something: the verdict. The pull still hands the review out, because a
// reviewer that cannot see the token cannot tell the person what is in it.
func TheLadderRefusesAnAgent(t Token) *Rejection {
	if t.Rung < RungThree {
		return nil
	}
	return &Rejection{Clause: "the ladder",
		Wrong: fmt.Sprintf("%s has climbed past the second rung, so no agent's verdict is "+
			"taken on it. The person decides now.", t.ID),
		Satisfies: "tell the person this token is theirs to settle, and stop"}
}

// TheReviewerRepairs writes a rung-two reviewer's criteria onto the token.
//
// THE POWER IS THE VERB AND NOT THE SENTENCE ABOUT IT. Payload.Criteria was
// declared and read by nothing, so the grant that named repairing was a string.
// This is its reader.
func TheReviewerRepairs(t *Token, p Payload) bool {
	if t.Rung < RungTwo || len(p.Criteria) == 0 {
		return false
	}
	t.Criteria = p.Criteria
	return true
}

// AN ACCEPT SETS ITS OWN HALF BACK TO ZERO, and a rejection counts against it.
// One place, so the two halves cannot drift apart.
func theHalfFailed(t *Token, drafting bool) {
	if drafting {
		t.SpecFails++
		return
	}
	t.ImpFails++
}

func theHalfPassed(t *Token, drafting bool) {
	if drafting {
		t.SpecFails = 0
		return
	}
	t.ImpFails = 0
}

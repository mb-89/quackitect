package main

import "testing"

// THE WINDOW IS THE HOLDER'S OWN TURNS, AT THE RATE THE QUEUE RUNS AT.
//
// staleWindow answered `return per, per, actors`. It worked out the actors
// present and then handed the per-actor number back as the window, so the
// multiplication its own comment describes never happened. quietHold and
// TakeBackWhatWasLookedAt both read that window, so a holder was called stale
// after ten pulls by ANYBODY rather than ten turns of its own.
//
// MEASURED on 2026-09-04: fifteen actors present, seventy-eight pulls, a holder
// fifteen behind, which is one turn each. The queue answered investigate on a
// token whose holder was writing to the tree at that moment, and the walker it
// woke would have released that live hold on its next pull.
//
// THE ASSERTION IS ON staleWindow ITSELF, because it is the one place the
// number is read and the two callers cannot disagree about it. Asserting only
// through quietHold would leave the take-back guard untested against the same
// number.
func TestTheStaleWindowIsPerActorTimesTheActorsPresent(t *testing.T) {
	t.Parallel()
	r, _ := aHeldTokenInASession(t, "holder")
	session := ArrivalSession(r)
	Arrived(r, session, "holder")
	// Eleven others pull once each, so twelve actors have pulled in all.
	theOthersPull(r, 11, 1)

	window, per, actors := staleWindow(r, session)
	if actors != 12 {
		t.Fatalf("actors present %d, want the 12 that pulled", actors)
	}
	if per <= 0 {
		t.Fatalf("pulls_before_hold_is_stale is %d, so the window measures nothing", per)
	}
	if window != per*actors {
		t.Fatalf("window %d, want per*actors = %d*%d = %d: the window runs at the "+
			"fleet's rate, not the holder's", window, per, actors, per*actors)
	}
}

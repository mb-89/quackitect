package main

import "testing"

// THE STOP CLAIM IS THE FIFTH SESSION-SCOPED STORE, AND IT READS THE SESSION
// THE WAY THE OTHER FOUR DO.
//
// The rung, the hold and the ask learned the rule in wk-38c4d9e04c, and the
// four stores in wk-3dbfe11bbd: a log that names no session decides nothing, so
// what was stored stands. The stop-claim register compared its stored session
// against currentSession itself, so through a rotation -- the full log set aside
// and a fresh current opened, empty until the next record lands -- a claim made
// a moment earlier read as not standing. The agent was then refused its stop
// with no claim standing when one had been made.
//
// BOTH HALVES ARE HERE, because the second one is why the session is written on
// the file at all: a claim from a session that has ended is still gone.
func TestAStopClaimOutlastsARotationAndNotItsSession(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theSessionNowIs(t, r, "20260904-090000")
	if err := ClaimStop(r, anActor, "decision", "the owner has to pick the name"); err != nil {
		t.Fatal(err)
	}
	if _, standing := StandingClaim(r, anActor); !standing {
		t.Fatal("the claim does not stand in the session that made it, so this test would prove nothing")
	}

	theRotationWindow(t, r)
	// The premise: through this window the log names no session.
	if now := currentSession(r); Named(now) {
		t.Fatalf("the log names the session %q, so this test is not in the window it means to be", now)
	}
	if _, standing := StandingClaim(r, anActor); !standing {
		t.Error("a claim made a moment ago does not stand while the log names no session")
	}

	// The session ends and another starts.
	theSessionNowIs(t, r, "20260905-100000")
	if _, standing := StandingClaim(r, anActor); standing {
		t.Error("a claim from a session that has ended still stands")
	}
}

package main

import "testing"

// THE GUARD RELENTS, SO A WEDGED HELPER IS NOT TRAPPED.
//
// A helper holding an open token is refused its stop, so it finishes or puts
// the work down deliberately. A helper has no person to answer to and no claim
// to make on its own behalf, so refusing it for ever wedges a session nobody is
// watching. It is refused a few times and then let go.
//
// THE COUNT AND THE HOOK READ ONE FUNCTION. The hook asked countRefusedStop
// against helperRefusalsBeforeRelenting inline, so a check could only restate
// that condition beside it and drift from it. Both halves ask this one now.
func TestAHelperStopRelentsAfterEnoughRefusals(t *testing.T) {
	r := aTreeToWriteIn(t)
	const id = "agent-7"

	for turn := 1; turn < helperRefusalsBeforeRelenting; turn++ {
		if !AHelperStopStillRefused(r, id) {
			t.Fatalf("refusal %d of %d let the helper go early", turn, helperRefusalsBeforeRelenting)
		}
	}
	if AHelperStopStillRefused(r, id) {
		t.Fatalf("the guard refused past %d and never relented", helperRefusalsBeforeRelenting)
	}

	// ANOTHER HELPER IS COUNTED APART. One agent's refusals are not another's,
	// or the second helper to hold work is let go on the first one's count.
	if !AHelperStopStillRefused(r, "agent-8") {
		t.Fatal("a second helper was let go on the first one's count")
	}
}

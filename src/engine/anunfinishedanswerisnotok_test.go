package main

import (
	"testing"
)

// AN ANSWER THAT HAS FINISHED NOTHING IS NOT OK, AND THE BATTERY IS THE OTHER
// HALF OF THAT RULE.
//
// A whole ruling starts the battery outside this engine, because the battery
// replaces the engine it was asked from. So the answer comes back at once, with
// nothing run. The standard process grades the work step on se test answering
// ok, and an ok here is a row ticked over a run that has not begun.
//
// THE LANDING HALF IS IN engineload_test.go, on the test that drives a run
// outliving the lane's wait. One rule serves both, and each is watched where it
// happens.
func TestAStartedBatteryIsNotAPass(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "work nothing has written")
	db := openTheIndex(t, r)

	// NOTHING IN THE RECORD SAYS WHAT A TOKEN JUST MINTED WROTE, which is what
	// rules a run whole, and a whole run is the battery.
	got, err := TestTheDelta(t.Context(), r, db, tok.ID, nil, true, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if !got.Whole {
		t.Fatalf("the ruling was not whole, so this drives nothing. It chose %+v", got.Chosen)
	}
	if len(got.Ran) != 1 || got.Ran[0].Kind != "battery" {
		t.Fatalf("the answer's ran is %+v, and a whole ruling is one battery entry", got.Ran)
	}
	if got.OK {
		t.Fatalf("a battery that has not finished answered ok: %+v", got.Ran[0])
	}
}

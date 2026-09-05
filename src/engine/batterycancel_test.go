package main

import (
	"context"
	"strings"
	"testing"
)

// A CANCELLED CONTEXT STARTS NO BATTERY.
//
// startBattery took no context, so it was the last spawn in the engine that
// could not be told not to happen. The call it hangs off can be over before it
// gets here: a client that has gone, a verb the engine is draining at a
// handover. Starting then puts a whole battery over the tree on behalf of
// nobody, and writes a marker the next engine reports as a run somebody asked
// for.
//
// THE CONTEXT DECIDES WHETHER TO START ONE, AND IT DOES NOT FOLLOW THE CHILD.
// That distinction is the point: the battery is detached on purpose, because it
// builds the engine and puts a new one over this tree.
func TestACancelledContextStartsNoBattery(t *testing.T) {
	r := aTreeWithABattery(t)
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	got := startBattery(ctx, r, "worker-one", "wk-1")

	if got.OK {
		t.Errorf("a cancelled call started a battery anyway: %s", got.Said)
	}
	if !strings.Contains(got.Said, context.Canceled.Error()) {
		t.Errorf("the answer does not say it was cancelled: %q", got.Said)
	}
	// AND NOTHING WAS WRITTEN DOWN. A marker with no run behind it is a run the
	// next engine reports as somebody's work.
	if going, ok := batteryGoing(r); ok {
		t.Errorf("a battery nobody started is written down as going: %+v", going)
	}
}

// AND A LIVE CONTEXT STILL STARTS ONE, so the rule above refuses what is
// cancelled and nothing else.
func TestALiveContextStillStartsTheBattery(t *testing.T) {
	r := aTreeWithABattery(t)

	got := startBattery(t.Context(), r, "worker-one", "wk-1")

	if !got.OK {
		t.Fatalf("a live context started no battery: %s", got.Said)
	}
	going, ok := batteryGoing(r)
	if !ok {
		t.Fatal("a battery started under a live context was not written down")
	}
	// THE CHILD IS NOT THE CONTEXT'S. This test's context ends with the test,
	// and the battery it started is waited for here rather than killed by it.
	waitForTheBattery(t, going)
}

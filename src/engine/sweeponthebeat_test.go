package main

import (
	"testing"
	"time"
)

// A HOLD BEHIND A HAND THAT IS GONE GOES BACK WHILE THE ENGINE IS UP.
//
// The sweep ran on a start and nowhere else, so an engine that stays up all day
// never reached one. A hold behind an agent that ended sat there until somebody
// pulled and was sent to look, and answering that look costs the walker its
// pull. Measured over one session: nine agents ended and each one produced a
// look, two of them one-off actors that made a single pull.
//
// THE BEAT IS WHERE THE ENGINE ALREADY ASKS ITSELF THINGS. Nothing new has to
// be recorded, and gone is the same question HasGone answers everywhere else.
func TestTheBeatSweepsWorkHeldByTheGone(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "worker-dead")
	theRecordSays(t, r,
		wasHeard{"engine", time.Hour},
		wasHeard{"worker-dead", 30 * time.Minute},
	)

	// A BEAT THAT IS NOT A SWEEPING ONE READS NOTHING, because every sweep
	// walks every token and the pulse is seconds where the window is minutes.
	if back := SweepOnTheBeat(r, 1); len(back) != 0 {
		t.Errorf("the first beat swept %v, and a sweep is not every beat", back)
	}
	if held, _ := LoadToken(r, tok.ID); held.Holder != "worker-dead" {
		t.Errorf("the hold went back on a beat that sweeps nothing: holder %q", held.Holder)
	}

	// AND THE SWEEPING BEAT PUTS IT BACK, with no pull anywhere in this test.
	back := SweepOnTheBeat(r, sweepEveryBeats)
	if len(back) != 1 || back[0] != tok.ID {
		t.Fatalf("the sweeping beat answered %v, and %s is held by a hand that is gone", back, tok.ID)
	}
	if held, _ := LoadToken(r, tok.ID); held.Holder != "" {
		t.Fatalf("the hold stands after the sweeping beat: holder %q", held.Holder)
	}
}

// AND A HAND THAT IS STILL CALLING KEEPS ITS WORK.
//
// A released hold is one another worker can take mid-change, which is the
// damage the pull count already did to worker-dvorak. The beat asks the same
// question the notice asks, so it is wrong in the same places or in none.
func TestTheBeatLeavesALiveHandItsWork(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "worker-live")
	theRecordSays(t, r,
		wasHeard{"engine", 20 * time.Minute},
		wasHeard{"worker-live", 0},
	)

	if back := SweepOnTheBeat(r, sweepEveryBeats); len(back) != 0 {
		t.Errorf("the sweeping beat released live work: %v", back)
	}
	if held, _ := LoadToken(r, tok.ID); held.Holder != "worker-live" {
		t.Errorf("the hold moved: holder %q, want worker-live", held.Holder)
	}
}

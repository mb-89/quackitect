package main

import (
	"testing"
	"time"
)

// THE HAND-OUT AND THE CLAIM ARE ONE WRITE, OR THE AGENT IS REFUSED ON ITS
// FIRST MOVE.
//
// take's own comment says the queue claims what it hands over, and says why: a
// tracked token is not worked without a claim, so a hand-out carrying none is
// refused at the agent's first run or apply.
//
// MEASURED, ON 2026-09-06. The queue offered one token three times running. It
// carried another box's claim, stamped 06:48:59, which had lapsed at 09:48:59
// under claim_hours 3. After every hand-out the record still named that box,
// and the next write was refused for want of a claim.
//
// A LAPSED CLAIM IS THE CASE, NOT AN EDGE OF IT. That is what a lapse is for:
// the work comes back to the queue. So the hand-out that follows one is the
// ordinary path and it is the path that was failing.
func TestTheHandOutWritesTheClaimItSaysItWrites(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	tok := mintStandard(t, r, "work claimed long ago")

	// ANOTHER BOX CLAIMED IT LONG ENOUGH AGO THAT THE CLAIM HAS GONE.
	stale := time.Now().UTC().Add(-time.Duration(LoadConfig(r).ClaimHours+1) * time.Hour)
	tok.ClaimedBy, tok.ClaimedAt = "another-box/worker-one", stale.Format(ClaimStamp)
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	if by := ClaimedNow(r, tok, time.Now().UTC()); by != "" {
		t.Fatalf("this test proves nothing: the claim has not lapsed, it reads %q", by)
	}

	// THE QUEUE HANDS IT OVER.
	got := Pull(r, "worker-here", RoleWorker, Payload{})
	if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != tok.ID {
		t.Fatalf("the queue answered %s rather than handing out the lapsed token: %s",
			got.Pull, got.Notice)
	}

	// AND THE RECORD SAYS IT IS THIS BOX'S NOW.
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	now := time.Now().UTC()
	by := ClaimedNow(r, back, now)
	if by == "" {
		t.Errorf("the queue handed %s over and wrote no claim, so the next write is refused", tok.ID)
	}
	if by == "another-box/worker-one" {
		t.Errorf("the record still names the box whose claim had lapsed: %s", by)
	}
	if by != "" && !ClaimedHere(r, by) {
		t.Errorf("the claim was written for %s, which is not this box", by)
	}

	// WHICH IS THE SAME THING THE GATE ASKS, SO IT ASKS AND PASSES.
	if why := NoClaimHere(r, back, now); why != "" {
		t.Errorf("the gate refuses work the queue just handed over: %s", why)
	}
}

// AND A CLAIM THAT HAS NOT LAPSED IS STILL ANOTHER BOX'S, so the fix above does
// not become a way to take work off somebody.
func TestAStandingClaimIsNotTakenByTheQueue(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	tok := mintStandard(t, r, "work another box holds")
	tok.ClaimedBy, tok.ClaimedAt = "another-box/worker-one",
		time.Now().UTC().Format(ClaimStamp)
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}

	if got := Pull(r, "worker-here", RoleWorker, Payload{}); got.Pull == AnswerWork &&
		got.Token != nil && got.Token.ID == tok.ID {
		t.Fatalf("the queue handed out %s while another box holds it", tok.ID)
	}
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if by := ClaimedNow(r, back, time.Now().UTC()); by != "another-box/worker-one" {
		t.Errorf("the standing claim reads %q, and it is another box's", by)
	}
}

package main

import (
	"testing"
	"time"
)

// THE AGENT FEEDS THE WATCHDOG, NOT THE ENGINE.
//
// An engine alive with no agent beside it would hold a group for as long as the
// process ran. These are not parallel, because when the engine last heard from
// an agent is one fact about this process and a parallel test would move it.

// theEngineHeardAnAgentAt plants when the engine last heard from an agent. The
// zero time is a process nobody has spoken to at all.
func theEngineHeardAnAgentAt(at time.Time) {
	theAgentWasHeard.Lock()
	defer theAgentWasHeard.Unlock()
	theAgentWasHeard.at = at
}

func TestAGroupIsRenewedOnlyWhenBothThingsHold(t *testing.T) {
	r := aTreeToWriteIn(t)
	now := mustTime(t, "2026-09-08T12:00:00Z")
	lease := theGroupLease(r)
	// MORE THAN HALF SPENT is a lease with a quarter of it left.
	nearlyOut := GroupEntry{State: GroupHeld, By: Box(r),
		Lapses: now.Add(lease / 4).UTC().Format(ClaimStamp)}
	fresh := GroupEntry{State: GroupHeld, By: Box(r),
		Lapses: now.Add(lease).UTC().Format(ClaimStamp)}

	// THE CLEAN CASE: an agent spoke five seconds ago and the lease is nearly out.
	theEngineHeardAnAgentAt(now.Add(-5 * time.Second))
	if !TimeToRenew(r, nearlyOut, now) {
		t.Error("a box with an agent beside it let a lease that is nearly out run down")
	}

	// AND IT RENEWS ONLY NEAR THE END, so this is a push about every ninety
	// minutes rather than one on every beat.
	if TimeToRenew(r, fresh, now) {
		t.Error("a lease with nothing spent was renewed, which is a push on every beat")
	}

	// THE PLANTED CASE: the same lease, with nobody having spoken for minutes.
	theEngineHeardAnAgentAt(now.Add(-5 * time.Minute))
	if TimeToRenew(r, nearlyOut, now) {
		t.Error("an idle box renewed, so it holds a group for as long as the process runs")
	}

	// AND A PROCESS NOBODY HAS SPOKEN TO HAS HEARD NOTHING.
	theEngineHeardAnAgentAt(time.Time{})
	if TimeToRenew(r, nearlyOut, now) {
		t.Error("an engine nobody has spoken to renewed a hold")
	}
}

// AND THE RENEWAL REACHES THE REMOTE, or does not, on the same two conditions.
func TestARenewalMovesTheLeaseOnTheRemote(t *testing.T) {
	r := aBoxOverGroups(t)
	now := time.Now().UTC()
	// A HOLD TAKEN TWO HOURS AGO, which is more than half of a three hour lease.
	if got := ClaimTheGroup(t.Context(), r, "voice", now.Add(-2*time.Hour)); got.Refused != "" {
		t.Fatalf("the group could not be taken: %s", got.Refused)
	}
	was := theGroupsOnOrigin(t, r)["group/voice"].Lapses

	// THE PLANTED CASE FIRST: an engine nobody has spoken to renews nothing.
	theEngineHeardAnAgentAt(time.Time{})
	RenewTheGroup(t.Context(), r, nil, now)
	if got := theGroupsOnOrigin(t, r)["group/voice"].Lapses; got != was {
		t.Errorf("an engine with no agent beside it renewed the hold: %s became %s", was, got)
	}

	// THE CLEAN CASE: an agent spoke, so the lease moves.
	theEngineHeardAnAgentAt(now)
	RenewTheGroup(t.Context(), r, nil, now)
	got := theGroupsOnOrigin(t, r)["group/voice"].Lapses
	if got == was {
		t.Fatalf("a working box let its hold run down: it still ends at %s", was)
	}
	ends, err := time.Parse(ClaimStamp, got)
	if err != nil {
		t.Fatalf("the renewed lease is not an absolute stamp: %q", got)
	}
	if ends.Before(now.Add(theGroupLease(r)).Add(-time.Minute)) {
		t.Errorf("the renewed lease ends at %s, and a whole lease from now is %s",
			ends, now.Add(theGroupLease(r)))
	}
}

// THERE IS ONE NUMBER AND NOT TWO. Three hours of silence frees a group, which
// is the same stretch that frees a token claim.
func TestAGroupLeaseIsTheClaimLimit(t *testing.T) {
	r := aTreeToWriteIn(t)
	if want := time.Duration(LoadConfig(r).ClaimHours) * time.Hour; theGroupLease(r) != want {
		t.Errorf("a group is held for %s and a token claim for %s, which is two numbers doing one job",
			theGroupLease(r), want)
	}
}

package main

import "testing"

// TWO ACTORS EACH KEEP THEIR OWN CLAIM.
//
// The claim was one object at the top level of stop-claim.json: ClaimStop wrote
// over whatever was there without reading it, and SpendClaim removed the file.
// So a second actor's stop erased the first's, and one agent carrying on ended
// everybody's. Anything reading the record then said working over an agent that
// had stopped, which is what the header exists to end.
func TestTwoActorsEachKeepTheirClaim(t *testing.T) {
	r := aLaneWithASession(t)
	if err := ClaimStop(r, "walker", "asked", "the person said to stop"); err != nil {
		t.Fatal(err)
	}
	if err := ClaimStop(r, "judge", "blocked", "it waits on somebody else"); err != nil {
		t.Fatal(err)
	}

	first, has := StandingClaim(r, "walker")
	if !has {
		t.Fatal("the second actor's stop erased the first's")
	}
	if first.Because != "asked" {
		t.Errorf("the first actor's claim reads %q", first.Because)
	}
	second, has := StandingClaim(r, "judge")
	if !has || second.Because != "blocked" {
		t.Fatalf("the second actor's own claim is %+v", second)
	}

	// AND SPENDING ONE LEAVES THE OTHER STANDING. One agent carrying on is one
	// agent changing its mind, not everybody.
	SpendClaim(r, "walker")
	if _, has := StandingClaim(r, "walker"); has {
		t.Error("the actor that carried on still has a claim standing")
	}
	if _, has := StandingClaim(r, "judge"); !has {
		t.Error("one actor carrying on ended another actor's stop")
	}

	// AND THE ANSWER DRAWS BOTH. This is what the strip could not say before:
	// the person watching two agents could see only one of them stopped.
	Pull(r, "walker", RoleWorker, Payload{})
	Pull(r, "judge", RoleReviewer, Payload{})
	if err := ClaimStop(r, "walker", "asked", "the person said to stop"); err != nil {
		t.Fatal(err)
	}
	said := WhatIsHappening(r)
	stopped := 0
	for _, d := range said.Actors {
		if d.State == Stopped {
			stopped++
		}
	}
	if stopped != 2 {
		t.Errorf("two actors have claimed a stop and the answer draws %d as stopped: %+v",
			stopped, said.Actors)
	}
}

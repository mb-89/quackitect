package main

import (
	"strings"
	"testing"
)

// THE ENGINE SAYS WHAT EACH ACTOR IS DOING, and it walks the engine's own list
// of states rather than one typed out here.
//
// A HAND LIST OF STATES IS EXACTLY THE SIZE OF WHAT SOMEBODY THOUGHT OF. The
// loop asks TheStates for its members and REFUSES a member it does not know how
// to drive, so a fifth state added tomorrow fails this rather than being skipped
// in silence.
func TestTheEngineSaysWhatEachActorIsDoing(t *testing.T) {
	for _, want := range TheStates() {
		r := aLaneWithASession(t)
		actor := driveInto(t, r, want)
		got := oneActor(t, r, actor)
		if got.State != want {
			t.Errorf("driven into %s, the engine says %s, and everything true of it was %v",
				want, got.State, got.True)
		}
	}

	// ONE ACTOR WITH TWO TRUE, which only an ordering can answer. It holds a
	// token in work AND has claimed a stop, and stopped is what the person acts
	// on, so stopped wins.
	r := aLaneWithASession(t)
	tok := mint(t, r, Token{Title: "build the thing", Assignee: "main", Status: ImpOpen})
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork || a.Token.ID != tok.ID {
		t.Fatalf("the worker was handed nothing: %s", a.Pull)
	}
	if err := ClaimStop(r, "main", "asked", "the person said to stop"); err != nil {
		t.Fatal(err)
	}
	two := oneActor(t, r, "main")
	if !trueOf(two.True, Working) || !trueOf(two.True, Stopped) {
		t.Fatalf("the fixture did not make two states true: %v", two.True)
	}
	if two.State != Stopped {
		t.Errorf("an actor holding a token with a claim standing is %s, and it is %v",
			two.State, two.True)
	}
	// AND THE ANSWER NAMES EVERY STATE IT FOUND TRUE, because with an ordering
	// the interesting failure is two rather than none, and a row that carries
	// only the one the order picked cannot say which two.
	if len(two.True) < 2 {
		t.Errorf("the row names %v and hides the second state that was true", two.True)
	}

	// ONE ACTOR WITH NONE TRUE: it pulled, a second actor's arrival took its
	// review back, and it has claimed nothing. Waiting is the complement, so
	// exactly one state is answered whatever the record says.
	none := aLaneWithASession(t)
	sub := aSubmission(t, none)
	if a := Pull(none, "rev-first", RoleReviewer, Payload{}); a.Pull != AnswerReview {
		t.Fatalf("the first reviewer was handed nothing: %s", a.Pull)
	}
	stale := LoadConfig(none).PullsBeforeHoldIsStale
	movePast(none, stale)
	if StillPulling(none, currentSession(none), "rev-first", stale) {
		behind, _ := HowFarBehind(none, currentSession(none), "rev-first")
		t.Fatalf("the fixture did not move the queue past the window: %d behind of %d",
			behind, stale)
	}
	// A SECOND ACTOR ARRIVES AND THE HAND IS EMPTIED. Which door does it is not
	// what this is about: the walker that came past may already have taken it
	// back, and the assertion is on the hand rather than on the mechanism.
	Reclaim(none, "rev-second", RoleReviewer)
	if held, err := LoadToken(none, sub.ID); err != nil {
		t.Fatal(err)
	} else if held.Holder == "rev-first" {
		t.Fatal("the fixture still leaves rev-first holding it")
	}
	empty := oneActor(t, none, "rev-first")
	if empty.State != Waiting {
		t.Errorf("an actor holding nothing with no claim is %s, and everything true of it was %v",
			empty.State, empty.True)
	}
}

// THE HOLD IS ANSWERED FOR THE TREE AND NOT PER ACTOR. It is one file covering
// everything, so a row each would say two agents are held when one file is.
func TestTheHoldIsAnswerdForTheTreeAndNotPerActor(t *testing.T) {
	r := aLaneWithASession(t)
	tok := mint(t, r, Token{Title: "build the thing", Assignee: "main", Status: ImpOpen})
	Pull(r, "main", RoleWorker, Payload{})
	Pull(r, "rev-1", RoleReviewer, Payload{})
	if _, err := SetHold(r, true, "the person"); err != nil {
		t.Fatal(err)
	}

	said := WhatIsHappening(r)
	if len(said.Actors) != 2 {
		t.Fatalf("the fixture wanted two actors and the answer carries %d: %v",
			len(said.Actors), said.Actors)
	}
	if !said.Hold.On || said.Hold.By != "the person" {
		t.Fatalf("the hold is not on the answer: %+v", said.Hold)
	}
	// ONCE, AND OUTSIDE THE ROWS. A row that carried it would be counted twice
	// with two actors and four times with four.
	for _, d := range said.Actors {
		if strings.Contains(strings.ToLower(d.State+d.Holding+d.Why), "hold") {
			t.Errorf("%s carries the hold in its own row: %+v", d.Actor, d)
		}
	}
	_ = tok
}

// THE ANSWER NAMES THE TOKEN IN HAND, and says there is none where there is
// not, driven into each case rather than built here.
func TestTheAnswerNamesTheTokenInHand(t *testing.T) {
	r := aLaneWithASession(t)
	tok := mint(t, r, Token{Title: "build the thing", Assignee: "main", Status: ImpOpen})
	if a := Pull(r, "main", RoleWorker, Payload{}); a.Pull != AnswerWork {
		t.Fatalf("the worker was handed nothing: %s", a.Pull)
	}
	held := oneActor(t, r, "main")
	if held.ID != tok.ID {
		t.Errorf("the answer names %q as the token in hand rather than %s", held.ID, tok.ID)
	}
	if held.Title != tok.Title {
		t.Errorf("the answer names %q as the title rather than %q", held.Title, tok.Title)
	}
	if !strings.Contains(held.Holding, tok.ID) || !strings.Contains(held.Holding, tok.Title) {
		t.Errorf("what it is holding reads %q and names neither the id nor the title", held.Holding)
	}

	// AND THE OTHER CASE IS DRIVEN TOO. An actor that pulled and holds nothing
	// SAYS so, because a blank field cannot be told from one nobody filled.
	if a := Pull(r, "rev-1", RoleReviewer, Payload{}); a.Pull != AnswerWait {
		t.Fatalf("the fixture wanted an empty-handed reviewer and got %s", a.Pull)
	}
	free := oneActor(t, r, "rev-1")
	if free.ID != "" || free.Title != "" {
		t.Errorf("an actor holding nothing names a token: %+v", free)
	}
	if free.Holding != NothingInHand {
		t.Errorf("an actor holding nothing says %q rather than saying there is none", free.Holding)
	}
}

// ---- the fixtures ----

// driveInto puts one actor into the state named, and answers its name. It
// REFUSES a state it does not know how to drive, because a loop that skips one
// is a loop that walks a shorter list than it says it does.
func driveInto(t *testing.T, r Roots, state string) string {
	t.Helper()
	// ASSIGNED TO THE ONE THAT SUBMITS IT, because four eyes ask who sent it and
	// the reviewing case needs a submission that is not the reviewer's.
	tok := mint(t, r, Token{Title: "build the thing", Assignee: "worker", Status: ImpOpen})
	switch state {
	case Stopped:
		Pull(r, "walker", RoleWorker, Payload{})
		if err := ClaimStop(r, "walker", "asked", "the person said to stop"); err != nil {
			t.Fatal(err)
		}
		return "walker"
	case Working:
		if a := Pull(r, "worker", RoleWorker, Payload{}); a.Pull != AnswerWork {
			t.Fatalf("the worker was handed nothing: %s", a.Pull)
		}
		return "worker"
	case Reviewing:
		if a := Pull(r, "worker", RoleWorker, Payload{}); a.Pull != AnswerWork {
			t.Fatalf("the worker was handed nothing: %s", a.Pull)
		}
		if a, _ := settle(r, "worker", RoleWorker, Payload{ID: tok.ID,
			Disposition: string(Done)}); a.Pull == AnswerRefused {
			t.Fatalf("the submission was refused: %+v", a.Findings)
		}
		if a := Pull(r, "judge", RoleReviewer, Payload{}); a.Pull != AnswerReview {
			t.Fatalf("the reviewer was handed nothing: %s", a.Pull)
		}
		return "judge"
	case Waiting:
		// It pulled and holds nothing, because somebody else took the one
		// token there was.
		Pull(r, "worker", RoleWorker, Payload{})
		if a := Pull(r, "idle", RoleReviewer, Payload{}); a.Pull == AnswerReview {
			t.Fatalf("the fixture wanted an empty-handed actor and it was handed %s", a.Token.ID)
		}
		return "idle"
	}
	t.Fatalf("TheStates names %q and this fixture cannot drive it, so the walk is short", state)
	return ""
}

// oneActor answers the row for this actor, and refuses when the answer carries
// no row for it, because a missing row and a waiting row are two different
// facts and an absent one would read as neither.
func oneActor(t *testing.T, r Roots, actor string) Doing {
	t.Helper()
	said := WhatIsHappening(r)
	for _, d := range said.Actors {
		if d.Actor == actor {
			return d
		}
	}
	t.Fatalf("the answer carries no row for %s, and it has pulled: %+v", actor, said.Actors)
	return Doing{}
}

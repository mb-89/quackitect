package main

import (
	"strings"
	"testing"
)

// FINISHING UP IS NOT HOLDING. One press finishes up and five presses hold.
//
// While finishing, no tracked token goes out and none may be taken up, and an
// agent goes on finishing what it already holds. A put-down, a submit, a close
// and every evidence write go through, because finishing means finishing what
// is in hand.
func TestATakeUpWhileFinishingIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-finishing"
	mine := mintNote(t, r, "work in hand")
	next := mintStandard(t, r, "work nobody took")
	ticked(t, r, mine.ID)
	if _, err := TakeUp(r, mine.ID, actor); err != nil {
		t.Fatal(err)
	}

	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}

	// NOTHING NEW IS PICKED UP.
	if _, err := TakeUp(r, next.ID, actor); err == nil {
		t.Fatal("a token was taken up while finishing")
	} else if !strings.Contains(err.Error(), "finish") {
		t.Fatalf("the refusal does not say why: %v", err)
	}

	// AND WHAT IS ALREADY IN HAND STAYS REACHABLE, so the work can be finished.
	if _, err := TakeUp(r, mine.ID, actor); err != nil {
		t.Fatalf("the token already in hand was refused: %v", err)
	}
}

// AND HELD REFUSES BOTH, because held is everything down.
func TestATakeUpWhileHeldIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-held"
	mine := mintNote(t, r, "work in hand")
	ticked(t, r, mine.ID)
	if _, err := TakeUp(r, mine.ID, actor); err != nil {
		t.Fatal(err)
	}
	if _, err := SetHold(r, HoldHeld, "the owner"); err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, mine.ID, actor); err == nil {
		t.Fatal("a token was taken up while everything is held")
	}
}

// A PULL WHILE FINISHING HANDS OUT THIS ACTOR'S OWN NOTES, AND NOTHING ELSE.
//
// The owner's rule, September 2026: an agent told to finish up works every note
// it holds, then stops. A note is private and lives outside git, so one left on
// a cloud box dies with it. The queue hands a note out at no other time, which
// is why the drain rides on finishing rather than on an ordering.
func TestAPullWhileFinishingHandsOutANoteAndNoTrackedToken(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	const actor = "worker-draining"
	mine := mintNote(t, r, "a note here")
	tracked := mintStandard(t, r, "work the queue has")

	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}
	said := Pull(r, actor, RoleWorker, Payload{})
	if said.Token == nil {
		t.Fatalf("finishing handed out nothing, with a note to work: %s", said.Notice)
	}
	if said.Token.ID == tracked.ID {
		t.Fatalf("finishing handed out a tracked token: %s", said.Token.ID)
	}
	if said.Token.ID != mine.ID {
		t.Fatalf("finishing handed out %s, and the note is %s", said.Token.ID, mine.ID)
	}
}

// AND IT HANDS OUT NOBODY ELSE'S NOTE. A note is private, so the drain only
// ever reaches the hand that wrote it.
func TestAPullWhileFinishingSkipsAnotherActorsNote(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	theirs := mintNote(t, r, "another hand note")
	ticked(t, r, theirs.ID)
	if _, err := TakeUp(r, theirs.ID, "worker-elsewhere"); err != nil {
		t.Fatal(err)
	}

	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}
	said := Pull(r, "worker-empty", RoleWorker, Payload{})
	if said.Token != nil {
		t.Fatalf("finishing handed another hand's note over: %s", said.Token.ID)
	}
}

// THE STAFFING DEMAND GOES QUIET WHILE FINISHING.
//
// Without this the main agent is told to spawn hands who are then forbidden to
// take anything up, which is a session with no legal move. Held is quiet for
// the same reason: nothing it spawned could act.
func TestTheStaffingDemandIsQuietWhileFinishing(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	for i := 0; i < 4; i++ {
		mintStandard(t, r, "work the queue has")
	}
	cfg := LoadConfig(r)

	// WITH NO HOLD IT ASKS FOR HANDS, so the quiet below is about the hold.
	//
	// THE TOOL IS THE PULL, which is the one heldDuringShortfall names. It was
	// se_run here, from before that list was narrowed, so the guard answered
	// not-held whatever the hold said and this line could not redden.
	if _, held := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_pull", "", "", ""); !held {
		t.Fatal("this proves nothing: the guard asks for no hands with a full queue and none here")
	}

	for _, state := range []string{HoldFinishing, HoldHeld} {
		if _, err := SetHold(r, state, "the owner"); err != nil {
			t.Fatal(err)
		}
		if said, held := AStaffShortfall(r, cfg, "main", "mcp__quackitect__se_pull", "", "", ""); held {
			t.Errorf("the guard asks for hands while %s: %s", state, said)
		}
	}
}

// WITH NO NOTE LEFT, THE PULL SAYS SO, and that is what allows the stop.
func TestAPullWhileFinishingWithNoNoteSaysSo(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	mintStandard(t, r, "work the queue has")

	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}
	said := Pull(r, "worker-clean", RoleWorker, Payload{})
	if said.Token != nil {
		t.Fatalf("finishing handed out %s with no note to work", said.Token.ID)
	}
	if !strings.Contains(said.Notice, "finish") {
		t.Fatalf("the answer does not say the finishing is done: %q", said.Notice)
	}
}

package main

import (
	"strings"
	"testing"
)

// A FINISHING BOX WAS ASKED FOR A NOTE NOTHING WOULD HAND IT.
//
// Two rungs disagreed, and between them a cloud box could neither drain nor
// stop. The pull hands out nothing at all while a person is finishing up, notes
// included, on the owner's word that finishing means finish the token in your
// hand and stop. NotesGoWithTheBox refused the stop until every note was turned
// in, on the owner's word that you claim the notes that are still there and work
// them in first.
//
// SO THE GATE ASKED FOR THE ONE THING THE OTHER TWO FORBID. A note nobody holds
// cannot be pulled, because finishing hands out nothing, and cannot be taken up
// by name, because the gate refuses a take-up of a token this actor does not
// already hold. The stop was then refused for it for ever.
//
// THE DRAIN RIDES ON AN EMPTY QUEUE NOW, which is where the notes are meant to
// be worked. Finishing is a person saying stop, and this gate goes quiet under
// it the way the staffing demand already does, for the same reason: a demand
// nothing can satisfy is a session with no legal move.
func TestAFinishingBoxIsNotHeldByANoteNobodyHolds(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	t.Setenv("CLAUDE_CODE_REMOTE", "true")

	note := mintNote(t, r, "a note nobody holds")

	// WITH NO HOLD THE GATE REFUSES, which is the rule this narrows rather than
	// removes.
	if _, refuse := NotesGoWithTheBox(r); !refuse {
		t.Fatal("a note on a cloud box refused no stop, so nothing here is about the gate")
	}

	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}

	// THE PULL WILL NOT HAND IT OVER.
	if said := Pull(r, "worker-stopping", RoleWorker, Payload{}); said.Token != nil {
		t.Fatalf("finishing handed out %s, and it hands out nothing", said.Token.ID)
	}
	// AND IT CANNOT BE TAKEN UP BY NAME EITHER, so it is out of reach.
	if _, err := TakeUp(r, note.ID, "worker-stopping"); err == nil {
		t.Fatal("a note nobody holds was taken up while finishing, so it is reachable after all")
	}

	// SO THE GATE CANNOT GO ON ASKING FOR IT.
	if why, refuse := NotesGoWithTheBox(r); refuse {
		t.Errorf("the stop is refused for a note neither the pull nor a take-up will hand over: %s", why)
	}
}

// AND ONE IN A HAND IS STILL ASKED FOR, because that hand can work it and close
// it, which is what finishing tells it to do. The gate is narrowed to what is
// reachable rather than taken off.
func TestAFinishingBoxIsStillHeldByANoteInAHand(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	t.Setenv("CLAUDE_CODE_REMOTE", "true")

	mine := mintNote(t, r, "a held note")
	ticked(t, r, mine.ID)
	if _, err := TakeUp(r, mine.ID, "worker-holding"); err != nil {
		t.Fatal(err)
	}
	if _, err := SetHold(r, HoldFinishing, "the owner"); err != nil {
		t.Fatal(err)
	}

	why, refuse := NotesGoWithTheBox(r)
	if !refuse {
		t.Fatal("a note somebody holds let the stop through, and that hand can still close it")
	}
	if !strings.Contains(why, mine.ID) {
		t.Errorf("the refusal does not name the note it is about: %s", why)
	}
}

package main

import (
	"encoding/json"
	"strings"
	"testing"
)

// A SUBMISSION AT A SHELL IS ONE THING ASKED FOR, AND ONE THING ANSWERED.
//
// se pull hands the next token on after a submission, which is right for the
// lane: an agent that submits is an agent asking for more. It is wrong for a
// person at a prompt, who asked for one thing. Measured: a submission typed at
// the shell closed a note and the answer carried another one, a parked note,
// which then stood held until a put-down by hand gave it back.
//
// The engine could not tell the two doors apart, so the ask carries the door
// now, and an ask that names none is a shell.
//
// THE TOKEN THAT SETTLES IS A NOTE, because a note closes on its one step. A
// standard token submitted at step one is handed back at step two, which is
// the same token rather than a second one.
func TestAShellSubmissionHandsOutNoSecondToken(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	const actor = "worker-shell"
	mine := mintNote(t, r, "work in this hand")
	mintStandard(t, r, "work nobody asked for")
	ticked(t, r, mine.ID)
	if _, err := TakeUp(r, mine.ID, actor); err != nil {
		t.Fatal(err)
	}

	// THE ASK NAMES NO DOOR, so it is read as a shell.
	said := aPullAnswer(t, r, verbAsk{
		Verb:  "pull",
		Args:  []string{"--actor", actor},
		Stdin: `{"id":"` + mine.ID + `","disposition":"done"}`,
	})
	if said.Token != nil {
		t.Errorf("the shell was handed %s, which nobody asked for", said.Token.ID)
	}
	if held := TheyHold(r, actor); len(held) != 0 {
		t.Errorf("a token nobody asked for stands in the hand: %s", held[0].ID)
	}
	if !strings.Contains(said.Notice, mine.ID) {
		t.Errorf("the answer does not name the token that settled: %q", said.Notice)
	}
}

// AND THE LANE IS ANSWERED AS IT ALWAYS WAS, because an agent that submits is
// asking for more.
func TestALaneSubmissionIsStillHandedTheNextToken(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	const actor = "worker-lane"
	mine := mintNote(t, r, "work in this hand")
	mintStandard(t, r, "next work for lane")
	ticked(t, r, mine.ID)
	if _, err := TakeUp(r, mine.ID, actor); err != nil {
		t.Fatal(err)
	}

	said := aPullAnswer(t, r, verbAsk{
		Verb:  "pull",
		Args:  []string{"--actor", actor},
		Stdin: `{"id":"` + mine.ID + `","disposition":"done"}`,
		Door:  DoorLane,
	})
	// WHICH TOKEN IT IS, IS THE QUEUE'S BUSINESS. What this asks is that the
	// lane is handed one, which is the answer it has always had.
	if said.Token == nil {
		t.Fatalf("the lane submitted and was handed nothing: %s", said.Notice)
	}
}

// AND IT LEAVES NO STRETCH BEHIND ON THE TOKEN IT NEVER TOOK UP.
//
// The shell answer was built by taking the next token up and putting it back a
// moment later. Handing out opens a stretch and a put-down closes one, so every
// shell submission wrote a began and an ended onto whatever token the queue
// would have handed on, and two snapshot commits behind them. That token's
// record then said it had been in a hand it was never in, and a reviewer
// running git diff began..ended over its last pair read an empty stretch.
func TestAShellSubmissionOpensNoStretchOnTheNextToken(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	const actor = "worker-shell"
	mine := mintNote(t, r, "work in this hand")
	next := mintStandard(t, r, "work nobody asked for")
	ticked(t, r, mine.ID)
	if _, err := TakeUp(r, mine.ID, actor); err != nil {
		t.Fatal(err)
	}
	was, err := LoadToken(r, next.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(was.Began) != 0 || len(was.Finished) != 0 {
		t.Fatalf("this proves nothing: %s carries a stretch before the submission, began %v ended %v",
			next.ID, was.Began, was.Finished)
	}

	// THE ASK NAMES NO DOOR, so it is read as a shell.
	aPullAnswer(t, r, verbAsk{
		Verb:  "pull",
		Args:  []string{"--actor", actor},
		Stdin: `{"id":"` + mine.ID + `","disposition":"done"}`,
	})

	back, err := LoadToken(r, next.ID)
	if err != nil {
		t.Fatal(err)
	}
	if len(back.Began) != len(was.Began) || len(back.Finished) != len(was.Finished) {
		t.Errorf("a shell submission that never named %s wrote a stretch onto it: began %v, ended %v",
			next.ID, back.Began, back.Finished)
	}
}

// AND A PULL CARRYING NO PAYLOAD IS WORK AT EITHER DOOR.
func TestAPullWithNoPayloadIsWorkAtEitherDoor(t *testing.T) {
	for _, door := range []string{"", DoorLane} {
		r := aTreeWithTheProcesses(t)
		mintStandard(t, r, "work for whoever asks")
		said := aPullAnswer(t, r, verbAsk{Verb: "pull", Args: []string{"--actor", "worker-asking"}, Door: door})
		if said.Token == nil {
			t.Errorf("a pull through door %q was handed nothing: %s", door, said.Notice)
		}
	}
}

// aPullAnswer runs one pull inside the engine and reads its answer.
func aPullAnswer(t *testing.T, r Roots, ask verbAsk) Answer {
	t.Helper()
	got := runVerbInside(t.Context(), r, ask)
	var a Answer
	if err := json.Unmarshal([]byte(got.Out), &a); err != nil {
		t.Fatalf("the pull answered something that will not read: %v, %q %q", err, got.Out, got.Err)
	}
	return a
}

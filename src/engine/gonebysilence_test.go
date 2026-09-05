package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// PULLS ARE NOT LIVENESS.
//
// Two guards decided a holder was gone by counting pulls, and both got the same
// live worker wrong inside one minute. worker-dvorak took a token at 16:58:00
// and was still writing to it at 17:05:38. At 17:04:18 the start sweep put that
// token back as work held by an agent that is gone, and the pull notice named
// the same hold, because eleven pulls had gone past since dvorak last pulled.
//
// A WORKER ON ONE LONG TOKEN PULLS ONCE. The count is a proxy for a worker that
// stops between tokens, not for one working inside a single one, and dvorak had
// no shell either: every se run it made exited one, so all of its work went
// through se apply, which makes no pull at all. A broken shell read as death.
//
// SO BOTH HALVES ARE DRIVEN HERE. The notice asks a person to look and the
// sweep releases the hold on its own, and a rule taught to one of them is the
// same defect by the other door.

// wasHeard is one line of the record: who called, and how long ago.
type wasHeard struct {
	actor string
	ago   time.Duration
}

// theRecordSays writes the log the engine reads, one line per call.
//
// IT IS WRITTEN AFTER THE FIXTURE HAS TAKEN THE TOKEN UP, because a fixture's
// own writes are calls too, and a test that left them in would be asserting on
// the moment it set itself up. The session name is carried over, so whatever
// reads the record still knows which session it is looking at.
func theRecordSays(t *testing.T, r Roots, said ...wasHeard) {
	t.Helper()
	session, now := currentSession(r), time.Now().UTC()
	var lines []byte
	for _, s := range said {
		b, err := json.Marshal(Record{
			T: now.Add(-s.ago).Format(time.RFC3339Nano), Session: session,
			Src: "agent", Kind: "call", Actor: s.actor, Msg: "se apply", OK: Yes(),
		})
		if err != nil {
			t.Fatal(err)
		}
		lines = append(lines, append(b, '\n')...)
	}
	if err := os.WriteFile(filepath.Join(r.Private("log"), Current), lines, 0o644); err != nil {
		t.Fatal(err)
	}
}

// A HOLDER THAT IS CALLING AND NOT PULLING IS NOT GONE.
//
// It pulled once, at the start, and has been inside one long token since, while
// the room went on pulling without it. Neither guard may touch it: the notice
// stops every worker to send one to look, and the sweep releases a hold another
// worker can then take mid-change.
func TestAHolderThatCallsWithoutPullingIsNeitherSweptNorCalledGone(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "worker-live")
	Arrived(r, ArrivalSession(r), "worker-live")
	// Eleven others pull twelve times each: a hundred and thirty-two pulls, past
	// any window this queue counts in pulls.
	theOthersPull(r, 11, 12)
	// AND THE HOLDER IS WORKING THROUGHOUT. Its last call is a moment ago, in a
	// record that has been running for twenty minutes.
	theRecordSays(t, r,
		wasHeard{"engine", 20 * time.Minute},
		wasHeard{"worker-live", 0},
	)

	// EACH HALF ANSWERS FOR ITSELF, so one red run says which of the two guards
	// got it wrong rather than stopping at the first.
	if got, quiet := quietHold(r, "walker"); quiet {
		t.Errorf("the notice: a holder that called a moment ago was called gone: %s", got.ID)
	}
	if back := SweepWorkHeldByTheGone(r); len(back) != 0 {
		t.Errorf("the sweep: live work was released: %v", back)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "worker-live" {
		t.Errorf("the hold moved: holder %q, want worker-live", got.Holder)
	}
}

// AND THE GUARDS ARE NOT MERELY SWITCHED OFF. A holder nothing has been heard
// from for half an hour is gone, and both halves say so: the notice names the
// hold and the sweep puts it back.
func TestAHolderNothingHasBeenHeardFromIsGone(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "worker-dead")
	// Nobody pulls at all here, because a busy room is not what decides this.
	theRecordSays(t, r,
		wasHeard{"engine", time.Hour},
		wasHeard{"worker-dead", 30 * time.Minute},
	)

	got, quiet := quietHold(r, "walker")
	if !quiet {
		t.Fatal("a holder silent for half an hour was not named to the walker")
	}
	if got.ID != tok.ID {
		t.Fatalf("the wrong hold was named: %s, want %s", got.ID, tok.ID)
	}
	if back := SweepWorkHeldByTheGone(r); len(back) != 1 {
		t.Fatalf("the sweep left work behind a hand that is gone: %v", back)
	}
	if held, _ := LoadToken(r, tok.ID); held.Holder != "" {
		t.Fatalf("the hold stands: holder %q", held.Holder)
	}
}

package main

import (
	"encoding/json"
	"os"
	"testing"
)

// THE HOLD IS A WORD WITH THREE VALUES, and the file it is written to says so.
//
// It was a boolean, which is one degree where the owner wants two. One press
// finishes up: the agent works out what it holds and takes nothing new. Five
// presses hold, which is what the boolean did.
func TestTheHoldIsAWordWithThreeValues(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)

	read := func() string {
		t.Helper()
		b, err := os.ReadFile(holdPath(r))
		if err != nil {
			t.Fatal(err)
		}
		var on struct {
			State string `json:"state"`
		}
		if err := json.Unmarshal(b, &on); err != nil {
			t.Fatal(err)
		}
		return on.State
	}

	for _, want := range []string{HoldHeld, HoldFinishing, HoldOff} {
		if _, err := SetHold(r, want, "person"); err != nil {
			t.Fatal(err)
		}
		if got := read(); got != want {
			t.Errorf("the file says %q where the state is %q", got, want)
		}
		if got := LoadHold(r).State; got != want {
			t.Errorf("it reads back as %q where the state is %q", got, want)
		}
	}
}

// A FILE WRITTEN BEFORE THE WORD EXISTED STILL READS. It carries on and no
// state, and a hold that was on is held.
func TestAHoldWrittenAsABooleanStillReads(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	os.MkdirAll(r.Private(), 0o755)

	was := `{"session":"` + currentSession(r) + `","on":true,"by":"person"}`
	if err := os.WriteFile(holdPath(r), []byte(was), 0o644); err != nil {
		t.Fatal(err)
	}
	if got := LoadHold(r); got.State != HoldHeld || !got.Held() {
		t.Fatalf("an old file reads as %q", got.State)
	}

	off := `{"session":"` + currentSession(r) + `","on":false}`
	if err := os.WriteFile(holdPath(r), []byte(off), 0o644); err != nil {
		t.Fatal(err)
	}
	if got := LoadHold(r); got.State != HoldOff || got.Held() {
		t.Fatalf("an old file that was off reads as %q", got.State)
	}
}

// AND On STAYS TRUE FOR HELD, so a reader written before the word still sees
// the hold it was watching for.
func TestOnIsStillWrittenForHeld(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)

	for _, c := range []struct {
		state string
		on    bool
	}{{HoldHeld, true}, {HoldFinishing, false}, {HoldOff, false}} {
		if _, err := SetHold(r, c.state, "person"); err != nil {
			t.Fatal(err)
		}
		b, err := os.ReadFile(holdPath(r))
		if err != nil {
			t.Fatal(err)
		}
		var said struct {
			On bool `json:"on"`
		}
		if err := json.Unmarshal(b, &said); err != nil {
			t.Fatal(err)
		}
		if said.On != c.on {
			t.Errorf("%s writes on as %v", c.state, said.On)
		}
	}
}

// A STATE NOBODY DECLARED IS REFUSED, rather than written and read back as a
// word the doors do not know.
func TestAHoldStateNobodyDeclaredIsRefused(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	if _, err := SetHold(r, "paused", "person"); err == nil {
		t.Fatal("a state nobody declared was written")
	}
}

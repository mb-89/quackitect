package main

import (
	"quackitect/engine/internal/sessionlog"
	"testing"
	"time"
)

// THE BURN DOWN COUNTS WHAT ACTUALLY HAPPENED.
//
// MEASURED, AND THE MEASUREMENT IS WHY THIS EXISTS. It counted a mint by
// looking for a log line carrying a status and no from, and an ending by
// looking for one carrying a disposition. Neither key was ever written, so
// minted and done answered nought for every day there has ever been.
//
// NOUGHT IS A NUMBER A BURN-DOWN MAY ANSWER, which is what hid it. A day with
// no work looks exactly like a counter that is not wired, so nothing could
// tell them apart and no check asked. This one mints and ends a token, so the
// only reading of nought is that the count is broken.
func TestTheBurndownCountsWhatHappened(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
	writeProcess(t, root, "counted")
	// A SESSION IS WHAT THE RECORD BELONGS TO. Every move writes into the log
	// that is open, so a tree with no session records nothing, which is why
	// this opens one rather than expecting the writes to land in the air.
	openSession(t, r)

	today := TheDay(time.Now())
	before := TheBurndown(r, today)

	one, err := Mint(r, Token{Tracked: local(), Process: "counted", Title: "a token to count", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := Mint(r, Token{Tracked: local(), Process: "counted", Title: "a second to count", Status: "first"}); err != nil {
		t.Fatal(err)
	}
	afterMint := TheBurndown(r, today)
	if got := afterMint.Minted - before.Minted; got != 2 {
		t.Errorf("two tokens were minted and the burn-down counted %d", got)
	}
	if got := afterMint.Open - before.Open; got != 2 {
		t.Errorf("two tokens are open and the burn-down counted %d", got)
	}

	// ENDING ONE MOVES TWO NUMBERS: done goes up and open comes down.
	one.Disposition = Done
	one.Status = "second"
	if err := SaveToken(r, one); err != nil {
		t.Fatal(err)
	}
	end := TheBurndown(r, today)
	if got := end.Done - before.Done; got != 1 {
		t.Errorf("one token ended and the burn-down counted %d", got)
	}
	if got := end.Open - before.Open; got != 1 {
		t.Errorf("one of the two is still open and the burn-down counted %d", got)
	}

	// AND THE BAR SAYS THE THREE NUMBERS IT COUNTED, so the editor draws what
	// this worked out rather than working anything out itself.
	if want := "BD: 2/1/1"; end.Says != want {
		t.Errorf("the bar reads %q where it counted %d/%d/%d", end.Says, end.Minted, end.Done, end.Open)
	}
}

// A day nothing happened on answers nought, and that is not the same fault.
func TestABurndownForAQuietDayIsNought(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
	writeProcess(t, root, "counted")
	openSession(t, r)
	if _, err := Mint(r, Token{Tracked: local(), Process: "counted", Title: "minted today", Status: "first"}); err != nil {
		t.Fatal(err)
	}
	// A day the log cannot hold anything for.
	b := TheBurndown(r, "1999-01-01")
	if b.Minted != 0 || b.Done != 0 {
		t.Errorf("a day before the log answered %d minted and %d done", b.Minted, b.Done)
	}
	// Open is taken now rather than that day, so it still sees the token.
	if b.Open != 1 {
		t.Errorf("open is absolute and answered %d where one token is open", b.Open)
	}
}

// The window says what the reading covers, so a small number can be told from
// a short window rather than guessed at.
func TestABurndownSaysWhatItCovers(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	b := TheBurndown(r, TheDay(time.Now()))
	if b.Window == "" {
		t.Error("the burn-down says nothing about what it covers")
	}
	if b.Detail == "" || b.Says == "" {
		t.Error("the burn-down carries no words for the bar or the hover")
	}
}

// openSession starts the log a move writes into, the way a running editor does.
func openSession(t *testing.T, r Roots) {
	t.Helper()
	l, err := sessionlog.Open(r.Private("log"))
	if err != nil {
		t.Fatalf("opening the log: %v", err)
	}
	if err := l.Close(); err != nil {
		t.Fatalf("closing the log: %v", err)
	}
}

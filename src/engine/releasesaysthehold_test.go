package main

import (
	"strings"
	"testing"
	"time"
)

// A RELEASE FREES A CLAIM AND NOT A HOLD, AND MUST SAY SO.
//
// freed reads as the token being back. It is not. The hold is a different field
// answering a different question, and it outlives the release.
//
// MEASURED THREE TIMES, IN SEPTEMBER 2026. Told to put work down, a session
// released, read freed, and stopped. The stop judge went on naming the same
// token as work in hand, and the session read that as the engine not listening.
func TestAReleaseSaysTheHoldItDidNotFree(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	tok := mintStandard(t, r, "work taken and held")
	if got := Pull(r, "worker-here", RoleWorker, Payload{}); got.Pull != AnswerWork {
		t.Fatalf("this test proves nothing: nothing was handed out: %s", got.Notice)
	}
	if by := HeldBy(r, tok.ID); by == "" {
		t.Fatal("this test proves nothing: the hand-out left no hold")
	}

	// THE CLAIM IS WRITTEN HERE, because a local token takes none on hand-out
	// and this test is about a release, not about what the hand-out claims.
	me := Claimant(r, "worker-here")
	held, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	held.ClaimedBy, held.ClaimedAt = me, time.Now().UTC().Format(ClaimStamp)
	if err := SaveToken(r, held); err != nil {
		t.Fatal(err)
	}

	res, err := Release(r, me, []string{tok.ID}, time.Now().UTC())
	if err != nil {
		t.Fatal(err)
	}
	if len(res.Freed) != 1 {
		t.Fatalf("the release freed %v, and this test is about one it did free", res.Freed)
	}

	// THE HOLD IS STILL THERE. That is the behaviour, and it is not the defect.
	if by := HeldBy(r, tok.ID); by == "" {
		t.Skip("the release now frees the hold as well, so there is nothing to say")
	}

	// WHAT IT MUST NOT DO IS ANSWER freed AND NOTHING ELSE.
	if res.Notice == "" {
		t.Fatal("the release answered freed with the hold still standing, and said nothing about it")
	}
	if !strings.Contains(res.Notice, tok.ID) {
		t.Errorf("the notice does not name the token still held: %s", res.Notice)
	}
	if !strings.Contains(res.Notice, "put-down") && !strings.Contains(res.Notice, "put_down") {
		t.Errorf("the notice does not name the way to set it back: %s", res.Notice)
	}
}

// AND A RELEASE OF WORK NOBODY HOLDS SAYS NOTHING EXTRA, so the notice means
// something when it is there.
func TestAReleaseOfUnheldWorkIsQuiet(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	tok := mintStandard(t, r, "work claimed not held")
	me := Claimant(r, "worker-here")
	tok.ClaimedBy, tok.ClaimedAt = me, time.Now().UTC().Format(ClaimStamp)
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}

	res, err := Release(r, me, []string{tok.ID}, time.Now().UTC())
	if err != nil {
		t.Fatal(err)
	}
	if len(res.Freed) != 1 {
		t.Fatalf("the release freed %v", res.Freed)
	}
	if res.Notice != "" {
		t.Errorf("a release of work nobody held still said something about a hold: %s", res.Notice)
	}
}

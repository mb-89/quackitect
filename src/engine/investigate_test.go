package main

import (
	"fmt"
	"strings"
	"testing"
)

// A LOOK DOES NOT STEAL FROM A HOLDER WHO IS STILL PULLING.
//
// TakeBackWhatWasLookedAt moved the hold unconditionally, though its comment
// said only if the holder is still not pulling. Seen twice on 2026-09-01:
// work-a took a held token from rev-14, which was alive and mid-review.
func TestALookDoesNotStealFromAHolderStillPulling(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeWorkableProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	log.Write("engine", "start", "engine", "for the session name", Yes(), nil)

	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work in review", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, "rev"); err != nil {
		t.Fatal(err)
	}
	// rev pulls, so the arrival record says it is alive.
	Arrived(r, ArrivalSession(r), "rev")

	Looked(r, "main", tok.ID)
	if back, _ := TakeBackWhatWasLookedAt(r, "main"); len(back) != 0 {
		t.Fatalf("a look stole %v from a holder who is still pulling", back)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "rev" {
		t.Fatalf("the hold moved: holder %q, want rev", got.Holder)
	}
}

// AND NOT FROM WHOEVER TOOK IT SINCE. The look was at one holder; a token that
// changed hands in the meantime is somebody else's work now.
func TestALookDoesNotStealFromANewerHolder(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeWorkableProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	defer log.Close()
	log.Write("engine", "start", "engine", "for the session name", Yes(), nil)

	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "work that moved on", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, "rev-old"); err != nil {
		t.Fatal(err)
	}
	Looked(r, "main", tok.ID)

	// The token changes hands after the look.
	if _, err := PutDown(r, tok.ID, "rev-old"); err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, "rev-new"); err != nil {
		t.Fatal(err)
	}

	if back, _ := TakeBackWhatWasLookedAt(r, "main"); len(back) != 0 {
		t.Fatalf("a look stole %v from a holder it was never sent to", back)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "rev-new" {
		t.Fatalf("the hold moved: holder %q, want rev-new", got.Holder)
	}
}

// THE NOTICE OFFERS TWO GESTURES, one for take it and one for leave it.
// Coming back to se pull meant both, so the engine could not hear the
// difference.
func TestTheInvestigateNoticeSeparatesLeaveFromTake(t *testing.T) {
	t.Parallel()
	r := lane(t)
	notice := investigate(r, Token{ID: "wk-x", Title: "a hold", Status: "first", Holder: "rev"}).Notice
	if !strings.Contains(notice, "se pull") {
		t.Fatalf("the take gesture is missing: %q", notice)
	}
	if !strings.Contains(notice, "se work --on") {
		t.Fatalf("the leave gesture is missing, or is the same as the take one: %q", notice)
	}
}

// aHeldTokenInASession is one token in one pair of hands, inside a real session,
// because staleness is answered from the session's own pull count.
func aHeldTokenInASession(t *testing.T, holder string) (Roots, Token) {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeWorkableProcess(t, root, "queued")
	log, err := OpenLog(r.Private("log"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { log.Close() })
	log.Write("engine", "start", "engine", "for the session name", Yes(), nil)
	tok, err := Mint(r, Token{Tracked: local(), Process: "queued", Title: "a long token", Status: "first"})
	if err != nil {
		t.Fatal(err)
	}
	if _, err := TakeUp(r, tok.ID, holder); err != nil {
		t.Fatal(err)
	}
	return r, tok
}

// theOthersPull moves the session's pull count by everybody except the holder,
// which is the fleet being busy and nothing else.
func theOthersPull(r Roots, others, each int) {
	session := ArrivalSession(r)
	for round := 0; round < each; round++ {
		for i := 0; i < others; i++ {
			Arrived(r, session, fmt.Sprintf("other-%d", i))
		}
	}
}

// A BUSY ROOM IS NOT A STOPPED HOLDER.
//
// limits.pulls_before_hold_is_stale is ten and the queue counted ten pulls by
// ANYBODY, so the window's rate was the fleet size. With twelve actors ten pulls
// go past in under a minute, and every holder deep in a twenty-minute token had
// stopped pulling by the engine's measure. The queue then answered investigate
// instead of handing out work, so one alarm stopped every worker.
func TestABusyFleetDoesNotMakeAHolderStale(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "holder")
	// The holder pulled once, then went to work on a token that takes a while.
	Arrived(r, ArrivalSession(r), "holder")
	// Eleven others pull five times each: fifty-five pulls, well past ten, and
	// well short of ten turns each across the twelve actors present.
	theOthersPull(r, 11, 5)

	if got, ok := quietHold(r, "walker"); ok {
		t.Fatalf("a holder five turns into its own token was called stale: %s", got.ID)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "holder" {
		t.Fatalf("the hold moved: holder %q, want holder", got.Holder)
	}
}

// AND THE ALARM IS NOT MERELY SWITCHED OFF. A holder that has really gone falls
// behind anyway, because the room goes on pulling and it does not.
func TestAHolderThatStoppedIsStillStale(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "holder")
	Arrived(r, ArrivalSession(r), "holder")
	// The same twelve actors, and now the others have each had twelve turns
	// while the holder had none.
	theOthersPull(r, 11, 12)

	got, ok := quietHold(r, "walker")
	if !ok {
		t.Fatal("a holder that stopped pulling for twelve rounds was not called stale")
	}
	if got.ID != tok.ID {
		t.Fatalf("the wrong hold was named: %s, want %s", got.ID, tok.ID)
	}
}

// THE ANSWER NAMES THE NUMBER IT USED AND WHAT IT WAS NORMALISED BY, so the
// walker it woke can see why it was woken without going to look it up.
func TestTheInvestigateNoticeNamesTheWindowAndItsRate(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "holder")
	theOthersPull(r, 11, 12)
	held, _ := LoadToken(r, tok.ID)
	notice := investigate(r, held).Notice

	window, per, actors := staleWindow(r, ArrivalSession(r))
	for _, want := range []string{
		fmt.Sprintf("%d", window),
		fmt.Sprintf("%d per actor", per),
		fmt.Sprintf("%d actors present", actors),
	} {
		if !strings.Contains(notice, want) {
			t.Fatalf("the notice does not say %q: %q", want, notice)
		}
	}
}

package main

import (
	"fmt"
	"strings"
	"testing"
	"time"
)

// A LOOK DOES NOT STEAL FROM A HOLDER WHO IS STILL CALLING.
//
// TakeBackWhatWasLookedAt moved the hold unconditionally, though its comment
// said only if the holder is still there. Seen twice on 2026-09-01: work-a took
// a held token from rev-14, which was alive and mid-review.
func TestALookDoesNotStealFromAHolderStillCalling(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
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
	// rev called a moment ago, in a record that has been running for twenty
	// minutes, so it is alive.
	theRecordSays(t, r, wasHeard{"engine", 20 * time.Minute}, wasHeard{"rev", 0})

	Looked(r, "main", tok.ID)
	if back, _ := TakeBackWhatWasLookedAt(r, "main"); len(back) != 0 {
		t.Fatalf("a look stole %v from a holder who is still calling", back)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "rev" {
		t.Fatalf("the hold moved: holder %q, want rev", got.Holder)
	}
}

// AND NOT FROM WHOEVER TOOK IT SINCE. The look was at one holder; a token that
// changed hands in the meantime is somebody else's work now.
func TestALookDoesNotStealFromANewerHolder(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
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

// THE ANSWER NAMES THE SILENCE IT MEASURED AND THE ONE IT ALLOWS, so the walker
// it woke can see why it was woken without going to look it up.
func TestTheInvestigateNoticeNamesTheSilenceAndItsWindow(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "holder")
	theRecordSays(t, r, wasHeard{"engine", time.Hour}, wasHeard{"holder", 30 * time.Minute})
	held, _ := LoadToken(r, tok.ID)
	notice := investigate(r, held).Notice

	silent, gone := HasGone(r, "holder")
	if !gone {
		t.Fatal("the holder in this fixture is not gone, so the notice is about nothing")
	}
	for _, want := range []string{briefSilence(silent), briefSilence(SilenceBeforeGone(r))} {
		if !strings.Contains(notice, want) {
			t.Fatalf("the notice does not say %q: %q", want, notice)
		}
	}
}

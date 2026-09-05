package main

import (
	"strings"
	"testing"
	"time"
)

// A REFUSED TAKE-BACK KEEPS THE LOOK AND SAYS WHICH GUARD REFUSED.
//
// The look was deleted inside the lock before anything had been decided, so
// every refusing path spent it. The walker then pulled again, the same quiet
// hold was found, the look was written straight back, and the identical notice
// returned with no word about why nothing moved. The alarm could not be
// cleared and the walker could not learn what to do instead.
func TestARefusedTakeBackKeepsTheLookAndNamesTheGuard(t *testing.T) {
	t.Parallel()
	for _, c := range []struct {
		name  string
		says  string
		setUp func(t *testing.T) (Roots, string)
	}{
		{
			name: "the token will not load",
			says: "will not load",
			setUp: func(t *testing.T) (Roots, string) {
				r, _ := aHeldTokenInASession(t, "holder")
				Looked(r, "walker", "nothing-of-that-name")
				return r, "nothing-of-that-name"
			},
		},
		{
			name: "it has already ended",
			says: "has already ended",
			setUp: func(t *testing.T) (Roots, string) {
				r, tok := aHeldTokenInASession(t, "holder")
				Looked(r, "walker", tok.ID)
				got, err := LoadToken(r, tok.ID)
				if err != nil {
					t.Fatal(err)
				}
				got.Disposition = "done"
				if err := SaveToken(r, got); err != nil {
					t.Fatal(err)
				}
				return r, tok.ID
			},
		},
		{
			name: "nobody is holding it now",
			says: "nobody is holding it",
			setUp: func(t *testing.T) (Roots, string) {
				r, tok := aHeldTokenInASession(t, "holder")
				Looked(r, "walker", tok.ID)
				if _, err := PutDown(r, tok.ID, "holder"); err != nil {
					t.Fatal(err)
				}
				return r, tok.ID
			},
		},
		{
			name: "the walker holds it itself",
			says: "holding it yourself",
			setUp: func(t *testing.T) (Roots, string) {
				r, tok := aHeldTokenInASession(t, "walker")
				Looked(r, "walker", tok.ID)
				return r, tok.ID
			},
		},
		{
			name: "it changed hands since the look",
			says: "changed hands",
			setUp: func(t *testing.T) (Roots, string) {
				r, tok := aHeldTokenInASession(t, "holder-old")
				Looked(r, "walker", tok.ID)
				if _, err := PutDown(r, tok.ID, "holder-old"); err != nil {
					t.Fatal(err)
				}
				if _, err := TakeUp(r, tok.ID, "holder-new"); err != nil {
					t.Fatal(err)
				}
				return r, tok.ID
			},
		},
		{
			name: "the holder is calling again",
			says: "is still calling",
			setUp: func(t *testing.T) (Roots, string) {
				r, tok := aHeldTokenInASession(t, "holder")
				Looked(r, "walker", tok.ID)
				theRecordSays(t, r,
					wasHeard{"engine", 20 * time.Minute}, wasHeard{"holder", 0})
				return r, tok.ID
			},
		},
	} {
		t.Run(c.name, func(t *testing.T) {
			t.Parallel()
			r, id := c.setUp(t)

			back, refused := TakeBackWhatWasLookedAt(r, "walker")

			if len(back) != 0 {
				t.Fatalf("a refused take-back moved %v", back)
			}
			if got := lookedAt(r)["walker"].ID; got != id {
				t.Fatalf("a refused take-back spent the look: it now reads %q, want %q", got, id)
			}
			if !strings.Contains(refused, c.says) {
				t.Fatalf("the refusal does not say %q: %q", c.says, refused)
			}
		})
	}
}

// AND THE PATH THAT ACTUALLY MOVES THE HOLD SPENDS IT, once. The look is the
// walker's answer being carried; once it has been acted on it is gone, so a
// second pull does not release a token somebody has since picked up.
func TestATakenBackHoldSpendsTheLookOnce(t *testing.T) {
	t.Parallel()
	r, tok := aHeldTokenInASession(t, "holder")
	Looked(r, "walker", tok.ID)
	// Nothing has been heard from the holder for half an hour, which is the only
	// thing that makes a hold quiet.
	theRecordSays(t, r, wasHeard{"engine", time.Hour}, wasHeard{"holder", 30 * time.Minute})

	back, refused := TakeBackWhatWasLookedAt(r, "walker")

	if len(back) != 1 {
		t.Fatalf("the hold was not taken back: %v, refused %q", back, refused)
	}
	if refused != "" {
		t.Fatalf("a take-back that worked still refused: %q", refused)
	}
	if got, _ := LoadToken(r, tok.ID); got.Holder != "" {
		t.Fatalf("the hold was not cleared: holder %q", got.Holder)
	}
	if _, still := lookedAt(r)["walker"]; still {
		t.Fatal("the look outlived the take-back it was spent on")
	}

	// Pulling again releases nothing, because the look is spent.
	if again, _ := TakeBackWhatWasLookedAt(r, "walker"); len(again) != 0 {
		t.Fatalf("the same hold was taken back twice: %v", again)
	}
}

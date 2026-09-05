package main

import (
	"context"
	"strings"
	"testing"
)

// A CANCELLED CONTEXT ENDS A CLAIM SYNC, AND THE SEAM IS WHERE THAT IS SEEN.
//
// The claim work takes a context and hands it down through Publish, the write,
// the sync and the watch. Every one of those is tested against the fake git,
// and the fake threw the context away, so a caller that reached git with a
// context it never threaded passed every claim test in the tree. The one cancel
// test there was calls the real git directly and goes nowhere near these five.
//
// SO THE FAKE ANSWERS THE CONTEXT, the way the real one does. It is the seam
// every claim test already feeds, so one rule there covers all of them.
func TestACancelledContextEndsASync(t *testing.T) {
	t.Parallel()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	fed := aFedGit(t)
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	got := SyncClaims(ctx, r)
	if !strings.Contains(got.Says, context.Canceled.Error()) {
		t.Errorf("a cancelled sync does not say it was cancelled: %q", got.Says)
	}
	if len(fed.ran) > 1 {
		t.Errorf("a cancelled sync went on asking git: %v", fed.ran)
	}
}

// AND THE SAME SEAM STILL ANSWERS A LIVE CONTEXT, so the rule above refuses
// only what is cancelled.
func TestALiveContextStillReachesGit(t *testing.T) {
	t.Parallel()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	fed := aFedGit(t)
	fed.says["rev-parse"] = ""
	SyncClaims(t.Context(), r)
	if len(fed.ran) == 0 {
		t.Error("a live context reached no git call at all, so this proves nothing")
	}
}

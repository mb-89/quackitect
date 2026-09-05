package main

import (
	"context"
	"errors"
	"testing"
	"time"
)

// A SPAWN THE ENGINE GOVERNS ENDS WITH ITS CONTEXT.
//
// realGit and the probe each made their own context inside a timeout, so a
// caller could not end them early and a test could not hand them t.Context.
// The git call and the probe are the two spawns a context may govern: the
// child is the engine's own and nothing outlives the caller on purpose. The
// detached starts are the other kind, and their tests are their own.

// A git call on a context already cancelled ends at once, with the
// cancellation as its reason, and never waits out gitBudget.
func TestACancelledContextEndsAGitCall(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	started := time.Now()
	_, err := realGit(ctx, r, "", "status")
	if err == nil {
		t.Fatal("a git call on a cancelled context answered as though it had run")
	}
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("the call ended for a reason that is not the cancel: %v", err)
	}
	if took := time.Since(started); took > 5*time.Second {
		t.Fatalf("the call took %s to end on a context that was already cancelled", took)
	}
}

// A probe on a context already cancelled finds nothing, even the engine this
// suite built, because the cancel ends every candidate before it answers.
func TestACancelledContextEndsTheProbe(t *testing.T) {
	t.Parallel()
	r := probeTree(t)
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	started := time.Now()
	p := ProbeTools(ctx, r, "20260831-000000")
	if len(p.Found) != 0 {
		t.Fatalf("a probe on a cancelled context still found %+v", p.Found)
	}
	if took := time.Since(started); took > probeWait {
		t.Fatalf("the probe took %s to end on a context that was already cancelled", took)
	}
	// AND ON A LIVE CONTEXT THE SAME PROBE FINDS THE ENGINE, so the empty
	// answer above is the cancel and not a fixture that finds nothing anyway.
	if live := ProbeTools(t.Context(), r, "20260831-000001"); len(live.Found) != 1 {
		t.Fatalf("the fixture finds %d tools on a live context, so the test above proves nothing", len(live.Found))
	}
}

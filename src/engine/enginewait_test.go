package main

import (
	"context"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"
)

// THE WAIT FOR A STARTED ENGINE ENDS WITH ITS CONTEXT.
//
// ensureEngine starts a detached engine and waits up to engineUpBudget for
// its record to name a socket. The child is meant to outlive the caller, so
// the context never governs it, but the wait is the caller's own, and a
// caller that has ended has nothing left to wait for. A hook process on its
// way out sat the whole budget for an engine it would never ask.
func TestACancelledContextEndsTheWaitForAnEngine(t *testing.T) {
	t.Parallel()
	if runtime.GOOS == "windows" {
		t.Skip("the stand-in engine is a shell script, and Windows runs se.exe")
	}
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	// AN ENGINE THAT STARTS AND NEVER REPORTS, so the wait is the whole
	// budget unless something ends it. It sleeps briefly and leaves.
	bin := filepath.Join(r.Method, ".bin")
	if err := os.MkdirAll(bin, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(bin, "se"), []byte("#!/bin/sh\nsleep 2\n"), 0o755); err != nil {
		t.Fatal(err)
	}

	ctx, cancel := context.WithCancel(t.Context())
	cancel()
	started := time.Now()
	ensureEngine(ctx, r)
	if took := time.Since(started); took >= engineUpBudget {
		t.Fatalf("the wait ran %s on a context already cancelled, which is the whole budget", took)
	}
}

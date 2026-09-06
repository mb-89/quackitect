package main

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// AN ENGINE THAT IS ENDING STARTS NO SUCCESSOR.
//
// handOver refuses on a cancelled context, and nothing could see it. Its only
// caller is the swap arm of main, whose context is cancelled by a defer that
// runs after that loop has returned, so the branch cannot fire in production
// and the suite never drove it. A sentence in a comment that nothing checks is
// a claim about behaviour rather than the behaviour.
//
// THE LOG FILE IS THE WITNESS. handOver opens the private engine.out before it
// builds the command, so a run that got past the refusal leaves that file
// behind. A test that read only the error would pass over a handover that
// refused and started a process anyway.
func TestAnEndingEngineStartsNoSuccessor(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	if err := os.MkdirAll(filepath.Dir(r.Private("engine.out")), 0o755); err != nil {
		t.Fatal(err)
	}
	ctx, cancel := context.WithCancel(t.Context())
	cancel()

	err := handOver(ctx, r, "20260101-000000")
	if err == nil {
		t.Fatal("an engine that is ending handed over, and nothing said so")
	}
	if !strings.Contains(err.Error(), "starts no successor") {
		t.Errorf("the refusal does not say what it refused: %v", err)
	}
	if _, err := os.Stat(r.Private("engine.out")); !os.IsNotExist(err) {
		t.Errorf("the handover opened its log, so it went past the refusal: %v", err)
	}
}

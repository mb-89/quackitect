package main

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// A HANDOVER WHOSE SUCCESSOR IS TURNED AWAY LEAVES AN ENGINE OVER THE TREE.
//
// handOver lets go of the tree before it starts the successor, so the successor
// can take it. Between those two calls the tree is held by nobody. Any other
// start in that window takes it, and the successor then reads the tree held,
// says already up and leaves. The predecessor has let go and ends, so the tree
// is left with a holder nobody meant to be the engine, or with none at all.
//
// THE SUCCESSOR HERE ENDS AT ONCE AND TAKES NOTHING, which is what an engine
// turned away does. What is watched is the predecessor: it let go for a
// handover that did not happen, so it takes the tree back and goes on being
// the engine.
func TestAHandoverThatIsTurnedAwayKeepsTheTree(t *testing.T) {
	if runtime.GOOS == "windows" {
		t.Skip("the successor here is a shell script, and Windows starts the engine as an exe")
	}
	r := guidanceTree(t)
	if held, err := HoldTheTree(r); err != nil || !held {
		t.Fatalf("the predecessor could not take the tree: held %v, %v", held, err)
	}
	t.Cleanup(LetGoOfTheTree)

	exe := engineAt(r)
	if err := os.MkdirAll(filepath.Dir(exe), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(exe, []byte("#!/bin/sh\nexit 0\n"), 0o755); err != nil {
		t.Fatal(err)
	}

	err := handOver(t.Context(), r, "one session, two processes")

	if !theTreeIsHeldHere() {
		t.Fatalf("the successor took nothing and this engine let go, so the tree has no engine. The handover said: %v", err)
	}
	if err == nil || !strings.Contains(err.Error(), "successor") {
		t.Errorf("the handover does not say the successor was turned away: %v", err)
	}
}

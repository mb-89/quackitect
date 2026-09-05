package main

import (
	"os"
	"strings"
	"testing"
	"time"
)

// A SWAP THAT SAYS IT SWAPPED AND DID NOT IS THE WORST OF THE THREE ANSWERS.
//
// MEASURED, TWICE IN ONE DAY ON ONE BOX. The door answered swapping true and
// named the build it was handing over to. Three quarters of a minute later
// engine.json still named the old build, and the old code went on answering
// every call. Nothing said the handover had failed.
//
// The damage is that an agent that has just fixed a guard cannot put the fix
// in front of itself, and reads a success while the old guard refuses it.
//
// So the answer the caller gets is written after somebody has looked, and it
// says how long it looked for.
func TestASwapThatNeverLandsSaysSo(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	r := Roots{Method: dir, Work: dir}

	now := func() string { return time.Now().UTC().Format(time.RFC3339) }
	told := swapAnswer{Swapping: true, Build: "new-build", From: "old-build",
		Says: "the next engine is built and answers. The calls in flight finish, then it takes over"}

	// A SUCCESSOR THAT NEVER TAKES OVER. engine.json goes on naming the old
	// build for as long as anybody looks, which is what the box did.
	SayRunning(r, Running{PID: os.Getpid(), Build: "old-build", Started: now(), Beat: now()})

	said := afterTheAnswer(r, told, 150*time.Millisecond, 10*time.Millisecond)
	if said.Swapping {
		t.Fatalf("a swap whose successor never took over still answered swapping true: %+v", said)
	}
	if said.Waited == "" {
		t.Fatal("the answer does not say how long it waited for the successor")
	}
	if _, err := time.ParseDuration(said.Waited); err != nil {
		t.Fatalf("the waited field is no duration a reader can compare: %q", said.Waited)
	}
	if !strings.Contains(said.Says, "old-build") || !strings.Contains(said.Says, "new-build") {
		t.Fatalf("the answer names neither the build that stayed nor the one that did not arrive: %q", said.Says)
	}

	// AND THE OTHER HALF, so this is not a door that always says no. A
	// successor that does take over is read as having taken over, and the
	// answer still says how long the caller waited.
	SayRunning(r, Running{PID: os.Getpid(), Build: "new-build", Started: now(), Beat: now()})
	landed := afterTheAnswer(r, told, 150*time.Millisecond, 10*time.Millisecond)
	if !landed.Swapping {
		t.Fatalf("a successor that took over was answered as a swap that did not land: %+v", landed)
	}
	if landed.Waited == "" {
		t.Fatal("a swap that landed does not say how long it waited either")
	}

	// AND AN ANSWER THAT WAS NEVER A HANDOVER IS LEFT ALONE. The engine
	// refusing to swap names no build, and there is nothing to watch for.
	if quiet := afterTheAnswer(r, swapAnswer{}, 150*time.Millisecond, 10*time.Millisecond); quiet.Waited != "" {
		t.Fatalf("an answer that promised no handover was waited on anyway: %+v", quiet)
	}
}

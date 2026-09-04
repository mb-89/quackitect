package main

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
	"time"
)

// US-7: PRESSING START WHILE AN ENGINE RUNS ATTACHES TO IT.
//
// The editor checked before starting one, and a cloud session has no editor.
// So the engine answers the question itself, and answers it in the shape a
// starting engine uses, because a caller reads one shape.
func TestAskingForAnEngineWhileOneRunsAttachesToIt(t *testing.T) {
	t.Parallel()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}

	if _, yes := AlreadyHere(r); yes {
		t.Fatal("it attached to an engine that is not there")
	}

	SayRunning(r, Running{PID: os.Getpid(), Log: "the running log", Session: "20260831-000000"})
	line, yes := AlreadyHere(r)
	if !yes {
		t.Fatal("a live engine was not found")
	}
	var got map[string]any
	if err := json.Unmarshal([]byte(line), &got); err != nil {
		t.Fatalf("the answer is not readable JSON: %v", err)
	}
	if got["ready"] != true || got["attached"] != true {
		t.Fatalf("the answer does not say it attached: %s", line)
	}
	if got["log"] != "the running log" || got["session"] != "20260831-000000" {
		t.Fatalf("the answer names something other than the running engine: %s", line)
	}
	if got["work_root"] != r.Work {
		t.Fatalf("the answer names the wrong folder: %s", line)
	}

	// A file left by an engine that was killed is not an engine, so asking
	// again starts one rather than attaching to nothing.
	SayRunning(r, Running{PID: 999999, Log: "gone", Session: "gone"})
	if _, yes := AlreadyHere(r); yes {
		t.Fatal("it attached to a process that is not there")
	}
}

// A PID NUMBER COMES BACK AROUND. Liveness read only the pid, and any process
// holding that number answers signal zero, so a reused number read as a live
// engine and the editor attached to nothing. The beat is the tell: an engine
// that stopped writing beats stopped.
func TestAStaleBeatReadsDead(t *testing.T) {
	t.Parallel()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	hourOld := time.Now().UTC().Add(-time.Hour).Format(time.RFC3339)
	SayRunning(r, Running{PID: os.Getpid(), Beat: hourOld})
	if _, up := LoadRunning(r); up {
		t.Fatal("an hour-old beat read as a live engine")
	}
	if _, why := loadRunning(r); !strings.Contains(why, "beat") {
		t.Fatalf("the refusal does not name the field that failed: %q", why)
	}
	// A FRESH BEAT IS AN ENGINE. The same process, saying so now, is alive.
	SayRunning(r, Running{PID: os.Getpid(), Beat: time.Now().UTC().Format(time.RFC3339)})
	if _, up := LoadRunning(r); !up {
		t.Fatal("a fresh beat read as dead")
	}
}

// THE RUN IDENTITY IS WHAT A NUMBER CANNOT BE: minted at start, never reused.
// A caller that remembers which run it attached to can tell a successor or a
// squatter from the engine it knew.
func TestARunIdentityTellsEnginesApart(t *testing.T) {
	t.Parallel()
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}
	SayRunning(r, Running{PID: os.Getpid(), Run: "run-abc",
		Beat: time.Now().UTC().Format(time.RFC3339)})
	if !SameRun(r, "run-abc") {
		t.Fatal("the engine's own run identity was refused")
	}
	if SameRun(r, "run-xyz") {
		t.Fatal("a mismatched run identity was accepted")
	}
}

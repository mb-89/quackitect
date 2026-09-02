package main

import (
	"encoding/json"
	"os"
	"testing"
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

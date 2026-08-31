package main

import (
	"encoding/json"
	"os"
	"testing"
)

// A FILE IS NOT A PROCESS. An engine that was killed leaves its file behind,
// and a reader that trusted the file would attach to nothing.
func TestWhatIsRunningIsCheckedAndNotTrusted(t *testing.T) {
	r := Roots{Method: t.TempDir(), Work: t.TempDir()}

	if _, ok := LoadRunning(r); ok {
		t.Fatal("it found an engine with no file")
	}

	// This process is alive, so it stands in for one.
	SayRunning(r, Running{PID: os.Getpid(), Log: "somewhere", Session: "now"})
	got, ok := LoadRunning(r)
	if !ok || got.Session != "now" {
		t.Fatalf("a live engine did not come back: %+v %v", got, ok)
	}

	// A pid nothing answers to is not an engine, whatever the file says.
	SayRunning(r, Running{PID: 999999, Log: "somewhere", Session: "gone"})
	if _, ok := LoadRunning(r); ok {
		t.Fatal("a file naming a dead process was taken for an engine")
	}

	// And leaving on purpose takes the file with it.
	SayRunning(r, Running{PID: os.Getpid()})
	StopSaying(r)
	if _, ok := LoadRunning(r); ok {
		t.Fatal("the file outlived the engine that said it was there")
	}
}

// US-7: PRESSING START WHILE AN ENGINE RUNS ATTACHES TO IT.
//
// The editor checked before starting one, and a cloud session has no editor.
// So the engine answers the question itself, and answers it in the shape a
// starting engine uses, because a caller reads one shape.
func TestAskingForAnEngineWhileOneRunsAttachesToIt(t *testing.T) {
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

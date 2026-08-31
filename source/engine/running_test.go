package main

import (
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

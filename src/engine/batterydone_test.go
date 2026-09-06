package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A BATTERY ANSWERS WHEN IT HAS FINISHED, NEVER WHEN IT HAS STARTED.
//
// startBattery set OK true the moment the process started, and again where one
// was merely already going. Nothing in it read the result. tests.go builds
// out.OK from those entries, so a whole-battery se test answered ok before a
// single test had run.
//
// THE BATTERY CANNOT BE AWAITED, and that is not what this asks for. It builds
// the engine and replaces the one that started it, so waiting for it is waiting
// inside the process it replaces. What it must not do is call a run that has
// not happened a pass.
//
// SO THERE ARE THREE ANSWERS, NOT TWO. Passed, failed, and still going. Only
// the first is ok.

// aBatteryMarkerFor writes the marker and its output file, as a run that has
// already ended would have left them.
func aBatteryMarkerFor(t *testing.T, r Roots, pid int, said string) string {
	t.Helper()
	if err := os.MkdirAll(batteryDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	out := filepath.Join(batteryDir(r), "battery-test.out")
	if err := os.WriteFile(out, []byte(said), 0o644); err != nil {
		t.Fatal(err)
	}
	b, err := json.MarshalIndent(aBatteryRunning{
		Started: time.Now().UTC().Format(time.RFC3339), Out: out, PID: pid}, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(batteryMarker(r), b, 0o644); err != nil {
		t.Fatal(err)
	}
	return out
}

func TestABatteryAnswersOnDoneAndNotOnStart(t *testing.T) {
	t.Parallel()

	// A RUN THAT FINISHED WITH NOTHING FAILED IS THE ONLY OK.
	t.Run("finished and passed", func(t *testing.T) {
		t.Parallel()
		r := aTreeWithTheProcesses(t)
		aBatteryMarkerFor(t, r, 0, "a check ran\n0 failed in 91s\n")
		got := startBattery(t.Context(), r, "main", "wk-1111111111")
		if !got.OK {
			t.Errorf("a battery that finished with none failed did not answer ok: %s", got.Said)
		}
		if !strings.Contains(got.Said, "0 failed") {
			t.Errorf("the answer does not carry the battery's own verdict: %s", got.Said)
		}
	})

	// A RUN THAT FINISHED WITH FAILURES IS NOT OK, AND SAYS HOW MANY.
	t.Run("finished and failed", func(t *testing.T) {
		t.Parallel()
		r := aTreeWithTheProcesses(t)
		aBatteryMarkerFor(t, r, 0, "a check ran\n3 failed in 91s\n")
		got := startBattery(t.Context(), r, "main", "wk-1111111111")
		if got.OK {
			t.Errorf("a battery that finished with 3 failed answered ok: %s", got.Said)
		}
		if !strings.Contains(got.Said, "3 failed") {
			t.Errorf("the answer does not carry the battery's own verdict: %s", got.Said)
		}
	})

	// A RUN STILL GOING IS NOT OK. It is not a failure either, and the answer
	// says which, so nobody reads a start as a pass.
	t.Run("still going", func(t *testing.T) {
		t.Parallel()
		r := aTreeWithTheProcesses(t)
		aBatteryMarkerFor(t, r, os.Getpid(), "a check ran\n")
		got := startBattery(t.Context(), r, "main", "wk-1111111111")
		if got.OK {
			t.Errorf("a battery still going answered ok: %s", got.Said)
		}
		if !got.Pending {
			t.Errorf("a battery still going does not say so, so it reads as a failure: %s", got.Said)
		}
	})
}

// AND se test OVER A WHOLE BATTERY DOES NOT ANSWER OK BEFORE IT HAS FINISHED.
//
// This is the one an agent reads. out.OK is built from the entries, so a
// battery that answered ok on start made the whole run answer ok on start.
func TestAWholeBatteryRunIsNotOkUntilItHasFinished(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	aBatteryMarkerFor(t, r, os.Getpid(), "a check ran\n")

	got := startBattery(t.Context(), r, "main", "wk-1111111111")
	if okOf([]ran{got}) {
		t.Errorf("a run carrying a battery that has not finished answers ok: %s", got.Said)
	}
}

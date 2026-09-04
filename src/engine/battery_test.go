package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// THE BATTERY RUNS OUTSIDE THE ENGINE, AND THE NEXT ENGINE REPORTS IT.
//
// se test with a whole ruling ran the battery inside the engine and waited for
// it. The battery replaces the engine, so the process hosting the run was the
// process the run replaced: the call was severed and the answer never came
// back. Three runs went that way in one afternoon and none of them reached the
// record.
//
// So the engine starts it, writes down that it is going, and answers at once
// with where the answer will be. The next engine to start reads the outcome and
// puts it in the record, because by then it is the only thing left that can.
func TestTheBatteryRunsOutsideTheEngine(t *testing.T) {
	r := aTreeWithABattery(t)

	got := startBattery(r, "worker-one", "wk-1")
	if !got.OK {
		t.Fatalf("the battery did not start: %s", got.Said)
	}
	// IT ANSWERED WITHOUT WAITING. The battery this tree carries writes a
	// verdict and exits; what matters here is that the answer names where the
	// result lands rather than carrying the result.
	if !strings.Contains(got.Said, "outside this engine") {
		t.Fatalf("the answer does not say the battery runs outside the engine: %s", got.Said)
	}
	going, ok := batteryGoing(r)
	if !ok {
		t.Fatal("nothing was written down, so the next engine has no way to know a battery ran")
	}
	if going.Actor != "worker-one" || going.Token != "wk-1" {
		t.Fatalf("the run was written down as %q on %q, not as the actor and token that asked",
			going.Actor, going.Token)
	}

	// THE OUTCOME LANDS IN THE RECORD. Wait for the run itself to finish, then
	// start the engine's own reporting the way a start does.
	waitForTheBattery(t, going)

	dir := r.Private("log")
	log, err := OpenLog(dir)
	if err != nil {
		t.Fatal(err)
	}
	RecordFinishedBattery(r, log)
	if err := log.Close(); err != nil {
		t.Fatal(err)
	}
	said, err := os.ReadFile(filepath.Join(dir, Current))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(said), "the battery that ran outside this engine has finished") {
		t.Fatalf("the outcome is not in the record, so a run nobody waited for is a run nobody hears about:\n%s", said)
	}
	// AND THE MARKER IS CLEARED, so the next start does not report it twice.
	if _, still := batteryGoing(r); still {
		t.Fatal("the marker survived being reported, so every start would report the same run again")
	}
}

// A battery that answers the way the real one does: a verdict on its last line.
func aTreeWithABattery(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	checks := filepath.Join(root, "util", "checks")
	if err := os.MkdirAll(checks, 0o755); err != nil {
		t.Fatal(err)
	}
	script := "#!/bin/sh\necho 'go build         ok    1s'\necho '0 failed, 1s wall clock'\n"
	if err := os.WriteFile(filepath.Join(checks, "battery.sh"), []byte(script), 0o755); err != nil {
		t.Fatal(err)
	}
	if sh, _ := batteryShell(r); sh == "" {
		t.Skip("no shell on this machine, so the battery cannot be started here")
	}
	return r
}

// waitForTheBattery waits for the started run to finish. It is the one wait in
// this file, and it is on a process this test started rather than on a clock.
func waitForTheBattery(t *testing.T, going aBatteryRunning) {
	t.Helper()
	for i := 0; i < 300; i++ {
		if !stillRunning(going.PID) {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal("the battery this test started has not finished")
}

// THE VERDICT IS THE BATTERY'S OWN LAST LINE, and it is read rather than
// guessed at from an exit code that is gone by the time anybody looks.
func TestTheBatterysVerdictIsItsLastLine(t *testing.T) {
	for _, c := range []struct {
		said string
		pass bool
	}{
		{"go build ok\n0 failed, 148s wall clock\n", true},
		{"go build ok\n11 failed, 148s wall clock\n", false},
		{"0 failed, 3s wall clock\n\n\n", true},
		{"panic: it never got there\n", false},
		{"", false},
	} {
		if got := batteryPassed(c.said); got != c.pass {
			t.Fatalf("batteryPassed(%q) = %v, wanted %v", c.said, got, c.pass)
		}
	}
}

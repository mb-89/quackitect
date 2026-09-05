package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"strconv"
	"strings"
	"testing"
	"time"
)

// A BATTERY THAT HAS ENDED DOES NOT STOP THE NEXT ONE.
//
// The engine starts the battery as its own child and never waits on it, so the
// shell that ran it stays a zombie for as long as the engine lives, and the
// liveness probe counts a zombie as running. Measured on a cloud box: a run
// that ended at 10:39 was "still going" at 11:03, its pid a defunct sh, and
// every se_test that owed a battery ran nothing.
func TestAStaleBatteryMarkerDoesNotStopTheNextBattery(t *testing.T) {
	if _, err := os.Stat("/proc/self"); err != nil {
		t.Skip("a zombie is read off /proc, and this machine has none")
	}
	r := aTreeWithABattery(t)

	// A ZOMBIE: a child that has exited and nobody has waited on.
	gone := exec.Command("sh", "-c", "exit 0")
	if err := gone.Start(); err != nil {
		t.Fatal(err)
	}
	zombie := gone.Process.Pid
	until(t, func() bool { return isZombie(zombie) }, "the child did not become a zombie")
	defer gone.Wait()

	marker := aBatteryRunning{Started: "2026-09-05T10:37:19Z", Out: r.Private("tests", "old.out"), PID: zombie}
	if err := os.MkdirAll(batteryDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	b, _ := json.Marshal(marker)
	if err := os.WriteFile(batteryMarker(r), b, 0o644); err != nil {
		t.Fatal(err)
	}

	got := startBattery(r, "worker-one", "wk-1")
	if strings.Contains(got.Said, "still going") {
		t.Fatalf("a zombie held the battery: %s", got.Said)
	}
	if !strings.Contains(got.Said, "outside this engine") {
		t.Fatalf("the next battery did not start: %s", got.Said)
	}

	// AND THE ONE IT STARTED IS REAPED WHEN IT ENDS, so it is not the next
	// zombie. Nothing here waits on it: the engine does.
	going, ok := batteryGoing(r)
	if !ok {
		t.Fatal("the new run was not written down")
	}
	until(t, func() bool { _, err := os.Stat("/proc/" + strconv.Itoa(going.PID)); return err != nil },
		"the battery's shell was never reaped, so it is a zombie the engine will count as running")
}

// isZombie reads the state letter off /proc/<pid>/stat.
func isZombie(pid int) bool {
	b, err := os.ReadFile("/proc/" + strconv.Itoa(pid) + "/stat")
	if err != nil {
		return false
	}
	after := string(b)[strings.LastIndexByte(string(b), ')')+1:]
	return strings.HasPrefix(strings.TrimSpace(after), "Z")
}

// until polls a condition about a process this test started. It is bounded by
// attempts on that process's state rather than by a clock.
func until(t *testing.T, ok func() bool, orElse string) {
	t.Helper()
	for i := 0; i < 500; i++ {
		if ok() {
			return
		}
		time.Sleep(10 * time.Millisecond)
	}
	t.Fatal(orElse)
}

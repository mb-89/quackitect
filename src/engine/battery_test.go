package main

import (
	"os"
	"path/filepath"
	"quackitect/engine/internal/sessionlog"
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

	// STARTING IS NOT PASSING. The run has not happened, so the answer is
	// pending: neither a pass nor a failure. A caller gating on ok gates on
	// the outcome, and so does this test.
	got := startBattery(t.Context(), r, "worker-one", "wk-1")
	if !got.Pending {
		t.Fatalf("a started battery did not answer pending: %s", got.Said)
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
	log, err := sessionlog.Open(dir)
	if err != nil {
		t.Fatal(err)
	}
	RecordFinishedBattery(r, log)
	if err := log.Close(); err != nil {
		t.Fatal(err)
	}
	said, err := os.ReadFile(filepath.Join(dir, sessionlog.Current))
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
	// AND THE GREEN CASE IS THE SCRIPT'S OWN LINE, NOT ONE TYPED HERE.
	for _, said := range theBatterysVerdicts(t) {
		if !batteryPassed(said + "\n") {
			t.Fatalf("util/checks/battery.sh prints %q with nothing failed, and batteryPassed calls it a failure, so every green battery reaches the record as not ok", said)
		}
	}
}

// theBatterysVerdicts answers every line util/checks/battery.sh can print as its
// verdict, with nothing failed and the wall clock filled in.
//
// IT READS THE SCRIPT RATHER THAN A COPY OF IT. The table above was written from
// the reader's side. batteryPassed wanted a last line starting "0 failed" and
// the script printed "all ok" when nothing had failed, so RecordFinishedBattery
// wrote every passing battery into the record as not ok while both sides stayed
// green.
//
// AND IT IS THE SET RATHER THAN ONE MEMBER, because a second spelling of the
// verdict is how the two came apart. It refuses when the script prints none.
func theBatterysVerdicts(t *testing.T) []string {
	t.Helper()
	said, err := os.ReadFile(filepath.Join("..", "..", "util", "checks", "battery.sh"))
	if err != nil {
		t.Fatal(err)
	}
	var out []string
	for _, line := range strings.Split(string(said), "\n") {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(line, `echo "`) || !strings.Contains(line, "wall clock") {
			continue
		}
		verdict := strings.TrimSuffix(strings.TrimPrefix(line, `echo "`), `"`)
		verdict = strings.ReplaceAll(verdict, "$bad", "0")
		out = append(out, strings.ReplaceAll(verdict, "${took}", "3"))
	}
	if len(out) == 0 {
		t.Fatal("util/checks/battery.sh prints no verdict naming its wall clock, so nothing holds the script and batteryPassed in step")
	}
	return out
}

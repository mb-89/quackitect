package main

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// THE BATTERY RUNS OUTSIDE THE ENGINE, BECAUSE IT REPLACES THE ENGINE.
//
// se test with a whole ruling used to run the battery inside the engine and
// wait for it. The battery builds the engine and puts a new one over this tree,
// so the process hosting the run was the process the run replaced: the call was
// severed, the answer never came back, and the agent that asked read a window
// that started over. Three runs went that way in one afternoon, unrecorded.
//
// SO IT IS STARTED AND NOT AWAITED. The engine writes down that a battery is
// going, starts it detached with its output to a file, and answers at once with
// where the answer will be. The battery is then free to swap the engine under
// itself, because nothing it needs is in the process it replaced.
//
// AND THE NEXT ENGINE READS THE RESULT. A run that finished while no engine was
// up, or under the engine it replaced, is picked up at the next start and put in
// the record, so an outcome nobody was waiting for is still an outcome the log
// carries.

// batteryDir is where a run's marker and its output live.
func batteryDir(r Roots) string { return r.Private("tests") }

// batteryMarker is the note saying a battery is going, and where its output is.
func batteryMarker(r Roots) string { return filepath.Join(batteryDir(r), "battery.running") }

// aBatteryRunning is what the engine writes down when it starts one, and reads
// back at the next start to see how it went.
type aBatteryRunning struct {
	Started string `json:"started"`
	Out     string `json:"out"`
	PID     int    `json:"pid"`
	Build   string `json:"build"` // the engine that started it
	Actor   string `json:"actor"`
	Token   string `json:"token,omitempty"`
}

// startBattery starts the whole battery detached and answers where its output
// will be. It waits for nothing.
func startBattery(r Roots, actor, token string) ran {
	sh, looked := batteryShell(r)
	if sh == "" {
		return ran{ID: "battery", Kind: "battery", Said: "no sh on this machine, so the battery cannot run. Looked at: " +
			strings.Join(looked, ", ")}
	}
	if err := os.MkdirAll(batteryDir(r), 0o755); err != nil {
		return ran{ID: "battery", Kind: "battery", Said: "the battery has nowhere to write: " + err.Error()}
	}
	// A RUN ALREADY GOING IS NOT STARTED TWICE. Two batteries over one tree
	// build the same binary over each other and neither answer means anything.
	if was, ok := batteryGoing(r); ok && stillRunning(was.PID) {
		return ran{ID: "battery", Kind: "battery", OK: true,
			Said: "a battery started at " + was.Started + " is still going. Its answer lands in " + was.Out}
	}
	stamp := time.Now().UTC().Format("20060102-150405")
	outPath := filepath.Join(batteryDir(r), "battery-"+stamp+".out")
	out, err := os.Create(outPath)
	if err != nil {
		return ran{ID: "battery", Kind: "battery", Said: "the battery's output file could not be made: " + err.Error()}
	}
	defer out.Close()
	cmd := Detached(Quietly(exec.Command(sh, filepath.Join(r.Method, "util", "checks", "battery.sh"))))
	cmd.Dir = r.Method
	cmd.Env = buildEnv()
	cmd.Stdout, cmd.Stderr = out, out
	if err := cmd.Start(); err != nil {
		return ran{ID: "battery", Kind: "battery", Said: "the battery would not start: " + err.Error()}
	}
	going := aBatteryRunning{Started: time.Now().UTC().Format(time.RFC3339), Out: outPath,
		PID: cmd.Process.Pid, Build: Build, Actor: actor, Token: token}
	if b, err := json.MarshalIndent(going, "", "  "); err == nil {
		_ = writeAtomic(batteryMarker(r), b, 0o644) // a marker it cannot write is a run the next engine does not report
	}
	_ = cmd.Process.Release() // it is its own process now, and it outlives this one
	return ran{ID: "battery", Kind: "battery", OK: true,
		Said: "the battery is running outside this engine, because it replaces it. " +
			"Its answer lands in " + outPath + ", and the next engine puts the outcome in the record."}
}

// batteryGoing answers the run the marker names, if there is one.
func batteryGoing(r Roots) (aBatteryRunning, bool) {
	b, err := os.ReadFile(batteryMarker(r))
	if err != nil {
		return aBatteryRunning{}, false
	}
	var was aBatteryRunning
	if err := json.Unmarshal(b, &was); err != nil {
		return aBatteryRunning{}, false
	}
	return was, was.Out != ""
}

// stillRunning answers whether that process is still there. A pid nothing
// answers for is a run that has ended, one way or another.
func stillRunning(pid int) bool { return pid > 0 && alive(pid) }

// RecordFinishedBattery puts the outcome of a battery that ran outside the
// engine into the record, and clears the marker. It is called at every start,
// because the run it reports on is usually the one that replaced the engine
// that started it.
func RecordFinishedBattery(r Roots, log *Log) {
	was, ok := batteryGoing(r)
	if !ok {
		return
	}
	if stillRunning(was.PID) {
		return // it is this tree's business again at the next start
	}
	said, err := os.ReadFile(was.Out)
	if err != nil {
		log.Write("engine", "test", "engine", "a battery ran and its output cannot be read", No(),
			map[string]any{"out": was.Out, "reason": err.Error()})
		_ = os.Remove(batteryMarker(r))
		return
	}
	// THE LAST LINE IS THE VERDICT. The battery prints "N failed" and its wall
	// clock there, so the outcome is read off what it says rather than from an
	// exit code no longer anywhere to be found.
	tail := tailOf(string(said), 4000)
	passed := batteryPassed(string(said))
	log.Write("engine", "test", orElse(was.Actor, "engine"),
		"the battery that ran outside this engine has finished", &passed,
		map[string]any{"started": was.Started, "out": was.Out, "token": was.Token,
			"started_by": was.Build, "says": lastLine(string(said)), "tail": tail})
	_ = os.Remove(batteryMarker(r))
}

// batteryPassed reads the battery's own verdict line.
func batteryPassed(said string) bool {
	return strings.HasPrefix(lastLine(said), "0 failed")
}

// lastLine is the last line with anything on it.
func lastLine(s string) string {
	lines := strings.Split(strings.ReplaceAll(s, "\r\n", "\n"), "\n")
	for i := len(lines) - 1; i >= 0; i-- {
		if t := strings.TrimSpace(lines[i]); t != "" {
			return t
		}
	}
	return ""
}

// A BATTERY RUN BY HAND IS ALREADY REFUSED. battery.sh lives under util/checks,
// which ATestRunByHand names, so there is no second rule here.

package main

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

// THE ENGINE IS THE ONE DOOR TO ITS OWN REPLACEMENT.
//
// Windows locks a running program, so replacing the engine was a ritual: stop
// it, build, start it again, and hope nobody was mid-call. Two agents doing
// that at once rotated the log away from each other, severed in-flight socket
// calls, and made a test suite impossible to finish. The ritual was typed by
// hand thirty-four times in one day.
//
// SO THE ENGINE DOES IT, because it is the only party that knows what is in
// flight. A caller asks. The engine builds the next binary beside the current
// one, checks the new one answers for itself, waits for the calls in flight to
// finish, records the swap, puts the new program in place and hands over to a
// process of its own. The successor continues the same log session rather than
// retiring it, so a person watching the log sees a swap rather than a restart.
//
// A BUILD THAT DOES NOT ANSWER IS NOT INSTALLED. The next binary is built to a
// name of its own and only moves into place once it has answered --version, so
// a tree whose source does not compile keeps the engine it has.

// swapDrainBudget is how long the engine waits for the calls in flight to
// finish before it hands over anyway. A verb may run a test suite, so this is
// generous; past it, a call that has not come back is one whose client has
// almost certainly gone.
const swapDrainBudget = 90 * time.Second

// swapVerifyBudget is how long the new binary has to answer for itself.
const swapVerifyBudget = 30 * time.Second

// swapPlan is a built and verified binary waiting to take over.
//
// Next is empty when the program in .bin is already the one to run. The battery
// builds the engine itself, because building it is one of the things it checks,
// and then asks the engine to hand over to what it built rather than to build a
// second copy under a second stamp.
type swapPlan struct {
	Next  string // the new program, not yet in place, or empty for the one on disk
	Build string // the stamp it answers for
	Why   string // who asked, and what for
}

// buildStamp is the name a build is known by: the commit it came from and the
// time it was made.
//
// THE TIME IS PART OF IT. It was the commit alone, and a tree with uncommitted
// work built the same stamp every time, so an engine on the old code read as
// current and ran the old verbs against the new tree.
func buildStamp(method string) string {
	commit := "nogit"
	out, err := Quietly(exec.Command("git", "-C", method, "rev-parse", "--short", "HEAD")).Output()
	if err == nil {
		if s := strings.TrimSpace(string(out)); s != "" {
			commit = s
		}
	}
	return commit + "." + time.Now().Format("150405")
}

// buildNext builds the engine to a name of its own and answers where it is.
//
// IT IS NOT THE RUNNING NAME. Building over the program that is running fails
// on Windows and, where it does not, replaces a binary other processes are
// still reading. The move is a separate act, and it happens only after this
// one has answered.
func buildNext(r Roots, stamp string) (string, error) {
	next := filepath.Join(r.Method, ".bin", exeName("se.next"))
	_ = os.Remove(next) // whatever a failed swap left behind
	// -gcflags=-e LIFTS THE ERROR CAP, so a sweep of undefined symbols comes
	// back in one round rather than a batch at a time.
	cmd := Quietly(exec.Command("go", "build", "-C", filepath.Join(r.Method, "src", "engine"),
		"-gcflags=-e", "-ldflags", "-X main.Build="+stamp, "-o", next, "."))
	cmd.Dir = r.Method
	cmd.Env = buildEnv()
	if said, err := cmd.CombinedOutput(); err != nil {
		return "", fmt.Errorf("the next engine did not build, so this one stays: %s", tailOf(string(said), 2000))
	}
	return next, nil
}

// answersForItself runs a binary and answers which build it says it is. A
// program that will not start, or will not say, is not one to hand a tree to.
func answersForItself(exe string) (string, error) {
	cmd := Quietly(exec.Command(exe, "--version"))
	var said []byte
	done := make(chan error, 1)
	go func() {
		var err error
		said, err = cmd.Output()
		done <- err
	}()
	select {
	case err := <-done:
		if err != nil {
			return "", fmt.Errorf("it did not answer --version: %w", err)
		}
	case <-time.After(swapVerifyBudget):
		return "", fmt.Errorf("it did not answer --version within %s", swapVerifyBudget)
	}
	// "quackitect engine <stamp>", which is what --version prints.
	f := strings.Fields(strings.TrimSpace(string(said)))
	if len(f) == 0 {
		return "", fmt.Errorf("it answered --version with nothing")
	}
	return f[len(f)-1], nil
}

// planSwap gets the next engine ready. It changes nothing that is running, so
// it is safe to do while the engine answers calls.
//
// A TREE WHOSE SOURCE WILL NOT COMPILE KEEPS THE ENGINE IT HAS, because the
// build happens here and the handover only happens after it answered.
func planSwap(r Roots, why string, built bool) (swapPlan, error) {
	if built {
		// THE PROGRAM ON DISK IS THE ONE TO RUN. The battery has already built
		// it, and building it again would put a second stamp on the same code.
		live := filepath.Join(r.Method, ".bin", exeName("se"))
		stamp, err := answersForItself(live)
		if err != nil {
			return swapPlan{}, fmt.Errorf("the program in .bin is not one to hand over to: %w", err)
		}
		if stamp == Build {
			return swapPlan{}, fmt.Errorf("the program on disk is this same build, %s, "+
				"so there is nothing to hand over to", Build)
		}
		return swapPlan{Build: stamp, Why: why}, nil
	}
	stamp := buildStamp(r.Method)
	next, err := buildNext(r, stamp)
	if err != nil {
		return swapPlan{}, err
	}
	if _, err := answersForItself(next); err != nil {
		_ = os.Remove(next)
		return swapPlan{}, fmt.Errorf("the next engine built and %w, so this one stays", err)
	}
	return swapPlan{Next: next, Build: stamp, Why: why}, nil
}

// drainCalls waits for the calls in flight to finish. It answers how many were
// still running when it gave up, so the record says whether anything was cut.
func drainCalls(budget time.Duration) int64 {
	deadline := time.Now().Add(budget)
	for time.Now().Before(deadline) {
		if n := theLoad.verbsInFlight.Load(); n == 0 {
			return 0
		}
		time.Sleep(50 * time.Millisecond)
	}
	return theLoad.verbsInFlight.Load()
}

// putInPlace moves the built engine over the running name and gives it both
// its names again.
//
// THE OLD ONE IS MOVED ASIDE RATHER THAN DELETED. Windows allows a running
// program to be renamed and refuses to have it overwritten, so the processes
// still reading it go on reading the moved file and the next one to start
// takes the new one.
func putInPlace(r Roots, next string) error {
	if next == "" {
		return nil // the program on disk is already the one to run
	}
	live := filepath.Join(r.Method, ".bin", exeName("se"))
	aside := live + ".was"
	if _, err := os.Stat(live); err == nil {
		_ = os.Remove(aside) // the one a previous swap moved aside
		if err := os.Rename(live, aside); err != nil {
			return fmt.Errorf("the running engine could not be moved aside: %w", err)
		}
	}
	if err := os.Rename(next, live); err != nil {
		return fmt.Errorf("the next engine could not be put in place: %w", err)
	}
	// TWO NAMES, ONE FILE. The cage names .bin/se with no extension because it
	// travels, and on Windows the engine is se.exe. A build that replaces one
	// and leaves the other pointing at what was there before is how every hook
	// in the cage stops firing with nothing to say why.
	if _, err := LinkBothNames(r.Method, []string{"se", "se-mcp", "logview"}); err != nil {
		return fmt.Errorf("the engine could not be given both its names: %w", err)
	}
	return nil
}

// handOver starts the successor over the same tree and tells it which log
// session it is continuing.
func handOver(r Roots, session string) error {
	exe := filepath.Join(r.Method, ".bin", exeName("se"))
	out, err := os.OpenFile(r.Private("engine.out"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer out.Close()
	cmd := Detached(Quietly(exec.Command(exe, "--work", r.Work, "--method", r.Method)))
	// THE SESSION RIDES OUT OF BAND. A swap is one session with two processes
	// in it, and retiring the log at the handover would split the record of one
	// stretch of work in half at a moment nobody chose.
	cmd.Env = append(os.Environ(), sessionVar+"="+session)
	cmd.Stdout, cmd.Stderr = out, out
	if err := cmd.Start(); err != nil {
		return err
	}
	return cmd.Process.Release() // it is its own process now
}

// ABuildRunByHand answers why a command that builds into this tree's .bin is
// refused, and whether it is.
//
// A BARE go build -o .bin/se.exe UNDER A LIVE ENGINE is what this refuses. On
// Windows it fails, because the program is running. Where it does not fail it
// leaves the engine that is answering and the program on disk as two different
// builds, with nothing saying so: an agent then reads one and the guard runs
// the other. The engine has a door for exactly this, and the refusal names it.
//
// OUTSIDE THIS TREE A BUILD IS THE AGENT'S OWN, the same way a test is.
func ABuildRunByHand(command, method string) (string, bool) {
	for _, part := range pipeline(command) {
		words := strings.Fields(part)
		builds := false
		for i, w := range words {
			head := strings.ToLower(strings.TrimSuffix(filepath.Base(strings.Trim(w, `"'`)), ".exe"))
			if head == "go" && i+1 < len(words) && (words[i+1] == "build" || words[i+1] == "install") {
				builds = true
			}
		}
		if !builds {
			continue
		}
		for _, w := range words {
			w = filepath.ToSlash(strings.Trim(w, `"'`))
			if !strings.Contains(w, ".bin/") {
				continue
			}
			if !anyInside([]string{w}, method) {
				continue
			}
			return "THE ENGINE IS THE ONE DOOR TO ITS OWN REPLACEMENT. Building over .bin while an " +
				"engine is running leaves the program answering your calls and the program on disk as two " +
				"different builds, and nothing says which one you are reading.\n\n" +
				TheBuildDoor + " builds the next engine, checks it answers, waits for the calls in flight, " +
				"and hands over keeping the log session.\n\n" +
				"What was run: " + strings.TrimSpace(part) + "\n\n" +
				"OUTSIDE THIS TREE a build is yours to run.", true
		}
	}
	return "", false
}

// TheBuildDoor is what a refused build is told to use.
const TheBuildDoor = "se --swap"

// swapAnswer is what the caller is told, whether or not the handover happens
// after the answer has gone.
type swapAnswer struct {
	Swapping bool   `json:"swapping"`
	Build    string `json:"build,omitempty"`
	From     string `json:"from,omitempty"`
	Says     string `json:"says,omitempty"`
}

// askForASwap asks the engine over this folder to replace itself, and answers
// what it said.
func askForASwap(r Roots, why string, built bool) (swapAnswer, error) {
	raw, _, ok := askModelWithin(r, "swap", map[string]any{"why": why, "built": built},
		swapDrainBudget+swapVerifyBudget)
	if !ok {
		return swapAnswer{}, fmt.Errorf("no engine is running over %s, so there is nothing to swap. "+
			"Build it the way the installer does: util/setup", r.Work)
	}
	var a swapAnswer
	if err := json.Unmarshal(raw, &a); err != nil {
		return swapAnswer{}, err
	}
	return a, nil
}

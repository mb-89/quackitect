package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"quackitect/engine/internal/quiet"
	"quackitect/engine/internal/replaced"
	"quackitect/engine/internal/version"
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
	out, err := quiet.Quietly(exec.Command("git", "-C", method, "rev-parse", "--short", "HEAD")).Output()
	if err == nil {
		if s := strings.TrimSpace(string(out)); s != "" {
			commit = s
		}
	}
	return commit + "." + time.Now().Format("150405")
}

// engineSource is the folder the engine itself is built from. Every program
// the manifest names is built by a swap, and this is the one it hands over to.
const engineSource = "src/engine"

// manifestBuild is one program this tree ships: its name in .bin and the folder
// it comes from.
type manifestBuild struct {
	Name   string `json:"name"`
	Source string `json:"source"`
}

// theBuilds answers every program the tree ships, read from the file the
// installer builds from, so the install door and the swap door cannot disagree
// about what .bin holds.
//
// MEASURED. The swap built src/engine alone while the installer built three, so
// .bin was half new after one. .bin/se.exe was written at 13:16 and
// .bin/se-mcp.exe at 10:45 with src/mcp changed between them, and the standing
// check for the lane drove that older program and passed on code that was not
// in the tree. A swap also makes .bin/se the newest thing under the source
// folders, which is what RUNME compares against, so nothing rebuilt the stale
// lane either.
//
// A TREE WITH NO MANIFEST STILL SWAPS. The engine is the one program a swap
// must have, and a file that will not read is no reason to leave a person with
// no way to replace it.
func theBuilds(method string) []manifestBuild {
	only := []manifestBuild{{Name: "se", Source: engineSource}}
	b, err := os.ReadFile(filepath.Join(method, "util", "setup", "manifest.json"))
	if err != nil {
		return only
	}
	var read struct {
		Builds []manifestBuild `json:"builds"`
	}
	if err := json.Unmarshal(b, &read); err != nil {
		return only
	}
	var out []manifestBuild
	for _, one := range read.Builds {
		if one.Name != "" && one.Source != "" {
			out = append(out, one)
		}
	}
	if len(out) == 0 {
		return only
	}
	return out
}

// nextName is where a program is built before it is put in place. It is never
// the running name: building over a program that is running fails on Windows
// and, where it does not, replaces a file other processes are still reading.
func nextBinary(method, name string) string {
	return filepath.Join(method, ".bin", exeName(name+".next"))
}

// theEngine is the program a swap hands over to. Every program the manifest
// names is built and put in place, and this is the only one that is started,
// because it is the only one the engine is.
func engineAt(r Roots) string {
	return filepath.Join(r.Method, ".bin", exeName("se"))
}

// buildNext builds every program the tree ships, each to a name of its own,
// and answers where the next engine is.
//
// EVERY PROGRAM, BECAUSE .BIN IS ONE SET. Building the engine alone left the
// lane and the log window at whatever build they were, and the standing check
// for the lane then drove a binary that was not in the tree. The manifest is
// the one list, so the install door and this one cannot disagree.
//
// AND ONE THAT WILL NOT BUILD STOPS THE WHOLE SWAP, because a set half
// replaced is the defect this reads the manifest to end.
//
// IT IS NOT THE RUNNING NAME. Building over the program that is running fails
// on Windows and, where it does not, replaces a binary other processes are
// still reading. The move is a separate act, and it happens only after this
// one has answered.
func buildNext(r Roots, stamp string, build buildOne) (string, error) {
	engine := ""
	for _, one := range theBuilds(r.Method) {
		next := nextBinary(r.Method, one.Name)
		_ = os.Remove(next) // whatever a failed swap left behind
		if err := build(r, one, next, stamp); err != nil {
			dropNexts(r)
			return "", fmt.Errorf("%s did not build, so this engine stays: %w", one.Name, err)
		}
		if one.Source == engineSource {
			engine = next
		}
	}
	if engine == "" {
		dropNexts(r)
		return "", fmt.Errorf("nothing the manifest builds comes from %s, "+
			"so there is no next engine to hand over to", engineSource)
	}
	return engine, nil
}

// buildOne builds one program the manifest names, to the path it is given.
//
// IT IS HANDED IN. What a swap decides is which programs it builds and where
// each one goes, and asking that of three compilers is what testing rule 13
// names. The battery swaps on every run, so the real one is driven there.
type buildOne func(r Roots, one manifestBuild, next, stamp string) error

// goBuild is the real one.
func goBuild(r Roots, one manifestBuild, next, stamp string) error {
	// -gcflags=-e LIFTS THE ERROR CAP, so a sweep of undefined symbols comes
	// back in one round rather than a batch at a time.
	cmd := quiet.Quietly(exec.Command("go", "build", "-C", filepath.Join(r.Method, one.Source),
		"-gcflags=-e", "-ldflags", "-X quackitect/engine/internal/version.Build="+stamp, "-o", next, "."))
	cmd.Dir = r.Method
	cmd.Env = buildEnv()
	if said, err := cmd.CombinedOutput(); err != nil {
		return errors.New(tailOf(string(said), 2000))
	}
	return nil
}

// dropNexts takes away what a swap built and will not install, so the next one
// starts from nothing rather than from half a set.
func dropNexts(r Roots) {
	for _, one := range theBuilds(r.Method) {
		_ = os.Remove(nextBinary(r.Method, one.Name))
	}
}

// answersForItself runs a binary and answers which build it says it is. A
// program that will not start, or will not say, is not one to hand a tree to.
func answersForItself(exe string) (string, error) {
	cmd := quiet.Quietly(exec.Command(exe, "--version"))
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
		live := engineAt(r)
		stamp, err := answersForItself(live)
		if err != nil {
			return swapPlan{}, fmt.Errorf("the program in .bin is not one to hand over to: %w", err)
		}
		if stamp == version.Build {
			return swapPlan{}, fmt.Errorf("the program on disk is this same build, %s, "+
				"so there is nothing to hand over to", version.Build)
		}
		return swapPlan{Build: stamp, Why: why}, nil
	}
	stamp := buildStamp(r.Method)
	next, err := buildNext(r, stamp, goBuild)
	if err != nil {
		return swapPlan{}, err
	}
	if _, err := answersForItself(next); err != nil {
		dropNexts(r)
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

// putInPlace moves every program the swap built over its running name and
// gives each of them both its names again.
//
// THE ENGINE IS ONE OF THEM AND NOT ALL OF THEM. next says a swap is landing
// rather than which file moves: the set comes from the manifest, the same list
// the build read, so what lands is what was built.
//
// THE OLD ONE IS MOVED ASIDE RATHER THAN DELETED. Windows allows a running
// program to be renamed and refuses to have it overwritten, so the processes
// still reading it go on reading the moved file and the next one to start
// takes the new one.
func putInPlace(r Roots, next string) error {
	if next == "" {
		return nil // the program on disk is already the one to run
	}
	var names []string
	for _, one := range theBuilds(r.Method) {
		names = append(names, one.Name)
		built := nextBinary(r.Method, one.Name)
		if _, err := os.Stat(built); err != nil {
			continue // nothing was built under this name, so nothing moves
		}
		live := filepath.Join(r.Method, ".bin", exeName(one.Name))
		if _, err := os.Stat(live); err == nil {
			// IT GOES WHERE EVERY REPLACED PROGRAM GOES, which is .bin/was and
			// not beside the one that replaced it. See internal/replaced.
			if _, err := replaced.PutAside(r.Method, live); err != nil {
				return fmt.Errorf("the running %s could not be moved aside: %w", one.Name, err)
			}
		}
		if err := os.Rename(built, live); err != nil {
			return fmt.Errorf("the next %s could not be put in place: %w", one.Name, err)
		}
	}
	// TWO NAMES, ONE FILE. The cage names .bin/se with no extension because it
	// travels, and on Windows the engine is se.exe. A build that replaces one
	// and leaves the other pointing at what was there before is how every hook
	// in the cage stops firing with nothing to say why.
	if _, err := LinkBothNames(r.Method, names); err != nil {
		return fmt.Errorf("the engine could not be given both its names: %w", err)
	}
	return nil
}

// handOver starts the successor over the same tree and tells it which log
// session it is continuing.
//
// THE CONTEXT GOVERNS THE START AND NEVER THE CHILD. The successor is meant
// to outlive this engine, so it is not run under the context, which would
// kill it when this engine let go. An engine already ending starts no
// successor, and that is the whole of what the context decides here.
func handOver(ctx context.Context, r Roots, session string) error {
	if err := ctx.Err(); err != nil {
		return fmt.Errorf("this engine is ending, so it starts no successor: %w", err)
	}
	exe := engineAt(r)
	out, err := os.OpenFile(r.Private("engine.out"), os.O_CREATE|os.O_APPEND|os.O_WRONLY, 0o644)
	if err != nil {
		return err
	}
	defer out.Close()
	cmd := quiet.Detached(quiet.Quietly(exec.Command(exe, "--work", r.Work, "--method", r.Method)))
	// THE SESSION RIDES OUT OF BAND. A swap is one session with two processes
	// in it, and retiring the log at the handover would split the record of one
	// stretch of work in half at a moment nobody chose.
	cmd.Env = append(os.Environ(), sessionVar+"="+session)
	cmd.Stdout, cmd.Stderr = out, out
	// THE TREE IS LET GO OF FIRST, on purpose. A starting engine takes the
	// tree before anything else, and this one still holds it, so a successor
	// started while it is held would say already up and leave. A start that
	// fails takes the tree back, because then this engine goes on being it.
	LetGoOfTheTree()
	if err := cmd.Start(); err != nil {
		_, _ = HoldTheTree(r)
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
	raw, err := askModelForAnAnswer(r, "swap", map[string]any{"why": why, "built": built},
		swapDrainBudget+swapVerifyBudget)
	if errors.Is(err, ErrNoEngine) {
		return swapAnswer{}, fmt.Errorf("no engine is running over %s, so there is nothing to swap. "+
			"Build it the way the installer does: util/setup", r.Work)
	}
	if err != nil {
		// THE ENGINE'S OWN WORDS. It said what was wrong with the program it
		// was handed, and a caller told only that the swap failed would go
		// looking for an engine that is answering perfectly well.
		return swapAnswer{}, fmt.Errorf("the engine refused the swap: %w", err)
	}
	var a swapAnswer
	if err := json.Unmarshal(raw, &a); err != nil {
		return swapAnswer{}, err
	}
	return a, nil
}

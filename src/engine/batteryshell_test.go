package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// THE BATTERY IS A SHELL SCRIPT, AND THE SHELL IS ON THE MACHINE THAT SAID IT
// HAD NONE.
//
// se_test answered "no sh on this machine, so the battery cannot run" in a
// hundredth of a second, on a Windows box carrying two copies of sh, because
// the lookup was exec.LookPath and Windows does not put Git's shell on PATH.
// Every token whose delta touched util/checks then owed a battery that could
// not start, and a worker got ok: false for a change that was fine.
//
// THE PROBE ALREADY KNOWS. It found git and wrote down where it lives, and Git
// keeps its shell beside its git, so the shell is derived from that rather than
// hoped for on PATH, the way every other tool a command needs is resolved.
func TestTheBatteryFindsTheShellGitBrought(t *testing.T) {
	r := aTree(t).Roots
	root := r.Work

	// A Git install the shape the installer leaves: git in cmd, the shell in bin.
	git := filepath.Join(root, "Git", "cmd", "git.exe")
	sh := filepath.Join(root, "Git", "bin", "sh.exe")
	for _, p := range []string{git, sh} {
		if err := writeAtomic(p, []byte("MZ"), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	writeProbe(r, Probe{Session: "s", Found: []Tool{{Name: "git", Path: git}}})

	// AND NOTHING ON PATH, which is the machine this is about: the shell is
	// installed and PATH has never heard of it.
	t.Setenv("PATH", "")

	got, looked := batteryShell(r)
	if got != sh {
		t.Fatalf("the battery resolved %q where Git's shell is %q; it looked at %v", got, sh, looked)
	}
}

// AND IT DOES NOT ONLY RESOLVE, IT RUNS.
//
// Resolving a path proves the lookup and not the run. The refusal this token is
// about was on the way to starting a script, so the thing worth watching is a
// battery that starts and says something, with PATH carrying no shell at all
// and Git's the only one there is.
//
// IT USES THIS MACHINE'S GIT, because a real shell is the point: a fixture that
// is not a shell cannot show a script running. A machine without git skips,
// rather than passing quietly on an assertion it never made.
func TestTheBatteryRunsOnTheShellGitBrought(t *testing.T) {
	git, err := exec.LookPath("git")
	if err != nil {
		t.Skip("no git on this machine, and this is about the shell git brings")
	}
	r := aTree(t).Roots
	root := r.Work
	writeProbe(r, Probe{Session: "s", Found: []Tool{{Name: "git", Path: git}}})
	if err := writeAtomic(filepath.Join(root, "util", "checks", "battery.sh"),
		[]byte("echo the battery ran\n"), 0o755); err != nil {
		t.Fatal(err)
	}

	// NOTHING ON PATH, so the only way to a shell is the one the probe knows.
	t.Setenv("PATH", "")

	// THE RUN IS STARTED AND NOT AWAITED, so what is watched here is the run
	// itself reaching the file the engine pointed at. See battery.go.
	got := startBattery(t.Context(), r, "worker-one", "")
	if !got.OK {
		t.Fatalf("the battery did not start: said=%q", got.Said)
	}
	going, ok := batteryGoing(r)
	if !ok {
		t.Fatal("the battery started and nothing was written down about it")
	}
	waitForTheBattery(t, going)
	said, err := os.ReadFile(going.Out)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(said), "the battery ran") {
		t.Fatalf("the battery did not run on the shell git brought: %q", said)
	}
}

// AND WHERE IT REALLY IS MISSING, IT SAYS WHERE IT LOOKED.
//
// "no sh on this machine" was true of PATH and false of the machine. A lookup
// that names the places it tried is the difference between a tool that is not
// installed and a lookup that is not reaching the one that is.
func TestTheBatterySaysWhereItLookedForTheShell(t *testing.T) {
	r := aTree(t).Roots
	t.Setenv("PATH", "")

	got, looked := batteryShell(r)
	if got != "" {
		t.Fatalf("it found %q in an empty tree with no PATH", got)
	}
	if len(looked) == 0 {
		t.Fatal("it says nothing about where it looked")
	}

	// AND THE ANSWER A PERSON READS CARRIES THEM, not only the refusal.
	said := startBattery(t.Context(), r, "worker-one", "").Said
	for _, want := range []string{"no sh on this machine", looked[0]} {
		if !strings.Contains(said, want) {
			t.Errorf("the battery's answer does not carry %q:\n%s", want, said)
		}
	}
}

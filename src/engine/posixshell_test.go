package main

import (
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// THE SHELL A COMMAND RUNS IN IS FOUND THE WAY THE BATTERY FINDS IT.
//
// runBattery already asks the probe where Git put its shell. TheShell did not:
// it called exec.LookPath for sh, and Git for Windows puts git.exe on PATH from
// its cmd folder while leaving sh.exe in the sibling bin folder. So on a machine
// carrying two copies of sh the engine answered cmd, and every se_run command
// written for sh, which is every command the guidance and the helper scripts
// assume, ran in cmd instead. It did not fail loudly: it answered exit 0 with
// output saying 'ls' is not recognized.
//
// ONE LOOKUP, USED BY BOTH, so the two cannot drift apart again.
func TestTheShellIsFoundBesideGitWhenPathHasNone(t *testing.T) {
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

	// AND NOTHING ON PATH, which is the machine this is about.
	t.Setenv("PATH", "")

	if got := TheShell(r); got != "sh" {
		t.Fatalf("the engine says a command runs in %q while Git's shell sits at %q", got, sh)
	}
	got, _ := posixShell(r)
	if got != sh {
		t.Fatalf("it resolved %q where Git's shell is %q", got, sh)
	}
}

// AND WITH NO SHELL ANYWHERE IT STILL SAYS cmd, so the Windows fallback stands.
func TestTheShellFallsBackToCmdWhenThereIsNone(t *testing.T) {
	if runtime.GOOS != "windows" {
		t.Skip("this is about the Windows fallback")
	}
	r := aTree(t).Roots
	t.Setenv("PATH", "")
	if got := TheShell(r); got != "cmd" {
		t.Fatalf("with no shell on the machine it answered %q", got)
	}
}

// AND THE COMMAND REALLY RUNS IN IT.
//
// Resolving a path proves the lookup and not the run, and the whole point is a
// command written for sh behaving like sh. This asks the shell what it is.
// A machine without git skips rather than passing on an assertion it never made.
func TestARunUsesTheShellGitBrought(t *testing.T) {
	git, err := exec.LookPath("git")
	if err != nil {
		t.Skip("no git on this machine, and this is about the shell git brings")
	}
	r := aTree(t).Roots
	writeProbe(r, Probe{Session: "s", Found: []Tool{{Name: "git", Path: git}}})
	t.Setenv("PATH", "")

	// A SUBSTITUTION AND A SINGLE QUOTE, which cmd does not answer the way sh does.
	said, err := shellCommand(r, "echo \"$(echo 'it is sh')\"").CombinedOutput()
	if err != nil {
		t.Fatalf("the command did not run: %v\n%s", err, said)
	}
	if !strings.Contains(string(said), "it is sh") {
		t.Fatalf("the command did not run in a POSIX shell, it said: %q", said)
	}
}

package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE RUN CARRIES THE PROBE'S PATH. A command through the engine resolves
// every probed tool without exporting anything: the probe already knows
// where they live, and a command carrying cd and export PATH re-states that
// knowledge on every call. Two suite failures read as engine defects and
// were only a missing rg.
func TestShellCommandPutsEveryProbedToolOnPath(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	// TWO TOOLS IN TWO PLACES. One proves a directory reaches the child and
	// says nothing about the second, and every tool is what the ask is.
	one := filepath.Join(root, "somewhere", "bin")
	two := filepath.Join(root, "elsewhere", "bin")
	writeProbe(r, Probe{Session: "s", Found: []Tool{
		{Name: "made-up", Path: filepath.Join(one, "made-up.exe")},
		{Name: "invented", Path: filepath.Join(two, "invented.exe")},
	}})

	// THE QUESTION IS PATH, NOT THE ENVIRONMENT ANYWHERE. A directory that
	// reached the child under some other name resolves nothing.
	cmd := shellCommand(r, "echo hi")
	path := ""
	for _, e := range cmd.Env {
		if k, v, ok := strings.Cut(e, "="); ok && strings.EqualFold(k, "PATH") {
			path = v
		}
	}
	for _, dir := range []string{one, two} {
		if !strings.Contains(path, dir) {
			t.Errorf("the child PATH does not carry the probed tool's directory %s: %q", dir, path)
		}
	}

	// AND THE PARENT'S PATH IS KEPT, BEHIND THEM. The tools are in addition to
	// what the caller had, never instead of it, and going in front is what
	// makes the copy the probe answered the copy that runs.
	for _, e := range os.Environ() {
		k, v, ok := strings.Cut(e, "=")
		if !ok || !strings.EqualFold(k, "PATH") || v == "" {
			continue
		}
		if !strings.HasSuffix(path, v) {
			t.Errorf("the child PATH does not end in the parent's: %q", path)
		}
	}
}

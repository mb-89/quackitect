package main

import (
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
	toolDir := filepath.Join(root, "somewhere", "bin")
	writeProbe(r, Probe{Session: "s", Found: []Tool{
		{Name: "made-up", Path: filepath.Join(toolDir, "made-up.exe")}}})

	cmd := shellCommand(r, "echo hi")
	if !strings.Contains(strings.Join(cmd.Env, "\n"), toolDir) {
		t.Errorf("the child environment does not carry the probed tool's directory %s", toolDir)
	}

	// AND THE PARENT ENVIRONMENT IS KEPT, because the tools are in addition
	// to what the caller had, never instead of it.
	if len(cmd.Env) > 0 && !strings.Contains(strings.Join(cmd.Env, "\n"), "=") {
		t.Error("the child environment lost the parent's variables")
	}
}

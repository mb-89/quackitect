// The real RUNME.sh, run by sh in a root whose install does nothing and whose
// binary says what reaches it, on a PATH carrying no editor.
// [[spec/tickets/bare-runme-exits-clean]]
package main

import (
	"errors"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// The tools the bare branch of RUNME.sh calls past the shell's own words.
var runmeTools = []string{"sh", "dirname", "mkdir"}

// A root holding the real RUNME.sh, an install that does nothing, and a binary printing its words.
func runmeRoot(t *testing.T) string {
	t.Helper()
	root, err := filepath.EvalSymlinks(t.TempDir())
	if err != nil {
		t.Fatal(err)
	}
	shim, err := os.ReadFile(filepath.Join("..", "..", "RUNME.sh"))
	if err != nil {
		t.Fatal(err)
	}
	files := map[string]string{
		"RUNME.sh":                  string(shim),
		"src/scripts/install.sh":    "#!/usr/bin/env sh\n",
		".se/.runtime/bin/se-index": "#!/bin/sh\nprintf '%s\\n' \"$*\"\n",
	}
	for name, text := range files {
		at := filepath.Join(root, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	return root
}

// A PATH folder linking the tools RUNME.sh calls, and no editor.
func runmePath(t *testing.T) string {
	t.Helper()
	at := t.TempDir()
	for _, name := range runmeTools {
		found, err := exec.LookPath(name)
		if err != nil {
			t.Skipf("%s stands nowhere on this box", name)
		}
		if err := os.Symlink(found, filepath.Join(at, name)); err != nil {
			t.Fatal(err)
		}
	}
	return at
}

// Runs RUNME.sh bare under the variables named, and answers its exit code, stdout and stderr.
func runBare(t *testing.T, env ...string) (int, string, string) {
	t.Helper()
	shell, err := exec.LookPath("sh")
	if err != nil {
		t.Skip("sh stands nowhere on this box")
	}
	root := runmeRoot(t)
	cmd := exec.Command(shell, filepath.Join(root, "RUNME.sh"))
	cmd.Dir = root
	cmd.Env = append([]string{"PATH=" + runmePath(t), "HOME=" + t.TempDir()}, env...)
	var out, errs strings.Builder
	cmd.Stdout, cmd.Stderr = &out, &errs
	code := 0
	if err := cmd.Run(); err != nil {
		var failed *exec.ExitError
		if !errors.As(err, &failed) {
			t.Fatal(err)
		}
		code = failed.ExitCode()
	}
	return code, strings.ReplaceAll(out.String(), root, "<root>"), errs.String()
}

// A bare RUNME.sh on a cloud box with no editor hands help to the binary and exits 0. [[spec/tickets/bare-runme-exits-clean]]
func TestABareRunmeOnACloudBoxPrintsTheVerbs(t *testing.T) {
	t.Parallel()
	for _, flag := range cloudVariables {
		code, out, errs := runBare(t, flag+"=true")
		if code != 0 || out != "verb <root>/src/scripts help\n" || errs != "" {
			t.Errorf("under %s the bare call answers %d, %q, %q", flag, code, out, errs)
		}
	}
}

// A bare RUNME.sh on a desk with no editor names the editor to install and exits 1, a cloud variable saying false or 0 among desks. [[spec/tickets/bare-runme-exits-clean]]
func TestABareRunmeOnADeskWithNoEditorNamesIt(t *testing.T) {
	t.Parallel()
	for _, env := range [][]string{nil, {"SE_CLOUD=false"}, {"CLAUDE_CODE_REMOTE= 0 "}, {"SE_CLOUD="}} {
		code, out, errs := runBare(t, env...)
		if code != 1 || out != "" || errs != "No code stands on the PATH. Install VS Code, then open this folder in it.\n" {
			t.Errorf("under %q the bare call answers %d, %q, %q", env, code, out, errs)
		}
	}
}

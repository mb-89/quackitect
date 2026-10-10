// The real RUNME.sh, run by sh in a root whose install does nothing and whose
// binary says what reaches it, on a PATH carrying no editor.
// [[spec/tickets/bare-runme-exits-clean]]
package main // level0: InPackageTest - reaches the unexported cloudVariables, and a main package admits no outside test package

import (
	"errors"
	"os"      // level0: OutsideInDoors - the case lays out a box of links to real tools and reads the RUNME.sh the tree ships, which no fake disk can run
	"os/exec" // level0: OutsideInDoors - the case runs the real RUNME.sh under sh, as a box does, so no fake runner can stand in
	"path/filepath"
	"runtime"
	"strings"
	"testing"

	"quackitect/src/modules/hooks/command"
)

// The tools the bare branch of RUNME.sh calls past the shell's own words. [[spec/tickets/bare-runme-exits-clean]]
var runmeTools = []string{"sh", "mkdir"}

// A root holding the real RUNME.sh, an install that does nothing, and a binary printing its words. [[spec/tickets/bare-runme-exits-clean]]
func runmeRoot(t *testing.T) string {
	t.Helper()
	root, err := filepath.EvalSymlinks(t.TempDir()) // level0: FixtureOutsideHome - each run writes the shim's files into its own root.
	if err != nil {
		t.Fatal(err)
	}
	shim, err := os.ReadFile(filepath.Join("..", "..", "RUNME.sh"))
	if err != nil {
		t.Fatal(err)
	}
	plant(t, root, map[string]string{
		"RUNME.sh":                  string(shim),
		"install.sh":                "#!/usr/bin/env sh\n",
		".se/.runtime/bin/se-index": "#!/bin/sh\nprintf '%s\\n' \"$*\"\n",
	})
	return root
}

// Writes each file under root, its folders first. [[spec/tickets/setup-install-path-stands]]
func plant(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for name, text := range files {
		at := filepath.Join(root, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o755); err != nil {
			t.Fatal(err)
		}
	}
}

// Runs the script under sh in root with the env and arguments, and answers its exit code, stdout with root as <root>, and stderr. [[spec/tickets/setup-install-path-stands]]
func runSh(t *testing.T, root string, env []string, args ...string) (int, string, string) {
	t.Helper()
	shell, err := exec.LookPath("sh")
	if err != nil {
		t.Skip("sh stands nowhere on this box")
	}
	cmd := exec.Command(shell, args...) // level0: FixtureOutsideHome - the case runs the real script under sh, as a box does.
	cmd.Dir, cmd.Env = root, env
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

// A PATH folder linking the tools RUNME.sh calls, and no editor. Windows takes the tools' own folders, since a linked Git tool finds no msys DLL beside the link. [[spec/tickets/bare-runme-exits-clean]]
func runmePath(t *testing.T) string {
	t.Helper()
	at := t.TempDir() // level0: FixtureOutsideHome - each run links its own PATH holding no editor.
	var folders []string
	for _, name := range runmeTools {
		found, err := exec.LookPath(name)
		if err != nil {
			t.Skipf("%s stands nowhere on this box", name)
		}
		if runtime.GOOS == "windows" {
			folders = append(folders, filepath.Dir(found))
			continue
		}
		if err := os.Symlink(found, filepath.Join(at, name)); err != nil {
			t.Fatal(err)
		}
	}
	if len(folders) > 0 {
		return strings.Join(folders, string(os.PathListSeparator))
	}
	return at
}

// Runs RUNME.sh bare under the variables named, and answers its exit code, stdout and stderr. [[spec/tickets/bare-runme-exits-clean]]
func runBare(t *testing.T, env ...string) (int, string, string) {
	t.Helper()
	root := runmeRoot(t)
	return runSh(t, root, append([]string{"PATH=" + runmePath(t), "HOME=" + t.TempDir()}, env...), filepath.Join(root, "RUNME.sh")) // level0: FixtureOutsideHome - the run takes a fresh HOME, so no box's own settings reach it.
}

// A bare RUNME.sh on a cloud box with no editor hands help to the binary and exits 0. [[spec/tickets/bare-runme-exits-clean]]
func TestABareRunmeOnACloudBoxPrintsTheVerbs(t *testing.T) {
	t.Parallel()
	for _, flag := range command.CloudVariables {
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

// An install that says a line on stdout and leaves a mark, and a binary that answers its stamp off a file and prints any other call. [[spec/tickets/runme-installs-when-stale]]
const (
	staleInstall = "#!/usr/bin/env sh\nprintf 'installing\\n'\n: > \"${0%/*}/installed\"\n"
	staleIndex   = "#!/bin/sh\ncase \"$*\" in *\" stamp fresh se-index\") read -r code < \"${0%/*}/../fresh-code\"; exit \"$code\";; esac\nprintf '%s\\n' \"$*\"\n"
)

// Runs RUNME.sh branch beat in a root whose stamp answers code, or whose binary stands missing where code is empty, with a go on the PATH. It answers the exit, stdout, stderr and whether the install ran. [[spec/tickets/runme-installs-when-stale]]
func runVerbOver(t *testing.T, code string) (int, string, string, bool) {
	t.Helper()
	root := runmeRoot(t)
	goAt := t.TempDir() // level0: FixtureOutsideHome - each run links a go of its own, so the stale check runs.
	plant(t, root, map[string]string{"install.sh": staleInstall, ".se/.runtime/bin/se-index": staleIndex, ".se/.runtime/fresh-code": code})
	plant(t, goAt, map[string]string{"go": "#!/bin/sh\nexit 0\n"})
	if code == "" {
		if err := os.Remove(filepath.Join(root, ".se", ".runtime", "bin", "se-index")); err != nil {
			t.Fatal(err)
		}
	}
	env := []string{"PATH=" + goAt + string(os.PathListSeparator) + runmePath(t), "HOME=" + t.TempDir()} // level0: FixtureOutsideHome - the run takes a fresh HOME, so no box's own settings reach it.
	exit, out, errs := runSh(t, root, env, filepath.Join(root, "RUNME.sh"), "branch", "beat")
	_, marked := os.Stat(filepath.Join(root, "installed"))
	return exit, out, errs, marked == nil
}

// The Stop hook runs a verb each turn, so a verb on a fresh binary pays the stamp check alone. [[spec/tickets/runme-installs-when-stale]]
func TestAVerbOnAFreshBinarySkipsTheInstall(t *testing.T) {
	t.Parallel()
	code, out, errs, installed := runVerbOver(t, "0")
	if installed || code != 0 || out != "verb <root>/src/scripts branch beat\n" {
		t.Errorf("a verb on a fresh binary installs %v, answers %d, %q, %q", installed, code, out, errs)
	}
}

// A stale or missing binary runs the install, whose lines land on stderr, so stdout carries the verb's answer alone. [[spec/tickets/runme-installs-when-stale]]
func TestAMissingOrStaleBinaryRunsTheInstallOnStderr(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name, code, out string
		exit            int
	}{
		{"a stale stamp", "1", "verb <root>/src/scripts branch beat\n", 0},
		{"a missing binary", "", "", 2},
	} {
		code, out, errs, installed := runVerbOver(t, one.code)
		if !installed || code != one.exit || out != one.out || !strings.Contains(errs, "installing\n") {
			t.Errorf("%s installs %v, answers %d, %q, %q", one.name, installed, code, out, errs)
		}
	}
}

// The claude.ai setup script runs src/scripts/install.sh, so the shim there reaches the root install with every argument. [[spec/tickets/setup-install-path-stands]]
func TestTheOldInstallPathRunsTheRootInstall(t *testing.T) {
	t.Parallel()
	root := runmeRoot(t)
	shim, err := os.ReadFile(filepath.Join("..", "scripts", "install.sh"))
	if err != nil {
		t.Fatal(err)
	}
	plant(t, root, map[string]string{"install.sh": "#!/usr/bin/env sh\nprintf '%s\\n' \"$#:$*\" > \"${0%/*}/reached\"\n", "src/scripts/install.sh": string(shim)})
	if code, _, errs := runSh(t, root, os.Environ(), filepath.Join(root, "src", "scripts", "install.sh"), "boot", "two words"); code != 0 {
		t.Fatalf("the shim answers %d, %q", code, errs)
	}
	if said, err := os.ReadFile(filepath.Join(root, "reached")); err != nil || string(said) != "2:boot two words\n" {
		t.Errorf("the root install reads %q, %v", said, err)
	}
}

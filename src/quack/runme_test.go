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
	root, rooted := filepath.EvalSymlinks(t.TempDir()) // level0: FixtureOutsideHome - each run writes the shim's files into its own root.
	shim, read := os.ReadFile(filepath.Join("..", "..", "RUNME.sh"))
	old, oldRead := os.ReadFile(filepath.Join("..", "scripts", "install.sh"))
	if err := errors.Join(rooted, read, oldRead); err != nil {
		t.Fatal(err)
	}
	plant(t, root, map[string]string{
		"RUNME.sh":                  string(shim),
		"src/scripts/install.sh":    string(old),
		"install.sh":                "#!/usr/bin/env sh\n[ $# -eq 0 ] || printf '%s\\n' \"$#:$*\"\n",
		".se/.runtime/bin/se-index": "#!/bin/sh\nprintf '%s\\n' \"$*\"\n",
	})
	return root
}

// Writes each file under root, its folders first. [[spec/tickets/setup-install-path-stands]]
func plant(t *testing.T, root string, files map[string]string) {
	t.Helper()
	for name, text := range files {
		at := filepath.Join(root, filepath.FromSlash(name))
		if err := errors.Join(os.MkdirAll(filepath.Dir(at), 0o755), os.WriteFile(at, []byte(text), 0o755)); err != nil {
			t.Fatal(err)
		}
	}
}

// Runs the script under sh in root with the env and arguments, and answers its exit code, stdout with root as <root>, and stderr. [[spec/tickets/setup-install-path-stands]]
func runSh(t *testing.T, root string, env []string, args ...string) (int, string, string) {
	t.Helper()
	if _, err := exec.LookPath("sh"); err != nil {
		t.Skip("sh stands nowhere on this box")
	}
	cmd := exec.Command("sh", args...) // level0: FixtureOutsideHome - the case runs the real script under sh, as a box does.
	cmd.Dir, cmd.Env = root, env
	var out, errs strings.Builder
	cmd.Stdout, cmd.Stderr = &out, &errs
	_ = cmd.Run() // a run that fails to start answers -1, which fails the case on its own assertion
	return cmd.ProcessState.ExitCode(), strings.ReplaceAll(out.String(), root, "<root>"), errs.String()
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

// A bare RUNME.sh on a cloud box with no editor hands help to the binary and exits 0, and on a desk, a cloud variable saying false or 0 among desks, names the editor to install and exits 1. [[spec/tickets/bare-runme-exits-clean]]
func TestABareRunmeHelpsOnACloudBoxAndNamesTheEditorOnADesk(t *testing.T) {
	t.Parallel()
	envs := map[string]bool{"": false, "SE_CLOUD=false": false, "CLAUDE_CODE_REMOTE= 0 ": false, "SE_CLOUD=": false}
	for _, flag := range command.CloudVariables {
		envs[flag+"=true"] = true
	}
	for env, cloud := range envs {
		code, out, errs := runBare(t, env)
		if cloud && (code != 0 || out != "verb <root>/src/scripts help\n" || errs != "") || !cloud && (code != 1 || out != "" || errs != "No code stands on the PATH. Install VS Code, then open this folder in it.\n") {
			t.Errorf("under %q the bare call answers %d, %q, %q", env, code, out, errs)
		}
	}
}

// Runs RUNME.sh branch beat in a root whose stamp answers code off a file, or whose binary stands missing where code is empty, with a go on the PATH and an install saying a line on stdout and leaving a mark. It answers the exit, stdout, stderr and whether the install ran. [[spec/tickets/runme-installs-when-stale]]
func runVerbOver(t *testing.T, code string) (int, string, string, bool) {
	t.Helper()
	root := runmeRoot(t)
	plant(t, root, map[string]string{"install.sh": "#!/usr/bin/env sh\nprintf 'installing\\n'\n: > \"${0%/*}/installed\"\n", ".se/.runtime/bin/se-index": "#!/bin/sh\ncase \"$*\" in *\" stamp fresh se-index\") read -r code < \"${0%/*}/../fresh-code\"; exit \"$code\";; esac\nprintf '%s\\n' \"$*\"\n", ".se/.runtime/fresh-code": code, "gobin/go": "#!/bin/sh\nexit 0\n"})
	if code == "" {
		_ = os.Remove(filepath.Join(root, ".se", ".runtime", "bin", "se-index")) // a binary left standing fails the missing case on its own assertion
	}
	env := []string{"PATH=" + filepath.Join(root, "gobin") + string(os.PathListSeparator) + runmePath(t), "HOME=" + t.TempDir()} // level0: FixtureOutsideHome - the run takes a fresh HOME, so no box's own settings reach it.
	exit, out, errs := runSh(t, root, env, filepath.Join(root, "RUNME.sh"), "branch", "beat")
	_, marked := os.Stat(filepath.Join(root, "installed"))
	return exit, out, errs, marked == nil
}

// The Stop hook runs a verb each turn, so a fresh binary pays the stamp check alone, and a stale or missing one runs the install on stderr, so stdout carries the verb's answer alone. [[spec/tickets/runme-installs-when-stale]]
func TestAVerbInstallsWhereTheBinaryIsMissingOrStale(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		name, code, out string
		exit            int
		installs        bool
	}{{"a fresh binary", "0", "verb <root>/src/scripts branch beat\n", 0, false}, {"a stale stamp", "1", "verb <root>/src/scripts branch beat\n", 0, true}, {"a missing binary", "", "", 2, true}} {
		code, out, errs, installed := runVerbOver(t, one.code)
		if installed != one.installs || code != one.exit || out != one.out || strings.Contains(errs, "installing\n") != one.installs {
			t.Errorf("%s installs %v, answers %d, %q, %q", one.name, installed, code, out, errs)
		}
	}
}

// The claude.ai setup script runs src/scripts/install.sh, so the shim there reaches the root install with every argument. [[spec/tickets/setup-install-path-stands]]
func TestTheOldInstallPathRunsTheRootInstall(t *testing.T) {
	t.Parallel()
	root := runmeRoot(t)
	if code, out, errs := runSh(t, root, os.Environ(), filepath.Join(root, "src", "scripts", "install.sh"), "boot", "two words"); code != 0 || out != "2:boot two words\n" {
		t.Errorf("the shim answers %d, %q, %q, and wants the root install to hear both words", code, out, errs)
	}
}

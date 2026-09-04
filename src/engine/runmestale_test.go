package main

import (
	"bytes"
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"
)

// A BINARY OLDER THAN ITS SOURCE IS THE WRONG PROGRAM.
//
// RUNME built only when the command was missing, so once .bin held a binary
// every later run used that one whatever the source said. A change to the
// engine took effect only if somebody remembered to install by hand, and the
// symptom is silent: the run succeeds, answering for code that is no longer
// there.
//
// The vehicle here is a fake one, because what is under test is RUNME and not
// the real toolchain. runme.json is data, so the command and the installer are
// two small scripts that a test can watch, and sources names where the source
// lives. The fake installer stamps the version it read into the command it
// writes, so the answer says which build ran.

const windowsFakeBuild = `@echo off
if "%FAKE_BUILD_FAILS%"=="1" (
  echo build refused 1>&2
  exit /b 1
)
set "ROOT=%~dp0.."
set /p V=<"%ROOT%\src\version.txt"
if not exist "%ROOT%\.bin" mkdir "%ROOT%\.bin"
> "%ROOT%\.bin\fake.cmd" echo @echo %V%
exit /b 0
`

const posixFakeBuild = `#!/usr/bin/env sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
if [ "${FAKE_BUILD_FAILS:-}" = "1" ]; then
  echo "build refused" >&2
  exit 1
fi
mkdir -p "$root/.bin"
v=$(cat "$root/src/version.txt")
printf '#!/usr/bin/env sh\necho %s\n' "$v" > "$root/.bin/fake"
chmod 755 "$root/.bin/fake"
`

// aFakeVehicle writes a tree of the vehicle shape: a source folder, an
// installer that builds from it, and the RUNME under test.
func aFakeVehicle(t *testing.T, version string) (dir, binary string) {
	t.Helper()
	dir = t.TempDir()
	mk := func(rel, body string, mode os.FileMode) {
		p := filepath.Join(dir, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(p), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(p, []byte(body), mode); err != nil {
			t.Fatal(err)
		}
	}

	mk("src/version.txt", version, 0o644)

	// Written as data rather than through the Runme struct, so this test says
	// what RUNME reads and stays red or green on RUNME's behaviour alone.
	spec := map[string]string{
		"kind":    string(AVehicle),
		"version": "0.1.0",
		"sources": "src",
	}
	if runtime.GOOS == "windows" {
		spec["command_windows"] = `.bin\fake.cmd`
		spec["install_windows"] = `util\build.cmd`
		mk("util/build.cmd", windowsFakeBuild, 0o755)
		binary = filepath.Join(dir, ".bin", "fake.cmd")
	} else {
		spec["command"] = ".bin/fake"
		spec["install"] = "util/build.sh"
		mk("util/build.sh", posixFakeBuild, 0o755)
		binary = filepath.Join(dir, ".bin", "fake")
	}
	b, err := json.MarshalIndent(spec, "", "  ")
	if err != nil {
		t.Fatal(err)
	}
	mk(".se/runme.json", string(b), 0o644)
	mk(runmeName(), runmeScript(), 0o755)

	// The source is deliberately older than anything the build will write, so
	// the first run is the never-built case and not a staleness case.
	stamp(t, filepath.Join(dir, "src", "version.txt"), -2*time.Hour)
	return dir, binary
}

// stamp puts a file's modification time a known distance from now, so the
// comparison under test is decided by the test and not by the clock.
func stamp(t *testing.T, path string, ago time.Duration) {
	t.Helper()
	w := time.Now().Add(ago)
	if err := os.Chtimes(path, w, w); err != nil {
		t.Fatal(err)
	}
}

func runTheRunme(t *testing.T, dir string, extraEnv ...string) (string, string, error) {
	t.Helper()
	script := filepath.Join(dir, runmeName())
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" {
		cmd = Quietly(exec.Command("powershell", "-NoProfile", "-File", script))
	} else {
		cmd = Quietly(exec.Command("sh", script))
	}
	cmd.Dir = dir
	cmd.Env = append(os.Environ(), extraEnv...)
	var out, errs bytes.Buffer
	cmd.Stdout, cmd.Stderr = &out, &errs
	err := cmd.Run()
	return out.String(), errs.String(), err
}

// The source moves on and the binary does not, which is every session where
// somebody edits the engine and runs RUNME expecting their change.
func TestAStaleBinaryIsRebuiltBeforeItRuns(t *testing.T) {
	t.Parallel()
	dir, binary := aFakeVehicle(t, "v1")

	out, errs, err := runTheRunme(t, dir)
	if err != nil {
		t.Fatalf("the first run did not build and run: %v\nout: %s\nerr: %s", err, out, errs)
	}
	if !strings.Contains(out, "v1") {
		t.Fatalf("the first run did not answer v1:\nout: %s\nerr: %s", out, errs)
	}

	if err := os.WriteFile(filepath.Join(dir, "src", "version.txt"), []byte("v2"), 0o644); err != nil {
		t.Fatal(err)
	}
	stamp(t, binary, -time.Hour)

	out, errs, err = runTheRunme(t, dir)
	if err != nil {
		t.Fatalf("the second run failed: %v\nout: %s\nerr: %s", err, out, errs)
	}
	if !strings.Contains(out, "v2") {
		t.Fatalf("RUNME ran the stale binary instead of rebuilding it:\nout: %s\nerr: %s", out, errs)
	}
}

// A REBUILD THAT FAILS IS NOT A REASON TO RUN THE OLD ONE. Falling back to the
// binary already in .bin answers for code the source no longer says, and it
// answers with exit 0, so nobody finds out.
func TestABrokenRebuildRefusesRatherThanRunningTheStaleBinary(t *testing.T) {
	t.Parallel()
	dir, binary := aFakeVehicle(t, "v1")

	out, errs, err := runTheRunme(t, dir)
	if err != nil || !strings.Contains(out, "v1") {
		t.Fatalf("the first run did not build and run: %v\nout: %s\nerr: %s", err, out, errs)
	}

	if err := os.WriteFile(filepath.Join(dir, "src", "version.txt"), []byte("v2"), 0o644); err != nil {
		t.Fatal(err)
	}
	stamp(t, binary, -time.Hour)

	out, errs, err = runTheRunme(t, dir, "FAKE_BUILD_FAILS=1")
	if err == nil {
		t.Fatalf("a failed rebuild was not refused:\nout: %s\nerr: %s", out, errs)
	}
	if strings.Contains(out, "v1") {
		t.Fatalf("the stale binary ran anyway after the rebuild failed:\nout: %s\nerr: %s", out, errs)
	}
	if !strings.Contains(errs, "the build failed") {
		t.Fatalf("the refusal did not say the build failed:\nout: %s\nerr: %s", out, errs)
	}
}

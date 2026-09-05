package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// A CHECK IS HANDED THE ENGINE THE GO LANE WOULD RUN, AND THE ANSWER NAMES IT.
//
// A check asks for its data through .bin/se, and that command reaches whatever
// engine is running over the tree. So a check read the behaviour of the engine
// that was started, not of the source it was built from: a column added to
// the view and a field to the engine went red as locked, because the running
// engine was four minutes older than the tree. The Go lane already answers
// this, building se.fresh and naming it. The check lane now does the same.

// aTreeWithAnEchoingCheck is a method root with engine source in it and one
// check that writes the engine it was handed where the test can read it.
func aTreeWithAnEchoingCheck(t *testing.T) (Roots, string) {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	for _, dir := range []string{filepath.Join("src", "engine"), filepath.Join("util", "checks"), ".se"} {
		if err := os.MkdirAll(filepath.Join(root, dir), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	if err := os.WriteFile(filepath.Join(root, "src", "engine", "a.go"), []byte("package main\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	seen := filepath.Join(root, ".se", "engine-seen.txt")
	// The runner hands a check its method root as the one argument, so the
	// script writes beside it.
	script := "import { writeFileSync } from \"node:fs\";\nimport { join } from \"node:path\";\n" +
		"writeFileSync(join(process.argv[2], \".se\", \"engine-seen.txt\"), process.env.SE_ENGINE ?? \"\");\n"
	if err := os.WriteFile(filepath.Join(root, "util", "checks", "echo-engine.mjs"), []byte(script), 0o644); err != nil {
		t.Fatal(err)
	}
	return r, seen
}

func echoingCheck() ([]aTest, []chosen) {
	tests := []aTest{{ID: "util/checks/echo-engine", Name: "echo-engine", Kind: "check", Path: "util/checks/echo-engine.mjs"}}
	return tests, []chosen{{ID: tests[0].ID, Kind: "check", Why: "named outright"}}
}

func TestACheckIsHandedTheFreshEngineAndNamesIt(t *testing.T) {
	t.Parallel()
	r, seen := aTreeWithAnEchoingCheck(t)
	aFedToolchain(t, "quackitect/x", nil)
	tests, picks := echoingCheck()

	runs, said := runChosen(r, nil, tests, picks)
	if len(runs) != 1 || !runs[0].OK {
		t.Fatalf("the check did not run clean: %+v", runs)
	}
	// WITH NO RESIDENT ENGINE, THE FRESH ONE IS BUILT AND HANDED.
	fresh := filepath.Join(r.Private("tests"), exeName("se.fresh"))
	handed, err := os.ReadFile(seen)
	if err != nil {
		t.Fatalf("the check wrote nothing about its engine: %v", err)
	}
	if string(handed) != fresh {
		t.Fatalf("the check was handed %q, and the fresh engine is %q", handed, fresh)
	}
	// AND THE ANSWER NAMES IT, on the run and on the whole.
	if !strings.Contains(runs[0].Engine, fresh) {
		t.Fatalf("the check's run does not name the engine it was handed: %q", runs[0].Engine)
	}
	if !strings.Contains(said, fresh) {
		t.Fatalf("the answer does not name the engine the checks were handed: %q", said)
	}
}

// A RESIDENT ENGINE OLDER THAN ITS SOURCE IS SAID TO BE, on every check's run,
// because a check over the tree asks that engine whatever it was handed.
func TestACheckOverAStaleEngineSaysSo(t *testing.T) {
	t.Parallel()
	r, _ := aTreeWithAnEchoingCheck(t)
	aFedToolchain(t, "quackitect/x", nil)
	resident := filepath.Join(r.Method, ".bin", exeName("se"))
	if err := os.MkdirAll(filepath.Dir(resident), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(resident, []byte("an engine built before the source moved"), 0o755); err != nil {
		t.Fatal(err)
	}
	anHourAgo := time.Now().Add(-time.Hour)
	if err := os.Chtimes(resident, anHourAgo, anHourAgo); err != nil {
		t.Fatal(err)
	}
	tests, picks := echoingCheck()

	runs, _ := runChosen(r, nil, tests, picks)
	if len(runs) != 1 {
		t.Fatalf("one check ran as %d", len(runs))
	}
	for _, want := range []string{"a.go", "newer than", "se --swap"} {
		if !strings.Contains(runs[0].Engine, want) {
			t.Fatalf("the run does not say the engine over the tree is stale, %q is missing: %q", want, runs[0].Engine)
		}
	}
}

// The root the check's doors stand over: the tree the verb road names, past
// the root the index reads.
// [[spec/tickets/check-reads-the-road-root]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"
)

const fakeGoRedEnv = "QUACK_FAKE_GO_RED"

// A process printing what a red go test prints, run as this test binary under the variable. [[spec/guidance/code/testing]]
func TestFakeGoRedProcess(t *testing.T) {
	t.Parallel()
	if os.Getenv(fakeGoRedEnv) == "" {
		return
	}
	fmt.Print("--- FAIL: TestA (0.00s)\n    a_test.go:7: one is two\nFAIL\nFAIL\tquackitect/src/one\t0.01s\nFAIL\n")
	os.Exit(1)
}

// A loud run prints the process's output and keeps it, so the Go gate writes the red case the report reads. [[spec/tickets/ci-reds-name-their-cases]]
func TestLoudRunKeepsAGoRedForTheReport(t *testing.T) {
	t.Parallel()
	var out, errs strings.Builder
	real := runsUnder(t.TempDir(), map[string]string{}, &out, &errs)
	doors := (&checkFake{}).doors()
	doors.root = t.TempDir()
	doors.run = func(argv, env []string, quiet bool) (int, string, error) {
		return real([]string{os.Args[0], "-test.run=^TestFakeGoRedProcess$"}, append(env, fakeGoRedEnv+"=1"), quiet)
	}
	if code := goGate(doors, false, nil); code != 1 {
		t.Fatalf("a red Go run answers %d: %q %q", code, out.String(), errs.String())
	}
	if !strings.Contains(out.String(), "--- FAIL: TestA") {
		t.Fatalf("the loud run prints %q", out.String())
	}
	var red []redCase
	if err := json.Unmarshal([]byte(doors.text(goRedFile)), &red); err != nil {
		t.Fatal(err)
	}
	if want := []redCase{{File: "src/one/a_test.go", Name: "TestA", Said: "one is two", Line: 7}}; !reflect.DeepEqual(red, want) {
		t.Fatalf("the report reads %v, and wants %v", red, want)
	}
}

// A road naming a worktree's scripts roots the check there, past the method root's variable. [[spec/tickets/check-reads-the-road-root]]
func TestRoadRootTakesTheTreeTheRoadNames(t *testing.T) {
	t.Parallel()
	method := func() (string, error) { return filepath.FromSlash("/main"), nil }
	scripts := filepath.Join("/work", "tree", "src", "scripts")
	if got, want := roadRoot([]string{"quack", "verb", scripts, "check"}, method), filepath.Join("/work", "tree"); got != want {
		t.Fatalf("the road root reads %q, want %q", got, want)
	}
}

// No road leaves the root to the index, and a failed read leaves the folder quack stands in. [[spec/tickets/check-reads-the-road-root]]
func TestRoadRootFallsBackToTheIndexRoot(t *testing.T) {
	t.Parallel()
	method := func() (string, error) { return filepath.FromSlash("/main"), nil }
	if got := roadRoot([]string{"quack", "check"}, method); got != filepath.FromSlash("/main") {
		t.Fatalf("without a road the root reads %q", got)
	}
	failed := func() (string, error) { return "", errors.New("no root") }
	if got := roadRoot([]string{"quack"}, failed); got != "." {
		t.Fatalf("a failed read roots at %q", got)
	}
}

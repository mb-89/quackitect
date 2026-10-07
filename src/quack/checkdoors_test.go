// The root the check's doors stand over: the tree the verb road names, past
// the root the index reads.
// [[spec/tickets/check-reads-the-road-root]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"errors"
	"path/filepath"
	"reflect"
	"testing"
)

// What a red go test prints. [[spec/tickets/test-walks-move-onto-fakes]]
const hq1GoRedText = "--- FAIL: TestA (0.00s)\n    a_test.go:7: one is two\nFAIL\nFAIL\tquackitect/src/one\t0.01s\nFAIL\n"

// A loud red run keeps what the go run said, so the Go gate writes the red case the report reads. The runner's own print stands in the contract test. [[spec/tickets/ci-reds-name-their-cases]]
func TestLoudRunKeepsAGoRedForTheReport(t *testing.T) {
	t.Parallel()
	doors := (&checkFake{}).doors()
	doors.root = "/tree"
	doors.run = func(argv, env []string, quiet bool) (int, string, error) {
		return 1, hq1GoRedText, nil
	}
	if code := goGate(doors, false, nil); code != 1 {
		t.Fatalf("a red Go run answers %d", code)
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

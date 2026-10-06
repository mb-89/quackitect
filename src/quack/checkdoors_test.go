// The root the check's doors stand over: the tree the verb road names, past
// the root the index reads.
// [[spec/tickets/check-reads-the-road-root]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"errors"
	"path/filepath"
	"testing"
)

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

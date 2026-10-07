// The doors the ticket verbs build: the pull splits at the cap the config
// names, less its margin.
// [[spec/tickets/branch-scripts-leave]]
package main

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/modules/git"
)

// [[spec/design_input/level-two#the-size-cap]]
func TestThePullTakesItsCapAndMarginOffTheConfig(t *testing.T) {
	root := t.TempDir()
	t.Setenv(workRootVar, "")
	t.Setenv("SE_PULL_CAP", "")
	t.Setenv("SE_PULL_MARGIN", "650")
	if err := os.MkdirAll(filepath.Join(root, "spec", "config"), 0o755); err != nil {
		t.Fatal(err)
	}
	tracked := `{"pull": {"cap": 9000, "margin": 700}}`
	if err := os.WriteFile(filepath.Join(root, "spec", "config", "level0.json"), []byte(tracked), 0o644); err != nil {
		t.Fatal(err)
	}
	it, code := pullHere(func() (string, error) { return root, nil }, func(string) git.Repo { return nil }, os.Stdout, os.Stderr)
	if code != 0 {
		t.Fatalf("the pull builds with the code %d", code)
	}
	if it.CapBytes != 9000 || it.CapMargin != 650 {
		t.Fatalf("the pull carries the cap %d and the margin %d, and wants 9000 off the file and 650 off SE_PULL_MARGIN", it.CapBytes, it.CapMargin)
	}
}

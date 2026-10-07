// The folders the window holds, as the chapter names them. The order their
// imports run in stands in src/imports.
// [[spec/design_output/tui#the-packages-the-window-holds]]

package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// The root holds the window's own files, and a tab's files stand under its folder. [[spec/design_output/tui#the-packages-the-window-holds]]
func TestTheRootHoldsTheWindowAlone(t *testing.T) {
	t.Parallel()
	names, _ := filepath.Glob("*.go")
	for _, name := range names {
		if strings.HasSuffix(name, "_test.go") {
			continue
		}
		for _, part := range []string{"work", "record", "tail", "tree", "colour", "filter"} {
			if strings.HasPrefix(name, part) {
				t.Fatalf("%s stands at the root, and its package holds it", name)
			}
		}
	}
	for _, folder := range []string{"draw", "tree", "frame", "log", "work"} {
		if said, err := os.Stat(folder); err != nil || !said.IsDir() {
			t.Fatalf("%s stands nowhere, and the chapter names it", folder)
		}
	}
}

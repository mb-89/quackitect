// The install, the stamp, the reporter, the bundle, the browser and trust each
// take a home or a Go verb, so the scripts folder holds the lint files alone,
// and no test of a leaving script stands.
// [[spec/tickets/scripts-folder-leaves]]
package main

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The files the lint group keeps under the folder. [[spec/tickets/scripts-folder-leaves]]
var lintScripts = []string{"src/scripts/cli-read.js", "src/scripts/styles.js"}

// The tests reading a leaving script. [[spec/tickets/scripts-folder-leaves]]
var leavingScriptTests = []string{
	"test/level0/trust.test.js", "test/contract/go-stamp.test.js",
	"test/contract/drawing-bundle.test.js", "test/contract/drawing-shipped.test.js",
}

func TestTheScriptsFolderHoldsTheLintFilesAlone(t *testing.T) {
	t.Parallel()
	left := []string{}
	for _, pattern := range append([]string{"src/scripts/*", "src/scripts/*/*"}, leavingScriptTests...) {
		found, err := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(pattern)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range found {
			rel, _ := filepath.Rel(treeRoot, one)
			if rel = filepath.ToSlash(rel); !slices.Contains(lintScripts, rel) {
				left = append(left, rel)
			}
		}
	}
	if len(left) > 0 {
		t.Fatalf("the tree holds\n%s\nand wants the lint files alone under src/scripts, since every other script takes a home or a Go verb", strings.Join(left, "\n"))
	}
}

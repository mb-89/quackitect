// The pull runs in Go, so no pull script stands in the tree, nor a script
// importing one.
// [[spec/tickets/pull-scripts-leave]]
package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// The pull scripts and the scripts importing them, which the Go pull answers for. [[spec/tickets/pull-scripts-leave]]
var pullScripts = []string{
	"src/scripts/pull*.js", "src/scripts/process.js", "src/scripts/tool-call.js", "src/scripts/quack-topic.js",
	"src/scripts/chapter.js", "src/scripts/guidance-hand.js", "src/scripts/ephemeral.js", "src/scripts/held-tests.js",
}

func TestThePullScriptsStandNowhere(t *testing.T) {
	t.Parallel()
	left := []string{}
	for _, pattern := range pullScripts {
		found, err := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(pattern)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range found {
			rel, _ := filepath.Rel(treeRoot, one)
			left = append(left, filepath.ToSlash(rel))
		}
	}
	if len(left) > 0 {
		t.Fatalf("the tree holds\n%s\nand wants no pull script, since the pull runs in Go", strings.Join(left, "\n"))
	}
}

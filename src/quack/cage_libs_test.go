// The cage rules live in Go alone under src/modules/hooks/command, so no
// command reader of the plugin library stands in the tree, nor a test holding one.
// [[spec/tickets/cage-libs-leave]]
package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// The libraries the done_when lines name, and the tests reading nothing past them. [[spec/tickets/cage-libs-leave]]
var cageLibs = []string{
	".claude/skills/level0/lib/bash*.js", ".claude/skills/level0/lib/code.js", ".claude/skills/level0/lib/commit-reads.js",
	".claude/skills/level0/lib/git-writes.js", ".claude/skills/level0/lib/pulled.js", ".claude/skills/level0/lib/scripted.js",
	".claude/skills/level0/lib/shell-values.js", ".claude/skills/level0/lib/tokens.js", ".claude/skills/level0/lib/verb-line.js",
	".claude/skills/level0/lib/trunk.js", ".claude/skills/level0/lib/cloud.js", ".claude/skills/level0/lib/markers.js",
	"test/level0/trunk.test.js", "test/level0/markers.test.js", "test/level0/cloud-desk.test.js",
}

func TestTheCageLibrariesStandNowhere(t *testing.T) {
	t.Parallel()
	left := []string{}
	for _, pattern := range cageLibs {
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
		t.Fatalf("the tree holds\n%s\nand wants no cage library, since each cage rule runs in Go", strings.Join(left, "\n"))
	}
}

// The tree rules and the stop pool live in Go alone under src/modules/check and
// src/modules/hooks, so no tree library of the plugin stands, nor a test holding one.
// [[spec/tickets/tree-libs-leave]]
package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// The libraries the done_when lines name, and the tests reading nothing past them. [[spec/tickets/tree-libs-leave]]
var treeLibs = []string{
	".claude/skills/level0/lib/tree.js", ".claude/skills/level0/lib/stop.js", ".claude/skills/level0/lib/rulefile.js",
	".claude/skills/level0/lib/tested.js", ".claude/skills/level0/lib/servers.js", ".claude/skills/level0/lib/names.js",
	".claude/skills/level0/lib/private.js", ".claude/skills/level0/lib/magic.js", ".claude/skills/level0/lib/size.js",
	"test/level0/tested.test.js", "test/level0/private.test.js", "test/contract/stop-rules.test.js", "test/contract/folders.test.js",
}

func TestTheTreeLibrariesStandNowhere(t *testing.T) {
	t.Parallel()
	left := []string{}
	for _, pattern := range treeLibs {
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
		t.Fatalf("the tree holds\n%s\nand wants no tree library, since each tree rule runs in Go", strings.Join(left, "\n"))
	}
}

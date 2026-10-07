// The pull runs in Go, so no pull script stands in the tree, nor a script
// importing one.
// [[spec/tickets/pull-scripts-leave]]
package main

import (
	"os/exec"
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
	cmd := exec.Command("git", append([]string{"ls-files", "--"}, pullScripts...)...)
	cmd.Dir = treeRoot
	said, err := cmd.Output()
	if err != nil {
		t.Fatal(err)
	}
	if left := strings.TrimSpace(string(said)); left != "" {
		t.Fatalf("git ls-files answers\n%s\nand wants no pull script, since the pull runs in Go", left)
	}
}

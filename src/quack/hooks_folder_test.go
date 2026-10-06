// The level zero hooks folder once the forwarder stands: it imports no plugin
// library, and no hook nor the stub posts the old server.
// [[spec/tickets/level0-hooks-forward-to-go]]
package main

import (
	"os/exec"
	"strings"
	"testing"
)

// The tracked lines under the paths carrying the fixed text, as git grep answers them. [[spec/tickets/level0-hooks-forward-to-go]]
func grepsTree(t *testing.T, text string, paths ...string) string {
	t.Helper()
	cmd := exec.Command("git", append([]string{"grep", "-n", "-F", text, "--"}, paths...)...)
	cmd.Dir = treeRoot
	said, _ := cmd.Output()
	return strings.TrimSpace(string(said))
}

func TestTheLevelZeroHooksImportNoLibrary(t *testing.T) {
	t.Parallel()
	if said := grepsTree(t, "../"+"lib/", ".claude/skills/level0/hooks"); said != "" {
		t.Fatalf("git grep answers\n%s\nand wants no hook importing the plugin library", said)
	}
}

func TestNoHookOrStubPostsTheOldServer(t *testing.T) {
	t.Parallel()
	if said := grepsTree(t, "/"+"event", ".claude/skills/level0/hooks", "src/stub"); said != "" {
		t.Fatalf("git grep answers\n%s\nand wants no hook nor stub posting the old server", said)
	}
}

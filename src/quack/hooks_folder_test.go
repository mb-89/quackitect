// The level zero hooks folder once the forwarder stands: it imports no plugin
// library, and no hook nor the stub posts the old server.
// [[spec/tickets/level0-hooks-forward-to-go]]
package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"quackitect/src/pull"
)

// The keys the pull tool forwards to the verb. [[spec/tickets/doors-read-what-commands-do]]
var harnessKeys = regexp.MustCompile(`HARNESS_KEYS = \[([^\]]*)\]`)

// Every key the pull tool forwards names a harness the hand rule reads, off the copy check test/level0/level1.test.js held. [[spec/tickets/doors-read-what-commands-do]]
func TestEveryKeyThePullToolForwardsNamesAHarness(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join(treeRoot, ".claude", "skills", "level0", "hooks", "pull-tool.js"))
	if err != nil {
		t.Fatal(err)
	}
	found := harnessKeys.FindStringSubmatch(string(text))
	if found == nil {
		t.Fatalf("the pull tool holds no HARNESS_KEYS")
	}
	for _, one := range strings.Split(found[1], ",") {
		key := strings.Trim(strings.TrimSpace(one), `"`)
		if pull.AgentOf(map[string]string{key: "1"}) == "" {
			t.Errorf("the pull tool forwards %s, and the hand rule reads no harness off it", key)
		}
	}
}

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

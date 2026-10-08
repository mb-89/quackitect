// The level zero hooks folder: each key the pull tool forwards names a harness.
// [[spec/tickets/doors-read-what-commands-do]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	// level0: OutsideInDoors - the case reads the tree's own hooks folder, as a build check reads source
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"quackitect/src/pull"
)

// The keys the pull tool forwards to the verb. [[spec/tickets/doors-read-what-commands-do]]
var harnessKeys = regexp.MustCompile(`HARNESS_KEYS = \[([^\]]*)\]`)

// Every key the pull tool forwards names a harness the hand rule reads. [[spec/tickets/doors-read-what-commands-do]]
func TestEveryKeyThePullToolForwardsNamesAHarness(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join(treeRoot, ".claude", "skills", "level0", "hooks", "pull-tool.ts"))
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

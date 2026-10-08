// The plugin library holds the lint group's Vale library alone, so every
// rule with logic runs in Go and changes in one language.
// [[spec/tickets/plugin-libs-leave]]
package main

import (
	"os/exec"
	"path"
	"strings"
	"testing"
)

func TestThePluginLibrariesHoldTheValeLibraryAlone(t *testing.T) {
	t.Parallel()
	cmd := exec.Command("git", "ls-files", ".claude/skills/level0/lib")
	cmd.Dir = treeRoot
	said, err := cmd.Output()
	if err != nil {
		t.Fatal(err)
	}
	left := []string{}
	for _, one := range strings.Fields(string(said)) {
		if path.Base(one) != "vale.js" {
			left = append(left, one)
		}
	}
	if len(left) > 0 {
		t.Fatalf("the plugin library holds\n%s\nand wants vale.js alone, since each rule with logic runs in Go", strings.Join(left, "\n"))
	}
}

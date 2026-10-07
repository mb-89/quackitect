// The shapes rule and the commit door pass one list of users naming nobody,
// since the Vale script reads no Go and the door reads no Vale.
// [[spec/design_output/private#the-box-names-the-owner]]
package main

import (
	"os"
	"path/filepath"
	"regexp"
	"slices"
	"strings"
	"testing"

	"quackitect/src/modules/hooks/command"
)

var nobodyListed = regexp.MustCompile(`nobody := \[([^\]]*)\]`)

func TestTheShapesRuleAndTheCommitDoorPassOneListOfNobodyUsers(t *testing.T) {
	t.Parallel()
	rule, err := os.ReadFile(filepath.Join(treeRoot, "spec", "config", "styles", "VoiceVale", "Private.yml"))
	if err != nil {
		t.Fatal(err)
	}
	listed := nobodyListed.FindStringSubmatch(string(rule))
	if listed == nil {
		t.Fatal("Private.yml names no nobody users")
	}
	names := []string{}
	for _, one := range strings.Split(listed[1], ",") {
		names = append(names, strings.Trim(strings.TrimSpace(one), `"`))
	}
	door := slices.Clone(command.Nobody)
	slices.Sort(names)
	slices.Sort(door)
	if !slices.Equal(names, door) {
		t.Fatalf("Private.yml passes %q, and the commit door passes %q, and wants one list", names, door)
	}
}

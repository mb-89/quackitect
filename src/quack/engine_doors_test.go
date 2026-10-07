// The engine's rules live in Go under src/branches and src/modules, so no engine
// file but the tools reader stands, nor a door, fake or test serving ported code.
// [[spec/tickets/engine-and-doors-leave]]
package main

import (
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// The engine files, doors, fakes and tests the approach sends away. [[spec/tickets/engine-and-doors-leave]]
var engineDoors = []string{
	"src/engine/group.js", "src/engine/named.js", "src/engine/front-merge.js", "src/engine/swap",
	"src/doors/clock.js", "src/doors/http.js", "src/doors/index.js", "src/doors/log.js",
	"src/doors/fake/clock.js", "src/doors/fake/http.js", "src/doors/fake/index.js", "src/doors/fake/log.js", "src/doors/fake/awake.js",
	"test/contract/clock.test.js", "test/contract/http.test.js", "test/contract/index.test.js", "test/contract/log.test.js", "test/contract/compact.test.js",
	"test/level0/group.test.js", "test/level0/front-merge.test.js", "test/level0/quoted.test.js", "test/level0/ticket-folders.test.js",
}

// The one engine file the lint group's Vale door still reads. [[spec/tickets/engine-and-doors-leave]]
const engineTools = "src/engine/tools.js"

// Every path under the tree root a pattern finds, each relative and slashed. [[spec/tickets/engine-and-doors-leave]]
func globbedIn(t *testing.T, patterns ...string) []string {
	t.Helper()
	left := []string{}
	for _, pattern := range patterns {
		found, err := filepath.Glob(filepath.Join(treeRoot, filepath.FromSlash(pattern)))
		if err != nil {
			t.Fatal(err)
		}
		for _, one := range found {
			rel, _ := filepath.Rel(treeRoot, one)
			left = append(left, filepath.ToSlash(rel))
		}
	}
	return left
}

func TestTheEngineAndThePortedDoorsStandNowhere(t *testing.T) {
	t.Parallel()
	if left := globbedIn(t, engineDoors...); len(left) > 0 {
		t.Fatalf("the tree holds\n%s\nand wants none of them, since Go owns each rule and no code that stays reads each door", strings.Join(left, "\n"))
	}
}

func TestTheEngineFolderHoldsToolsAlone(t *testing.T) {
	t.Parallel()
	left := slices.DeleteFunc(globbedIn(t, "src/engine/*"), func(one string) bool { return one == engineTools })
	if len(left) > 0 {
		t.Fatalf("src/engine holds\n%s\nand wants %s alone, or nothing", strings.Join(left, "\n"), engineTools)
	}
}

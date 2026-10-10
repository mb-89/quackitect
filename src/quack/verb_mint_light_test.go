// A ticket minted with no process takes the light route and its stopping line. [[spec/tickets/small-work-takes-light-path]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"
)

// level0: FixtureOutsideHome - the mint reads the shipped trivial route off a tree of its own
func TestAMintWithNoProcessTakesTheTrivialRoute(t *testing.T) {
	t.Parallel()
	root := mintTree(t, "")
	seedFile(t, root, "spec/processes/trivial.yaml", shippedText(t, "spec/processes/trivial.yaml"))
	code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--gain=A fix lands in one step.", "--breaks=It pays for the full route.", "--done_when=one passes")
	if got, _ := readIn(root, "spec/tickets/fresh.md"); code != 0 || !strings.Contains(got, "process: [[spec/processes/trivial]]") || !strings.Contains(got, "leave working code alone") {
		t.Fatalf("the mint answers %d: %s\nand writes:\n%s", code, said, got)
	}
}

// A ticket minted with no process takes the light route, the trivial one with
// its stopping line, and one naming the standard route keeps the full one.
// [[spec/tickets/small-work-takes-light-path]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"
)

// A tree holding the shipped trivial and standard routes beside the mint fixture. [[spec/tickets/small-work-takes-light-path]]
func lightTree(t *testing.T) string {
	t.Helper()
	root := mintTree(t, "")
	for _, one := range []string{"spec/processes/trivial.yaml", "spec/processes/standard.yaml"} {
		seedFile(t, root, one, shippedText(t, one))
	}
	return root
}

func TestAMintWithNoProcessTakesTheTrivialRoute(t *testing.T) {
	root := lightTree(t)
	code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md",
		"--gain=A small fix lands in one step.", "--breaks=Small work pays for the full route.", "--done_when=the case passes")
	got, _ := readIn(root, "spec/tickets/fresh.md")
	if code != 0 {
		t.Fatalf("the mint answers %d: %s\nand writes:\n%s", code, said, got)
	}
	for _, line := range []string{"process: [[spec/processes/trivial]]", "  - name: do\n", "leave working code alone"} {
		if !strings.Contains(got, line) {
			t.Errorf("the minted ticket holds no %q:\n%s", line, got)
		}
	}
}

func TestAMintWithStandardKeepsTheFullRoute(t *testing.T) {
	root := lightTree(t)
	code, said := runsVerb(t, root, "mint", "ticket", "spec/tickets/fresh.md", "--process=standard",
		"--gain=A change gets its design.", "--breaks=A big change lands unread.", "--done_when=the case passes")
	got, _ := readIn(root, "spec/tickets/fresh.md")
	if code != 0 {
		t.Fatalf("the mint answers %d: %s\nand writes:\n%s", code, said, got)
	}
	for _, line := range []string{"process: [[spec/processes/standard]]", "  - name: gate\n", "  - name: accept\n"} {
		if !strings.Contains(got, line) {
			t.Errorf("the minted ticket holds no %q:\n%s", line, got)
		}
	}
}

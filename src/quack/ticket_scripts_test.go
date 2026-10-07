// The ticket, guidance, hold and vehicle verbs run in Go, so no script of
// theirs stands in the tree, nor a test holding one.
// [[spec/tickets/ticket-scripts-leave]]
package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// The scripts the done_when line names, and the tests reading nothing past them. [[spec/tickets/ticket-scripts-leave]]
var ticketScripts = []string{
	"src/scripts/ticket*.js", "src/scripts/guidance-*.js", "src/scripts/ephemeral*.js", "src/scripts/vehicle.js",
	"test/contract/vehicle.test.js", "test/level0/outside-hand.test.js",
}

func TestTheTicketAndVehicleScriptsStandNowhere(t *testing.T) {
	t.Parallel()
	left := []string{}
	for _, pattern := range ticketScripts {
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
		t.Fatalf("the tree holds\n%s\nand wants no ticket or vehicle script, since their verbs run in Go", strings.Join(left, "\n"))
	}
}

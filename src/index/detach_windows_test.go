//go:build windows

// The starter's exit reads apart from the door's end.
// [[spec/tickets/door-outlives-taskkill-tree]]
package index // level0: InPackageTest - the case reads the unexported exitEnds the door's wait reads

import (
	"errors"
	"testing"
)

// The starter exits clean once it launches the door, so a start waits on the door past that exit, and a failed starter ends the start. [[spec/tickets/the-doors-pr-goes-green]]
func TestAStartersCleanExitLeavesTheDoorStanding(t *testing.T) {
	t.Parallel()
	if exitEnds(nil) {
		t.Error("the starter's clean exit reads as the door's end")
	}
	if !exitEnds(errors.New("exit status 1")) {
		t.Error("a failed starter reads as no end")
	}
}

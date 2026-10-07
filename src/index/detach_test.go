//go:build !windows

// [[spec/tickets/the-index-outlives-the-check]] [[spec/tickets/platform-draft-names-checkdoors]]
package index // level0: InPackageTest - the case reads the unexported exitEnds the door's wait reads

import (
	"errors"
	"testing"
)

// The detached process is the door, so a start reads its clean exit as the door's end. [[spec/tickets/the-doors-pr-goes-green]]
func TestADoorsCleanExitEndsIt(t *testing.T) {
	t.Parallel()
	if !exitEnds(nil) || !exitEnds(errors.New("exit status 1")) {
		t.Fatal("an exit of the door itself reads as no end")
	}
}

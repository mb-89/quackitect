// A spawned process's exit reads as the door's where the process is the door, and a starter's clean exit reads as nothing.
// [[spec/tickets/door-outlives-taskkill-tree]]
package index

import (
	"errors"
	"testing"
)

// [[spec/tickets/door-outlives-taskkill-tree]]
func TestAStartersCleanExitSaysNothingOfTheDoor(t *testing.T) {
	t.Parallel()
	failed := errors.New("exit status 1")
	for _, one := range []struct {
		err    error
		isDoor bool
		wants  bool
	}{
		{nil, true, true},
		{failed, true, true},
		{nil, false, false},
		{failed, false, true},
	} {
		if got := speaksForDoor(one.err, one.isDoor); got != one.wants {
			t.Errorf("an exit of %v from a process that is the door %v speaks for the door %v, wants %v", one.err, one.isDoor, got, one.wants)
		}
	}
}

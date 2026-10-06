// The doors the branch verbs run behind carry the send door, so done opens
// its pull request through it. [[spec/tickets/branch-done-opens-the-pr]]
package main

import (
	"io"
	"testing"
)

// The branch verbs' doors carry a send door. [[spec/tickets/branch-done-opens-the-pr]]
func TestTheBranchDoorsCarryASendDoor(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	d := branchDoors(func() (string, error) { return root, nil }, nil, io.Discard, io.Discard)
	if d.Send == nil {
		t.Fatal("the branch doors carry no send door")
	}
}

// The branch verbs' doors carry the send door, so done opens its pull request
// through it. The work root and method root case stands in the box doors'
// contract. [[spec/tickets/branch-done-opens-the-pr]]
package main // level0: InPackageTest - the case reads the unexported branchDoors of the command

import (
	"io"
	"testing"
)

// The branch verbs' doors carry a send door. [[spec/tickets/branch-done-opens-the-pr]]
func TestTheBranchDoorsCarryASendDoor(t *testing.T) {
	t.Parallel()
	root := t.TempDir() // level0: FixtureOutsideHome - the doors stand over a method root of the case's own
	d := branchDoors(func() (string, error) { return root, nil }, nil, io.Discard, io.Discard)
	if d.Send == nil {
		t.Fatal("the branch doors carry no send door")
	}
}

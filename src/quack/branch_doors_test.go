// The branch verbs' doors stand over the work root, their method disk over
// the root the method reads, and they carry the send door, so done opens its
// pull request through it. [[spec/tickets/branch-verbs-meet-fake-git]]
// [[spec/tickets/branch-done-opens-the-pr]]
package main

import (
	"io"
	"os"
	"path/filepath"
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

// The branch verbs' doors write the work root and read the method root. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestTheBranchDoorsWriteTheWorkRootAndReadTheMethodRoot(t *testing.T) {
	work, method := t.TempDir(), t.TempDir()
	t.Setenv(workRootVar, work)
	doors := branchDoors(func() (string, error) { return method, nil }, func() (string, error) { return "", nil }, io.Discard, io.Discard)
	if doors.Root != work || doors.Method != method || doors.Repo == nil || doors.Run == nil {
		t.Fatalf("the doors stand at %s and %s, repo %v, runner set %v", doors.Root, doors.Method, doors.Repo, doors.Run != nil)
	}
	if err := doors.Disk.Write("a.md", "work"); err != nil {
		t.Fatal(err)
	}
	if body, err := os.ReadFile(filepath.Join(work, "a.md")); err != nil || string(body) != "work" {
		t.Errorf("the disk writes %q, %v under the work root", body, err)
	}
	if err := os.WriteFile(filepath.Join(method, "m.md"), []byte("method"), 0o644); err != nil {
		t.Fatal(err)
	}
	if text, ok, err := doors.Methods.Read("m.md"); err != nil || !ok || text != "method" {
		t.Errorf("the method disk reads %q, %v, %v under the method root", text, ok, err)
	}
}

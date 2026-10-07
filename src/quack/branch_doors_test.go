// The branch verbs' doors stand over the work root, and their method disk over
// the root the method reads. [[spec/tickets/branch-verbs-meet-fake-git]]
package main

import (
	"io"
	"os"
	"path/filepath"
	"testing"
)

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

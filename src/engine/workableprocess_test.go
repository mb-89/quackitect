package main

import (
	"os"
	"path/filepath"
	"testing"
)

// writeWorkableProcess writes a process a token can actually be pulled on: one
// that starts at "first" and has a step LEAVING "first", because Workable asks
// whether an activity starts where the token stands.
//
// IT IS THE FIXTURE FOUR TEST FILES ALREADY CALLED AND NOBODY HAD WRITTEN.
// arrival_test.go, holdstore_test.go and investigate_test.go each assumed it,
// so the package would not compile for anybody. writeProcess in
// move_store_test.go is the neighbouring fixture and is deliberately NOT
// workable: its only activity comes from nowhere.
func writeWorkableProcess(t *testing.T, root, name string) {
	t.Helper()
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	body := "name: " + name + "\ndescription: a process for the test\n" +
		"sections:\n  required:\n    - detail\n" +
		"states:\n  - name: first\n    description: where it starts\n" +
		"  - name: last\n    description: where it ends\n" +
		"activities:\n  - name: write\n    does: write it\n    to: first\n" +
		"  - name: do\n    does: do it\n    from: first\n    to: last\n" +
		"dispositions:\n  - name: done\n    description: it was done\n"
	if err := os.WriteFile(filepath.Join(dir, name+".process.yaml"), []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
}

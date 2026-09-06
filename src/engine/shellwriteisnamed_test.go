package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A WRITE THE RECORD CANNOT PROVE IS NAMED, NOT SILENTLY DROPPED.
//
// The delta is narrowed to what the record says this token wrote, because on a
// tree several hands share the diff is everybody's. The record is the apply
// journal, and a file written by a shell command under se run is in no journal.
//
// So the moment a token has one apply on it, every shell write it made falls
// out of the delta, no test is chosen for it, and the answer said nothing about
// it at all. A generator, a formatter or a sed under a token read as green over
// a change nothing looked at.
//
// The narrowing stays. What it leaves out is named.
func TestAShellWriteIsNamedRatherThanDropped(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	on := aTokenTaking(t, r, head)
	wrote(t, r, on, "one.md", "# one\n")
	// AND ONE WRITE NO APPLY JOURNALLED, which is what a shell command under
	// this token leaves behind.
	if err := os.WriteFile(filepath.Join(dir, "byshell.md"), []byte("# by shell\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	got, err := TestTheDelta(t.Context(), r, db, on, nil, false, "worker-"+on)
	if err != nil {
		t.Fatal(err)
	}
	var inDelta bool
	for _, ch := range got.Delta {
		if ch.Path == "one.md" {
			inDelta = true
		}
	}
	if !inDelta {
		t.Errorf("the delta lost the write the record does hold: %+v", got.Delta)
	}
	// THE ANSWER IS WHAT AN AGENT READS, so the question is whether the answer
	// says the name anywhere, in the delta or beside it.
	said, err := json.Marshal(got)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(said), "byshell.md") {
		t.Errorf("the answer names nothing of the write no apply journalled: %s", said)
	}
}

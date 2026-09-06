package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A NOTE A DEAD BOX CLAIMED CANNOT BE TURNED IN BY ANYONE, AND THE GATE BILLED
// IT TO WHOEVER WAS HERE.
//
// MEASURED, September 2026. doc/work/wk-ac18ea020a.md was a note claimed by a
// box that had gone. A stop was refused twice naming it. A claim on it answered
// that it is held, wait for that claim to lapse. The gate demanded the note be
// turned in and the claim refused the only call that turns it in.
//
// THE COUNT WAS NOT TRUE. The gate says a note dies with this box. That one did
// not: it sat in doc/work, which git carries, and its own detail records an
// earlier session moving it there for that reason. The gate counted by kind.
//
// SO THE NARROW HALF IS FIXED AND THE WIDE HALF IS NOT. A claim still outlives
// the box that took it, and breaking one early changes what a claim means.
// wk-4759d90994 carries that.
func TestANoteOnTheBranchDoesNotRefuseTheStop(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	aHostTable(t, r)
	t.Setenv("CLAUDE_CODE_REMOTE", "true")

	note := mintNote(t, r, "a note here")

	// UNDER .se IT REFUSES, which is the rule this narrows rather than removes.
	why, refuse := NotesGoWithTheBox(r)
	if !refuse {
		t.Fatal("a private note refused nothing, so this proves nothing")
	}
	if !strings.Contains(why, note.ID) {
		t.Fatalf("the refusal does not name the note it is about: %s", why)
	}

	// MOVED ONTO THE BRANCH IT DOES NOT, because git carries it now.
	was := noteAt(r, note.ID)
	if was == "" {
		t.Fatal("the note is on no disk, so there is nothing to move")
	}
	if err := os.MkdirAll(TrackedDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.Rename(was, filepath.Join(TrackedDir(r), note.ID+".md")); err != nil {
		t.Fatal(err)
	}
	if why, refuse := NotesGoWithTheBox(r); refuse {
		t.Errorf("a note in doc/work refused the stop, and it does not die with this box: %s", why)
	}
}

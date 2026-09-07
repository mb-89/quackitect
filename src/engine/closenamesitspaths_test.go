package main

import (
	"os"
	"path/filepath"
	"slices"
	"strings"
	"testing"
)

// A CLOSE WRITES TWO THINGS AND A HAND LANDS ONE.
//
// The note goes one way and the archive row the other, and the settled answer
// named neither, so a hand landed what it remembered.
//
// MEASURED, 2026-09-07, three times in one session, and caught by the stop
// hook rather than by the engine. wk-aa9c98250a and wk-0200291ebb both closed
// here, both had their note landed with the evidence, and neither row reached
// spec/work/archive.jsonl on the branch. The record there read them as open.
//
// wk-bf10a262a0 carries the other half in its own words: the hand landing a
// close names the archive and forgets the note it just deleted, because the
// note is gone and nothing lists it. The engine knows both, so the engine says
// both.
func TestACloseNamesThePathsItWrote(t *testing.T) {
	t.Parallel()
	r := aTreeWithOneStep(t)
	tok := mintTask(t, r, "a hand lands this", "")
	at := filepath.Join(r.Work, "spec", "work", tok.ID+".md")

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})

	if got.Pull == AnswerRefused {
		t.Fatalf("the close was refused: %+v", got.Findings)
	}
	for _, want := range []string{"spec/work/" + tok.ID + ".md", "spec/work/archive.jsonl"} {
		if !slices.Contains(got.Paths, want) {
			t.Errorf("the close wrote %s and the answer names %v", want, got.Paths)
		}
		// AND THE NOTICE CARRIES IT TOO, because a hand with no lane reads the
		// notice and never sees a field.
		if !strings.Contains(got.Notice, want) {
			t.Errorf("the notice does not name %s:\n%s", want, got.Notice)
		}
	}

	// THE NOTE IS NAMED WHETHER OR NOT IT SURVIVED THE CLOSE. Where the archive
	// takes it off the disk, asking afterwards answers nothing, and land.sh
	// removes a path the tree no longer holds, which is what the branch needs.
	if _, err := os.Stat(at); os.IsNotExist(err) &&
		!slices.Contains(got.Paths, "spec/work/"+tok.ID+".md") {
		t.Errorf("the close deleted the note and did not name it: %v", got.Paths)
	}
}

// A PRIVATE NOTE TRAVELS NOWHERE, so its close asks for no landing at all.
// Telling a hand to land .se/work would be telling it to push a folder git
// carries nothing from.
func TestAPrivateNoteNamesNoPathToLand(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	note := mintNote(t, r, "a note nothing pushes")
	ticked(t, r, note.ID)
	if _, err := TakeUp(r, note.ID, "worker-a"); err != nil {
		t.Fatal(err)
	}

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: note.ID, Disposition: "dropped",
		Reason: "nothing came of it"})

	if got.Pull == AnswerRefused {
		t.Fatalf("the drop was refused: %+v", got.Findings)
	}
	if len(got.Paths) > 0 {
		t.Errorf("a private note travels nowhere, and the answer asks to land %v", got.Paths)
	}
	if strings.Contains(got.Notice, "LAND") {
		t.Errorf("the notice tells a hand to land what git carries nowhere:\n%s", got.Notice)
	}
}

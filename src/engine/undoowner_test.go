package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// AN UNDO TAKES BACK ITS OWN WORK AND NOBODY ELSE'S.
//
// The journal was a folder of file lists and the undo took the newest one,
// whoever had written it. With one agent on a tree that is the same thing as
// taking your own back. With ten it is not: the newest apply is somebody else's
// most of the time, and an undo is the verb an agent reaches for the second it
// realises it has made a mistake, which is the second it is least likely to
// check who wrote last.
//
// MEASURED ON THIS TREE: an undo called on one token restored a file belonging
// to another actor's token. The newer content was gone for good, both files
// being untracked, and the only copy left was in the head of the agent that
// wrote it.
func TestAnUndoLeavesAnotherTokensApplyAlone(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	mine := filepath.Join(r.Work, "mine.txt")
	theirs := filepath.Join(r.Work, "theirs.txt")
	if err := os.WriteFile(mine, []byte("mine before"), 0o644); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(theirs, []byte("theirs before"), 0o644); err != nil {
		t.Fatal(err)
	}

	if _, err := Apply(r, []Edit{{File: "mine.txt", Old: "mine before", New: "mine after"}},
		false, "wk-mine", "worker-bell"); err != nil {
		t.Fatal(err)
	}
	// SOMEBODY ELSE WRITES AFTER ME, so the newest entry in the folder is theirs.
	if _, err := Apply(r, []Edit{{File: "theirs.txt", Old: "theirs before", New: "theirs after"}},
		false, "wk-theirs", "worker-vale"); err != nil {
		t.Fatal(err)
	}

	done, err := Undo(r, "wk-mine", "worker-bell")
	if err != nil {
		t.Fatalf("my own apply would not come back: %v", err)
	}
	if b, _ := os.ReadFile(mine); string(b) != "mine before" {
		t.Errorf("my file reads %q after undoing my own apply, and it restored %v", b, done)
	}
	if b, _ := os.ReadFile(theirs); string(b) != "theirs after" {
		t.Errorf("the undo took back another token's work: theirs.txt reads %q", b)
	}
}

// AND AN UNDO WITH NOTHING OF ITS OWN SAYS SO, rather than reaching down the
// stack for the nearest thing it can find.
func TestAnUndoWithNothingOfItsOwnTakesNothing(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	theirs := filepath.Join(r.Work, "theirs.txt")
	if err := os.WriteFile(theirs, []byte("theirs before"), 0o644); err != nil {
		t.Fatal(err)
	}
	if _, err := Apply(r, []Edit{{File: "theirs.txt", Old: "theirs before", New: "theirs after"}},
		false, "wk-theirs", "worker-vale"); err != nil {
		t.Fatal(err)
	}

	_, err := Undo(r, "wk-mine", "worker-bell")
	if err == nil {
		t.Fatal("an undo with nothing of its own took something anyway")
	}
	if !strings.Contains(err.Error(), "wk-mine") {
		t.Errorf("the refusal does not name the token it looked for: %v", err)
	}
	if b, _ := os.ReadFile(theirs); string(b) != "theirs after" {
		t.Errorf("nothing of its own, and it still moved a file: theirs.txt reads %q", b)
	}
}

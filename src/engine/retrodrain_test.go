package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE RETRO DRAINS WHAT GROWS, and both of these grew with nothing draining them.
//
// A kept command output is what an agent was reading, and an undo journal is
// what a change would be put back from. Neither survives the session that made
// it useful, and both were written one file per call, so a folder nobody opens
// filled with the output of every command ever run.
func TestARetroDrainsTheKeptOutputAndTheUndoJournal(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	writeProcess(t, root, "drained", false)

	// Something in each folder, written the way the engine writes it.
	for _, f := range []struct{ dir, name string }{
		{outDir(r), "20260101-000000.000000000.txt"},
		{outDir(r), "20260101-000001.000000000.txt"},
		{undoDir(r), "20260101-000002.000000000.json"},
	} {
		if err := writeAtomic(filepath.Join(f.dir, f.name), []byte("what was there"), 0o644); err != nil {
			t.Fatal(err)
		}
	}

	got, err := Retro(r, "main", nil)
	if err != nil {
		t.Fatalf("the retro would not run: %v", err)
	}
	if got.Outputs != 2 {
		t.Errorf("it drained %d kept output(s) where two were there", got.Outputs)
	}
	if got.Undos != 1 {
		t.Errorf("it drained %d undo journal(s) where one was there", got.Undos)
	}

	// AND THE FOLDERS ARE EMPTY AFTERWARDS, which is what draining means.
	for _, dir := range []string{outDir(r), undoDir(r)} {
		if left, err := os.ReadDir(dir); err == nil && len(left) > 0 {
			t.Errorf("%d file(s) left in %s", len(left), filepath.Base(dir))
		}
	}
	// AND THEY ARE IN THE FOLDER A PERSON OPENS, not deleted.
	for _, sub := range []string{"out", "undo"} {
		kept, err := os.ReadDir(filepath.Join(got.Folder, sub))
		if err != nil || len(kept) == 0 {
			t.Errorf("the retro folder holds nothing under %s", sub)
		}
	}

	// AND THE INDEX SAYS WHAT ONE TURN COSTS, because a number nobody watches
	// is a number that grows.
	b, err := os.ReadFile(filepath.Join(got.Folder, "index.md"))
	if err != nil {
		t.Fatal(err)
	}
	for _, says := range []string{
		"WHAT ONE TURN COSTS, IN BYTES",
		"the standing layer",
		"a pull answer",
		"a gate refusal",
	} {
		if !strings.Contains(string(b), says) {
			t.Errorf("the index does not say %q", says)
		}
	}
}

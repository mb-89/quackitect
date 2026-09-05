package main

import (
	"strings"
	"testing"
)

// AN ARCHIVED NOTE NOTHING POINTS AT IS AN ARCHIVED NOTE A GC TAKES.
//
// The close writes the note into the object store with hash-object, and the
// archive row names the object. Where the branch also committed the note, the
// row names that blob too and the branch keeps it reachable, so nothing is
// lost. Where the branch never carried it, the row names only what the close
// wrote, no ref and no tree reaches that object, and git gc --prune=now, git
// prune or git repack -ad is free to sweep the only copy there is. The close
// has already deleted the file from the disk by then.
//
// A TRACKED TOKEN MINTED AND CLOSED BEFORE ANYBODY COMMITTED doc/work IS THAT
// CASE, and it is an ordinary one: a token that is minted, worked and closed
// inside one stretch of work.
func TestAnArchivedNoteSurvivesAGarbageCollection(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "an uncommitted note",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is quince"})
	if err != nil {
		t.Fatal(err)
	}

	// NOTHING IS COMMITTED. The note is on the disk and nowhere else, which is
	// where a token lives between being minted and somebody staging doc/work.
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}

	// THE PREMISE: the row names the close's blob and nothing the branch holds,
	// so that object is the only copy of the note there is.
	row := theArchiveRow(t, r, tok.ID)
	if row.Blob == "" {
		t.Fatalf("the close wrote no blob for %s, so this test is about nothing", tok.ID)
	}
	if row.OnBranch != "" {
		t.Fatalf("the branch carries %s, so the blob is not the only copy and this "+
			"test is not in the case it means to be", tok.ID)
	}

	// AND THE OBJECT STORE IS COLLECTED, the way a person or a tool does it.
	gitAt(t, r.Work, "gc", "--prune=now", "--quiet")

	said, err := ReadArchived(r, tok.ID)
	if err != nil {
		t.Fatalf("a gc took the only copy of %s, and the close had already taken "+
			"the file off the disk: %v", tok.ID, err)
	}
	if !strings.Contains(said, "quince") {
		t.Fatalf("%s reads back without what it said: %q", tok.ID, said)
	}
}

// theArchiveRow answers the archive's row for one token, and fails the test
// where the archive has none.
func theArchiveRow(t *testing.T, r Roots, id string) Archived {
	t.Helper()
	rows, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	for _, row := range rows {
		if row.ID == id {
			return row
		}
	}
	t.Fatalf("%s is not in the archive", id)
	return Archived{}
}

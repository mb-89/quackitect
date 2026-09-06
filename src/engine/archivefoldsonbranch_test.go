package main

import (
	"encoding/json"
	"os"
	"testing"
)

// A ROW IS GIVEN THE COPY THAT TRAVELS, NOT ONLY ONE THAT NAMES AN OBJECT.
//
// The fold already gives a row from an older archive the blob its tag reaches,
// and that made every row name an object. Naming an object is not the object
// travelling: what the close writes is reachable from nothing, and a tag has to
// be pushed. What travels is on_branch, the note as the branch committed it,
// which is in every clone.
//
// So the fold looks the note up in the branch's own history as well. The note is
// off the disk by then and its deletion is committed, so HEAD holds no such path
// and the commit that carried it is the one to read.
func TestTheFoldGivesARowTheCopyThatTravels(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "the branch carried it",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is quince"})
	if err != nil {
		t.Fatal(err)
	}
	// THE BRANCH COMMITS IT, which is what makes the copy that travels.
	gitAt(t, r.Work, "add", "doc/work")
	gitAt(t, r.Work, "commit", "-m", "the note as the branch carried it")

	tok.Disposition, tok.Status = Done, "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}
	want := theArchiveRow(t, r, tok.ID).OnBranch
	if want == "" {
		t.Fatalf("the close found no committed copy of %s, so this test is about nothing", tok.ID)
	}
	// AND THE CLOSE TOOK THE FILE OFF THE DISK, which the branch is told.
	gitAt(t, r.Work, "add", "-A", "doc")
	gitAt(t, r.Work, "commit", "-m", "the note is archived and off the disk")

	// THE ROW AS AN OLDER ARCHIVE LEFT IT: what the close wrote, and nothing the
	// branch carries.
	// It is written as a line rather than through the writer, because the writer
	// is the thing under test and would fold it back on the way in.
	unfolded := theArchiveRow(t, r, tok.ID)
	unfolded.OnBranch = ""
	line, err := json.Marshal(unfolded)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(ArchiveList(r), append(line, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}
	if got := theArchiveRow(t, r, tok.ID).OnBranch; got != "" {
		t.Fatalf("the row still names %q for what the branch carries, so this test is not "+
			"in the case it means to be", got)
	}

	if err := WriteArchiveList(r); err != nil {
		t.Fatal(err)
	}
	if got := theArchiveRow(t, r, tok.ID).OnBranch; got != want {
		t.Errorf("the fold left the row naming %q for the copy that travels, and the branch "+
			"carries %q", got, want)
	}
}

package main

import (
	"path/filepath"
	"testing"
)

// AN ARCHIVED TOKEN READS AS CLOSED ON THE BOX THAT ONLY HAS THE BRANCH.
//
// An archived row names two copies of the note. The blob the close wrote is
// exact, and it hangs off nothing, so no clone is ever sent it. What the branch
// committed is in every clone, and it is the note one close short: the close
// writes the disposition and the closing state into the frontmatter, and only
// then archives and deletes the file.
//
// So a reader on a clone parsed the note as it stood before the close and was
// handed a token whose status was the open one and whose disposition was empty.
// Ended() then said the closed work was not closed. The row itself carries the
// disposition, so the reader has what it needs.
func TestAnArchivedNoteReadsClosedOnTheBranchAlone(t *testing.T) {
	t.Parallel()
	// THE TREE CARRIES THE REAL PROCESSES, because which state a close ends at
	// is what the process says, and this reader asks it.
	r := aTreeWithTheProcesses(t)
	tok, err := Mint(r, Token{Process: "trivial", Title: "closed and read back",
		Status: "open", Tracked: tracked(), Detail: "the word the search looks for is gooseberry",
		Criteria: []Criterion{{Says: "it reads as closed on a box holding the branch"}}})
	if err != nil {
		t.Fatal(err)
	}
	// THE PROCESSES ARE ON THE BRANCH TOO, which is what a clone of a method
	// tree carries: the reader there reads which state a close ends at.
	gitAt(t, r.Work, "add", "--all", "--", ".")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")

	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}
	gitAt(t, r.Work, "add", "--all", "--", "doc/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the close")

	// THE CLONE IS THE BOX THIS IS ABOUT. It takes the branch and no tags, and
	// the blob the close wrote reaches nothing, so it is not sent either.
	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)
	elsewhere := Roots{Method: clone, Work: clone}

	got, found := readArchivedNote(elsewhere, tok.ID)
	if !found {
		t.Fatalf("the clone could not read %s back at all", tok.ID)
	}
	if !got.Ended() {
		t.Errorf("a closed token reads as not ended, with disposition %q and status %q",
			got.Disposition, got.Status)
	}
	if got.Disposition != Done {
		t.Errorf("the disposition the row carries did not reach the reader: %q", got.Disposition)
	}
	if got.Status != "closed" {
		t.Errorf("the token reads at %q, and the trivial process ends at closed", got.Status)
	}
	// AND THE BODY IS WHAT IT ALWAYS WAS, so nothing was traded for the fix.
	if got.Title != tok.Title {
		t.Errorf("the note that came back is not this token: %q", got.Title)
	}
}

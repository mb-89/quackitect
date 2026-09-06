package main

import (
	"os"
	"testing"
)

// A CLOSE DOES NOT WRITE AN ARCHIVE IT DID NOT READ.
//
// MEASURED, ON 2026-09-06. doc/work/archive.jsonl went from 377 rows to 1 after
// one close on a cloud box. It was caught before it was pushed.
//
// THE PATH. archiveListRows reads a missing file as zero rows and no error.
// TheArchive then folds in the tag rows. On a cloud box that is the tags this
// box made itself, because a push to refs/tags answers 403 and nothing fetches
// them back. So the close writes a list holding those alone.
//
// SweepClosed already guards this and says why in its own comment. The close
// does not, and the close is the door every token goes through.
//
// WHAT THE BRANCH STILL HAS IS THE WAY BACK. The list travels, so a tree with
// history carries it even where the working copy has gone.
func TestACloseDoesNotWriteAnArchiveItDidNotRead(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)

	// TWO TOKENS ARCHIVE, so the list holds rows worth losing.
	for _, title := range []string{"the first to close", "the second to close"} {
		tok, err := Mint(r, Token{Process: "trivial", Title: title, Status: "first", Tracked: tracked()})
		if err != nil {
			t.Fatal(err)
		}
		if err := Archive(r, tok); err != nil {
			t.Fatal(err)
		}
	}
	before, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(before) != 2 {
		t.Fatalf("this test proves nothing: the archive holds %d rows, wanted 2", len(before))
	}

	// THE LIST IS COMMITTED, so the branch carries it the way it does on a real
	// tree, and the working copy is not the only place it lives.
	if _, err := runGit(t, r.Work, "add", "-A"); err != nil {
		t.Fatal(err)
	}
	if _, err := runGit(t, r.Work, "commit", "-q", "-m", "the archive as it stood"); err != nil {
		t.Fatal(err)
	}

	// NOW THE CLOUD BOX. The working copy of the list has gone, and the tags
	// that would have carried those rows never travelled to this box.
	if err := os.Remove(ArchiveList(r)); err != nil {
		t.Fatal(err)
	}
	for _, row := range before {
		if row.Tag != "" {
			if _, err := runGit(t, r.Work, "tag", "-d", trimRefsTags(row.Tag)); err != nil {
				t.Fatal(err)
			}
		}
	}

	// AND A THIRD TOKEN CLOSES.
	third, err := Mint(r, Token{Process: "trivial", Title: "the one closing after",
		Status: "first", Tracked: tracked()})
	if err != nil {
		t.Fatal(err)
	}
	if err := Archive(r, third); err != nil {
		t.Fatal(err)
	}

	after, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(after) < 3 {
		t.Errorf("the close wrote an archive of %d rows over one of %d: a list that is "+
			"absent is not an empty archive", len(after), len(before)+1)
	}
	for _, was := range before {
		found := false
		for _, is := range after {
			if is.ID == was.ID {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("%s was archived and the next close lost it", was.ID)
		}
	}
}

// A TREE THAT NEVER HAD A LIST STILL RECORDS WHAT CLOSES ON IT, so the guard
// above does not turn a first close into a close that records nothing.
func TestAFirstCloseStillWritesTheArchive(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)

	tok, err := Mint(r, Token{Process: "trivial", Title: "the very first close",
		Status: "first", Tracked: tracked()})
	if err != nil {
		t.Fatal(err)
	}
	if err := Archive(r, tok); err != nil {
		t.Fatal(err)
	}
	rows, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].ID != tok.ID {
		t.Fatalf("a first close on a tree with no list wrote %d rows, wanted the one it closed", len(rows))
	}
}

// trimRefsTags answers the tag name git tag -d wants, from the full ref a row
// carries.
func trimRefsTags(ref string) string {
	const at = "refs/tags/"
	if len(ref) > len(at) && ref[:len(at)] == at {
		return ref[len(at):]
	}
	return ref
}

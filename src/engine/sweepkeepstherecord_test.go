package main

import (
	"encoding/json"
	"os"
	"strings"
	"testing"
)

// A SWEEP PUTS BACK NO LIST IT CANNOT REBUILD.
//
// The list is the record rather than a rendering of the tags. A row naming a
// blob is in no tag, and nothing on any box can build that row again, so the
// only copy of it is the file and whatever git holds of the file.
//
// THE SWEEP ENDED BY WRITING THE LIST WHATEVER IT HAD FOUND, and the comment
// above it said that was how a list somebody lost came back. It is not. Over a
// tree whose list has gone, that write puts down one holding what the tags
// carry and nothing else, so every row naming a blob goes for good at the
// moment a person follows that advice to get them back.
func TestASweepPutsBackNoListItCannotRebuild(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)

	// A ROW NAMING A BLOB, which is what a close writes today.
	tok, err := Mint(r, Token{Process: "standard", Title: "a token that travels",
		Status: "first", Tracked: tracked(), Detail: "the word the search looks for is gooseberry"})
	if err != nil {
		t.Fatal(err)
	}
	tok.Disposition = Done
	tok.Status = "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatal(err)
	}
	rows, err := TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	if len(rows) != 1 || rows[0].Blob == "" {
		t.Fatalf("the close wrote no row naming a blob, so this guards nothing: %+v", rows)
	}

	// AND A ROW THE OLDER ARCHIVE TAGGED, so the sweep has something to write.
	// Without one it would write an empty list, which is the same as writing
	// nothing and would let this pass for the wrong reason.
	line, err := json.Marshal(Archived{ID: "wk-1111111111", Title: "an older archive kept",
		Process: "trivial", Disposition: "done", Tag: archiveRefs + "wk-1111111111"})
	if err != nil {
		t.Fatal(err)
	}
	commit := gitAt(t, r.Work, "commit-tree", gitAt(t, r.Work, "write-tree"), "-m", string(line))
	gitAt(t, r.Work, "update-ref", archiveRefs+"wk-1111111111", commit)

	// THE LIST GOES, the way a person who deleted it finds their tree.
	kept, err := os.ReadFile(ArchiveList(r))
	if err != nil {
		t.Fatal(err)
	}
	if err := os.Remove(ArchiveList(r)); err != nil {
		t.Fatal(err)
	}

	if _, _, err := SweepClosed(r); err != nil {
		t.Fatal(err)
	}

	said, err := os.ReadFile(ArchiveList(r))
	if err == nil {
		t.Fatalf("the sweep wrote a list over the lost one:\n%s\nand the row naming a blob was only in:\n%s", said, kept)
	}
	if !os.IsNotExist(err) {
		t.Fatal(err)
	}

	// AND WHAT WAS LOST COMES BACK, which is what writing nothing is for.
	if err := os.WriteFile(ArchiveList(r), kept, 0o644); err != nil {
		t.Fatal(err)
	}
	rows, err = TheArchive(r)
	if err != nil {
		t.Fatal(err)
	}
	back := false
	for _, row := range rows {
		if row.ID == tok.ID && row.Blob != "" {
			back = true
		}
	}
	if !back {
		t.Fatalf("the row naming a blob did not come back with the file: %+v", rows)
	}
	body, err := ReadArchived(r, tok.ID)
	if err != nil {
		t.Fatalf("reading %s back: %v", tok.ID, err)
	}
	if !strings.Contains(body, "gooseberry") {
		t.Errorf("what came back does not carry the token body: %q", body)
	}
}

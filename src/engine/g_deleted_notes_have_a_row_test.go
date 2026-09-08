package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE CASE IS PLANTED, AND A CLEAN ONE STANDS BESIDE IT.
//
// The tree here holds an archive of two rows and one note. One row names a note
// a close took away, and that row is the last name that note has. The other
// names a note that is on the disk, so its row names nothing a reader needs.
//
// A door that refused every write would pass the planted case for the wrong
// reason. The clean cases are what make the planted one evidence.
func TestAnArchiveDroppingANoteThatIsGone(t *testing.T) {
	t.Parallel()
	const gone = "wk-1111111111"
	const here = "wk-2222222222"
	const closing = "wk-3333333333"
	at := TheTrackedFolder + "/archive.jsonl"

	row := func(id, title string) string {
		return `{"id":"` + id + `","title":"` + title + `"}` + "\n"
	}
	goneRow := row(gone, "the one the close took away")
	hereRow := row(here, "the one that is on the disk")

	// A TREE PER CASE, so no case reads what another one wrote.
	tree := func(t *testing.T) Roots {
		t.Helper()
		dir := t.TempDir()
		r := Roots{Work: dir, Method: dir}
		if err := os.MkdirAll(TrackedDir(r), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(ArchiveList(r), []byte(goneRow+hereRow), 0o644); err != nil {
			t.Fatal(err)
		}
		note := "---\ntype: work\n---\n\nthe note that is on the disk\n"
		if err := os.WriteFile(filepath.Join(TrackedDir(r), here+".md"), []byte(note), 0o644); err != nil {
			t.Fatal(err)
		}
		return r
	}

	// PLANTED. The row for the note nothing can open is dropped.
	err := anArchiveDroppingANoteThatIsGone(tree(t), false, at, hereRow)
	if err == nil {
		t.Fatal("a write took the row for a note that is off the disk out of the archive, " +
			"and the note is then gone and named by nothing")
	}
	if !strings.Contains(err.Error(), gone) {
		t.Errorf("the refusal names no note, so a reader cannot tell which row it means: %v", err)
	}
	if !strings.Contains(err.Error(), "on the disk") {
		t.Errorf("the refusal does not say why the row is the last name that note has: %v", err)
	}
	if !strings.Contains(err.Error(), "git checkout") {
		t.Errorf("the refusal offers no legal move, so it is a wall: %v", err)
	}

	// PLANTED. A line the archive cannot read takes every row with it.
	broken := goneRow + hereRow + "this line is not a row at all\n"
	err = anArchiveDroppingANoteThatIsGone(tree(t), false, at, broken)
	if err == nil {
		t.Fatal("a write put a line the archive cannot read into the list, and the list is " +
			"read whole or not at all")
	}
	if !strings.Contains(err.Error(), "not a row at all") {
		t.Errorf("the refusal does not name the line that will not read: %v", err)
	}

	// CLEAN. The row goes and the note it names is on the disk, so no name is lost.
	if err := anArchiveDroppingANoteThatIsGone(tree(t), false, at, goneRow); err != nil {
		t.Errorf("a row dropped for a note that is on the disk was refused: %v", err)
	}

	// CLEAN. Every row is kept and a close adds one.
	whole := goneRow + hereRow + row(closing, "the one closing now")
	if err := anArchiveDroppingANoteThatIsGone(tree(t), false, at, whole); err != nil {
		t.Errorf("a close writing its own row was refused: %v", err)
	}

	// CLEAN. Another file entirely, which this rule has nothing to say about.
	note := "---\ntype: work\n---\n\na note being written\n"
	if err := anArchiveDroppingANoteThatIsGone(tree(t), true, TheTrackedFolder+"/"+closing+".md", note); err != nil {
		t.Errorf("a write of a note was judged by the archive rule: %v", err)
	}

	// CLEAN. A tree with no list yet, where a first close writes one.
	dir := t.TempDir()
	fresh := Roots{Work: dir, Method: dir}
	if err := os.MkdirAll(TrackedDir(fresh), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := anArchiveDroppingANoteThatIsGone(fresh, true, at, goneRow); err != nil {
		t.Errorf("a first close writing the list was refused: %v", err)
	}
}

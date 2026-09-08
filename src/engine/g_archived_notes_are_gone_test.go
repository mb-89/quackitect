package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE INSTRUMENT IS PROVED BEFORE IT RULES.
//
// A door that refuses every write passes a planted case for the wrong reason,
// and it would have passed on the day the tree went wrong. So each planted case
// here has a clean one beside it that differs in the one fact the rule turns
// on, and every refusal is read for the reason it gives.
func TestANoteStandingBesideItsArchiveRow(t *testing.T) {
	const closed, open, gone = "closed-note", "open-note", "gone-note"
	dir := t.TempDir()
	r := Roots{Work: dir, Method: dir}
	here := filepath.Join(dir, filepath.FromSlash(TheTrackedFolder))
	if err := os.MkdirAll(here, 0o755); err != nil {
		t.Fatal(err)
	}
	stands := `{"id":"` + closed + `","title":"a note","disposition":"done"}` + "\n"
	if err := os.WriteFile(filepath.Join(here, "archive.jsonl"), []byte(stands), 0o644); err != nil {
		t.Fatal(err)
	}
	note := "---\nstatus: open\n---\n\n## detail\n\na note\n"
	for _, id := range []string{closed, open} {
		if err := os.WriteFile(filepath.Join(here, id+".md"), []byte(note), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	list := TheTrackedFolder + "/archive.jsonl"

	// PLANTED, the note side. The list already carries this close, so writing the
	// note puts finished work back where every reader counts it as open.
	err := aNoteStandingBesideItsArchiveRow(r, false, TheTrackedFolder+"/"+closed+".md", note)
	theArchiveDoorRefused(t, "a note whose close the list already carries", err, closed, "done", "land the deletion")

	// CLEAN, the note side. Same folder, same bytes, and no row for it. This one
	// is the seven that were genuinely open.
	err = aNoteStandingBesideItsArchiveRow(r, false, TheTrackedFolder+"/"+open+".md", note)
	theArchiveDoorAllowed(t, "a note the list says nothing about", err)

	// CLEAN, the note side again. A local note is kept until a retro reads it, so
	// the rule is not about it even where a row names the same id.
	err = aNoteStandingBesideItsArchiveRow(r, false, ".se/work/"+closed+".md", note)
	theArchiveDoorAllowed(t, "a note outside the tracked folder", err)

	// PLANTED, the list side. The row is added for a note still on the disk,
	// which is the close whose deletion never travelled.
	err = aNoteStandingBesideItsArchiveRow(r, false, list,
		stands+`{"id":"`+open+`","disposition":"done"}`+"\n")
	theArchiveDoorRefused(t, "a row added for a note still on the disk", err, open, "still on the disk", "land.sh")

	// CLEAN, the list side. The row is added for a note that is off the disk,
	// which is what a close leaves behind.
	err = aNoteStandingBesideItsArchiveRow(r, false, list,
		stands+`{"id":"`+gone+`","disposition":"done"}`+"\n")
	theArchiveDoorAllowed(t, "a row added for a note that is gone", err)

	// CLEAN, the list side. The pair this tree already stood in is not this
	// write's doing, and refusing it would leave the writer no move but to repair
	// work they never touched.
	err = aNoteStandingBesideItsArchiveRow(r, false, list, stands)
	theArchiveDoorAllowed(t, "the list rewritten as it already stood", err)

	// PLANTED, the list side. A line nobody can read may be the row for a note
	// still sitting in the folder, so it is refused rather than passed over.
	err = aNoteStandingBesideItsArchiveRow(r, false, list, stands+"{not a row}\n")
	theArchiveDoorRefused(t, "a line of the list that will not read", err, "does not read as an archive row")
}

// theArchiveDoorRefused says the door refused, and that the refusal names why.
// A refusal a reader cannot act on is a wall, and the words are what make it a
// door.
func theArchiveDoorRefused(t *testing.T, what string, err error, words ...string) {
	t.Helper()
	if err == nil {
		t.Fatalf("%s was allowed through, and the pair it makes is what the archive was written to prevent", what)
	}
	for _, want := range words {
		if !strings.Contains(err.Error(), want) {
			t.Errorf("the refusal of %s does not say %q, so a reader is not told what to do: %s", what, want, err)
		}
	}
}

// theArchiveDoorAllowed says the door let a legal write through. It is the half
// that makes the refusals above evidence rather than a door that refuses
// everything.
func theArchiveDoorAllowed(t *testing.T, what string, err error) {
	t.Helper()
	if err != nil {
		t.Fatalf("%s was refused, and a door that refuses a legal write leaves nowhere to go: %s", what, err)
	}
}

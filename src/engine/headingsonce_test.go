package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A NOTE THAT OPENS THE SAME SECTION TWICE IS REFUSED.
//
// The body is read into its sections by heading. The schema keeps the last
// chapter under a name, so a second chapter under the same heading buries the
// first and no departure says so. MEASURED on wk-963dbf6898: two approach
// sections in different words, one carrying a sentence the other did not, and
// a reader could not say which the change was written against.

// aNoteRepeating writes a trivial note whose body opens approach this many
// times, the way a hand editing the file lands it.
func aNoteRepeating(t *testing.T, r Roots, id string, approaches int) {
	t.Helper()
	if err := os.MkdirAll(TrackedDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	note := "---\nkind: [[work-token]]\nprocess: [[trivial]]\ntitle: one approach twice\nstatus: open\n---\n\n## detail\n\nA note the record is asked to hold.\n\n"
	for i := 0; i < approaches; i++ {
		note += "## approach\n\nThe design, said once more.\n\n"
	}
	if err := os.WriteFile(filepath.Join(TrackedDir(r), id+".md"), []byte(note), 0o644); err != nil {
		t.Fatal(err)
	}
}

// THE SCHEMA NAMES IT, so lint and every schema gate see it.
func TestTheSchemaRefusesARepeatedHeading(t *testing.T) {
	t.Parallel()
	twice := "## approach\n\nonce\n\n## approach\n\nagain\n"
	var said []string
	for _, d := range checkBody(BodySpec{HeadingLevel: 2, ExtraSections: true}, twice, 1) {
		said = append(said, d.Says)
	}
	if len(said) == 0 || !strings.Contains(strings.Join(said, " "), "approach") {
		t.Fatalf("a body opening approach twice raised no departure naming it: %v", said)
	}
	once := "## approach\n\nonce\n"
	if got := checkBody(BodySpec{HeadingLevel: 2, ExtraSections: true}, once, 1); len(got) != 0 {
		t.Fatalf("a body opening approach once was refused: %+v", got)
	}
}

// AND THE RECORD WILL NOT WRITE IT BACK, so the next save cannot land it.
func TestTheRecordRefusesToSaveARepeatedHeading(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)

	aNoteRepeating(t, r, "wk-twice", 2)
	tok, err := LoadToken(r, "wk-twice")
	if err != nil {
		t.Fatal(err)
	}
	if err := SaveToken(r, tok); err == nil {
		t.Fatal("a note with two approach sections was saved, so the second buries the first")
	} else if !strings.Contains(err.Error(), "approach") {
		t.Fatalf("the refusal does not name the section it is about: %v", err)
	}

	aNoteRepeating(t, r, "wk-once", 1)
	tok, err = LoadToken(r, "wk-once")
	if err != nil {
		t.Fatal(err)
	}
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("a note with one approach section was refused: %v", err)
	}
}

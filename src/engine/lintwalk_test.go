package main

import (
	"strings"
	"testing"
)

// THE LINT GOES ALL THE WAY DOWN.
//
// MEASURED. It read one level and skipped every directory, so doc/guidance was
// checked and doc/guidance/software-development was not. Four files had never
// been read by anything, and the schema they name applied to them exactly as
// much as to any other file. Nothing had ever asked.
//
// A CHECK THAT READS THE TOP OF A TREE REPORTS ON THE TREE. That is what makes
// this the quiet kind of gap: it answered clean, and clean was true about the
// files it read.
func TestTheLintReadsEveryFolderDown(t *testing.T) {
	t.Parallel()
	r := aTreeOfGuidance(t)

	found := LintNotes(r, GuidanceDir(r.Method))
	saw := map[string]bool{}
	for _, f := range found {
		saw[f.ID] = true
	}

	// THE ONE AT THE TOP, which the old walk read.
	if !saw["top.md"] {
		t.Error("the file at the top was not read")
	}
	// THE ONE A FOLDER DOWN, which it did not.
	if !saw["lane/deep.md"] {
		t.Errorf("a file in a subfolder was not read: it found %v", keysOf(saw))
	}
	// AND TWO FOLDERS DOWN, because one level of recursion is not recursion.
	if !saw["lane/deeper/deepest.md"] {
		t.Errorf("a file two folders down was not read: it found %v", keysOf(saw))
	}

	// THE ID CARRIES THE PATH. Two files called guidance.md, one at the top and
	// one in a lane's folder, are two findings a reader has to tell apart.
	for id := range saw {
		if id == "deep.md" || id == "deepest.md" {
			t.Errorf("a finding is named %q, which says nothing about where it is", id)
		}
	}
}

// A PARKED FOLDER IS SKIPPED WHOLE, which is what makes parking a thing you can
// do to a lane rather than only to a file.
func TestAParkedFolderIsSkippedWhole(t *testing.T) {
	t.Parallel()
	r := aTreeOfGuidance(t)
	for _, f := range LintNotes(r, GuidanceDir(r.Method)) {
		if strings.HasPrefix(f.ID, "_parked/") {
			t.Errorf("a file under a parked folder was read: %s", f.ID)
		}
		if strings.Contains(f.ID, "_alone.md") {
			t.Errorf("a parked file was read: %s", f.ID)
		}
	}
}

func keysOf(m map[string]bool) []string {
	out := make([]string, 0, len(m))
	for k := range m {
		out = append(out, k)
	}
	return out
}

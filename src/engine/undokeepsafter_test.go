package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"testing"
)

// THE JOURNAL SAYS WHAT THE APPLY WROTE, NOT ONLY WHAT IT HASHES TO.
//
// An entry carried the file's old bytes whole and the new ones as a sha256. The
// undo needs the hash and nobody can read a file back out of one. The private
// folder is not in git, so a token file the engine wiped was gone for good
// unless some later apply happened to journal the wiped text as its own before.
// Two tokens were lost that way, one entry holding a blank template and one
// holding a state an apply short of what the token said.
//
// So the entry carries the text as well, and the state between two applies is
// rebuilt from the older entry alone.
func TestTheJournalRebuildsWhatTheApplyWrote(t *testing.T) {
	t.Parallel()
	r := aTreeToWriteIn(t)
	kept := filepath.Join(r.Work, "kept.txt")
	if err := os.WriteFile(kept, []byte("the first thing it said"), 0o644); err != nil {
		t.Fatal(err)
	}
	between := "the second thing it said"
	for _, said := range []string{between, "the third thing it said"} {
		if _, err := Apply(r, []Edit{{File: "kept.txt", Op: "write", New: said}},
			false, "wk-journal", "tester"); err != nil {
			t.Fatal(err)
		}
	}

	entries := theJournalEntries(t, r)
	if len(entries) != 2 {
		t.Fatalf("two applies left %d journal entries", len(entries))
	}
	// THE STATE BETWEEN THE TWO, out of the older entry and nothing else. The
	// tree holds the third thing by now, so a rebuild that read the disk would
	// prove nothing.
	if got := theTextTheApplyWrote(t, entries[0], "kept.txt"); got != between {
		t.Errorf("the entry rebuilds %q, and that apply wrote %q", got, between)
	}
}

// theJournalEntries is every entry in the undo folder, oldest first. The name
// is the time it was written, so sorting by name is sorting by when.
func theJournalEntries(t *testing.T, r Roots) []string {
	t.Helper()
	found, err := os.ReadDir(undoDir(r))
	if err != nil {
		t.Fatalf("the undo folder cannot be read: %v", err)
	}
	var names []string
	for _, e := range found {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".json") {
			names = append(names, filepath.Join(undoDir(r), e.Name()))
		}
	}
	sort.Strings(names)
	return names
}

// theTextTheApplyWrote rebuilds one file as that apply left it, out of the entry
// and nothing else.
//
// IT FINDS THE TEXT BY WHAT IT HOLDS RATHER THAN BY ITS NAME. The entry already
// records the hash of what the apply wrote, so the text that answers that hash
// is the text, whatever the record calls the field. This test then says the
// record has to carry it and leaves the naming to the record.
func theTextTheApplyWrote(t *testing.T, entry, file string) string {
	t.Helper()
	raw, err := os.ReadFile(entry)
	if err != nil {
		t.Fatal(err)
	}
	var j struct {
		Files []map[string]any `json:"files"`
	}
	if err := json.Unmarshal(raw, &j); err != nil {
		t.Fatalf("the journal entry will not read: %v", err)
	}
	for _, one := range j.Files {
		if name, _ := one["file"].(string); name != file {
			continue
		}
		applied, _ := one["applied"].(string)
		for key, v := range one {
			said, ok := v.(string)
			if !ok || key == "was" || key == "applied" {
				continue
			}
			if hashOf([]byte(said)) == applied {
				return said
			}
		}
		t.Fatalf("the entry for %s carries the hash %s and no text that answers it, "+
			"so what the apply wrote cannot be rebuilt", file, applied)
	}
	t.Fatalf("the journal entry names no %s", file)
	return ""
}

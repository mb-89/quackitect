package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// AN ID WRITTEN INTO A NOTE REACHES SOMETHING, AND THE LINT SAYS SO WHEN IT
// DOES NOT.
//
// A closed token's evidence said one token each had been minted for three
// files. Two landed and archived. The third was never minted, and the only
// trace left was the sentence claiming it had been. Nothing read that
// sentence, so the one piece of the cleanup still undone was also the piece no
// longer in the queue.
//
// The lint reads the tokens that exist and never asked whether an id written
// into one still opens. This is that question, and it has two answers that
// count as reaching something: a token on disk, and a row in the archive.
func TestATokenIdNamingNothingIsAFinding(t *testing.T) {
	t.Parallel()
	r := aTree(t).Roots
	root := r.Work
	writeProcess(t, root, "gated")

	// A CLOSED TOKEN IS OFF THE DISK AND IN THE LIST, so the archive is the
	// other half of what resolving means. Naming one is how finished work is
	// traced, and a rule that only read the disk would call every trace broken.
	const archived = "wk-bbbbbbbbbb"
	if err := os.MkdirAll(filepath.Dir(ArchiveList(r)), 0o755); err != nil {
		t.Fatal(err)
	}
	row, err := json.Marshal(Archived{ID: archived, Title: "a closed token",
		Process: "gated", Disposition: "done"})
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(ArchiveList(r), append(row, '\n'), 0o644); err != nil {
		t.Fatal(err)
	}

	open := mintWithDetail(t, r, "this one stands on nothing else")
	clean := map[string]string{
		"an open token, on the disk":     mintWithDetail(t, r, "it follows on from "+open.ID).ID,
		"a closed token, in the archive": mintWithDetail(t, r, "it follows on from "+archived).ID,
	}
	gone := mintWithDetail(t, r, "one token each, and wk-aaaaaaaaaa for the third file").ID

	said := map[string]string{}
	for _, f := range LintTokens(r) {
		said[f.ID] = f.Says
	}
	says, named := said[gone]
	switch {
	case !named:
		t.Errorf("the lint says nothing about %s, so an id reaching nothing stays silent", gone)
	case !strings.Contains(says, "wk-aaaaaaaaaa"):
		t.Errorf("the finding does not name the id that reaches nothing: %s", says)
	case !strings.Contains(says, "no token and no archive row answers to it"):
		t.Errorf("the finding does not say what is wrong with it: %s", says)
	}
	for what, id := range clean {
		if says, named := said[id]; named {
			t.Errorf("%s was read as reaching nothing: %s", what, says)
		}
	}
}

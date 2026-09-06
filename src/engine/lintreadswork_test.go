package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE LINT READS A WORK TOKEN AGAINST ITS OWN SCHEMA.
//
// se lint says of itself that it reads the tree and names what breaks a rule.
// It read guidance and rationales that way and never a work token: the token
// lint checked a title and looked for times, and no token was ever put to its
// schema. So a token whose chapters break the schema was clean to the verb and
// red only in the editor.
//
// MEASURED before wiring it in, because this puts every token in the tree to a
// schema at once. LintNotes over doc/work answered 283 findings. 208 of those
// were two fields the engine itself writes, which an earlier token declared,
// and what is left is 75.
func TestTheLintReadsAWorkTokenAgainstItsSchema(t *testing.T) {
	t.Parallel()
	method, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	work := t.TempDir()
	dir := filepath.Join(work, "doc", "work")
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	write := func(id, note string) {
		t.Helper()
		if err := os.WriteFile(filepath.Join(dir, id+".md"), []byte(note), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("wk-1111111111", `---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: a token that reads
status: open
---

## detail

A token whose chapters are the ones its schema declares.

## done when

- it reads clean
`)
	write("wk-2222222222", `---
kind: [[work-token]]
process: [[trivial]]
guidance: [[work-token]]
title: a token that breaks
status: open
invented_field: nothing declares this
---

## detail

A token carrying a field its schema refuses.

## done when

- it is named by the lint
`)

	found := LintWork(Roots{Method: method, Work: work})
	var about1, about2 int
	for _, f := range found {
		switch {
		case strings.Contains(f.ID, "wk-1111111111"):
			about1++
		case strings.Contains(f.ID, "wk-2222222222"):
			about2++
		}
	}
	if about2 == 0 {
		t.Errorf("a token carrying a field its schema refuses was not named: %v", found)
	}
	if about1 != 0 {
		t.Errorf("a token that reads clean was named %d time(s)", about1)
	}
}

// AND THE HELP LINE SAYS WHAT THE VERB READS.
//
// The help said tokens, guidance and Go, while the verb also read icons,
// limits, rationales and processes, and read no work token against its schema
// at all. Both are the one list now, so they cannot drift apart again.
func TestTheLintHelpNamesWhatItReads(t *testing.T) {
	t.Parallel()
	said := whatTheLintReads()
	if len(theLints) < 2 {
		t.Fatalf("the lint list holds %d corpora", len(theLints))
	}
	for _, one := range theLints {
		if !strings.Contains(said, one.Name) {
			t.Errorf("the help line does not name %q: %q", one.Name, said)
		}
	}
	if !strings.Contains(said, "Go") {
		t.Errorf("the help line does not name Go, which the verb also reads: %q", said)
	}
}

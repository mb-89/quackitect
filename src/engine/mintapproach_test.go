package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A REQUIRED APPROACH IS REQUIRED AT THE MINT.
//
// The standard process declares approach a required section, and its open
// state reads "written with its approach, and waiting to be taken". The mint
// wrote neither and had no field to carry one, so a standard token was open
// and failing open-tokens-carry-their-sections a second after it was minted.
// Twenty-seven stood on this tree when this was written.
//
// WHICH DOOR THIS CLOSES. Two were open. This is the mint refusing what the
// process requires, which is the door the neighbouring rule already uses for
// done when, and the refusal reaches a caller who can still act. The other
// door is that a token is not open until its ask is answered, which is what
// the state's own description says: that one wants a state before open in
// every process asking for an approach, and in everything that reads a state,
// so it is a change to the processes rather than to the mint.
func TestAMintRequiringAnApproachRefusesWithoutIt(t *testing.T) {
	t.Parallel()
	r := aTreeRequiringAnApproach(t)
	_, err := Mint(r, Token{Tracked: local(), Process: "shaped", Title: "a shaped change", Detail: "change it"})
	if err == nil || !strings.Contains(err.Error(), "approach") {
		t.Fatalf("a mint with no approach was answered %v, want a refusal naming the approach", err)
	}
	const shape = "one interface, named, so a reader can disagree with it"
	tok, err := Mint(r, Token{Tracked: local(), Process: "shaped", Title: "a shaped change",
		Detail: "change it", Approach: shape})
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(r.Work, ".se", "work", tok.ID+".md"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(b), "## approach") || !strings.Contains(string(b), shape) {
		t.Fatalf("the minted note does not carry the approach chapter: %s", b)
	}
	// AND IT READS BACK INTO THE FIELD IT WAS WRITTEN FROM. A chapter the
	// reader does not know is kept, and a kept approach would be written twice
	// the next time anything saved the token.
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	if back.Approach != shape {
		t.Fatalf("the approach read back as %q, and it was written as %q", back.Approach, shape)
	}
	for _, k := range back.Kept {
		if strings.TrimPrefix(k.Head, "## ") == "approach" {
			t.Fatal("the approach was kept as a section the reader does not know, so a save would write it twice")
		}
	}
}

// aTreeRequiringAnApproach is a tree whose one process wants a detail and an
// approach, which is the shape the standard process has.
func aTreeRequiringAnApproach(t *testing.T) Roots {
	t.Helper()
	f := aTree(t)
	dir := ProcessesDir(f.Work)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: shaped
description: a change that wants a shape a reader can disagree with
sections:
  required:
    - detail
    - approach
states:
  - name: open
    description: written with its approach, and waiting to be taken
activities:
  - name: ask
    does: write it with its approach
    to: open
dispositions:
  - name: done
    description: it was done
`
	if err := os.WriteFile(filepath.Join(dir, "shaped.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return f.Roots
}

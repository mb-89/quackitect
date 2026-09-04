package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE WRITE DOOR CHECKS THE SCHEMA THE WAY THE MINT DOOR DOES.
//
// MEASURED. A detail grown well past its bound through apply was taken, and
// every engine call the holder made afterwards was refused:
// putting a held token back validates it, and it would not load. The mint door
// checked and the write door did not, so the way to leave a token nothing can
// read was to use the door that writes files.
func TestAnApplyPastTheSchemasCapIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeDescribingFields(t)
	tok := aMintedToken(t, r)
	name := filepath.Join(".se", "work", tok.ID+".md")

	long := strings.Repeat("argument ", 30) // 30 words, against a bound of 20
	_, err := Apply(r, []Edit{{File: name, Old: "short", New: long}}, false, tok.ID, "tester")
	if err == nil {
		t.Fatal("a write that leaves the token unloadable was taken")
	}
	if !strings.Contains(err.Error(), "the schema allows") {
		t.Errorf("it was refused for something else: %v", err)
	}
	// THE REFUSAL NAMES THE TOKEN IT MEASURED. A size with no id beside it
	// reads as a complaint about whatever the caller happened to name.
	if !strings.Contains(err.Error(), tok.ID) {
		t.Errorf("the refusal does not name the token it measured: %v", err)
	}
	if b, _ := os.ReadFile(filepath.Join(r.Work, name)); !strings.Contains(string(b), "short") {
		t.Errorf("a refused apply wrote anyway:\n%s", b)
	}
}

// AND AN EDIT THAT BRINGS AN OVER-LONG SECTION DOWN IS LET THROUGH. A guard
// that measures the result alone refuses the one edit that fixes the file, and
// the holder is locked out with no way back in.
func TestAnApplyThatShrinksAnOverLongSectionIsTaken(t *testing.T) {
	t.Parallel()
	r := aTreeDescribingFields(t)
	tok := aMintedToken(t, r)
	name := filepath.Join(".se", "work", tok.ID+".md")
	path := filepath.Join(r.Work, name)

	// Past the cap by hand, the way the unguarded door used to leave it.
	raw, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	over := strings.Repeat("argument ", 30)
	if err := os.WriteFile(path, []byte(strings.Replace(string(raw), "short", over, 1)), 0o644); err != nil {
		t.Fatal(err)
	}

	smaller := strings.Repeat("argument ", 25) // still over, and smaller
	if _, err := Apply(r, []Edit{{File: name, Old: over, New: smaller}}, false, tok.ID, "tester"); err != nil {
		t.Fatalf("an edit that brings an over-long section down was refused: %v", err)
	}
	if b, _ := os.ReadFile(path); !strings.Contains(string(b), smaller) {
		t.Errorf("the shrinking edit did not land:\n%s", b)
	}
}

func aMintedToken(t *testing.T, r Roots) Token {
	t.Helper()
	tok, err := Mint(r, Token{Process: "small", Title: "a small change", Detail: "short",
		Status: "open", Criteria: []Criterion{{Says: "go test ./... is green"}}})
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

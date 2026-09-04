package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// EVERY KIND HAS A SCHEMA, AND BOTH DOORS SAY SO.
//
// Three kinds exist, work-token, guidance and rationale, and each has one, so
// this binds nothing today. That is why it was cheap to write: the third kind
// could not arrive without a schema, and it did not.
//
// THERE ARE TWO DOORS AND THE RULE IS DRIVEN THROUGH EACH. The mint is where a
// note is made, and the lint is where one already on disk is read. A rule taught
// to one door is half a mechanism: a kind refused at the mint still lands if
// somebody writes the file by hand, and a kind the lint refuses is still mintable
// until the mint is told too.
//
// BOTH HAVE TO NAME THE KIND. "no schema" leaves a reader hunting for which of
// the kinds on the page has not got one.
func TestAKindNeedsASchema(t *testing.T) {
	root := aTreeWithTheTwoSchemas(t)
	r := Roots{Method: root, Work: root}

	// THE MINT. A token declaring a kind nothing can read is refused before it is
	// written, because a file that lands is a file somebody has to find again.
	t.Run("the mint refuses a kind with no schema", func(t *testing.T) {
		_, err := Mint(r, Token{Kind: "invented", Process: "trivial", Title: "a kind nobody declared",
			Criteria: []Criterion{{Says: "it is refused"}}})
		if err == nil {
			t.Fatal("the mint wrote a note whose kind has no schema, so nothing can read it back")
		}
		if !strings.Contains(err.Error(), "invented") {
			t.Fatalf("the refusal does not name the kind, so a reader cannot tell which one: %v", err)
		}
	})

	// AND IT LETS THE KINDS THAT EXIST THROUGH. A guard that refuses everything
	// is not a guard, and this is the half that would go quiet first.
	t.Run("the mint takes a kind that has one", func(t *testing.T) {
		if _, err := Mint(r, Token{Kind: "work-token", Process: "trivial", Title: "a declared kind",
			Criteria: []Criterion{{Says: "it is written"}}}); err != nil {
			t.Fatalf("the mint refused work-token, which has a schema: %v", err)
		}
	})

	// THE LINT. A note already on disk is read against the schema its kind names,
	// and a kind with no schema is a finding rather than a skip.
	t.Run("the lint refuses a kind with no schema", func(t *testing.T) {
		dir := filepath.Join(root, "notes")
		if err := os.MkdirAll(dir, 0o755); err != nil {
			t.Fatal(err)
		}
		note := "---\nkind: [[invented]]\ntitle: written by hand\n---\n\n# a note\n"
		if err := os.WriteFile(filepath.Join(dir, "by-hand.md"), []byte(note), 0o644); err != nil {
			t.Fatal(err)
		}
		found := LintNotes(r, dir)
		if len(found) == 0 {
			t.Fatal("the lint read a note whose kind has no schema and said nothing")
		}
		var said []string
		for _, f := range found {
			said = append(said, f.Says)
		}
		if !strings.Contains(strings.Join(said, "\n"), "invented") {
			t.Fatalf("the lint said nothing naming the kind: %v", said)
		}
	})
}

// A tree carrying the schemas and processes the product ships, copied in, so
// the two kinds that exist are the two kinds this test finds.
func aTreeWithTheTwoSchemas(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	for _, dir := range []string{"schemas", "processes"} {
		from := filepath.Join("..", dir)
		to := filepath.Join(root, "src", dir)
		if err := os.MkdirAll(to, 0o755); err != nil {
			t.Fatal(err)
		}
		entries, err := os.ReadDir(from)
		if err != nil {
			t.Fatalf("the shipped %s cannot be read, so this test guards nothing: %v", dir, err)
		}
		for _, e := range entries {
			if e.IsDir() {
				continue
			}
			b, err := os.ReadFile(filepath.Join(from, e.Name()))
			if err != nil {
				t.Fatal(err)
			}
			if err := os.WriteFile(filepath.Join(to, e.Name()), b, 0o644); err != nil {
				t.Fatal(err)
			}
		}
	}
	// A CHECK THAT FINDS NOTHING TO CHECK REFUSES. If the schemas move, this
	// test must fail rather than pass with nothing copied.
	if _, err := LoadSchema(root, "work-token"); err != nil {
		t.Fatalf("the work-token schema did not copy, so this test guards nothing: %v", err)
	}
	if _, err := LoadSchema(root, "guidance"); err != nil {
		t.Fatalf("the guidance schema did not copy, so this test guards nothing: %v", err)
	}
	return root
}

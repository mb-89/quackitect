package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A REQUIRED DONE WHEN IS REQUIRED AT THE MINT. The schema refuses the file
// the moment it lands, so the call is refused instead, to a caller who can
// still act. Minting with criteria writes the chapter.
func TestAMintRequiringDoneWhenRefusesWithoutIt(t *testing.T) {
	t.Parallel()
	r := aTreeRequiringDoneWhen(t)
	_, err := Mint(r, Token{Process: "small", Title: "a small change", Detail: "change it"})
	if err == nil || !strings.Contains(err.Error(), "done when") {
		t.Fatalf("a mint without done when was answered %v, want a refusal naming done when", err)
	}
	tok, err := Mint(r, Token{Process: "small", Title: "a small change", Detail: "change it",
		Criteria: []Criterion{{Says: "go test ./... is green"}}})
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(r.Work, ".se", "work", tok.ID+".md"))
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(string(b), "## done when") || !strings.Contains(string(b), "- go test ./... is green") {
		t.Fatalf("the minted note does not carry the done when chapter: %s", b)
	}
}

// THE COMMENT IS ON THE TOKEN, NOT ONLY ON THE TEMPLATE. The schema
// describes each field and the template writes the description above it, so
// a token minted by the verb carries the same guidance and its reader is not
// sent to a manual. Ruled in cross-cutting 4d: the guidance belongs where
// the field is.
func TestAMintedTokenCarriesEachFieldsComment(t *testing.T) {
	t.Parallel()
	r := aTreeDescribingFields(t)
	tok, err := Mint(r, Token{Process: "small", Title: "a small change", Detail: "change it",
		Status: "open", Criteria: []Criterion{{Says: "go test ./... is green"}}})
	if err != nil {
		t.Fatal(err)
	}
	b, err := os.ReadFile(filepath.Join(r.Work, ".se", "work", tok.ID+".md"))
	if err != nil {
		t.Fatal(err)
	}
	for field, comment := range map[string]string{
		"process": "# which process shapes it",
		"title":   "# the name it is known by",
		"status":  "# where it stands",
	} {
		if !strings.Contains(string(b), comment+"\n"+field+":") {
			t.Errorf("%s does not carry its comment %q:\n%s", field, comment, b)
		}
	}
}

// THE SIZE BOUND IS THE SCHEMA'S. The save reads the detail's byte bound
// from the section that carries it, so the rule lives with the field it
// holds and util/parameters.json keeps no second copy.
func TestAnOversizeDetailIsRefusedOffTheSchema(t *testing.T) {
	t.Parallel()
	r := aTreeDescribingFields(t)
	long := strings.Repeat("argument ", 30)
	_, err := Mint(r, Token{Process: "small", Title: "a small change", Detail: long,
		Status: "open", Criteria: []Criterion{{Says: "go test ./... is green"}}})
	if err == nil || !strings.Contains(err.Error(), "the schema allows") {
		t.Fatalf("an oversize detail was answered %v, want a refusal naming the schema's bound", err)
	}
}

// aTreeDescribingFields is aTreeRequiringDoneWhen with a schema that
// describes each field, so a mint has descriptions to carry.
func aTreeDescribingFields(t *testing.T) Roots {
	t.Helper()
	r := aTreeRequiringDoneWhen(t)
	dir := SchemasDir(r.Method)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const schema = `kind: work-token
frontmatter:
  type: object
  required:
    - kind
    - process
    - title
    - status
  properties:
    kind:
      const: work-token
      description: which schema reads this note
    process:
      description: which process shapes it
    title:
      description: the name it is known by
    status:
      description: where it stands
body:
  headingLevel: 2
  sections:
    - header: detail
      maxBytes: 120
    - header: done when
      list: true
`
	if err := os.WriteFile(filepath.Join(dir, "work-token.schema.yaml"), []byte(schema), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

// aTreeRequiringDoneWhen writes a process whose tokens must say what done
// means before they exist.
func aTreeRequiringDoneWhen(t *testing.T) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	dir := ProcessesDir(root)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		t.Fatal(err)
	}
	const proc = `name: small
description: a small change with criteria up front
traced: false
sections:
  required:
    - detail
    - done when
states:
  - name: open
    description: waiting
  - name: closed
    description: finished
activities:
  - name: do
    does: do it
    to: open
dispositions:
  - name: done
    description: it was done
`
	if err := os.WriteFile(filepath.Join(dir, "small.process.yaml"), []byte(proc), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

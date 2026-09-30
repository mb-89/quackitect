// The mint writes the front a schema asks, and a chapter for each section.
// [[spec/tickets/edit-tools-answer-in-go]]
package check

import (
	"strings"
	"testing"

	"quackitect/src/yaml"
)

// A schema naming a linked kind, a list key, and three chapters: one given, one a list, one a table. [[spec/tickets/edit-tools-answer-in-go]]
const mintSchema = `kind: sample
governs:
  - spec/sample/**
frontmatter:
  type: object
  required:
    - kind
    - tags
  properties:
    kind:
      const: sample
      x-link: true
      description: the schema
    tags:
      type: array
      description: the tags it carries
body:
  headingLevel: 1
  sections:
    - header: Scope
      required: true
      description: what it asks
    - header: Steps
      list: true
      ordered: true
    - header: Examples
      table:
        heads: [the rule, do]
        namesOf: Steps
`

// [[spec/tickets/edit-tools-answer-in-go]]
func TestMintFillsEachChapterTheSchemaNames(t *testing.T) {
	schema := yaml.AsDoc(yaml.Read(mintSchema))
	got := mintNote(schema, map[string]any{"Scope": "One thing.", "tags": []any{"a"}})
	want := "---\nkind: [[sample]]\ntags: [\"a\"]\n---\n\n# Scope\n\nOne thing.\n\n# Steps\n\n1. Say the first one here.\n\n# Examples\n\n| the rule | do |\n|---|---|\n| 1 | Say the first one here. |\n"
	if got != want {
		t.Errorf("the mint writes\n%s\nand wants\n%s", got, want)
	}
	if !strings.Contains(mintNote(schema, nil), "# Scope\n\n<!-- what it asks -->") {
		t.Errorf("a chapter left out takes no description as its placeholder")
	}
}

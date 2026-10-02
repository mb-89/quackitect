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

// A schema writing one chapter a step of its route. [[spec/tickets/mint-keeps-nested-steps]]
const routedSchema = `kind: routed
frontmatter:
  type: object
  required:
    - kind
    - steps
  properties:
    kind:
      const: routed
      x-link: true
      description: the schema
    steps:
      type: array
      description: the route
body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
      description: what it asks
    - header: Step
      x-one-per: steps
`

// The body mintNote in lib/schema-mint.js writes over the same route. [[spec/tickets/mint-keeps-nested-steps]]
const routedBody = "\n# Ask\n\nA thing.\n\n# design\n\n## draft\n\n<!-- writes the approach -->\n\n### approach\n\n<!-- the approach -->\n\n<!-- the form is text -->\n\n### checked\n\n<!-- one line per item of the checklist, on how you take it into account -->\n\n<!-- the form is checklist -->\n\n## owner-read\n\n<!-- does the ask say what the owner said -> -->\n\n# gate\n\n<!-- reads the design -->\n\n## verdict\n\n<!-- accept or reject -->\n\n<!-- the form is verdict -->\n"

// [[spec/tickets/mint-keeps-nested-steps]]
func TestAMintNestsEachStepAsTheJavaScriptMintDoes(t *testing.T) {
	steps := []any{
		map[string]any{"name": "design", "steps": []any{
			map[string]any{"name": "draft", "does": "writes the approach", "checklist": []any{"every file stands opened"},
				"evidence": []any{map[string]any{"name": "approach", "form": "text", "says": "the approach"}}},
			map[string]any{"name": "owner-read", "asks": "does the ask  say what\n the owner said -->", "by": "person"},
		}},
		map[string]any{"name": "gate", "does": "reads the design", "evidence": []any{map[string]any{"name": "verdict", "form": "verdict", "says": "accept or reject"}}},
	}
	got := mintNote(yaml.AsDoc(yaml.Read(routedSchema)), map[string]any{"steps": steps, "Ask": "A thing."})
	_, body, _ := strings.Cut(strings.TrimPrefix(got, "---\n"), "\n---\n")
	if body != routedBody {
		t.Errorf("the Go mint writes the body\n%s\nand the JavaScript mint writes\n%s", body, routedBody)
	}
}

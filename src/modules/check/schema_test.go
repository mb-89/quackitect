// The schema checker's words over a note missing a field and a chapter, which
// schema.go and schema-body.go say, and the chapter each nested step and
// field wants.
// [[spec/tickets/cage-write-door-port]]
package check

import (
	"slices"
	"strings"
	"testing"

	"quackitect/src/yaml"
)

const looseHandoverSchema = `kind: handover
governs:
  - .se/HANDOVER.md
frontmatter:
  type: object
  required: [kind, status]
  properties:
    kind:
      const: handover
      x-link: true
    status:
      enum: [todo, held, done]
body:
  headingLevel: 1
  extraSections: true
  sections:
    - header: Where it stands
      required: true
    - header: What waits
      required: true
`

func TestTheCheckerWordsAMissingFieldAndChapterAsTheBridge(t *testing.T) {
	schema := yaml.AsDoc(yaml.Read(looseHandoverSchema))
	found := checkNote("---\nkind: [[handover]]\n---\n\n# Where it stands\n\n- the branch\n", schema, ".se/HANDOVER.md")
	want := map[string]string{
		"Schema.status":    "A handover names status in its frontmatter.",
		"Schema.WhatWaits": "A handover carries a What waits chapter.",
	}
	if len(found) != len(want) {
		t.Fatalf("the checker answers %+v, want %v", found, want)
	}
	for _, one := range found {
		if one.Message != want[one.Rule] {
			t.Errorf("%s reads %q, want %q", one.Rule, one.Message, want[one.Rule])
		}
	}
}

func TestAStrangerNamesTheKindItReadsAs(t *testing.T) {
	schema := yaml.AsDoc(yaml.Read(looseHandoverSchema))
	found, ok := StrangerFault("---\nkind: [[rationale]]\n---\n", schema, ".se/HANDOVER.md")
	if want := ".se/HANDOVER.md reads as a rationale, and the handover schema governs this path."; !ok || found.Message != want {
		t.Errorf("StrangerFault answers %+v, %v, want %q", found, ok, want)
	}
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func TestAChapterMissingForAnEvidenceFieldIsRefused(t *testing.T) {
	t.Parallel()
	found := refused(routedAt, strings.Replace(routed, "### lint\n", "", 1))
	if got := rulesOf(found); !slices.Equal(got, []string{"Schema.lint"}) {
		t.Fatalf("a route missing the lint chapter answers %+v, and wants Schema.lint alone", found)
	}
	found = refused(routedAt, strings.Replace(routed, "## review\n", "", 1))
	if !slices.Contains(rulesOf(found), "Schema.review") {
		t.Fatalf("a route missing the review chapter answers %+v, and wants Schema.review", found)
	}
}

// A new route lands on a ticket: the front in the schema's order, and each
// chapter keeping what a hand wrote under it, each want what reRouted in
// lib/schema-mint.js writes over the same text.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package check

import (
	"testing"

	"quackitect/src/yaml"
)

const rerouteSchema = `kind: ticket
frontmatter:
  properties:
    kind:
      const: ticket
    state:
      enum: [open]
    steps:
      type: array
    process_hash:
      type: string
body:
  headingLevel: 1
  sections:
    - header: Ask
      description: what it asks
    - x-one-per: steps
    - header: Discussion
      description: what anybody adds
`

const reroutedText = `---
extra: kept after
state: open
kind: [[ticket]]
steps:
  - name: a
    does: does a
    steps:
      - name: x
        does: the old x
  - name: b
    checklist: [one thing]
    evidence:
      - name: said
        form: text
        says: what it says
process_hash: old
---

# Ask

The ask.

# a

## x

What x holds.

# b

## said

The said field.

## checked

- one thing: taken

# Discussion
`

const rerouteSteps = `steps:
  - name: a
    does: does a
    steps:
      - name: x
        does: the new x
        form: text
      - name: y
        does: a new y
  - name: c
    steps:
      - name: x
        does: another x
  - name: b
    checklist: ["one thing"]
    evidence:
      - name: said
        form: text
        says: what it says
`

const reroutedFront = `steps:
  - name: a
    does: does a
    steps:
      - name: x
        does: the new x
        form: text
      - name: y
        does: a new y
  - name: c
    steps:
      - name: x
        does: another x
  - name: b
    checklist: ["one thing"]
    evidence:
      - name: said
        form: text
        says: what it says
`

const reroutedBody = `
# Ask

The ask.

# a

<!-- does a -->

## x

What x holds.

## y

<!-- a new y -->

# c

## x

<!-- another x -->

# b

## said

The said field.

## checked

- one thing: taken

# Discussion

<!-- what anybody adds -->
`

func TestReRouted(t *testing.T) {
	schema := yaml.AsDoc(yaml.Read(rerouteSchema))
	route := yaml.AsList(yaml.AsDoc(yaml.Read(rerouteSteps)).Get("steps"))
	cases := []struct {
		name, hash string
		schema     *yaml.Doc
		want       string
	}{
		{"a hash lands, the front takes the schema's order, and each chapter keeps what it holds", "fresh", schema,
			"---\nkind: [[ticket]]\nstate: open\n" + reroutedFront + "process_hash: fresh\nextra: kept after\n---\n" + reroutedBody},
		{"no hash keeps the one the ticket carries", "", schema,
			"---\nkind: [[ticket]]\nstate: open\n" + reroutedFront + "process_hash: old\nextra: kept after\n---\n" + reroutedBody},
		{"no schema keeps the front's own order and writes no chapter", "", nil,
			"---\nextra: kept after\nstate: open\nkind: [[ticket]]\n" + reroutedFront + "process_hash: old\n---\n"},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			if got := ReRouted(reroutedText, one.schema, route, one.hash); got != one.want {
				t.Errorf("ReRouted writes\n%s\nand the JS writes\n%s", got, one.want)
			}
		})
	}
}

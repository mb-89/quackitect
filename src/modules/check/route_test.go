// The route a ticket and a process carry, weighed through the sweep: each nested
// key, each keyword naming a step, each slot, and the data schema's $ref.
// [[spec/tickets/schema-libs-leave]]
package check

import (
	"slices"
	"strings"
	"testing"
)

// [[spec/design_output/schema#keywords-that-name-a-step]]
const ticketRouteSchema = `kind: ticket
governs:
  - spec/tickets/**
  - .se/tickets/**
frontmatter:
  type: object
  additionalProperties: false
  required: [kind, state, steps]
  properties:
    kind:
      const: ticket
      x-link: true
    state:
      enum: [draft, open, closed]
    urgent:
      type: boolean
    step:
      type: string
      x-names: steps
      x-leaf: true
    steps:
      type: array
      items:
        type: object
        additionalProperties: false
        required: [name]
        properties:
          name:
            type: string
          steps:
            $ref: "#/frontmatter/properties/steps"
          does:
            type: string
          by:
            type: string
            x-names: steps
            x-words: [anyone, person, agent, helper, retro, children]
            x-prefix: not
          on_fail:
            type: string
            x-earlier: steps
          input:
            type: [array, string]
            x-earlier: steps
            x-fields: evidence
            x-words: [ask, diff]
          to:
            type: string
          evidence:
            type: array
            items:
              type: object
              additionalProperties: false
              required: [name, form, says]
              properties:
                name:
                  type: string
                form:
                  enum: [text, list, command, verdict]
                says:
                  type: string
                expects:
                  type: [integer, string]
    record:
      type: array
      items:
        type: object
        additionalProperties: false
        required: [step]
        properties:
          step:
            type: string
            x-names: steps
            x-leaf: true
          hand:
            type: string
          hash_before:
            type: string
          hash_after:
            type: string
          returns:
            type: integer
          answered:
            type: array
body:
  headingLevel: 1
  order: strict
  extraSections: false
  sections:
    - header: Ask
      required: true
    - x-one-per: steps
    - header: Discussion
      required: true
      position: last
`

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
const processSchema = `kind: process
governs:
  - spec/processes/*.yaml
data:
  type: object
  additionalProperties: false
  required: [steps]
  properties:
    for:
      type: string
    steps:
      $ref: "ticket#/frontmatter/properties/steps"
`

const (
	routedAt  = "spec/tickets/a-name.md"
	processAt = "spec/processes/standard.yaml"
)

const routed = `---
kind: [[ticket]]
state: open
urgent: true
step: implement/change
steps:
  - name: design
    steps:
      - name: draft
        does: writes the design input the ask calls for
      - name: review
        does: reads the design input against the ask
        by: not draft
        on_fail: draft
        evidence:
          - name: verdict
            form: verdict
            says: pass or fail, with findings one a line
  - name: implement
    steps:
      - name: change
        does: makes the change
        input: design/draft
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree builds and lints
---

# Ask

What this ticket asks for.

# design

## draft

## review

### verdict

# implement

## change

### lint

# Discussion

Nothing yet.
`

// [[spec/design_output/schema#the-sweep-over-the-tree]]
func refused(at, text string) []Finding {
	tree := TreeOver("/tree", Texts{"spec/schemas/ticket.schema.yaml": ticketRouteSchema, "spec/schemas/process.schema.yaml": processSchema, at: text})
	out := []Finding{}
	for _, one := range sorted(schemaFaults(tree)) {
		if one.File == at && one.Severity == SeverityError {
			out = append(out, one)
		}
	}
	return out
}

func rulesOf(found []Finding) []string {
	out := []string{}
	for _, one := range found {
		out = append(out, one.Rule)
	}
	return out
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
func wantsOne(t *testing.T, found []Finding, rule string, line int, says string) {
	t.Helper()
	for _, one := range found {
		if one.Rule == rule && one.Line == line && strings.Contains(one.Message, says) {
			return
		}
	}
	t.Fatalf("the checker answers %+v, and wants %s at line %d saying %q", found, rule, line, says)
}

// [[spec/design_output/schema#the-checker-walks-every-key]]
func TestAFaultNestedTwoListsDeepNamesItsLine(t *testing.T) {
	t.Parallel()
	if found := refused(routedAt, routed); len(found) > 0 {
		t.Fatalf("a whole route answers %+v, and wants nothing", found)
	}
	found := refused(routedAt, strings.Replace(routed, "            expects: 0", "            expects: 0\n            about: a thing", 1))
	wantsOne(t, found, "Schema.about", 28, "names no about under steps[1].steps[0].evidence[0]")
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func TestAPathNamingNoStepIsRefusedWithTheStepsItHolds(t *testing.T) {
	t.Parallel()
	found := refused(routedAt, strings.Replace(routed, "step: implement/change", "step: implement/ship", 1))
	wantsOne(t, found, "Schema.step", 5, "implement/change")
}

// [[spec/design_output/schema#keywords-that-name-a-step]]
func TestAnOrphanFieldOnAStepIsRefused(t *testing.T) {
	t.Parallel()
	found := refused(routedAt, strings.Replace(routed, "        does: makes the change", "        writes: a thing", 1))
	if got := rulesOf(found); !slices.Equal(got, []string{"Schema.writes"}) || found[0].Line != 22 {
		t.Fatalf("an orphan field answers %+v, and wants Schema.writes alone at line 22", found)
	}
}

// [[spec/design_output/schema#the-record-draws-itself]]
func TestARecordEntryNamesAStepThatStands(t *testing.T) {
	t.Parallel()
	recorded := strings.Replace(routed, "steps:\n", "record:\n  - step: design/review\n    hand: a box, a session and an agent\n    hash_before: abc1234\n    hash_after: def5678\n    returns: 1\n    answered:\n      - name: verdict\n        exit: 0\n        said: pass\nsteps:\n", 1)
	if found := refused(routedAt, recorded); len(found) > 0 {
		t.Fatalf("a record naming a standing leaf answers %+v, and wants nothing", found)
	}
	found := refused(routedAt, strings.Replace(recorded, "  - step: design/review", "  - step: design/nowhere", 1))
	if got := rulesOf(found); !slices.Equal(got, []string{"Schema.step"}) || found[0].Line != 7 {
		t.Fatalf("a record naming no step answers %+v, and wants Schema.step alone at line 7", found)
	}
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func TestAnInputNamingNoEarlierStepIsRefused(t *testing.T) {
	t.Parallel()
	found := refused(routedAt, strings.Replace(routed, "input: design/draft", "input: implement/change", 1))
	wantsOne(t, found, "Schema.Input", 23, "implement/change reads implement/change, and no step before it holds that.")
	wantsOne(t, found, "Schema.input", 23, "names a step standing before implement/change")
}

// [[spec/design_input/the-agent-pulls-tickets#the-route]]
func TestAnOutputNothingReadsIsRefused(t *testing.T) {
	t.Parallel()
	writes := strings.Replace(routed, "            says: the tree builds and lints\n", "            says: the tree builds and lints\n          - name: says\n            form: text\n            says: what changes\n", 1)
	writes = strings.Replace(writes, "### lint\n", "### lint\n\n### says\n", 1)
	found := refused(routedAt, writes)
	if got := rulesOf(found); !slices.Equal(got, []string{"Schema.Output"}) {
		t.Fatalf("an output nothing reads answers %+v, and wants Schema.Output alone", found)
	}
	wantsOne(t, found, "Schema.Output", 29, "implement/change writes says, and nothing reads it.")
	handed := strings.Replace(writes, "        does: makes the change\n", "        does: makes the change\n        to: owner\n", 1)
	if found := refused(routedAt, handed); len(found) > 0 {
		t.Fatalf("an output the step hands on answers %+v, and wants nothing", found)
	}
}

// [[spec/design_output/schema#one-home-for-a-shape]]
func TestARefReadsTheShapeAnotherSchemaHolds(t *testing.T) {
	t.Parallel()
	found := refused(processAt, "steps:\n  - name: do\n    writes: a thing\n")
	wantsOne(t, found, "Schema.writes", 3, "The process schema names no writes under steps[0].")
}

// [[spec/design_output/schema#a-data-schema-holds-yaml]]
func TestAProcessFileReadsUnderItsDataSchema(t *testing.T) {
	t.Parallel()
	text := "steps:\n  - name: do\n    does: makes the change the ask names\n"
	if found := refused(processAt, text); len(found) > 0 {
		t.Fatalf("a whole process answers %+v, and wants nothing", found)
	}
	found := refused(processAt, text+"about: a thing\n")
	if got := rulesOf(found); !slices.Equal(got, []string{"Schema.about"}) || found[0].Line != 4 {
		t.Fatalf("a stray key answers %+v, and wants Schema.about alone at line 4", found)
	}
}

// [[spec/design_output/schema#warning-now-and-error-later]]
func TestEveryDepartureCarriesTheShapeThePanelDraws(t *testing.T) {
	t.Parallel()
	files := Texts{"spec/schemas/ticket.schema.yaml": ticketRouteSchema, routedAt: strings.Replace(routed, "\n---\n", "\nabout: a thing\n---\n", 1)}
	found := schemaFaults(TreeOver("/tree", files))
	if !slices.ContainsFunc(found, func(one Finding) bool { return one.Severity == SeverityError }) {
		t.Fatalf("the departing ticket answers %+v, and wants a finding at the level that refuses", found)
	}
	for _, one := range found {
		if (one.Severity != SeverityError && one.Severity != SeverityWarning) || !files.Exists(one.File) || one.Line < 1 || !strings.HasPrefix(one.Rule, "Schema.") {
			t.Errorf("%+v wants a level, a file on the tree, a line, and a rule under Schema", one)
		}
	}
}

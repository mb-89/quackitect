package main

import (
	"quackitect/yaml"

	"strings"
	"testing"
)

const handoverSchema = `kind: handover
governs:
  - HANDOVER.md
frontmatter:
  type: object
  additionalProperties: false
  required:
    - kind
    - status
  properties:
    kind:
      const: handover
      x-link: true
      description: the schema this note is minted from
    status:
      enum: [todo, held, done]
      description: where the work stands
    depends_on:
      type: [array, string]
      description: the branches this one waits for
body:
  headingLevel: 1
  order: strict
  extraSections: false
  sections:
    - header: Where it stands
      required: true
      description: what the last session finished
    - header: What waits
      required: true
      list: true
      ordered: true
      maxItems: 2
      description: what the next reader does
`

func schemaHere(t *testing.T) *yaml.Doc {
	t.Helper()
	said := yaml.AsDoc(yaml.Read(handoverSchema))
	if said == nil {
		t.Fatal("the schema reads as nothing")
	}
	return said
}

func TestANoteOpensWithFrontmatter(t *testing.T) {
	found := checkNote("# Where it stands\n", schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.Frontmatter")
	if !strings.Contains(one.Message, "opens with frontmatter") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestARequiredFieldStandsNamed(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
		schemaHere(t), "HANDOVER.md")
	if names(found, "Schema.status") != 1 {
		t.Fatalf("a missing status answers %v", rules(found))
	}
}

func TestAFieldOutsideTheEnumRefuses(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: maybe\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.status")
	if !strings.Contains(one.Message, "todo, held, done") {
		t.Errorf("the message reads %q", one.Message)
	}
	if one.Line != 3 {
		t.Errorf("the finding names line %d", one.Line)
	}
}

func TestAFieldTheSchemaNamesNotRefuses(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\nstranger: yes\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.stranger")
	if !strings.Contains(one.Message, "names no stranger") {
		t.Errorf("the message reads %q", one.Message)
	}
}

const ticketSchema = `kind: ticket
frontmatter:
  type: object
  properties:
    kind:
      const: ticket
      x-link: true
    steps:
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

// [[spec/design_output/schema#keywords-that-name-a-step]]
func TestAStepNamesItsOwnChapter(t *testing.T) {
	schema := yaml.AsDoc(yaml.Read(ticketSchema))
	note := "---\nkind: [[ticket]]\nsteps:\n  - name: do\n    does: makes it\n---\n\n# Ask\n\nA thing.\n\n# do\n\nDone.\n\n# Discussion\n"
	if found := checkNote(note, schema, "spec/tickets/a.md"); len(found) != 0 {
		t.Fatalf("a chapter a step names answers %v", rules(found))
	}

	missing := strings.Replace(note, "# do\n\nDone.\n\n", "", 1)
	if names(checkNote(missing, schema, "spec/tickets/a.md"), "Schema.do") != 1 {
		t.Fatal("a step with no chapter answers nothing")
	}
}

func TestALinkFieldNamesALink(t *testing.T) {
	found := checkNote("---\nkind: handover\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.kind")
	if !strings.Contains(one.Message, "names a link") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestATypeHoldsTheField(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\ndepends_on: 3\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.DependsOn")
	if !strings.Contains(one.Message, "array or string") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAMissingChapterRefuses(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.WhatWaits")
	if !strings.Contains(one.Message, "carries a What waits chapter") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAChapterTheSchemaNamesNotRefuses(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n\n# Stranger\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.Stranger")
	if one.Line != 12 {
		t.Errorf("the finding names line %d", one.Line)
	}
}

func TestChaptersRunInOrder(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\n---\n\n# What waits\n\n1. Go.\n\n# Where it stands\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.WhereItStands")
	if !strings.Contains(one.Message, "puts it first") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAListChapterHoldsAList(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\nProse alone.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.WhatWaits")
	if !strings.Contains(one.Message, "holds a list") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAnOrderedChapterNumbersEveryItem(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n- Go.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.WhatWaits")
	if !strings.Contains(one.Message, "numbers every item") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAChapterHoldsItsCap(t *testing.T) {
	found := checkNote("---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n1. One.\n2. Two.\n3. Three.\n",
		schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.WhatWaits")
	if !strings.Contains(one.Message, "holds 2 items") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAFenceHidesAHeadingAndAnItem(t *testing.T) {
	said := "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n```\n# Stranger\n- not an item\n```\n\n# What waits\n\n1. Go.\n"
	if found := checkNote(said, schemaHere(t), "HANDOVER.md"); len(found) != 0 {
		t.Fatalf("a fenced heading answers %v", rules(found))
	}
}

func TestAPlaceholderStandsAtWarning(t *testing.T) {
	said := "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n<!-- what the last session finished -->\n\n# What waits\n\n1. Go.\n"
	found := placeholderFaults(said, schemaHere(t), "HANDOVER.md")
	one := onlyOne(t, found, "Schema.Placeholder")
	if one.Severity != SeverityWarning {
		t.Errorf("a placeholder stands at %q", one.Severity)
	}
	if one.Line != 8 {
		t.Errorf("the finding names line %d", one.Line)
	}
}

func TestAStrangerKindMeetsTheGovernor(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"HANDOVER.md":                       "---\nkind: [[rationale]]\n---\n\n# Why\n",
	})
	schemas := schemasIn(tree)
	found := noteFaults(tree, schemas, "HANDOVER.md", tree.Read("HANDOVER.md"))
	one := onlyOne(t, found, "Schema.Kind")
	if !strings.Contains(one.Message, "reads as a rationale") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestAKindWithNoSchemaRefuses(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"spec/one.md":                       "---\nkind: [[stranger]]\n---\n\n# Why\n",
	})
	found := noteFaults(tree, schemasIn(tree), "spec/one.md", tree.Read("spec/one.md"))
	one := onlyOne(t, found, "Schema.Kind")
	if !strings.Contains(one.Message, "names no schema") {
		t.Errorf("the message reads %q", one.Message)
	}
}

func TestTheSweepSkipsADraft(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"_draft.md":                         "---\nkind: [[handover]]\n---\n\n# Nothing\n",
	})
	if found := schemaFaults(tree); len(found) != 0 {
		t.Fatalf("a parked draft answers %v", found)
	}
}

// [[spec/design_output/schema#a-schema-names-its-chapters]]
func TestASchemaNamingChaptersReadsAsANoteSchema(t *testing.T) {
	if !isNoteSchema(schemaHere(t)) {
		t.Error("a schema with a kind and sections names a note schema")
	}
	if isNoteSchema(yaml.AsDoc(yaml.Read("kind: handover\n"))) {
		t.Error("a schema naming no chapter is no note schema")
	}
	if isNoteSchema(nil) {
		t.Error("no schema is no note schema")
	}
}

// A required key the fill writes waits while the note writes an empty process. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
const fillSchema = `kind: ticket
frontmatter:
  type: object
  required: [kind, state, steps]
  properties:
    kind:
      const: ticket
      x-link: true
    state:
      enum: [draft, open]
      x-filled-by: process
    steps:
      type: array
      x-filled-by: process
    process:
      x-link: true
body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
`

func TestAnEmptyProcessHoldsBackTheKeysTheFillWrites(t *testing.T) {
	schema := yaml.AsDoc(yaml.Read(fillSchema))
	fresh := "---\nkind: [[ticket]]\nprocess:\n---\n\n# Ask\n\nA thing.\n"
	found := checkNote(fresh, schema, "spec/tickets/a.md")
	if names(found, "Schema.steps")+names(found, "Schema.state") != 0 {
		t.Fatalf("a fresh ticket answers %v", rules(found))
	}
	bare := strings.Replace(fresh, "process:\n", "", 1)
	found = checkNote(bare, schema, "spec/tickets/a.md")
	if names(found, "Schema.steps") != 1 || names(found, "Schema.state") != 1 {
		t.Fatalf("a ticket naming no process answers %v", rules(found))
	}
}

// A governed folder holds its own kind alone, so a page there draws a warning. [[spec/tickets/each-folder-holds-its-kind]]
func TestAPagePastTheFolderKindWarns(t *testing.T) {
	tree := fixture(t, map[string]string{
		"spec/schemas/handover.schema.yaml": strings.Replace(handoverSchema, "  - HANDOVER.md", "  - spec/funnel/**", 1),
		"spec/funnel/page.html":             "<html></html>\n",
	})
	one := onlyOne(t, schemaFaults(tree), "Schema.Folder")
	if one.File != "spec/funnel/page.html" || one.Severity != "warning" {
		t.Errorf("the finding reads %+v", one)
	}
	if !strings.Contains(one.Message, "handover") {
		t.Errorf("the message reads %q", one.Message)
	}
}

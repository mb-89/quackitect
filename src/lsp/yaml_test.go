package main

import "testing"

const schemaYaml = `# a comment the reader skips
kind: handover

governs:
  - HANDOVER.md
  - .se/HANDOVER.md

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

body:
  headingLevel: 1
  order: strict
  extraSections: false
  sections:
    - header: Where it stands
      required: true
      description: what the last session finished
`

func TestReadYamlHoldsTheShape(t *testing.T) {
	said := asDoc(readYaml(schemaYaml))
	if said == nil {
		t.Fatal("the reader answers no map")
	}
	if asString(said.Get("kind")) != "handover" {
		t.Errorf("kind reads %v", said.Get("kind"))
	}
	if governs := asList(said.Get("governs")); len(governs) != 2 {
		t.Errorf("governs holds %v", governs)
	}

	front := asDoc(said.Get("frontmatter"))
	if front.Get("additionalProperties") != false {
		t.Error("a false reads as a boolean")
	}
	props := asDoc(front.Get("properties"))
	if asBool(asDoc(props.Get("kind")).Get("x-link")) != true {
		t.Error("x-link reads as a boolean")
	}
	allowed, listed := asDoc(props.Get("status")).Get("enum").([]any)
	if !listed || len(allowed) != 3 {
		t.Errorf("the enum reads %v", asDoc(props.Get("status")).Get("enum"))
	}

	body := asDoc(said.Get("body"))
	if asInt(body.Get("headingLevel")) != 1 {
		t.Error("a whole number reads as one")
	}
	sections := asList(body.Get("sections"))
	if len(sections) != 1 || asString(asDoc(sections[0]).Get("header")) != "Where it stands" {
		t.Errorf("the sections read %v", sections)
	}
	if !isNoteSchema(said) {
		t.Error("this file names a note schema")
	}
}

func TestReadYamlKeepsTheOrder(t *testing.T) {
	said := asDoc(readYaml("one: 1\ntwo: 2\nthree: 3\n"))
	want := []string{"one", "two", "three"}
	for i, key := range said.Keys() {
		if key != want[i] {
			t.Fatalf("the keys read %v", said.Keys())
		}
	}
}

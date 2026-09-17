package yaml

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
	said := AsDoc(Read(schemaYaml))
	if said == nil {
		t.Fatal("the reader answers no map")
	}
	if AsString(said.Get("kind")) != "handover" {
		t.Errorf("kind reads %v", said.Get("kind"))
	}
	if governs := AsList(said.Get("governs")); len(governs) != 2 {
		t.Errorf("governs holds %v", governs)
	}

	front := AsDoc(said.Get("frontmatter"))
	if front.Get("additionalProperties") != false {
		t.Error("a false reads as a boolean")
	}
	props := AsDoc(front.Get("properties"))
	if AsBool(AsDoc(props.Get("kind")).Get("x-link")) != true {
		t.Error("x-link reads as a boolean")
	}
	allowed, listed := AsDoc(props.Get("status")).Get("enum").([]any)
	if !listed || len(allowed) != 3 {
		t.Errorf("the enum reads %v", AsDoc(props.Get("status")).Get("enum"))
	}

	body := AsDoc(said.Get("body"))
	if AsInt(body.Get("headingLevel")) != 1 {
		t.Error("a whole number reads as one")
	}
	sections := AsList(body.Get("sections"))
	if len(sections) != 1 || AsString(AsDoc(sections[0]).Get("header")) != "Where it stands" {
		t.Errorf("the sections read %v", sections)
	}
}

func TestReadYamlKeepsTheOrder(t *testing.T) {
	said := AsDoc(Read("one: 1\ntwo: 2\nthree: 3\n"))
	want := []string{"one", "two", "three"}
	for i, key := range said.Keys() {
		if key != want[i] {
			t.Fatalf("the keys read %v", said.Keys())
		}
	}
}

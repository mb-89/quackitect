package yaml

import (
	"math"
	"testing"
)

// Nil, false, a zero, NaN and the empty string read false, and every other value reads true. [[spec/tickets/shared-helpers-stand-once]]
func TestTruthyReadsEachKind(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		said any
		want bool
	}{
		{nil, false}, {false, false}, {0, false}, {0.0, false}, {int64(0), false}, {math.NaN(), false}, {"", false},
		{true, true}, {1, true}, {-2.5, true}, {"x", true}, {"false", true}, {[]any{}, true}, {map[string]any{}, true},
	} {
		if got := Truthy(one.said); got != one.want {
			t.Errorf("Truthy(%#v) reads %v, want %v", one.said, got, one.want)
		}
	}
}

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

func TestAQuotedItemStaysText(t *testing.T) {
	said := AsDoc(Read("checklist:\n  - \"a colon: stays text\"\n  - \"a\": \"b\"\ntags: [\"one, two\", three]\n"))
	list := AsList(said.Get("checklist"))
	if len(list) != 2 || list[0] != "a colon: stays text" || AsDoc(list[1]) == nil {
		t.Fatalf("the checklist reads %#v", list)
	}
	if tags := StringsOf(said.Get("tags")); len(tags) != 2 || tags[0] != "one, two" || tags[1] != "three" {
		t.Fatalf("the flow list reads %#v", tags)
	}
}

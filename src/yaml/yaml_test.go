package yaml

import (
	"encoding/json"
	"reflect"
	"strings"
	"testing"
)

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

// [[spec/design_output/schema#a-line-per-nested-key]]
func TestReadLinesNamesEveryKeyByItsPath(t *testing.T) {
	said, lines := ReadLines("steps:\n  - name: do\n    evidence:\n      - name: lint\n\n        form: command\nstate: open\n")
	want := map[string]int{"steps": 1, "steps[0]": 2, "steps[0].name": 2, "steps[0].evidence": 3, "steps[0].evidence[0]": 4, "steps[0].evidence[0].name": 4, "steps[0].evidence[0].form": 6, "state": 7}
	if !reflect.DeepEqual(lines, want) {
		t.Errorf("the lines read %v, and want %v", lines, want)
	}
	if AsString(AsDoc(said).Get("state")) != "open" || len(AsList(AsDoc(said).Get("steps"))) != 1 {
		t.Errorf("the line reader answers %#v, and wants the map Read answers", said)
	}
}

// [[spec/tickets/schema-libs-leave]]
func TestADocMarshalsItsKeysInOrder(t *testing.T) {
	said := AsDoc(Read("b: 1\na:\n  - x\n  - c: true\n    d: [one, two]\n"))
	got, err := json.Marshal(said)
	if want := `{"b":1,"a":["x",{"c":true,"d":["one","two"]}]}`; err != nil || string(got) != want {
		t.Errorf("the doc marshals %s (%v), and wants %s", got, err, want)
	}
	var out strings.Builder
	writes := json.NewEncoder(&out)
	writes.SetEscapeHTML(false)
	err = writes.Encode(AsDoc(Read("said: a <b> & c\n")))
	if want := "{\"said\":\"a <b> & c\"}\n"; err != nil || out.String() != want {
		t.Errorf("the doc encodes %s (%v), and wants the text unescaped as %s", out.String(), err, want)
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

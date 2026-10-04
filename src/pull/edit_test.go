// The edit helpers the ticket verbs share: the schema's weighing of a value,
// the place a row takes, the plan file a place writes, and a number as JS reads it.
// [[spec/tickets/view-actions-run-through-verbs]]
package pull

import (
	"encoding/json"
	"os"
	"testing"
)

const editSchema = `kind: ticket

frontmatter:
  type: object
  required: [kind]
  properties:
    kind:
      type: string
    state:
      enum: [open, closed]
      x-engine: true
    urgent:
      type: boolean
    group:
      type: string
    size:
      type: integer
    weight:
      type: number
    shape:
      const: round
`

func TestWeighs(t *testing.T) {
	for _, one := range []struct{ key, said, want string }{
		{"state", "closed", "state is the verbs' to write, so ./RUNME.sh ticket moves it and the door refuses the edit."},
		{"colour", "red", "colour stands in no ticket's front, so set writes it nowhere."},
		{"kind", "", "kind stands in every ticket, so it takes no empty value."},
		{"group", "", ""},
		{"group", "a-group", ""},
		{"urgent", "maybe", `urgent takes a boolean, and "maybe" reads as none.`},
		{"urgent", "true", ""},
		{"size", "-3", ""},
		{"size", "+3", `size takes a integer, and "+3" reads as none.`},
		{"weight", "0x10", ""},
		{"weight", " 1e3 ", ""},
		{"weight", "Infinity", `weight takes a number, and "Infinity" reads as none.`},
		{"weight", " ", `weight takes a number, and " " reads as none.`},
		{"shape", "square", `shape takes round alone, and "square" is none of them.`},
		{"shape", "round", ""},
	} {
		if got := Weighs(editSchema, one.key, one.said); got != one.want {
			t.Errorf("%s %q weighs %q, and wants %q", one.key, one.said, got, one.want)
		}
	}
}

func TestJSNumber(t *testing.T) {
	for said, want := range map[string]float64{"2": 2, " 2 ": 2, "02": 2, "2.0": 2, "2e0": 2, "0x2": 2, ".5": 0.5, "": 0, "+4": 4, "0o17": 15, "0B11": 3, "0XfF": 255} {
		if got, ok := JSNumber(said); !ok || got != want {
			t.Errorf("%q reads %v, %v, and wants %v", said, got, ok, want)
		}
	}
	for _, said := range []string{"two", "Infinity", "NaN", "1_0", "0x", "2a"} {
		if got, ok := JSNumber(said); ok {
			t.Errorf("%q reads %v, and wants no finite number", said, got)
		}
	}
}

// The cases the work tab and the JS verb share. [[spec/tickets/view-actions-run-through-verbs]]
func TestPlaceValueOverTheSharedCases(t *testing.T) {
	text, err := os.ReadFile("../tui/work/testdata/places.json")
	if err != nil {
		t.Fatal(err)
	}
	var shared struct {
		Rows  []PlaceRow `json:"rows"`
		Cases []struct {
			Says, Name, Want string
			N                int
		} `json:"cases"`
	}
	if err := json.Unmarshal(text, &shared); err != nil || len(shared.Cases) == 0 {
		t.Fatalf("the shared cases read %v, %v", shared, err)
	}
	for _, one := range shared.Cases {
		value, notice := PlaceValue(shared.Rows, one.Name, one.N)
		if value != one.Want || (notice != "") != (value == "") {
			t.Errorf("%s: answers %q, %q", one.Says, value, notice)
		}
	}
	if _, notice := PlaceValue(shared.Rows, "b", 2); notice != "b stands at 2 already" {
		t.Errorf("the same place says %q", notice)
	}
	if _, notice := PlaceValue(shared.Rows, "a", 6); notice != "the places at this level end at 4, so no row stands at 6" {
		t.Errorf("a place past the end says %q", notice)
	}
}

func TestPlacesWritten(t *testing.T) {
	for _, one := range []struct{ plan, name, value, want string }{
		{"", "a", "true", "{\n  \"places\": {\n    \"a\": \"true\"\n  }\n}\n"},
		{"not json", "a", "b", "{\n  \"places\": {\n    \"a\": \"b\"\n  }\n}\n"},
		{`{"working":"w","places":{"x":"last","a":"c"},"todos":[]}`, "a", "true", "{\n  \"working\": \"w\",\n  \"places\": {\n    \"x\": \"last\",\n    \"a\": \"true\"\n  },\n  \"todos\": []\n}\n"},
		{`{"places":{"a":"true"},"working":""}`, "a", "false", "{\n  \"places\": {},\n  \"working\": \"\"\n}\n"},
		{`{"working":""}`, "a<b", "x", "{\n  \"working\": \"\",\n  \"places\": {\n    \"a<b\": \"x\"\n  }\n}\n"},
	} {
		if got := PlacesWritten(one.plan, one.name, one.value); got != one.want {
			t.Errorf("%q with %s=%s writes %q, and wants %q", one.plan, one.name, one.value, got, one.want)
		}
	}
}

func TestFieldWriters(t *testing.T) {
	text := "---\nkind: [[ticket]]\n---\n\n# Ask\n"
	set, err := WithField(text, "todo", "true")
	if err != nil || set != "---\nkind: [[ticket]]\ntodo: true\n---\n\n# Ask\n" {
		t.Fatalf("the set writes %q, %v", set, err)
	}
	if dropped, err := WithoutField(set, "todo"); err != nil || dropped != text {
		t.Fatalf("the drop writes %q, %v", dropped, err)
	}
	if kept, err := WithField("no front\n", "todo", "true"); err != nil || kept != "no front\n" {
		t.Fatalf("a note with no front comes back %q, %v", kept, err)
	}
}

func TestNewTicketPath(t *testing.T) {
	for path, want := range map[string]bool{"spec/tickets/a-new-one.md": true, ".se/tickets/x1.md": true, "spec/tickets/A.md": false, "spec/a.md": false, "": false, "spec/tickets/a.txt": false} {
		if got := NewTicketPath(path); got != want {
			t.Errorf("%q reads %v, and wants %v", path, got, want)
		}
	}
}

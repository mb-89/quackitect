// An action answers its list of requests, and refuses an input of another type.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import (
	"encoding/json"
	"reflect"
	"testing"
)

// A land request carries the fold's name and its event under the names a surface decodes. [[spec/tickets/config-answers-keys-and-overrides]]
func TestALandingCarriesItsNameAndEvent(t *testing.T) {
	body, err := json.Marshal(Request{Module: StoreModule, Verb: StoreLand, Args: Landing{Name: "t/sum", Event: 2}}.Args)
	if err != nil || string(body) != `{"name":"t/sum","event":2}` {
		t.Fatalf("a landing reads %s, %v", body, err)
	}
}

func TestAnActionAnswersItsRequests(t *testing.T) {
	c := New()
	ActionIn(c, "t/save", func(path string) []Request {
		return []Request{{Module: "disk", Verb: "write", Args: path, NoUndo: "a case"}}
	})
	s := NewStore(c)
	asked, err := s.Act("t/save", "a.md")
	if err != nil {
		t.Fatal(err)
	}
	if len(asked) != 1 || asked[0].Module != "disk" || asked[0].Args != "a.md" {
		t.Fatalf("the action answers %+v", asked)
	}
	if _, err := s.Act("t/save", 7); err == nil {
		t.Fatal("the action takes an int")
	}
}

// An action taking a struct reads a map a caller in the process hands it, and refuses a map of another shape. [[spec/tickets/edit-tools-answer-in-go]]
func TestAnActionReadsAMapAsItsStruct(t *testing.T) {
	type save struct {
		Path string `json:"path" doc:"the file"`
	}
	c := New()
	ActionIn(c, "t/save", func(in save) []Request {
		return []Request{{Module: "disk", Verb: "write", Args: in.Path, NoUndo: "a case"}}
	})
	s := NewStore(c)
	asked, err := s.Act("t/save", map[string]any{"path": "a.md"})
	if err != nil || len(asked) != 1 || asked[0].Args != "a.md" {
		t.Fatalf("the map reads as %+v, %v", asked, err)
	}
	if _, err := s.Act("t/save", map[string]any{"path": 7}); err == nil {
		t.Fatal("a number reads as the path")
	}
}

// An action decodes a JSON body into the type it takes, an empty body into the zero value, and refuses a body of another shape. [[spec/tickets/actions-answer-over-http]]
func TestAnActionDecodesItsInputOffJSON(t *testing.T) {
	type save struct {
		Path string `json:"path" doc:"the file"`
	}
	c := New()
	ActionIn(c, "t/save", func(save) []Request { return nil })
	s := NewStore(c)
	got, err := s.Input("t/save", []byte(`{"path":"a.md"}`))
	if err != nil || got != (save{Path: "a.md"}) {
		t.Fatalf("the body decodes into %#v, %v", got, err)
	}
	empty, err := s.Input("t/save", nil)
	if err != nil || empty != (save{}) {
		t.Fatalf("an empty body decodes into %#v, %v", empty, err)
	}
	if _, err := s.Input("t/save", []byte(`{"path":7}`)); err == nil {
		t.Fatal("a number decodes into the path")
	}
	if _, err := s.Input("t/none", nil); err == nil {
		t.Fatal("a name the catalog lacks decodes an input")
	}
}

// An action answers its input type and the type q.Answers declares, and a name no action holds answers none. [[spec/tickets/actions-answer-over-http]]
func TestAnActionAnswersItsTypes(t *testing.T) {
	c := New()
	ActionIn(c, "t/count", func(string) []Request { return nil }, Answers[int]())
	OutIn(c, "t/n", 0)
	s := NewStore(c)
	in, out, ok := s.Types("t/count")
	if !ok || in.Kind() != reflect.String || out.Kind() != reflect.Int {
		t.Fatalf("t/count answers %v, %v, %v", in, out, ok)
	}
	if _, _, ok := s.Types("t/n"); ok {
		t.Fatal("a name no action holds answers its types")
	}
}

// An action taking a string decodes it off a JSON string. [[spec/tickets/actions-answer-over-http]]
func TestAStringInputDecodesOffAJSONString(t *testing.T) {
	c := New()
	ActionIn(c, "t/read", func(string) []Request { return nil })
	if got, err := NewStore(c).Input("t/read", []byte(`"a.md"`)); err != nil || got != "a.md" {
		t.Fatalf("the body decodes into %#v, %v", got, err)
	}
}

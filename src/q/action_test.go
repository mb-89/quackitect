// An action answers its list of requests, and refuses an input of another type.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import "testing"

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

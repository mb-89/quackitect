// An action answers its list of calls, and refuses an input of another type.
// [[spec/design_output/model#an-action-lists-calls]]
package q

import "testing"

func TestAnActionAnswersItsCalls(t *testing.T) {
	c := New()
	ActionIn(c, "t/save", func(path string) []Call {
		return []Call{{Door: "disk", Verb: "write", Args: path, NoUndo: "a case"}}
	})
	s := NewStore(c, nil)
	calls, err := s.Act("t/save", "a.md")
	if err != nil {
		t.Fatal(err)
	}
	if len(calls) != 1 || calls[0].Door != "disk" || calls[0].Args != "a.md" {
		t.Fatalf("the action answers %+v", calls)
	}
	if _, err := s.Act("t/save", 7); err == nil {
		t.Fatal("the action takes an int")
	}
}

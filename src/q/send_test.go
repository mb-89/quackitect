// The requests of an action run in order, Then reads their answers, and a
// failing request takes back the ones before it, newest first.
// [[spec/design_output/model#an-action-lists-requests]]
package q

import (
	"errors"
	"testing"
)

func sender(t *testing.T, requests func(string) []Request) *Store {
	t.Helper()
	c := New()
	ActionIn(c, "t/save", requests)
	return NewStore(c, nil)
}

func TestSendRunsTheRequestsInOrderAndFollowsThen(t *testing.T) {
	s := sender(t, func(path string) []Request {
		return []Request{
			{Module: "disk", Verb: "write", Args: path, NoUndo: "a case"},
			{Module: "git", Verb: "add", Args: path, NoUndo: "a case", Then: func(said []any) []Request {
				return []Request{{Module: "git", Verb: "commit", Args: said, NoUndo: "a case"}}
			}},
		}
	})
	var ran []string
	err := s.Send("t/save", "a.md", func(one Request) (any, error) {
		ran = append(ran, one.Module+"."+one.Verb)
		return one.Verb, nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(ran) != 3 || ran[0] != "disk.write" || ran[1] != "git.add" || ran[2] != "git.commit" {
		t.Fatalf("the requests ran %v", ran)
	}
}

func TestAFailingRequestUndoesTheOnesBeforeIt(t *testing.T) {
	s := sender(t, func(path string) []Request {
		return []Request{
			{Module: "disk", Verb: "write", Args: "a.md", Undo: &Request{Module: "disk", Verb: "remove", Args: "a.md"}},
			{Module: "disk", Verb: "write", Args: "b.md", Undo: &Request{Module: "disk", Verb: "remove", Args: "b.md"}},
			{Module: "git", Verb: "commit", NoUndo: "a case"},
		}
	})
	var ran []string
	err := s.Send("t/save", "", func(one Request) (any, error) {
		ran = append(ran, one.Module+"."+one.Verb+" "+asText(one.Args))
		if one.Module == "git" {
			return nil, errors.New("the commit refuses")
		}
		return nil, nil
	})
	if err == nil {
		t.Fatalf("the send answers no error after %v", ran)
	}
	want := []string{"disk.write a.md", "disk.write b.md", "git.commit ", "disk.remove b.md", "disk.remove a.md"}
	if len(ran) != len(want) {
		t.Fatalf("the requests ran %v", ran)
	}
	for i := range want {
		if ran[i] != want[i] {
			t.Fatalf("the requests ran %v", ran)
		}
	}
}

func asText(args any) string {
	text, _ := args.(string)
	return text
}

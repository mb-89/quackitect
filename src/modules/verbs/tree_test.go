// Each tree verb stands as an action handing the verb and its words to the
// node module, with no topic word before them.
// [[spec/tickets/agents-call-quack-directly]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

func TestATreeVerbHandsItsWordsBare(t *testing.T) {
	c := q.New()
	Tree([]Verb{{Name: "lint", Doc: "the rules over the tree"}})(c)
	said, err := q.NewStore(c).Act("lint", Words{Args: []string{"spec/tickets"}})
	if err != nil || len(said) != 1 {
		t.Fatalf("the action lists %+v, %v", said, err)
	}
	one := said[0]
	if one.Module != NodeModule || one.Verb != NodeRun || !reflect.DeepEqual(one.Args, []string{"lint", "spec/tickets"}) || one.NoUndo == "" {
		t.Fatalf("the request reads %+v, and wants the words lint spec/tickets", one)
	}
}

func TestEveryTreeVerbHoldsADoc(t *testing.T) {
	if len(TreeVerbs) == 0 {
		t.Fatal("the tree verbs list nothing")
	}
	for _, one := range TreeVerbs {
		if one.Doc == "" {
			t.Fatalf("the verb %s holds no doc", one.Name)
		}
	}
}

// A tree verb names no topic, so no verb stands as two tools. [[spec/tickets/agents-call-quack-directly]]
func TestNoTreeVerbNamesATopic(t *testing.T) {
	for _, one := range TreeVerbs {
		for _, topic := range []string{"ticket", "retro", "branch", "vehicle", "stub"} {
			if one.Name == topic {
				t.Fatalf("the tree verbs name the topic %s", topic)
			}
		}
	}
}

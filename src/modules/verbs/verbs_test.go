// Each verb of a topic stands as an action, and hands its words to the node
// module under the topic and the verb.
// [[spec/tickets/ticket-verbs-become-actions]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

var ticketVerbs = []Verb{{Name: "note", Doc: "write a private ticket"}, {Name: "todo", Doc: "park it for the next pull"}}

func TestEachVerbOfATopicStandsAsAnAction(t *testing.T) {
	c := q.New()
	Topic("ticket", ticketVerbs)(c)
	store := q.NewStore(c)
	for _, one := range ticketVerbs {
		if in, _, ok := store.Types(one.Name); !ok || in != reflect.TypeFor[Words]() {
			t.Fatalf("the catalog holds no action %s taking Words", one.Name)
		}
		if looks, _ := store.Presentation(one.Name); looks.Doc != one.Doc {
			t.Fatalf("the action %s reads the doc %q", one.Name, looks.Doc)
		}
	}
}

func TestAnActionHandsItsWordsToTheNodeModule(t *testing.T) {
	c := q.New()
	Topic("ticket", ticketVerbs)(c)
	said, err := q.NewStore(c).Act("note", Words{Args: []string{"slow-lint", "a line"}})
	if err != nil || len(said) != 1 {
		t.Fatalf("the action lists %+v, %v", said, err)
	}
	one := said[0]
	if one.Module != NodeModule || one.Verb != NodeRun || !reflect.DeepEqual(one.Args, []string{"ticket", "note", "slow-lint", "a line"}) || one.NoUndo == "" {
		t.Fatalf("the request reads %+v", one)
	}
}

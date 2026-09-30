// The ticket verb list holds every verb the verb's program answers under ticket, each with
// its doc, and each verb of a topic stands as an action handing its words to
// the node module under the topic and the verb.
// [[spec/tickets/ticket-verbs-become-actions]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

// [[spec/tickets/ticket-verbs-each-pinned]]
func TestEveryTicketVerbStandsInTheList(t *testing.T) {
	want := []string{"pull", "note", "update", "open", "todo", "route", "yours", "fill", "bless", "place", "urgent", "set"}
	var names []string
	for _, one := range TicketVerbs {
		names = append(names, one.Name)
		if one.Doc == "" {
			t.Fatalf("the verb %s holds no doc", one.Name)
		}
	}
	if !reflect.DeepEqual(names, want) {
		t.Fatalf("the ticket verbs read %v, and want %v", names, want)
	}
}

func TestEachVerbOfATopicStandsAsAnAction(t *testing.T) {
	c := q.New()
	Topic("ticket", TicketVerbs)(c)
	store := q.NewStore(c)
	for _, one := range TicketVerbs {
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
	Topic("ticket", TicketVerbs)(c)
	said, err := q.NewStore(c).Act("note", Words{Args: []string{"slow-lint", "a line"}})
	if err != nil || len(said) != 1 {
		t.Fatalf("the action lists %+v, %v", said, err)
	}
	one := said[0]
	if one.Module != NodeModule || one.Verb != NodeRun || !reflect.DeepEqual(one.Args, []string{"ticket", "note", "slow-lint", "a line"}) || one.NoUndo == "" {
		t.Fatalf("the request reads %+v", one)
	}
}

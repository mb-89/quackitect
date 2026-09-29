// The ticket verb list holds every verb cli.js answers under ticket, each with
// its doc, so the topic registers each one.
// [[spec/tickets/ticket-verbs-each-pinned]]
package verbs

import (
	"reflect"
	"testing"
)

func TestEveryTicketVerbStandsInTheList(t *testing.T) {
	want := []string{"pull", "note", "update", "open", "todo", "route", "yours", "fill", "bless"}
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

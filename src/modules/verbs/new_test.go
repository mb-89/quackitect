// tickets/new runs the ticket verb's new, which writes the bare ticket where
// no file stands.
// [[spec/tickets/the-sidebar-writes-through-actions]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

// The action's local name, which the wiring files under tickets. [[spec/tickets/the-sidebar-writes-through-actions]]
const newTicket = "new"

func TestTicketsNewRunsTheVerb(t *testing.T) {
	c := q.New()
	TicketsActions(c)
	store := q.NewStore(c)
	input, err := store.Input(newTicket, []byte(`{"path": "spec/tickets/a-new-one.md"}`))
	if err != nil {
		t.Fatalf("tickets/%s takes a path to %v", newTicket, err)
	}
	declared, _ := store.Declared(newTicket)
	if !declared.Writes {
		t.Fatalf("tickets/%s declares %+v, and wants a write", newTicket, declared)
	}
	asked, err := store.Act(newTicket, input)
	want := []string{"ticket", "new", "spec/tickets/a-new-one.md"}
	if err != nil || len(asked) != 1 {
		t.Fatalf("tickets/%s lists %+v, %v, and wants one run", newTicket, asked, err)
	}
	if got := asked[0]; got.Module != NodeModule || got.Verb != NodeRun || !reflect.DeepEqual(got.Args, want) || got.NoUndo == "" {
		t.Fatalf("tickets/%s lists %+v, and wants the words %v", newTicket, got, want)
	}
}

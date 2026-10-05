// The work and tickets module types take the view actions beside their own
// names, so an instance of either answers the calls the base files name.
// [[spec/tickets/view-actions-run-through-verbs]]
package main

import (
	"testing"

	"quackitect/src/q"
)

func TestTheWorkAndTicketsModulesTakeTheViewActions(t *testing.T) {
	t.Parallel()
	for module, names := range map[string][]string{"work": {"pull", "place"}, "tickets": {"flip-urgent", "set-field"}} {
		c := q.New()
		modules[module].registers(c)
		store := q.NewStore(c)
		for _, name := range names {
			if _, ok := store.Declared(name); !ok {
				t.Fatalf("the %s module type registers no action %s", module, name)
			}
		}
	}
}

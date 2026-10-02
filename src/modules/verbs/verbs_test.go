// The branch verbs each stand as an action of their topic, as the ticket
// verbs do.
// [[spec/tickets/work-verbs-become-actions]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

// Every verb work.js answers stands as an action of the branch topic, writing, with its doc. [[spec/tickets/work-verbs-become-actions]]
func TestEveryBranchVerbStandsAsAnAction(t *testing.T) {
	want := []string{"open", "take", "sync", "done", "release", "merge", "close", "read", "review", "list", "escalate", "guidance", "unblock", "test"}
	var names []string
	for _, one := range BranchVerbs {
		names = append(names, one.Name)
	}
	if !reflect.DeepEqual(names, want) {
		t.Fatalf("the branch verbs read %v, and want %v", names, want)
	}
	c := q.New()
	Topic("branch", BranchVerbs)(c)
	store := q.NewStore(c)
	for _, one := range BranchVerbs {
		declared, ok := store.Declared(one.Name)
		if looks, _ := store.Presentation(one.Name); !ok || !declared.Writes || one.Doc == "" || looks.Doc != one.Doc {
			t.Fatalf("the action %s declares %+v, %v, and reads the doc %q", one.Name, declared, ok, looks.Doc)
		}
	}
}

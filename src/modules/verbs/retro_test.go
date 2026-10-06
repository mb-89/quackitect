// The retro verbs each stand as an action of the retro topic, writing, with
// no deadline, so a long collect answers within its caller's wait.
// [[spec/tickets/retro-verbs-become-actions]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

// Every retro verb stands as an action of the retro topic, with its doc. [[spec/tickets/retro-verbs-become-actions]]
func TestEveryRetroVerbStandsAsAnAction(t *testing.T) {
	want := []string{"notes", "audit", "backlog", "collect", "timeline", "chapters", "matrix", "read", "effect", "classes", "mint", "new", "score"}
	var names []string
	for _, one := range RetroVerbs {
		names = append(names, one.Name)
	}
	if !reflect.DeepEqual(names, want) {
		t.Fatalf("the retro verbs read %v, and want %v", names, want)
	}
	c := q.New()
	Topic("retro", RetroVerbs)(c)
	store := q.NewStore(c)
	for _, one := range RetroVerbs {
		if looks, _ := store.Presentation(one.Name); one.Doc == "" || looks.Doc != one.Doc {
			t.Fatalf("the action %s reads the doc %q", one.Name, looks.Doc)
		}
	}
}

// The read action's doc names every row the verb prints, the refusal among them. [[spec/tickets/retro-read-reads-every-record]]
func TestTheReadActionNamesEveryRowItPrints(t *testing.T) {
	t.Parallel()
	want := "every owner prompt, fault, refusal and command of the chapter, with its file and line"
	for _, one := range RetroVerbs {
		if one.Name == "read" && one.Doc != want {
			t.Fatalf("the action read reads the doc %q, and want %q", one.Doc, want)
		}
	}
}

// A retro action writes and declares no deadline, so a long collect answers within its caller's wait, however long it runs. [[spec/tickets/retro-verbs-become-actions]]
func TestARetroActionWritesAndDeclaresNoDeadline(t *testing.T) {
	c := q.New()
	Topic("retro", RetroVerbs)(c)
	declared, ok := q.NewStore(c).Declared("collect")
	if !ok || !declared.Writes || declared.Deadline != 0 {
		t.Fatalf("the action collect declares %+v, %v", declared, ok)
	}
}

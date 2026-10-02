// The view actions register with a label, an icon and a doc, and each hands
// its input to the node module as the ticket verb it runs.
// [[spec/tickets/view-actions-run-through-verbs]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

type viewAction struct {
	registers func(*q.Catalog) q.Writer
	name      string
	in        any
	args      []string
	writes    bool
}

var viewActions = []viewAction{
	{WorkActions, "pull", Nothing{}, []string{"ticket", "yours", "--next"}, false},
	{WorkActions, "place", Placed{Name: "a-ticket", N: 2}, []string{"ticket", "place", "a-ticket", "2"}, true},
	{TicketsActions, "flip-urgent", Named{Name: "a-ticket"}, []string{"ticket", "urgent", "a-ticket"}, true},
	{TicketsActions, "set-field", FieldSet{Name: "a-ticket", Field: "group", Value: "a-group"}, []string{"ticket", "set", "a-ticket", "group", "a-group"}, true},
}

func TestTheViewActionsRegisterWithLabelAndIcon(t *testing.T) {
	for _, one := range viewActions {
		c := q.New()
		one.registers(c)
		store := q.NewStore(c)
		declared, ok := store.Declared(one.name)
		looks, _ := store.Presentation(one.name)
		if !ok || looks.Label == "" || looks.Icon == "" || looks.Doc == "" || declared.Writes != one.writes {
			t.Fatalf("the action %s declares %+v, %v, with the label %q, the icon %q and the doc %q", one.name, declared, ok, looks.Label, looks.Icon, looks.Doc)
		}
	}
}

func TestEachViewActionRunsItsTicketVerb(t *testing.T) {
	for _, one := range viewActions {
		c := q.New()
		one.registers(c)
		said, err := q.NewStore(c).Act(one.name, one.in)
		if err != nil || len(said) != 1 {
			t.Fatalf("the action %s lists %+v, %v", one.name, said, err)
		}
		if got := said[0]; got.Module != NodeModule || got.Verb != NodeRun || !reflect.DeepEqual(got.Args, one.args) || got.NoUndo == "" {
			t.Fatalf("the action %s lists %+v, and wants the words %v", one.name, got, one.args)
		}
	}
}

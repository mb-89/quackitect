// A tagged ticket stands first in the hand-out, and on a group's branch a
// tagged ticket naming another group stays out.
// [[spec/design_input/the-agent-pulls-tickets#the-tag-survives-the-verbs]]
package pull // level0: InPackageTest - reaches the unexported taggedIn

import (
	"reflect"
	"testing"
)

func heldNamed(name, front string) *Held {
	text := "---\nkind: [[ticket]]\nstate: open\n" + front + "---\n\n# Ask\n\nA change.\n"
	return &Held{Name: name, Text: text, Front: FrontOf(text)}
}

func TestATaggedTicketOfAnotherGroupStaysOutOfTheGroupsHandOut(t *testing.T) {
	t.Parallel()
	all := []*Held{
		heldNamed("ours", "todo: true\ngroup: g\n"),
		heldNamed("theirs", "todo: true\ngroup: other\n"),
		heldNamed("free", "todo: true\n"),
		heldNamed("untagged", "group: g\n"),
	}
	names := func(list []*Held) []string {
		out := []string{}
		for _, one := range list {
			out = append(out, one.Name)
		}
		return out
	}
	if got, want := names(taggedIn(all, "g")), []string{"ours", "free"}; !reflect.DeepEqual(got, want) {
		t.Errorf("the group's branch takes %v, want %v", got, want)
	}
	if got, want := names(taggedIn(all, "")), []string{"ours", "theirs", "free"}; !reflect.DeepEqual(got, want) {
		t.Errorf("a desk takes %v, want %v", got, want)
	}
}

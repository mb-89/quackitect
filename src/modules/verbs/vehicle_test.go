// The vehicle and stub verbs each stand as an action of their topic, as the
// ticket verbs do.
// [[spec/tickets/vehicle-verbs-become-actions]]
package verbs

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

// Every verb theVehicle answers stands as an action of the vehicle topic, writing, with its doc. [[spec/tickets/vehicle-verbs-become-actions]]
func TestEveryVehicleVerbStandsAsAnAction(t *testing.T) {
	want := []string{"here", "produce", "into", "attach", "detach", "register"}
	var names []string
	for _, one := range VehicleVerbs {
		names = append(names, one.Name)
	}
	if !reflect.DeepEqual(names, want) {
		t.Fatalf("the vehicle verbs read %v, and want %v", names, want)
	}
	c := q.New()
	Topic("vehicle", VehicleVerbs)(c)
	store := q.NewStore(c)
	for _, one := range VehicleVerbs {
		declared, ok := store.Declared(one.Name)
		if looks, _ := store.Presentation(one.Name); !ok || !declared.Writes || one.Doc == "" || looks.Doc != one.Doc {
			t.Fatalf("the action %s declares %+v, %v, and reads the doc %q", one.Name, declared, ok, looks.Doc)
		}
	}
}

// The stub topic stands as the one action into, handing its words to the node module. [[spec/tickets/vehicle-verbs-become-actions]]
func TestTheStubTopicStandsAsOneAction(t *testing.T) {
	if len(StubVerbs) != 1 || StubVerbs[0].Name != "into" {
		t.Fatalf("the stub verbs read %+v", StubVerbs)
	}
	c := q.New()
	Topic("stub", StubVerbs)(c)
	said, err := q.NewStore(c).Act("into", Words{Args: []string{"elsewhere", "--upstream", "u"}})
	if err != nil || len(said) != 1 || !reflect.DeepEqual(said[0].Args, []string{"stub", "into", "elsewhere", "--upstream", "u"}) {
		t.Fatalf("the action lists %+v, %v", said, err)
	}
}

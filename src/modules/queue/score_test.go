// The score orders a list: the mark first, then what waits under a row, then
// the plan's own order, then the name.
// [[spec/tickets/the-queue-moves-to-plan]]
package queue

import (
	"reflect"
	"testing"
)

func namesOf(list []Row) []string {
	out := []string{}
	for _, one := range list {
		out = append(out, one.Name)
	}
	return out
}

func TestTheMarkStandsOverTheScore(t *testing.T) {
	all := []Row{
		{Name: "blocks-one"},
		{Name: "marked", Urgent: true},
		{Name: "waits", DependsOn: []string{"blocks-one"}},
	}
	at := At{Weights: map[string]float64{"block": 10}}
	said := namesOf(Queued(all[:2], all, at))
	if want := []string{"marked", "blocks-one"}; !reflect.DeepEqual(said, want) {
		t.Fatalf("the queue reads %v, and the mark stands first: %v", said, want)
	}
}

func TestABlockerOfABlockerCounts(t *testing.T) {
	all := []Row{
		{Name: "a-one"},
		{Name: "a-two", DependsOn: []string{"a-one"}},
		{Name: "z-root"},
		{Name: "z-mid", DependsOn: []string{"z-root"}},
		{Name: "z-top", DependsOn: []string{"z-mid"}},
	}
	at := At{Weights: map[string]float64{"block": 1}}
	said := namesOf(Queued([]Row{all[0], all[2]}, all, at))
	if want := []string{"z-root", "a-one"}; !reflect.DeepEqual(said, want) {
		t.Fatalf("the queue reads %v, and the chain of two stands over the one: %v", said, want)
	}
}

func TestATieKeepsThePlansOrder(t *testing.T) {
	list := []Row{
		{Name: "a later todo", Order: 1},
		{Name: "b first todo", Order: 0},
	}
	said := namesOf(Queued(list, list, At{}))
	if want := []string{"b first todo", "a later todo"}; !reflect.DeepEqual(said, want) {
		t.Fatalf("the queue reads %v, and the plan's order breaks the tie: %v", said, want)
	}
}

// A tie reads the name the way localeCompare does, so a todo title carrying a capital sorts beside its small letter. [[spec/tickets/the-queue-moves-to-plan]]
func TestATieReadsTheNameWhateverItsCase(t *testing.T) {
	list := []Row{{Name: "Beta todo"}, {Name: "alpha"}, {Name: "a"}, {Name: "A"}}
	said := namesOf(Queued(list, list, At{}))
	if want := []string{"a", "A", "alpha", "Beta todo"}; !reflect.DeepEqual(said, want) {
		t.Fatalf("the queue reads %v, and the letters order it before their case: %v", said, want)
	}
}

func TestTheDaysAndTheFailsWeigh(t *testing.T) {
	list := []Row{
		{Name: "a-new", Path: "spec/tickets/a-new.md"},
		{Name: "b-old", Path: "spec/tickets/b-old.md"},
		{Name: "c-failed", Path: "spec/tickets/c-failed.md", Fails: 3},
	}
	at := At{
		Now:     10 * 86400 * 1000,
		Weights: map[string]float64{"day": 1, "fail": 5},
		Stood:   map[string]int64{"spec/tickets/a-new.md": 9 * 86400, "spec/tickets/b-old.md": 2 * 86400},
	}
	said := namesOf(Queued(list, list, at))
	if want := []string{"c-failed", "b-old", "a-new"}; !reflect.DeepEqual(said, want) {
		t.Fatalf("the queue reads %v, and fifteen for the fails, eight days and one day order it: %v", said, want)
	}
}

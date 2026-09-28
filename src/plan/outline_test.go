// The outline numbers the lists: a person's rows count down, a row in hand
// stands at zero, the rest count up, and a todo moves a row before the one it
// names.
// [[spec/tickets/the-queue-moves-to-plan]]
package plan

import (
	"reflect"
	"testing"
)

func TestAPersonsRowCountsDown(t *testing.T) {
	p1, p2, h, r := Row{Name: "p1"}, Row{Name: "p2"}, Row{Name: "held"}, Row{Name: "rest"}
	said := Outline([]Row{p1, p2}, []Row{h}, []Row{r}, []Row{p1, p2, h, r}, nil)
	want := map[string]string{"p1": "-2", "p2": "-1", "held": "0", "rest": "1"}
	if !reflect.DeepEqual(said, want) {
		t.Fatalf("the outline reads %v, and wants %v", said, want)
	}
}

func TestATodoStandsBeforeTheRowItNames(t *testing.T) {
	a, b, c := Row{Name: "a"}, Row{Name: "b"}, Row{Name: "c"}
	todo := Row{Name: "a todo", Todo: "c"}
	front := Row{Name: "a front todo", Todo: First}
	all := []Row{a, b, c, todo, front}
	said := Outline(nil, nil, []Row{a, b, c, todo, front}, all, nil)
	want := map[string]string{"a front todo": "1", "a": "2", "b": "3", "a todo": "4", "c": "5"}
	if !reflect.DeepEqual(said, want) {
		t.Fatalf("the outline reads %v, and wants %v", said, want)
	}
}

func TestAChildTakesItsGroupsNumber(t *testing.T) {
	loose := Row{Name: "loose"}
	group := Row{Name: "group"}
	one, two := Row{Name: "one", Group: "group"}, Row{Name: "two", Group: "group"}
	all := []Row{loose, group, one, two}
	said := Outline(nil, nil, []Row{two, loose, one}, all, map[string]string{"one": "two"})
	want := map[string]string{"group": "1", "one": "1.1", "two": "1.2", "loose": "2"}
	if !reflect.DeepEqual(said, want) {
		t.Fatalf("the outline reads %v, and wants %v", said, want)
	}
}

func TestPlacesCompareAsNumbers(t *testing.T) {
	before := [][2]string{{"-2", "1"}, {"1.2", "1.10"}, {"1", "1.1"}, {"3", CloudPlace}, {"0", "0.1"}}
	for _, pair := range before {
		if Compare(pair[0], pair[1]) >= 0 || Compare(pair[1], pair[0]) <= 0 {
			t.Errorf("%s stands before %s", pair[0], pair[1])
		}
	}
	if Compare("2.1", "2.1") != 0 || Compare(CloudPlace, CloudPlace) != 0 {
		t.Errorf("a place compares even with itself")
	}
}

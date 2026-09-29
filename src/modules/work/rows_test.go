// A row carries its ticket's fields, its place and its flags, and a placed
// todo no ticket carries stands as a row of its own.
// [[spec/tickets/open-tasks-come-from-work]]
package work

import (
	"testing"

	"quackitect/src/ticket"
)

func rowsBy(t *testing.T, seeds map[string]any) map[string]Row {
	t.Helper()
	said, _ := read(t, RowsPort, seeds).([]Row)
	out := map[string]Row{}
	for _, one := range said {
		out[one.Name] = one
	}
	return out
}

func TestARowCarriesItsPlaceAndItsFlags(t *testing.T) {
	rows := rowsBy(t, map[string]any{
		TicketsPort: []ticket.Ticket{
			{Name: "a-group", Route: "group", State: "open", Step: "children", Says: "the ask"},
			{Name: "in-hand", Group: "a-group", State: "open", Urgent: true, DependsOn: []string{"a-group"}},
			{Name: "marked", State: "open", Person: true},
		},
		PlacesPort: map[string]string{"a-group": "1", "in-hand": "0", "marked": onCloud},
		CloudPort:  []string{"marked"},
	})
	group, held, marked := rows["a-group"], rows["in-hand"], rows["marked"]
	if group.Kind != "group" || group.Queue != "1" || group.Step != "children" || group.Says != "the ask" {
		t.Errorf("the group reads %+v", group)
	}
	if held.Kind != "ticket" || held.State != "held" || !held.Urgent || !held.Waits || held.Group != "a-group" {
		t.Errorf("the ticket in hand reads %+v", held)
	}
	if !marked.Cloud || !marked.Person || marked.Queue != onCloud {
		t.Errorf("the marked ticket reads %+v", marked)
	}
}

func TestAPlacedTodoStandsAsARow(t *testing.T) {
	rows := rowsBy(t, map[string]any{
		TicketsPort: []ticket.Ticket{{Name: "one", State: "open"}},
		PlacesPort:  map[string]string{"one": "1", "Write the retro": "-1"},
	})
	if todo := rows["Write the retro"]; todo.Kind != "todo" || todo.Queue != "-1" || !todo.Todo {
		t.Fatalf("the todo reads %+v, and the rows %v", todo, rows)
	}
}

func TestAClosedWaitRaisesNoFlagAndATodoAtZeroStandsHeld(t *testing.T) {
	rows := rowsBy(t, map[string]any{
		TicketsPort: []ticket.Ticket{{Name: "done", State: "closed"}, {Name: "next", State: "open", DependsOn: []string{"done", "gone"}}},
		PlacesPort:  map[string]string{"next": "1", "the work in hand": "0"},
	})
	if rows["next"].Waits {
		t.Errorf("a ticket waiting on a closed one and a missing one reads %+v", rows["next"])
	}
	if todo := rows["the work in hand"]; todo.State != "held" || !todo.Held {
		t.Errorf("the todo at zero reads %+v", todo)
	}
	if rows["done"].Queue != "" {
		t.Errorf("a closed ticket takes no place, and reads %+v", rows["done"])
	}
}

func TestYoursHoldsThePlacedRowsOffTheCloudInOutlineOrder(t *testing.T) {
	said, _ := read(t, YoursPort, map[string]any{
		TicketsPort: []ticket.Ticket{
			{Name: "second", Path: "spec/tickets/second.md", State: "open", Step: "do", Person: true},
			{Name: "first", Path: "spec/tickets/first.md", State: "open", Step: "design/draft"},
			{Name: "unplaced", Path: "spec/tickets/unplaced.md", State: "open"},
			{Name: "marked", Path: "spec/tickets/marked.md", State: "open"},
		},
		PlacesPort: map[string]string{"second": "1.2", "first": "-1", "marked": onCloud},
		CloudPort:  []string{"marked"},
	}).([]YoursRow)
	want := []YoursRow{
		{Ticket: "first", Path: "spec/tickets/first.md", Step: "design/draft", Queue: "-1", State: "open"},
		{Ticket: "second", Path: "spec/tickets/second.md", Step: "do", Queue: "1.2", State: "open", Person: true},
	}
	if len(said) != len(want) {
		t.Fatalf("yours holds %+v, and wants %+v", said, want)
	}
	for i := range want {
		if said[i] != want[i] {
			t.Fatalf("yours holds %+v, and wants %+v", said, want)
		}
	}
}

// A placed todo no ticket carries joins yours with no path, and 1.10 stands after 1.2. [[spec/tickets/ticket-verbs-become-actions]]
func TestYoursKeepsALooseTodoInOutlineOrder(t *testing.T) {
	said, _ := read(t, YoursPort, map[string]any{
		TicketsPort: []ticket.Ticket{{Name: "later", Path: "spec/tickets/later.md", State: "open"}},
		PlacesPort:  map[string]string{"later": "1.10", "a-todo": "1.2"},
	}).([]YoursRow)
	if len(said) != 2 || said[0].Ticket != "a-todo" || said[0].Path != "" || said[1].Ticket != "later" {
		t.Fatalf("yours holds %+v", said)
	}
}

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

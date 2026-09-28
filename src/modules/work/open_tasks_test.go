// The count reads the places the queue answers, and leaves the cloud's out.
// [[spec/tickets/open-tasks-come-from-work]]
package work

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

// The place of a row the cloud holds, which src/modules/queue answers. [[spec/design_output/pull#the-queue-is-an-outline]]
const onCloud = "∞"

// The ports a case feeds, as the wiring binds them. [[spec/design_output/model#the-fake-index]]
func fed(c *q.Catalog) q.Writer {
	hand := q.Join(
		q.OutIn(c, TicketsPort, []ticket.Ticket{}, q.Doc("the tickets, as the case seeds them")),
		q.OutIn(c, PlacesPort, map[string]string{}, q.Doc("the places, as the case seeds them")),
		q.OutIn(c, CloudPort, []string{}, q.Doc("the tickets the cloud holds, as the case seeds them")),
	)
	Registers(c)
	return hand
}

// What the module answers under a port, over what the case seeds. [[spec/design_output/model#the-fake-index]]
func read(t *testing.T, port string, seeds map[string]any) any {
	t.Helper()
	var hand q.Writer
	index := qtest.New(t, func(c *q.Catalog) { hand = fed(c) })
	index.SeedAs(hand, seeds)
	return index.Run(port)
}

func TestOpenTasksCountsEveryPlaceOffTheCloud(t *testing.T) {
	said := read(t, OpenTasksPort, map[string]any{PlacesPort: map[string]string{"a": "-1", "b": "0", "c": "1", "c-kid": "1.1", "d": onCloud}})
	if said != 4 {
		t.Fatalf("%s reads %v, and wants 4", OpenTasksPort, said)
	}
}

func TestOpenTasksReadsAFakeTreeOfTickets(t *testing.T) {
	said := read(t, OpenTasksPort, map[string]any{
		TicketsPort: []ticket.Ticket{
			{Name: "a-group", Route: "group", State: "open", Cloud: true},
			{Name: "its-child", Group: "a-group", State: "open"},
			{Name: "free", State: "open"},
			{Name: "done", State: "closed"},
		},
		PlacesPort: map[string]string{"a-group": onCloud, "its-child": onCloud, "free": "1"},
		CloudPort:  []string{"a-group", "its-child"},
	})
	if said != 1 {
		t.Fatalf("%s reads %v over the fake tree, and wants 1", OpenTasksPort, said)
	}
}

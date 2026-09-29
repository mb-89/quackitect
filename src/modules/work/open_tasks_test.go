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

// The port owns the label and the look the badge wears, so no renderer spells them. [[spec/tickets/the-work-view-gains-actions]]
func TestTheOpenTasksPortDeclaresItsLabelAndLook(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { fed(c) })
	looks, found := index.Store().Presentation(OpenTasksPort)
	if !found || looks.Label != "work" || looks.Looks != q.Count {
		t.Fatalf("%s declares label %q and look %q, and wants work and count", OpenTasksPort, looks.Label, looks.Looks)
	}
}

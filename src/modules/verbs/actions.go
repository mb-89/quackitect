// The view actions: the buttons and keys the base files under spec/views call,
// each with a label and an icon, each running a ticket verb through the node
// module.
// [[spec/tickets/view-actions-run-through-verbs]]
package verbs

import (
	"strconv"

	"quackitect/src/q"
)

// The input of an action taking nothing. [[spec/tickets/view-actions-run-through-verbs]]
type Nothing struct{}

// The input of a place: the ticket, and the place it takes. [[spec/tickets/view-actions-run-through-verbs]]
type Placed struct {
	Name string `json:"name" label:"ticket" doc:"the ticket to place"`
	N    int    `json:"n" label:"place" doc:"the place, one to nine"`
}

// The input of a flip: the ticket. [[spec/tickets/view-actions-run-through-verbs]]
type Named struct {
	Name string `json:"name" label:"ticket" doc:"the ticket to flip"`
}

// The input of a field write: the ticket, the field and its value. [[spec/tickets/view-actions-run-through-verbs]]
type FieldSet struct {
	Name  string `json:"name" label:"ticket" doc:"the ticket to write"`
	Field string `json:"field" label:"field" doc:"the front field"`
	Value string `json:"value" label:"value" doc:"the value it takes"`
}

// The actions the work instance takes. [[spec/tickets/view-actions-run-through-verbs]]
func WorkActions(c *q.Catalog) q.Writer {
	return q.Join(
		q.ActionIn(c, "pull", func(Nothing) []q.Request { return nodeRun("ticket", "yours", "--next") },
			q.Doc("Take the ticket waiting on you first, and open it."), q.Label("Pull for me"), q.Icon("📥")),
		q.ActionIn(c, "place", func(in Placed) []q.Request { return nodeRun("ticket", "place", in.Name, strconv.Itoa(in.N)) },
			q.Doc("Place the ticket in the queue, and the same place again clears it."), q.Label("Place"), q.Icon("🔢"), q.Writes()),
	)
}

// The actions the tickets instance takes. [[spec/tickets/view-actions-run-through-verbs]]
func TicketsActions(c *q.Catalog) q.Writer {
	return q.Join(
		q.ActionIn(c, "flip-urgent", func(in Named) []q.Request { return nodeRun("ticket", "urgent", in.Name) },
			q.Doc("Flip the ticket's urgent mark."), q.Label("Urgent"), q.Icon("🚨"), q.Writes()),
		q.ActionIn(c, "set-field", func(in FieldSet) []q.Request { return nodeRun("ticket", "set", in.Name, in.Field, in.Value) },
			q.Doc("Write one field of the ticket's front, as the schema takes it."), q.Label("Set a field"), q.Icon("✏️"), q.Writes()),
		// [[spec/tickets/the-sidebar-writes-through-actions]]
		q.ActionIn(c, "new", func(in Pathed) []q.Request { return nodeRun("ticket", "new", in.Path) },
			q.Doc("Write the bare ticket where no file stands."), q.Label("New ticket"), q.Icon("🆕"), q.Writes()),
	)
}

// The input of a new ticket: its path. [[spec/tickets/the-sidebar-writes-through-actions]]
type Pathed struct {
	Path string `json:"path" label:"path" doc:"the ticket's path, under spec/tickets or .se/tickets"`
}

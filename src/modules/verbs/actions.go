// The view actions: the buttons and keys the base files under spec/views call,
// each with a label and an icon, each running a ticket verb through the node
// module.
// [[spec/tickets/view-actions-run-through-verbs]]
package verbs

import "quackitect/src/q"

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
func WorkActions(c *q.Catalog) q.Writer { return q.Join() }

// The actions the tickets instance takes. [[spec/tickets/view-actions-run-through-verbs]]
func TicketsActions(c *q.Catalog) q.Writer { return q.Join() }

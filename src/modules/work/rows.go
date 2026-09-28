// The work module's rows: one a ticket, with its place and its flags, and one
// a placed todo no ticket carries, ported from rowOfTicket in
// src/scripts/work-answer.js. It reads no git.
// [[spec/tickets/open-tasks-come-from-work]]
package work

import (
	"quackitect/src/q"
	"quackitect/src/ticket"
)

// The ports, by their local names. [[spec/design_output/model#the-wiring-file]]
const (
	TicketsPort   = "tickets"
	PlacesPort    = "places"
	CloudPort     = "cloud"
	RowsPort      = "rows"
	OpenTasksPort = "open-tasks"
)

// A row as the work tab reads it. [[spec/design_output/tui#the-work-tab]]
type Row struct {
	Name     string `json:"name"`
	Kind     string `json:"kind"`
	State    string `json:"state"`
	Step     string `json:"step"`
	Progress string `json:"progress"`
	Group    string `json:"group"`
	Urgent   bool   `json:"urgent"`
	Person   bool   `json:"person"`
	Held     bool   `json:"held"`
	Waits    bool   `json:"waits"`
	Todo     bool   `json:"todo"`
	Says     string `json:"says"`
	Queue    string `json:"queue,omitempty"`
	Cloud    bool   `json:"cloud"`
}

type rowsIn struct {
	Tickets []ticket.Ticket   `q:"tickets"`
	Places  map[string]string `q:"places"`
	Cloud   []string          `q:"cloud"`
}

// The module type the wiring loads as work. [[spec/tickets/open-tasks-come-from-work]]
func Registers(c *q.Catalog) q.Writer {
	rows := q.DerivedIn(c, RowsPort, []Row{}, rowsOf, q.Doc("every ticket and every placed todo, with its place in the queue and its flags"))
	open := q.DerivedIn(c, OpenTasksPort, 0, openTasksOf, q.Doc("the rows this box can take: every placed row off the cloud"))
	return q.Join(rows, open)
}

// [[spec/tickets/open-tasks-come-from-work]]
func rowsOf(in rowsIn) []Row {
	return []Row{}
}

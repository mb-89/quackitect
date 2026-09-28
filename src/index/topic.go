// The topics the index commits itself: the tickets it reads off the note rows.
// The files come from the watch IO module the wiring loads.
// [[spec/design_output/model#io-modules-are-modules]]
package index

import (
	"quackitect/src/q"
	"quackitect/src/tickets"
)

// [[spec/tickets/the-tickets-topic-lands]]
func registersTopics(catalog *q.Catalog) writers {
	return writers{tickets: tickets.Registers(catalog)}
}

// The hands the index commits its topics with, one a registration. [[spec/tickets/commits-name-their-writer]]
type writers struct{ tickets q.Writer }

// One commit of tickets/all. The note rows carry the private tickets the tracked rows leave out, so tickets/all reads them there. [[spec/tickets/the-tickets-topic-lands]]
func (one *door) publishes(_ []string) error {
	all, err := Tickets(one.db)
	if err != nil {
		return err
	}
	_, err = one.store.Commit(one.store.Snapshot().Revision, one.writers.tickets, map[string]any{tickets.AllName: all})
	return err
}

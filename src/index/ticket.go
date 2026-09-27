// The tickets, answered off the note rows through the one reading in
// src/tickets, so a reader asks here and opens no file and no git.
// [[spec/design_output/index#the-index-answers-the-tickets]]
package index

import (
	"database/sql"
	"strings"

	"quackitect/src/tickets"
)

const ticketKind = "ticket"

type Ticket = tickets.Ticket

// [[spec/tickets/the-tickets-topic-lands]]
func Tickets(db *sql.DB) ([]Ticket, error) {
	rows, err := db.Query(
		`SELECT n.path, n.id, n.kind, f.text, f.mtime FROM note n JOIN file f ON f.path = n.path ORDER BY n.path`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := []Ticket{}
	for rows.Next() {
		var path, id, kind, text string
		var changed int64
		if err := rows.Scan(&path, &id, &kind, &text, &changed); err != nil {
			return nil, err
		}
		if strings.Trim(strings.TrimSpace(kind), "[]") != ticketKind || !tickets.Path(path) {
			continue
		}
		out = append(out, tickets.Of(path, id, text, changed))
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return tickets.All(out), nil
}

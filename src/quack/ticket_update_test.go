// The update verb copies a changed process onto a ticket, the leaves it
// reached keeping what they hold and a person's drift stopping the copy, each
// case read off what src/scripts/ticket.js answers over the same tree and git
// history, kept in testdata/ticket_update.json.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main

import "testing"

func TestTicketUpdateVerb(t *testing.T) {
	runsJSCases(t, "testdata/ticket_update.json", "testdata/ticket_route.json")
}

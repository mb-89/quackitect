// The update verb copies a changed process onto a ticket, the leaves it
// reached keeping what they hold and a person's drift stopping the copy, each
// case kept in testdata/ticket_update.json.
// [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

func TestTicketUpdateVerb(t *testing.T) {
	runsJSCases(t, "testdata/ticket_update.json", "testdata/ticket_route.json")
}

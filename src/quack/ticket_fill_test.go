// The fill verb writes what the mint writes for a ticket a person saves with
// a process and no route, each case read off what src/scripts/ticket.js
// answers over the same tree, kept in testdata/ticket_fill.json.
// [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

func TestTicketFillVerb(t *testing.T) {
	runsJSCases(t, "testdata/ticket_fill.json", "testdata/ticket_route.json")
}

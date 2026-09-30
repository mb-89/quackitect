// The ticket verbs: every verb the ticket program answers, each standing as
// an action through the node module.
// [[spec/tickets/ticket-verbs-each-pinned]]
package verbs

// Every verb ticket in src/scripts/verbs/ticket.js and src/scripts/ticket.js answers, with its usage line as its doc. [[spec/tickets/ticket-verbs-each-pinned]]
var TicketVerbs = []Verb{
	{Name: "pull", Doc: "take the next leaf of this group, or hand one back with --pass, --fail, --became, --answered"},
	{Name: "note", Doc: "write a private ticket off the note process, and carry on"},
	{Name: "update", Doc: "copy the ticket's process onto the steps it has yet to reach, and --over writes over drift"},
	{Name: "open", Doc: "open a draft whose ask stands written, so a hand can pull it"},
	{Name: "todo", Doc: "park it for the next pull, and --off takes the tag away"},
	{Name: "route", Doc: "write the steps past the pointer, off --steps=<json>, and answer JSON"},
	{Name: "yours", Doc: "the tickets waiting on a person as JSON, or --next"},
	{Name: "fill", Doc: "write the route a saved ticket's process names, or print it under --stdout"},
	{Name: "bless", Doc: "bless the verdict a gate asking one holds, and move the step on"},
	{Name: "place", Doc: "place the ticket at 1 to 9 in its queue level, and the same place again clears it"},
	{Name: "urgent", Doc: "flip the ticket's urgent mark"},
	{Name: "set", Doc: "write one field of the ticket's front, as the schema takes it, and refuse a field the engine owns"},
}

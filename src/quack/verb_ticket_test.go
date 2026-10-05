// The bare ticket prints the usage ticket.js prints, and exits 0 with no word
// and 2 on a word no sub-verb answers.
// [[spec/tickets/ticket-verbs-port-to-go]]
package main

import "testing"

// The usage src/scripts/ticket.js prints, byte for byte. [[spec/tickets/ticket-verbs-port-to-go]]
const ticketUsageWant = "Usage: ./RUNME.sh ticket <verb>\n\n" +
	"  pull [ticket]       take the next leaf of this group, or hand one back with --pass, --fail, --became, --answered\n" +
	"  note <name> <line>  write a private ticket off the note process, and carry on\n" +
	"  update <ticket>     copy the ticket's process onto the steps it has yet to reach, and --over writes over drift\n" +
	"  open <ticket>       open a draft whose ask stands written, so a hand can pull it\n" +
	"  todo <ticket>       park it for the next pull, and --off takes the tag away\n" +
	"  route <ticket>      write the steps past the pointer, off --steps=<json>, and answer JSON\n" +
	"  yours               the tickets waiting on a person as JSON, or --next\n" +
	"  bless <ticket>      bless the verdict a gate asking one holds, and move the step on, or --desk=<true|false> the desk's word\n" +
	"  new <path>          write the bare ticket where no file stands\n" +
	"  fill <path>         write the route a saved ticket's process names, or print it under --stdout\n" +
	"  place <ticket> <n>  place the ticket at 1 to 9 in its queue level, and the same place again clears it\n" +
	"  urgent <ticket>     flip the ticket's urgent mark\n" +
	"  set <ticket> <field> <value>  write one field of the ticket's front, as the schema takes it\n" +
	"                      note takes --talk where a person decides it, and --todo to park it\n"

func TestTicketVerbUsage(t *testing.T) {
	for _, one := range []struct {
		argv []string
		code int
	}{
		{[]string{"ticket"}, 0},
		{[]string{"ticket", "nothing"}, 2},
	} {
		code, out, errs := runsApart(t, t.TempDir(), false, one.argv...)
		if code != one.code || out != ticketUsageWant || errs != "" {
			t.Errorf("%v answers %d, %q, %q, and wants %d and the usage", one.argv, code, out, errs, one.code)
		}
	}
}

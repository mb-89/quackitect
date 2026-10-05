// The bare ticket: the usage, one line a sub-verb, which twinOf reaches where
// no longer words name a registered verb, off ticket in src/scripts/ticket.js.
// [[spec/tickets/ticket-verbs-port-to-go]]
package main

import "io"

func init() { register("ticket", ticketUsageVerb()) }

// The usage the bare ticket prints, one line a sub-verb. [[spec/tickets/ticket-verbs-port-to-go]]
const ticketUsage = `Usage: ./RUNME.sh ticket <verb>

  pull [ticket]       take the next leaf of this group, or hand one back with --pass, --fail, --became, --answered
  note <name> <line>  write a private ticket off the note process, and carry on
  update <ticket>     copy the ticket's process onto the steps it has yet to reach, and --over writes over drift
  open <ticket>       open a draft whose ask stands written, so a hand can pull it
  todo <ticket>       park it for the next pull, and --off takes the tag away
  route <ticket>      write the steps past the pointer, off --steps=<json>, and answer JSON
  yours               the tickets waiting on a person as JSON, or --next
  bless <ticket>      bless the verdict a gate asking one holds, and move the step on, or --desk=<true|false> the desk's word
  new <path>          write the bare ticket where no file stands
  fill <path>         write the route a saved ticket's process names, or print it under --stdout
  place <ticket> <n>  place the ticket at 1 to 9 in its queue level, and the same place again clears it
  urgent <ticket>     flip the ticket's urgent mark
  set <ticket> <field> <value>  write one field of the ticket's front, as the schema takes it
                      note takes --` + talkKey + ` where a person decides it, and --` + todoKey + ` to park it
`

// The usage, exit 0 with no word and 2 on a word no sub-verb answers. [[spec/tickets/ticket-verbs-port-to-go]]
func ticketUsageVerb() twin {
	return func(argv []string, _ bool, out, _ io.Writer) int {
		_, _ = io.WriteString(out, ticketUsage)
		if wordAt(argv, 1) != "" {
			return exitUsage
		}
		return 0
	}
}

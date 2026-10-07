// ticket urgent: the ticket's urgent mark flipped, written through the road
// ticket set takes.
// [[spec/tickets/view-actions-run-through-verbs]]
package main

import (
	"fmt"
	"io"

	"quackitect/src/index"
	"quackitect/src/pull"
)

func init() { register("ticket urgent", ticketUrgent(pullingHere(index.Root, registeredRepo))) }

// The one mark a hand reads before it takes the next thing. [[spec/design_output/work#the-mark-and-what-waits]]
const urgentKey = "urgent"

// [[spec/tickets/view-actions-run-through-verbs]]
func ticketUrgent(here pullOver) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		it, code := here(out, errs)
		if it == nil {
			return code
		}
		disk := it.Disk
		at, found := ticketNamed(disk, said)
		if !found {
			fmt.Fprintf(errs, "%s names no ticket: ./RUNME.sh ticket urgent slow-lint\n", nameOr(said, "ticket urgent"))
			return exitUsage
		}
		text, _ := disk.Read(at)
		flipped := pull.FlagOn
		if pull.FieldOf(text, urgentKey) == pull.FlagOn {
			flipped = pull.FlagOff
		}
		return ticketWritten(disk, at, urgentKey, flipped, dry, out, errs)
	}
}

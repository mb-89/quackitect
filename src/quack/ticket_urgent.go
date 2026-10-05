// ticket urgent: the ticket's urgent mark flipped, off urgent in
// src/scripts/ticket-edit.js, written through the road ticket set takes.
// [[spec/tickets/view-actions-run-through-verbs]]
package main

import (
	"fmt"
	"io"

	"quackitect/src/index"
	"quackitect/src/pull"
)

func init() { register("ticket urgent", ticketUrgent(index.Root)) }

// The one mark a hand reads before it takes the next thing. [[spec/design_output/work#the-mark-and-what-waits]]
const urgentKey = "urgent"

// [[spec/tickets/view-actions-run-through-verbs]]
func ticketUrgent(rootOf func() (string, error)) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		disk, err := workDisk(rootOf)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
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

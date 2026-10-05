// ticket open: a draft with an Ask opens at its first leaf in one commit of
// its own, through the voice and the group checks, off open in
// src/scripts/ticket.js and OpensDraft in src/pull.
// [[spec/design_output/pull#a-draft-opens]]
package main

import (
	"fmt"
	"io"

	"quackitect/src/index"
	"quackitect/src/pull"
)

func init() { register("ticket open", ticketOpen(index.Root)) }

// The state a ticket opens from. [[spec/design_output/pull#a-draft-opens]]
const openFrom = "draft"

// [[spec/design_output/pull#a-draft-opens]]
func ticketOpen(rootOf func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		if wordAt(said, 0) == "" {
			fmt.Fprintln(errs, "ticket open needs a ticket: ./RUNME.sh ticket open slow-lint")
			return exitUsage
		}
		it, code := pullHere(rootOf, out, errs)
		if it == nil {
			return code
		}
		at, found := ticketNamed(it.Disk, said)
		if !found {
			fmt.Fprintf(errs, "%s names no ticket under %s or %s.\n", said[0], pull.Notes, pull.Tickets)
			return exitUsage
		}
		text, _ := it.Disk.Read(at)
		if state := pull.FieldOf(text, "state"); state != openFrom {
			if state == "" {
				state = "with no state"
			}
			fmt.Fprintf(out, "%s stands %s already.\n", at, state)
			return 0
		}
		step, refused := it.OpensDraft(at)
		if refused != "" {
			fmt.Fprintln(errs, refused)
			return exitFailed
		}
		fmt.Fprintf(out, "%s stands open at %s, and the pull hands it out.\n", at, step)
		return 0
	}
}

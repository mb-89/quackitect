// ticket new: the bare ticket where no file stands, and a standing one keeps
// what it holds, off bare in src/scripts/ticket.js.
// [[spec/tickets/the-sidebar-writes-through-actions]]
package main

import (
	"fmt"
	"io"

	"quackitect/src/index"
	"quackitect/src/pull"
)

func init() { register("ticket new", ticketNew(index.Root)) }

// [[spec/tickets/the-sidebar-writes-through-actions]]
func ticketNew(rootOf func() (string, error)) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		path := wordAt(argv, 2)
		if !pull.NewTicketPath(path) {
			fmt.Fprintln(errs, "ticket new needs a ticket path: ./RUNME.sh ticket new spec/tickets/slow-lint.md")
			return exitUsage
		}
		disk, err := workDisk(rootOf)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if disk.Exists(path) {
			return 0
		}
		if !dry {
			if err := disk.Write(path, pull.NewTicket); err != nil {
				fmt.Fprintln(errs, err)
				return exitFailed
			}
		}
		fmt.Fprintf(out, "%s stands bare\n", path)
		return 0
	}
}

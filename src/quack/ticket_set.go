// ticket set: one field of a ticket's front, written as the schema takes it,
// off set and written in src/scripts/ticket-edit.js. ticket urgent writes
// through the same road.
// [[spec/tickets/view-actions-run-through-verbs]]
package main

import (
	"fmt"
	"io"
	"strings"

	"quackitect/src/index"
	"quackitect/src/pull"
)

func init() { register("ticket set", ticketSet(pullingHere(index.Root, registeredRepo))) }

// The schema a written field is weighed against, which SCHEMA in ticket-edit.js names too. [[spec/design_output/schema#the-verbs-own-their-fields]]
const ticketSchemaAt = "spec/schemas/ticket.schema.yaml"

// [[spec/tickets/view-actions-run-through-verbs]]
func ticketSet(here pullOver) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		it, code := here(out, errs)
		if it == nil {
			return code
		}
		disk := it.Disk
		at, found := ticketNamed(disk, said)
		if !found || wordAt(said, 1) == "" {
			fmt.Fprintf(errs, "%s needs a ticket, a field and a value: ./RUNME.sh ticket set slow-lint group a-group\n", nameOr(said, "ticket set"))
			return exitUsage
		}
		return ticketWritten(disk, at, said[1], strings.Join(said[2:], " "), dry, out, errs)
	}
}

// The disk under the work root, which the JS ticket verb reads as its root. [[spec/design_output/vehicle#the-work-root-inherits]]
func workDisk(rootOf func() (string, error)) (pull.OSDisk, error) {
	_, work, err := rootsOf(rootOf)
	return pull.OSDisk{Root: work}, err
}

// The ticket the first word names, and nothing where no word stands or none answers. [[spec/design_output/pull#the-private-queue]]
func ticketNamed(disk pull.Disk, said []string) (string, bool) {
	if wordAt(said, 0) == "" {
		return "", false
	}
	return pull.TicketAt(disk, said[0])
}

// The first word as the message names it, or the verb's own words where the call names nothing. [[spec/tickets/view-actions-run-through-verbs]]
func nameOr(said []string, verb string) string {
	if len(said) == 0 {
		return verb
	}
	return said[0]
}

// One field written, or dropped where the value is empty or a flag standing off. A dry run says so and writes nothing. [[spec/tickets/go-writes-the-frontmatter]]
func ticketWritten(disk pull.Disk, at, key, value string, dry bool, out, errs io.Writer) int {
	text, _ := disk.Read(at)
	schema, _ := disk.Read(ticketSchemaAt)
	if why := pull.Weighs(schema, key, value); why != "" {
		fmt.Fprintln(errs, why)
		return exitUsage
	}
	written, err := pull.WithField(text, key, value)
	if value == "" || value == pull.FlagOff {
		written, err = pull.WithoutField(text, key)
	}
	// [[spec/design_output/pull#a-closed-group-stays-shut]]
	if key == pull.GroupField && err == nil {
		if why := pull.ClosedGroup(disk, written); why != "" {
			fmt.Fprintln(errs, why)
			return exitUsage
		}
	}
	if err == nil && !dry {
		err = disk.Write(at, written)
	}
	if err != nil {
		fmt.Fprintln(errs, err)
		return exitFailed
	}
	if value == "" {
		value = "nothing"
	}
	fmt.Fprintf(out, "%s carries %s: %s.\n", at, key, value)
	return 0
}

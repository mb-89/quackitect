// ticket todo: a ticket parked for the next pull, and --off takes the tag
// away.
// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
package main

import (
	"fmt"
	"io"
	"slices"

	"quackitect/src/index"
	"quackitect/src/pull"
)

func init() { register("ticket todo", ticketTodo(pullingHere(index.Root, registeredRepo))) }

// The tag the pull hands back first, which TODO in .claude/skills/level0/lib/todo.js names. [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
const todoKey = "todo"

// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
func ticketTodo(here pullOver) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		if wordAt(said, 0) == "" {
			fmt.Fprintf(errs, "ticket %s needs a ticket: ./RUNME.sh ticket %s slow-lint\n", todoKey, todoKey)
			return exitUsage
		}
		it, code := here(out, errs)
		if it == nil {
			return code
		}
		disk := it.Disk
		at, found := ticketNamed(disk, said)
		if !found {
			fmt.Fprintf(errs, "%s names no ticket under %s or %s.\n", said[0], pull.Notes, pull.Tickets)
			return exitUsage
		}
		text, _ := disk.Read(at)
		off := slices.Contains(argv, "--off")
		if rides := pull.FieldOf(text, pull.GroupField); !off && rides != "" {
			fmt.Fprintf(errs, "%s rides %s, and that branch speaks for it already.\n", at, rides)
			fmt.Fprintf(errs, "A %s parks work no branch carries.\n", todoKey)
			return exitUsage
		}
		written, err := pull.WithField(text, todoKey, pull.FlagOn)
		if off {
			written, err = pull.WithoutField(text, todoKey)
		}
		if err == nil && !dry {
			err = disk.Write(at, written)
		}
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		if off {
			fmt.Fprintf(out, "%s carries no %s, and a push takes it away from here.\n", at, todoKey)
		} else {
			fmt.Fprintf(out, "%s stands at %s, and the next pull hands it back first.\n", at, todoKey)
		}
		return 0
	}
}

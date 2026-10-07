// ticket place: the ticket placed at 1 to 9 in its queue level, written as
// an override into the plan file.
// The level reads off the index's work rows in place of answerOf.
// [[spec/tickets/view-actions-run-through-verbs]]
package main

import (
	"fmt"
	"io"
	"math"
	"strconv"

	"quackitect/src/index"
	"quackitect/src/modules/queue"
	"quackitect/src/modules/work"
	"quackitect/src/pull"
)

func init() { register("ticket place", ticketPlace(index.Root, reachV1)) }

// The value the index answers every row under, which the work module wires as work. [[spec/tickets/open-tasks-come-from-work]]
const placeRows = "work/" + work.RowsPort

// The usage a place prints where its words read wrong. [[spec/tickets/view-actions-run-through-verbs]]
const placeNeeds = "ticket place needs a ticket and a place from 1 to 9: ./RUNME.sh ticket place slow-lint 2"

// The places a place takes. [[spec/design_output/pull#a-todo-forces-a-place]]
const (
	firstPlace = 1
	lastPlace  = 9
)

// Where the ticket and the place stand in the verb's words, past ticket and place. [[spec/tickets/view-actions-run-through-verbs]]
const (
	placeNameAt = 2
	placeAt     = 3
)

// [[spec/tickets/view-actions-run-through-verbs]]
func ticketPlace(rootOf, v1 func() (string, error)) twin {
	return func(argv []string, dry bool, out, errs io.Writer) int {
		name := wordAt(argv, placeNameAt)
		n, read := pull.JSNumber(wordAt(argv, placeAt))
		if len(argv) <= placeAt || name == "" || !read || n != math.Trunc(n) || n < firstPlace || n > lastPlace {
			fmt.Fprintln(errs, placeNeeds)
			return exitUsage
		}
		base, err := v1()
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		var said struct {
			Value []work.Row `json:"value"`
		}
		if err := reads(base+"/values/"+placeRows, &said); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		rows := levelOf(said.Value, name)
		if rows == nil {
			fmt.Fprintf(errs, "%s stands in no row of the queue.\n", name)
			return exitUsage
		}
		value, notice := pull.PlaceValue(rows, name, int(n))
		if value == "" {
			fmt.Fprintln(errs, notice)
			return exitUsage
		}
		disk, err := workDisk(rootOf)
		if err == nil && !dry {
			plan, _ := disk.Read(queue.Plan)
			err = disk.Write(queue.Plan, pull.PlacesWritten(plan, name, value))
		}
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		fmt.Fprintf(out, "%s takes place %d once the queue reads it.\n", name, int(n))
		return 0
	}
}

// The rows standing beside the name at its own level: the roots, or its branch's tickets. A branch's row carries no path, which branchRow in src/modules/work/rows.go draws, and its tickets name it under group. [[spec/tickets/view-actions-run-through-verbs]]
func levelOf(rows []work.Row, name string) []pull.PlaceRow {
	branches := map[string]bool{}
	for _, one := range rows {
		if one.Kind == "group" && one.Path == "" {
			branches[one.Name] = true
		}
	}
	level := func(group string) []pull.PlaceRow {
		out := []pull.PlaceRow{}
		for _, one := range rows {
			if branches[one.Group] == (group != "") && (group == "" || one.Group == group) {
				out = append(out, pull.PlaceRow{Name: one.Name, Queue: one.Queue, Todo: strconv.FormatBool(one.Todo)})
			}
		}
		return out
	}
	for _, one := range rows {
		if one.Name == name && !branches[one.Group] {
			return level("")
		}
	}
	for _, one := range rows {
		if one.Name == name {
			return level(one.Group)
		}
	}
	return nil
}

// The route verb: a person edits the steps ahead of the pointer, every leaf
// the ticket reached stands as it stood, and the verb answers JSON on both
// roads.
// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
package main

import (
	"fmt"
	"io"
	"strings"

	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/note"
	"quackitect/src/pull"
	"quackitect/src/yaml"
)

func init() { register("ticket route", ticketRoute(index.Root)) }

// The flag the whole route rides in on, as JSON. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
const stepsFlag = "--steps="

// [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func ticketRoute(rootOf func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		said := argv[min(2, len(argv)):]
		disk, err := workDisk(rootOf)
		if err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		at, found := ticketNamed(disk, said)
		if !found {
			return routeAnswer(out, 1, "refused", wordAt(said, 0)+" names no ticket under "+pull.Notes+" or "+pull.Tickets+".", "at", "")
		}
		flag := ""
		for _, one := range said {
			if strings.HasPrefix(one, stepsFlag) {
				flag = strings.TrimPrefix(one, stepsFlag)
				break
			}
		}
		steps, ok := pull.RouteOf(flag)
		if !ok {
			return routeAnswer(out, 1, "refused", "ticket route takes the whole route as a JSON list: "+stepsFlag+"<json>.", "at", "")
		}
		text, _ := disk.Read(at)
		held := note.Read(text).Front.Said
		if why, where := pull.RouteAheadOnly(held, steps); why != "" {
			return routeAnswer(out, 1, "refused", why, "at", where)
		}
		schema := ticketSchema(disk.Root)
		if err := disk.Write(at, check.ReRouted(text, schema, steps, "")); err != nil {
			fmt.Fprintln(errs, err)
			return exitFailed
		}
		return routeAnswer(out, 0, "ticket", at, "step", yaml.AsString(held.Get("step")), "steps", steps)
	}
}

// The ticket schema the tree holds, or nothing. [[spec/design_output/schema#mint-writes-a-valid-note]]
func ticketSchema(root string) *yaml.Doc {
	return check.SchemasIn(check.TreeOver(root, rootDisk{root})).Get(ticketKind)
}

// Prints one JSON object off its keys and values, in their order, and answers the code. [[spec/design_input/the-editor-draws-the-ticket#the-drawing-takes-an-edit]]
func routeAnswer(out io.Writer, code int, pairs ...any) int {
	said := yaml.New()
	for i := 0; i+1 < len(pairs); i += 2 {
		said.Set(pairs[i].(string), pairs[i+1])
	}
	fmt.Fprintln(out, pull.RouteJSON(said))
	return code
}

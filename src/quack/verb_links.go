// The links verb: what reaches a note, and what reaches nothing, asked of the
// index in place of the program the verb ran under node.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"io"

	"quackitect/src/index"
)

func init() { register("links", linksVerb(index.Ask)) }

// links off the ask: the links reaching the target named, and the dangling ones where no target comes. [[spec/tickets/read-verbs-port-to-go]]
func linksVerb(ask asker) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		if len(argv) > 1 {
			return indexSays(ask, argv, out, errs)
		}
		return indexSays(ask, []string{"dangling"}, out, errs)
	}
}

// The notes verb: the notes the words belong to, ranked by name and body,
// asked of the index in place of the program the verb ran under node.
// [[spec/tickets/read-verbs-port-to-go]]
package main

import (
	"io"

	"quackitect/src/index"
)

func init() { register("notes", notesVerb(index.Ask)) }

// notes off the ask, with the words as the index reads them. [[spec/tickets/read-verbs-port-to-go]]
func notesVerb(ask asker) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return indexSays(ask, argv, out, errs)
	}
}

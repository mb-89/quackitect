// ticket pull: the next leaf of this group, or a hand back, through the pull
// in src/pull over the doors this box holds.
// [[spec/design_output/pull#the-answers]]
package main

import (
	"io"

	"quackitect/src/index"
)

func init() { register("ticket pull", ticketPull(index.Root)) }

// [[spec/design_output/pull#the-hand-out]]
func ticketPull(rootOf func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		it, code := pullHere(rootOf, out, errs)
		if it == nil {
			return code
		}
		return it.Pulling(argv[1:])
	}
}

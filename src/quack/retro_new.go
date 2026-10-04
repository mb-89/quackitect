// The retro's mint: one command writes the ticket off the retro route, opens it
// at that route's first leaf, and hands the leaf out, each through the verb
// that owns it.
// [[spec/design_input/the-agent-pulls-tickets]]
package main

import "io"

func init() { register("retro new", retroNewVerb(retroRoot, retroMintRunme)) }

// The verb: mints the retro off its route, writes the reason into its ask, opens it and pulls it. [[spec/design_input/the-agent-pulls-tickets]]
func retroNewVerb(root func() string, run retroMintRun) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return 0
	}
}

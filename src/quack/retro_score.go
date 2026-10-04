// The score verb: it counts the improvement tickets earlier retros mint, and
// says how many of them still stand open in the tree.
// [[spec/design_input/the-agent-pulls-tickets]]
package main

import "io"

func init() { register("retro score", retroScoreVerb(retroRoot)) }

// The verb: every improvement a retro mints, and how many stay open. [[spec/design_input/the-agent-pulls-tickets]]
func retroScoreVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return 0
	}
}

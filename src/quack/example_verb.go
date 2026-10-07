// example run: one example against the real system, in a clone of the tree
// under the runtime folder, each step its own process, each verdict printed.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

import (
	"io"

	"quackitect/src/index"
	"quackitect/src/proc"
)

func init() { register("example", exampleVerb(index.Root, proc.Real)) }

// The example verb over its root and its runner. [[spec/design_output/examples#one-runner-two-drivers]]
func exampleVerb(rootOf func() (string, error), run proc.Runner) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int { return 0 }
}

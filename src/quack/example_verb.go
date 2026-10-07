// example run: one example against the real system, in a clone of the tree
// under the runtime folder, each step its own process, each verdict printed.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

import (
	"bufio"
	"io"
	"os"

	"quackitect/src/index"
	"quackitect/src/proc"
)

func init() { register("example", exampleVerb(index.Root, proc.Real, enterOnTerminal)) }

// Waits for the user's Enter where a person sits at the terminal, and runs straight through where the input is a pipe or nothing. [[spec/tickets/example-run-pauses-between-steps]]
func enterOnTerminal() {
	if said, err := os.Stdin.Stat(); err == nil && said.Mode()&os.ModeCharDevice != 0 {
		_, _ = bufio.NewReader(os.Stdin).ReadString('\n')
	}
}

// The example verb over its root, its runner and the pause between steps. [[spec/design_output/examples#one-runner-two-drivers]]
func exampleVerb(rootOf func() (string, error), run proc.Runner, pause func()) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int { return 0 }
}

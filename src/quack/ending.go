// A child the check gives up on ends whole, with every process it started, so no orphan holds a pipe, a port or a lock past it.
// [[spec/tickets/the-check-ends-what-it-drops]]
package main

import "os/exec"

// Readies a command so the end of its context ends the child and every process under it. The platform files hold how. [[spec/tickets/the-check-ends-what-it-drops]]
func endsWhole(run *exec.Cmd) *exec.Cmd {
	whole(run)
	return run
}

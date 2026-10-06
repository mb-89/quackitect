// The failure verb: an agent raises a failure by id, writes a node for a
// failure it meets with no id, and counts the failures the log holds by id.
// [[spec/design_output/failures#an-agent-raises-by-verb]]
package main

import (
	"io"
	"time"

	"quackitect/src/index"
)

// What the verb reads: the root and the clock. [[spec/design_output/failures#an-agent-raises-by-verb]]
type failureDoors struct {
	root string
	now  func() time.Time
}

// The doors over the tree's own root and the wall clock. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureHere() (failureDoors, error) {
	root, err := index.Root()
	return failureDoors{root: root, now: time.Now}, err
}

func init() { register("failure", failureVerb(failureHere)) }

// The failure verb over the doors. [[spec/design_output/failures#an-agent-raises-by-verb]]
func failureVerb(doors func() (failureDoors, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return exitFailed
	}
}

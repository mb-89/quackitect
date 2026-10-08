// quack dispatch: the dispatch verb in Go, registered from this file, over the
// branch doors and a send door onto the network.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package main

import (
	"io"

	"quackitect/src/branches"
	"quackitect/src/index"
)

func init() { register("dispatch", dispatchVerb(index.Root, reachV1, httpSend)) }

// dispatch off the branch doors and the send door, every word past the verb handed to the package. [[spec/tickets/dispatch-verbs-port-to-go]]
func dispatchVerb(root func() (string, error), v1 func() (string, error), send branches.Send) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return branches.Dispatch(branchDoors(root, v1, out, errs), send, argv[1:])
	}
}

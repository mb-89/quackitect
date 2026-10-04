// quack cloud: the cloud verb in Go, registered from this file, over the doors
// the branch verbs run behind.
// [[spec/tickets/work-verbs-port-to-go]]
package main

import (
	"io"

	"quackitect/src/branches"
	"quackitect/src/index"
)

func init() { register("cloud", cloudVerb(index.Root, index.V1)) }

// cloud off the doors over the root, every word past the verb handed to the package. [[spec/tickets/work-verbs-port-to-go]]
func cloudVerb(root func() (string, error), v1 func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return branches.Cloud(branchDoors(root, v1, out, errs), argv[1:])
	}
}

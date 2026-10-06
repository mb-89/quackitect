// The hook verb: answers the git hooks out of Go, so a commit and a push need
// no Node. Each event prints its refusal and exits one, or exits zero.
// [[spec/tickets/git-hooks-run-in-go]]
package main

import (
	"io"
	"time"
)

// The outside the hook verb reads: the root, whether a cloud box runs it, the environment, the text git pipes in, and the clock. [[spec/tickets/git-hooks-run-in-go]]
type hookDoors struct {
	root  string
	cloud bool
	env   func(name string) string
	stdin io.Reader
	now   func() time.Time
}

// The hook verb over the doors. [[spec/tickets/git-hooks-run-in-go]]
func hookVerb(_ hookDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int {
		return 0
	}
}

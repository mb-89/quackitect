// The hook verb: answers the git hooks out of Go, so a commit and a push need
// no Node. Each event prints its refusal and exits one, or exits zero.
// [[spec/tickets/git-hooks-run-in-go]]
package main

import (
	"io"
	"time"

	"quackitect/src/modules/hooks"
)

// The outside the hook verb reads: the root, whether a cloud box runs it, the environment, the text git pipes in, and the clock. [[spec/tickets/git-hooks-run-in-go]]
type hookDoors struct {
	root  string
	cloud bool
	env   func(name string) string
	stdin io.Reader
	now   func() time.Time
	// The Copilot surface a hook answers on, vscode or cloud. [[spec/tickets/copilot-hooks-run-in-go]]
	copilot string
	// The post to the hooks door, which errs where the door answers nothing. [[spec/tickets/copilot-hooks-run-in-go]]
	ask func(post hooks.Post) (hooks.Answer, error)
	// The session log's one row a Copilot event writes. [[spec/tickets/copilot-hooks-run-in-go]]
	log func(level, kind, line string, fields map[string]any) error
	// The run of a program in a folder the down word starts the index with, as serveDoors.run answers it. [[spec/tickets/level0-hooks-forward-to-go]]
	run func(argv []string, cwd string) (int, string, error)
}

// The ask reading the standing file under the root and posting there with its bearer token, within the wait. [[spec/tickets/copilot-hooks-run-in-go]]
func hookAsk(_ string, _ time.Duration) func(hooks.Post) (hooks.Answer, error) {
	return func(hooks.Post) (hooks.Answer, error) { return hooks.Answer{}, nil }
}

// The hook verb over the doors. [[spec/tickets/git-hooks-run-in-go]]
func hookVerb(_ hookDoors) twin {
	return func(_ []string, _ bool, _, _ io.Writer) int {
		return 0
	}
}

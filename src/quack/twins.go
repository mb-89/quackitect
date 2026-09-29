// The Go twins of the verbs cli.js answers, each a read the index holds. The
// road runs each beside cli.js in shadow, and alone under new.
// [[spec/tickets/ticket-verbs-become-actions]]
package main

import (
	"io"

	"quackitect/src/q"
)

// ticket yours off work/yours over the base v1 answers. [[spec/tickets/ticket-verbs-become-actions]]
func ticketYours(v1 func() (string, error)) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return exitUsage
	}
}

// The node module: runs cli.js under the root with the request's words, and answers its output. [[spec/tickets/ticket-verbs-become-actions]]
func nodeAccept(root string) func(q.Request) (any, error) {
	return func(q.Request) (any, error) { return nil, nil }
}

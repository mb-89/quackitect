// The drafts module's outside: Vale through the seam a caller hands it, the
// owner's question count off the store, and the answer's caps off the
// settings. A stub until tests-green.
// [[spec/tickets/prose-tools-answer-in-go]]
package main

import (
	"quackitect/src/modules/drafts"
	"quackitect/src/q"
)

// [[spec/tickets/prose-tools-answer-in-go]]
func draftsOutside(root string, store *q.Store, lint func(text, name string) drafts.Linted) drafts.Outside {
	return drafts.Outside{}
}

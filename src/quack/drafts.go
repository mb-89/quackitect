// The drafts module's outside: Vale through the seam a caller hands it, the
// owner's question count off the store, and the answer's caps off the
// settings. A stub until tests-green.
// [[spec/tickets/prose-tools-answer-in-go]]
package main

import (
	"quackitect/src/modules/drafts"
	"quackitect/src/q"
)

// heardOver under the root, as the lint the drafts seam takes. [[spec/tickets/drafts-lint-seam-carries-why]]
func draftsLint(root string) func(text, name string) drafts.Linted {
	return func(text, name string) drafts.Linted {
		said := heardOver(root, name, text)
		out := drafts.Linted{Stands: said.stands, Ran: said.ran, Why: said.why}
		for _, one := range said.rows {
			out.Found = append(out.Found, drafts.Finding{Rule: one.found.Rule, Line: one.found.Line, Column: one.found.Column, Said: one.found.Said, Message: one.message, Severity: one.severity})
		}
		return out
	}
}

// [[spec/tickets/prose-tools-answer-in-go]]
func draftsOutside(root string, store *q.Store, lint func(text, name string) drafts.Linted) drafts.Outside {
	return drafts.Outside{}
}

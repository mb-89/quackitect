// The drafts module's outside: Vale through the seam a caller hands it, the
// owner's question count off the store, and the answer's caps off the
// settings.
// [[spec/tickets/prose-tools-answer-in-go]]
package main

import (
	"sync/atomic"

	settingsreader "quackitect/src/config"
	"quackitect/src/modules/drafts"
	"quackitect/src/modules/hooks"
	"quackitect/src/q"
)

// The config keys the answer's caps read. [[spec/design_output/level0#the-three-bands]]
const (
	answerWordsKey   = "answer.words"
	answerWarnAtKey  = "answer.warnAt"
	answerCeilingKey = "answer.ceiling"
)

// heardOver under the root, as the lint the drafts seam takes. [[spec/tickets/drafts-lint-seam-carries-why]]
func draftsLint(root string) func(text, name string) drafts.Linted {
	return func(text, name string) drafts.Linted {
		said := heardOver(quietBox(), root, name, text)
		out := drafts.Linted{Stands: said.stands, Ran: said.ran, Why: said.why}
		for _, one := range said.rows {
			out.Found = append(out.Found, drafts.Finding{Rule: one.found.Rule, Line: one.found.Line, Column: one.found.Column, Said: one.found.Said, Message: one.message, Severity: one.severity})
		}
		return out
	}
}

// [[spec/tickets/prose-tools-answer-in-go]]
func draftsOutside(root string, store *q.Store, lint func(text, name string) drafts.Linted) drafts.Outside {
	return drafts.Outside{
		Lint:      lint,
		Questions: questionsHeard(store),
		Bands: func() drafts.Bands {
			return drafts.Bands{
				Words:   settingsreader.Count(root, answerWordsKey),
				WarnAt:  settingsreader.Count(root, answerWarnAtKey),
				Ceiling: settingsreader.Count(root, answerCeilingKey),
			}
		},
	}
}

// The question count the newest holds fold commits, off the owner's last prompt, as reportsHeard reads the reports. [[spec/tickets/prose-tools-answer-in-go]]
func questionsHeard(store *q.Store) func() int {
	if store == nil {
		return func() int { return 0 }
	}
	var asked atomic.Int64
	store.OnCommit(func(values map[string]any) {
		for _, value := range values {
			if held, ok := value.(hooks.Holds); ok {
				asked.Store(int64(held.Questions))
			}
		}
	})
	return func() int { return int(asked.Load()) }
}

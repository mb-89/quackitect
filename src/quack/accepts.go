// The IO side of the root: each request an action lists goes to the IO module
// that accepts it, and a request no module accepts is refused.
// [[spec/tickets/actions-answer-over-http]]
package main

import (
	"fmt"

	"quackitect/src/index"
	"quackitect/src/modules/drafts"
	"quackitect/src/modules/edits"
	"quackitect/src/modules/files"
	"quackitect/src/modules/plans"
	"quackitect/src/modules/search"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/waits"
	"quackitect/src/q"
)

// The IO modules that answer a request an action lists: disk over the root, the edits, search, waits, plans and drafts modules, the node module, the store's land, and a refusal naming any other. [[spec/tickets/actions-answer-over-http]]
func accepts(root string, store *q.Store, reads index.Reads) func(q.Request) (any, error) {
	disk := files.Accept(files.NewDisk(root))
	node := nodeAccept(root)
	edit := edits.Accept(editsOutside(root))
	find := search.Accept(searchOutside(root, reads))
	wait := waits.Accept(waitsOutside(root, store))
	plan := plans.Accept(plansOutside(root, store))
	draft := drafts.Accept(draftsOutside(root, store, draftsLint(root)))
	return func(asked q.Request) (any, error) {
		// [[spec/tickets/find-and-wait-in-go]]
		switch asked.Module {
		case search.Module:
			return find(asked)
		case waits.Module:
			return wait(asked)
		// [[spec/tickets/plan-writes-off-go]]
		case plans.Module:
			return plan(asked)
		// [[spec/tickets/prose-tools-answer-in-go]]
		case drafts.Module:
			return draft(asked)
		}
		if asked.Module == files.DiskModule {
			return disk(asked)
		}
		// [[spec/tickets/edit-tools-answer-in-go]]
		if asked.Module == edits.Module {
			return edit(asked)
		}
		// [[spec/tickets/config-answers-keys-and-overrides]]
		if landing, ok := asked.Args.(q.Landing); ok && store != nil && asked.Module == q.StoreModule && asked.Verb == q.StoreLand {
			return nil, store.Land(landing.Name, landing.Event)
		}
		// [[spec/tickets/ticket-verbs-become-actions]]
		if asked.Module == verbsmodule.NodeModule && asked.Verb == verbsmodule.NodeRun {
			return node(asked)
		}
		return nil, fmt.Errorf("no IO module accepts %s.%s", asked.Module, asked.Verb)
	}
}

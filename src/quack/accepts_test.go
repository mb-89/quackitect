// The accept table reads one answer for the tool list and for the route.
// [[spec/tickets/every-index-tool-answers]]
package main

import (
	"testing"

	"quackitect/src/modules/drafts"
	"quackitect/src/modules/edits"
	"quackitect/src/modules/files"
	"quackitect/src/modules/plans"
	"quackitect/src/modules/search"
	verbsmodule "quackitect/src/modules/verbs"
	"quackitect/src/modules/waits"
	"quackitect/src/q"
)

// The verbs accepts routes read as accepted, and a module or verb it refuses reads as refused. [[spec/tickets/every-index-tool-answers]]
func TestAcceptsVerbReadsTheTableAcceptsRoutes(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		module, verb string
		want         bool
	}{
		{search.Module, "find", true},
		{waits.Module, "wait", true},
		{plans.Module, "set", true},
		{drafts.Module, "check", true},
		{files.DiskModule, "write", true},
		{edits.Module, "patch", true},
		{q.StoreModule, q.StoreLand, true},
		{verbsmodule.NodeModule, verbsmodule.NodeRun, true},
		{verbsmodule.NodeModule, "other", false},
		{"ghost", "add", false},
	} {
		if got := acceptsVerb(one.module, one.verb); got != one.want {
			t.Errorf("acceptsVerb(%s, %s) reads %v, want %v", one.module, one.verb, got, one.want)
		}
	}
}

// Every level zero tool the bridge's TOOLS table served stands in the tool
// list the real wiring registers, under the name the agent calls.
// [[spec/tickets/level0-tools-leave-the-bridge]]
package main

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/tool"
)

// The level zero tools the bridge's TOOLS table served, by the name the agent calls. [[spec/tickets/level0-tools-leave-the-bridge]]
var bridgeServed = []string{
	"log", "report", "stop",
	"find", "wait",
	"patch", "replace", "undo",
	"check_answer", "check_prose",
	"mint_note", "plan", "review_branch",
}

func wiresType(w q.Wiring, kind string) bool {
	for _, one := range w.Instances {
		if one.Module == kind {
			return true
		}
	}
	return false
}

func calledNames(t *testing.T) map[string]bool {
	t.Helper()
	store := wiredStore(t)
	out := map[string]bool{}
	for _, name := range store.Names() {
		if _, _, ok := store.Types(name); ok {
			out[tool.NameOf(store, name)] = true
		}
	}
	return out
}

func TestEveryToolTheBridgeServedStandsInTheWiredToolList(t *testing.T) {
	called := calledNames(t)
	var missing []string
	for _, name := range bridgeServed {
		if !called[name] {
			missing = append(missing, name)
		}
	}
	if len(missing) > 0 {
		t.Fatalf("the wiring registers no tool %v", missing)
	}
}

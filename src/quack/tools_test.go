// Every level zero tool the bridge's TOOLS table served stands in the tool
// list the real wiring registers, under the name the agent calls.
// [[spec/tickets/level0-tools-leave-the-bridge]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/index"
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

// The names a caller reads off the wiring: an agent's topic call, a step's needs, the door's wait and the mcp instance's wait. [[spec/tickets/vehicle-verbs-become-actions]] [[spec/tickets/retro-verbs-become-actions]] [[spec/tickets/needs-wait-on-branch-topic]] [[spec/tickets/wait-key-meets-its-wiring]] [[spec/tickets/the-mcp-module-lands]]
var wiredNames = []string{
	"vehicle/produce", "stub/into",
	"retro/collect",
	"branch/take", "branch/open",
	"mcp/config/wait",
	index.WaitName,
}

// The module types the wiring loads that the root must know, and the instances it must start. [[spec/tickets/find-and-wait-in-go]] [[spec/tickets/plan-writes-off-go]] [[spec/tickets/the-mcp-module-lands]]
var (
	wiredTypes     = []string{searchModuleType, waitsModuleType, plansModuleType}
	wiredInstances = []string{"mcp"}
)

func TestTheWiringDeclaresEveryNameACallerReads(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join(treeRoot, filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	_, hands, err := loaded(w, c)
	if err != nil {
		t.Fatal(err)
	}
	store := q.NewStore(c)
	for _, name := range wiredNames {
		if _, ok := store.Declared(name); !ok {
			t.Errorf("the wiring declares no %s", name)
		}
	}
	for _, kind := range wiredTypes {
		if _, ok := modules[kind]; !ok {
			t.Errorf("the root loads no module type %s", kind)
		}
		if !wiresType(w, kind) {
			t.Errorf("the wiring loads no %s", kind)
		}
	}
	for _, name := range wiredInstances {
		if _, ok := hands[name]; !ok {
			t.Errorf("the wiring loads %v, and wants an %s instance", w.Instances, name)
		}
	}
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
	t.Parallel()
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

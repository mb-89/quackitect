package main // level0: InPackageTest - a main package admits no outside test package

import (
	"testing"

	oldconfig "quackitect/src/config"
	"quackitect/src/modules/hooks"
)

// The config writer listensHooks wires fits the door's Drop, and the reader reads the drop back off the local layer. [[spec/tickets/cage-hold-drops-port]]
func TestTheHooksDoorDropsThroughTheLocalLayer(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	out := hooks.Outside{Drop: oldconfig.Drop}
	if err := out.Drop(root, "stop.hold", "off"); err != nil {
		t.Fatal(err)
	}
	said, layer, ok := oldconfig.Where(root, "stop.hold")
	if !ok || said != "off" || layer != oldconfig.Local {
		t.Errorf("the reader answers %v off %q, and the drop wrote off into %q", said, layer, oldconfig.Local)
	}
}

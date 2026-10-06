// The wiring loads the mcp IO module, and binds its wait under its instance.
// [[spec/tickets/the-mcp-module-lands]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/q"
)

func TestTheWiringLoadsTheMCPModule(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
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
	if _, ok := hands["mcp"]; !ok {
		t.Fatalf("the wiring loads %v, and wants an mcp instance", w.Instances)
	}
	if _, ok := q.NewStore(c).Declared("mcp/config/wait"); !ok {
		t.Fatal("the store declares no mcp/config/wait, and wants the wait the instance binds")
	}
}

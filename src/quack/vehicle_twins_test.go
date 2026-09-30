// The wiring loads the vehicle and stub topics, each verb an action through
// the node module.
// [[spec/tickets/vehicle-verbs-become-actions]]
package main

import (
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/q"
)

// The wiring loads the vehicle and stub topics, so an agent calls each through the index. [[spec/tickets/vehicle-verbs-become-actions]]
func TestTheWiringLoadsTheVehicleAndStubTopics(t *testing.T) {
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	for _, name := range []string{"vehicle/produce", "stub/into"} {
		if _, ok := q.NewStore(c).Declared(name); !ok {
			t.Fatalf("the wiring declares no %s", name)
		}
	}
}

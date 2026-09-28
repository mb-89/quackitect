// The slice key reads old where nothing sets it, and the value the default
// file resolves to otherwise.
// [[spec/tickets/open-tasks-run-in-shadow]]
package migration

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
)

func TestTheSliceKeyReadsTheDefaultFile(t *testing.T) {
	var values q.Writer
	index := qtest.New(t, func(c *q.Catalog) {
		values = q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values, as the case seeds them"))
		Registers(c)
	})
	if said := index.Run("config/" + OpenTasksKey); said != "old" {
		t.Fatalf("the slice reads %v with nothing set, and wants old", said)
	}
	index.SeedAs(values, map[string]any{q.ResolvedName: q.Resolved{"config/" + OpenTasksKey: `"shadow"`}})
	if said := index.Run("config/" + OpenTasksKey); said != "shadow" {
		t.Fatalf("the slice reads %v, and wants shadow", said)
	}
}

// The key stands shared, so the default file sets it under the migration block. [[spec/tickets/open-tasks-run-in-shadow]]
func TestTheSliceKeyStandsShared(t *testing.T) {
	c := q.New()
	Registers(c)
	keys := c.Keys()
	if len(keys) != len(slices) {
		t.Fatalf("the module registers %+v, and wants one key a slice", keys)
	}
	for i, one := range keys {
		if one.Local != slices[i].key || !one.Shared {
			t.Fatalf("the module registers %+v, and wants the shared key %s", one, slices[i].key)
		}
	}
}

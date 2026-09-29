// The slice key reads new where nothing sets it, and the value the default
// file resolves to otherwise.
// [[spec/tickets/opentasks-enum-keeps-dead-values]]
package migration

import (
	"strings"
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
	if said := index.Run("config/" + OpenTasksKey); said != "new" {
		t.Fatalf("the slice reads %v with nothing set, and wants new", said)
	}
	index.SeedAs(values, map[string]any{q.ResolvedName: q.Resolved{"config/" + OpenTasksKey: `"a-seeded-value"`}})
	if said := index.Run("config/" + OpenTasksKey); said != "a-seeded-value" {
		t.Fatalf("the slice reads %v, and wants a-seeded-value", said)
	}
}

// The lsp slice stands among the slices, built in as old, so a box with no tracked mode runs no shadow of the editor checks. [[spec/tickets/lsp-rules-move-to-check]]
func TestTheLspSliceStandsOld(t *testing.T) {
	for _, one := range slices {
		if one.key == LspKey && one.mode == "old" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want lsp built in as old", slices)
}

// The verbs slice stands among the slices, built in as old, so a box with no tracked mode keeps every verb on cli.js. [[spec/tickets/runme-hands-verbs-to-quack]]
func TestTheVerbsSliceStandsSharedAndOld(t *testing.T) {
	for _, one := range slices {
		if one.key == "verbs" && one.mode == "old" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want verbs built in as old", slices)
}

// The cage slice stands among the slices, built in as old, so a box with no tracked mode keeps the bridge alone. [[spec/tickets/the-hooks-door-lands]]
func TestTheCageSliceStandsSharedAndOld(t *testing.T) {
	for _, one := range slices {
		if one.key == CageKey && one.mode == "old" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want cage built in as old", slices)
}

// The key stands shared, so the default file sets it under the migration block. [[spec/tickets/open-tasks-run-in-shadow]]
func TestTheSliceKeyStandsShared(t *testing.T) {
	c := q.New()
	Registers(c)
	keys := c.Keys()
	if len(keys) != len(phases)+len(slices) {
		t.Fatalf("the module registers %+v, and wants one key a phase and one a slice", keys)
	}
	for i, one := range keys[:len(phases)] {
		if one.Local != phases[i].key || !one.Shared || one.Default != "false" {
			t.Fatalf("the module registers %+v, and wants the shared switch %s built in as false", one, phases[i].key)
		}
	}
	for i, one := range keys[len(phases):] {
		if one.Local != slices[i].key || !one.Shared {
			t.Fatalf("the module registers %+v, and wants the shared key %s", one, slices[i].key)
		}
	}
}

// The window slice stands among the slices, built in as old, so a box with no tracked mode keeps the window's own reads. [[spec/tickets/the-log-becomes-a-view]]
func TestTheWindowSliceStandsAmongTheSlicesBuiltInAsOld(t *testing.T) {
	for _, one := range slices {
		if one.key == WindowKey && one.mode == "old" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want window built in as old", slices)
}

// The window slice names its three modes as its options. [[spec/tickets/the-config-schema-gets-generated]]
func TestTheWindowSliceDocNamesItsModes(t *testing.T) {
	for _, one := range slices {
		if one.key == WindowKey && one.doc != "" && strings.Join(one.enum, ", ") == "old, shadow, new" {
			return
		}
	}
	t.Fatal("the window slice names no modes in its doc")
}

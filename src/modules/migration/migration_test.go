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

// The processes slice stands switched over, built in as new with no other mode, so every box runs the split. [[spec/tickets/the-split-deployment-takes-over]]
func TestTheProcessesSliceStandsSwitchedOverToNew(t *testing.T) {
	for _, one := range slices {
		if one.key == ProcessesKey && one.mode == "new" && strings.Join(one.enum, ", ") == "new" && strings.Contains(one.doc, "switched over") {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want processes built in as new alone", slices)
}

// The verbs slice stands switched over to new, so a box with no tracked mode runs every twin alone. [[spec/tickets/agents-call-quack-directly]]
func TestTheVerbsSliceStandsNew(t *testing.T) {
	for _, one := range slices {
		if one.key == VerbsKey && one.mode == "new" && strings.Contains(one.doc, "switched over") {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want verbs built in as new", slices)
}

// The cage slice stands switched over, built in as new with no other mode, so the config verb sets no box back onto the bridge. [[spec/tickets/the-cage-slice-stands-new]]
func TestTheCageSliceStandsSwitchedOverToNew(t *testing.T) {
	for _, one := range slices {
		if one.key == CageKey && one.mode == "new" && strings.Join(one.enum, ", ") == "new" && one.doc != "" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want cage built in as new alone", slices)
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

// The window slice stands switched over, built in as new with no other mode, so no box keeps the window's own reads. [[spec/tickets/the-tui-data-paths-leave]]
func TestTheWindowSliceStandsSwitchedOverToNew(t *testing.T) {
	for _, one := range slices {
		if one.key == WindowKey && one.mode == "new" && strings.Join(one.enum, ", ") == "new" && one.doc != "" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want window built in as new alone", slices)
}

// The sidebar's slice stands beside the window's, built in as old, with the three modes. [[spec/tickets/the-sidebar-shadow-compares]]
func TestTheSidebarSliceStandsBuiltInOld(t *testing.T) {
	for _, one := range slices {
		if one.key == "sidebar" && one.mode == "old" && strings.Join(one.enum, ", ") == "old, shadow, new" && one.doc != "" {
			return
		}
	}
	t.Fatalf("the slices read %+v, and want sidebar built in as old", slices)
}

// The sidebar key reads old off the index with nothing set, so a box with no tracked mode draws the old groups alone. [[spec/tickets/the-sidebar-shadow-compares]]
func TestTheSidebarKeyReadsOldWithNothingSet(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) {
		q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values, as the case seeds them"))
		Registers(c)
	})
	if said := index.Run("config/" + SidebarKey); said != "old" {
		t.Fatalf("the sidebar slice reads %v with nothing set, and wants old", said)
	}
}

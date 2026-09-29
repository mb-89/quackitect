// The lsp slice in shadow: the LSP's own sweep answers, and each finding it
// and the check module's sweep hold apart writes one row.
// [[spec/tickets/lsp-rules-move-to-check]]
package main

import (
	"errors"
	"os"
	"path/filepath"
	"testing"

	"quackitect/src/config"
)

func rowsOf(t *testing.T, mode string, old, now []Finding) []map[string]any {
	t.Helper()
	rows := []map[string]any{}
	shadowsSweep(mode, old, func() ([]Finding, error) { return now, nil }, func(row map[string]any) error {
		rows = append(rows, row)
		return nil
	})
	return rows
}

func TestTheShadowWritesARowForEachFindingApart(t *testing.T) {
	both := fault("EveryPointerResolves", "spec/a.md", 3, "dead")
	old := []Finding{both, fault("NoConflictMarkers", "src/b.go", 1, "marker")}
	now := []Finding{both, fault("NameHoldsTheWords", "spec/one-two-three.md", 1, "long")}
	rows := rowsOf(t, "shadow", old, now)
	if len(rows) != 2 {
		t.Fatalf("the shadow writes %v, and wants one row for each finding apart", rows)
	}
	for _, row := range rows {
		if row["kind"] != "shadow" || row["slice"] != "lsp" || row["said"] == "" {
			t.Fatalf("the row reads %v, and wants the kind shadow, the slice lsp and a line", row)
		}
	}
	if rows[0]["rule"] != "NoConflictMarkers" || rows[0]["old"] != true || rows[0]["new"] != false {
		t.Fatalf("the first row reads %v, and wants the finding the LSP holds alone", rows[0])
	}
	if rows[1]["rule"] != "NameHoldsTheWords" || rows[1]["old"] != false || rows[1]["new"] != true {
		t.Fatalf("the second row reads %v, and wants the finding the check module holds alone", rows[1])
	}
}

func TestTheShadowLeavesTheBoxRulesOut(t *testing.T) {
	old := []Finding{fault("NothingPrivateTravels", "spec/a.md", 1, "owner"), fault("SurveyFindsNode", ".se/.runtime/tools.json", 1, "node")}
	if rows := rowsOf(t, "shadow", old, nil); len(rows) != 0 {
		t.Fatalf("the shadow writes %v, and wants no row for a rule reading the box", rows)
	}
}

func TestTheShadowWritesNothingUnderOld(t *testing.T) {
	old := []Finding{fault("NoConflictMarkers", "src/b.go", 1, "marker")}
	if rows := rowsOf(t, "old", old, nil); len(rows) != 0 {
		t.Fatalf("the shadow writes %v under old, and wants none", rows)
	}
	asked := false
	shadowsSweep("shadow", old, func() ([]Finding, error) { asked = true; return nil, errors.New("no index") }, func(row map[string]any) error {
		t.Fatalf("a fault on the new road writes %v, and wants nothing", row)
		return nil
	})
	if !asked {
		t.Fatal("the shadow asks the new road nothing under shadow")
	}
}

// The slice reads its built-in where the default file sets none. [[spec/tickets/the-config-schema-gets-generated]]
func TestTheSliceModeReadsItsBuiltIn(t *testing.T) {
	root := t.TempDir()
	schema := `{"properties": {"migration": {"properties": {"lsp": {"type": "string", "default": "old"}}}}}`
	for path, text := range map[string]string{config.Schema: schema, config.Tracked: `{}`} {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	if mode := lspMode(root); mode != "old" {
		t.Fatalf("the slice reads %q, and wants its built-in old", mode)
	}
}

// The panel draws this server's findings beside the bridge's, and an open file
// leaves Biome alone to its own server.
// [[spec/design_output/lsp]]
package main

import (
	"bytes"
	"path/filepath"
	"testing"
)

func TestAnOpenFileLeavesBiomeToItsOwnServerAndKeepsTheRest(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	path := "HANDOVER.md"
	uri := uriOf(filepath.Join(tree.Root, path))
	one.panel.extra[path] = []Finding{
		{File: path, Rule: "VoiceVale.Tense", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromVale},
		{File: path, Rule: "noUnusedImports", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromBiome},
		{File: path, Rule: "MagicNumber", Line: 1, Column: 1, Severity: SeverityWarning, Source: "tree"},
	}

	one.panel.open[path] = true
	one.shows(tree, path)
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 2 {
		t.Fatalf("an open file draws %d of the bridge's findings, and every one but Biome's is two", said)
	}

	delete(one.panel.open, path)
	one.shows(tree, path)
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 3 {
		t.Fatalf("a closed file draws %d of the bridge's findings, and every one is three", said)
	}
}

func TestAPathTheBridgeSpellsWithBackslashesMeetsTheSamePath(t *testing.T) {
	got := grouped([]Finding{{File: "src\\viewer\\wrap.go"}, {File: "src/viewer/wrap.go"}})
	if len(got["src/viewer/wrap.go"]) != 2 {
		t.Fatalf("the two spellings stand apart: %v", got)
	}
}

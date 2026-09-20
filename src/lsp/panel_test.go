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
	got := grouped([]Finding{{File: "src\\tui\\wrap.go"}, {File: "src/tui/wrap.go"}})
	if len(got["src/tui/wrap.go"]) != 2 {
		t.Fatalf("the two spellings stand apart: %v", got)
	}
}

// A move or a delete leaves the file's findings behind in both lists, and the row must go with the file. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func TestAFileTheDiskNoLongerHoldsDrawsNothingAndDropsItsLists(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	path := "src/viewer/gone.go"
	uri := uriOf(filepath.Join(tree.Root, path))
	one.panel.own[path] = []Finding{{File: path, Rule: "Gofmt", Line: 1, Column: 1, Severity: SeverityWarning, Source: "tree"}}
	one.panel.extra[path] = []Finding{{File: path, Rule: "VoiceVale.Tense", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromVale}}
	one.panel.shown[path] = true

	one.shows(tree, path)

	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 0 {
		t.Fatalf("a file standing nowhere draws %d findings, and it draws none", said)
	}
	if _, held := one.panel.own[path]; held {
		t.Fatal("the server's own list still names the file")
	}
	if _, held := one.panel.extra[path]; held {
		t.Fatal("the bridge's list still names the file")
	}

	tree.Holds(path, "package main\n")
	one.panel.extra[path] = []Finding{{File: path, Rule: "VoiceVale.Tense", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromVale}}
	one.shows(tree, path)
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 1 {
		t.Fatalf("an open file the disk lacks draws %d findings, and it draws its one", said)
	}
}

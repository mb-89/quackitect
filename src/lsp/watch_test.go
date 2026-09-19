// The panel follows the disk. A file something else changes redraws off the
// disk, so a finding leaves once the file mends, with no editor event on it.
// [[spec/design_output/lsp#the-panel-follows-the-disk]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"testing"
)

func changeFrame(uris ...string) json.RawMessage {
	changes := []map[string]any{}
	for _, uri := range uris {
		changes = append(changes, map[string]any{"uri": uri, "type": 2})
	}
	said, _ := json.Marshal(map[string]any{"changes": changes})
	return said
}

func TestInitializedAsksTheEditorToWatchEveryFile(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	if err := Speaks(&Checker{tree: tree}, framed(initialized), out); err != nil {
		t.Fatal(err)
	}
	for _, one := range spoken(t, out.String()) {
		if one.Method == registering && bytes.Contains(one.Params, []byte(watched)) {
			return
		}
	}
	t.Fatal("the server asks the editor to watch nothing")
}

func TestAFileTheDiskMendsLeavesThePanel(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	uri := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	one.panel.own["HANDOVER.md"] = one.checker.Over("HANDOVER.md")
	if len(one.panel.own["HANDOVER.md"]) == 0 {
		t.Fatal("the fixture carries no finding to clear")
	}
	one.shows(tree, "HANDOVER.md")

	if err := os.WriteFile(filepath.Join(tree.Root, "HANDOVER.md"), []byte(standing), 0o644); err != nil {
		t.Fatal(err)
	}
	one.refreshes(changeFrame(uri))

	if said, drew := urisDrawn(spoken(t, out.String()))[uri]; !drew || said != 0 {
		t.Fatalf("the mended file draws %d finding(s), drawn %v", said, drew)
	}
}

func TestAChangeUnderTheFoldersNoRuleReadsRedrawsNothing(t *testing.T) {
	root := t.TempDir()
	got := changedIn(root, changeFrame(
		uriOf(filepath.Join(root, ".se", ".log", "session.jsonl")),
		uriOf(filepath.Join(root, "node_modules", "x", "a.js")),
		uriOf(filepath.Join(root, "src", "a.js")),
		uriOf(filepath.Join(root, "src", "a.js")),
	))
	if fmt.Sprint(got) != "[src/a.js]" {
		t.Fatalf("the change reads %v", got)
	}
}

func TestAnOpenFileFollowsTheEditorAndNotTheDisk(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	one.panel.open["HANDOVER.md"] = true

	one.refreshes(changeFrame(uriOf(filepath.Join(tree.Root, "HANDOVER.md"))))

	if out.Len() != 0 {
		t.Fatalf("an open file redraws off the disk: %s", out.String())
	}
}

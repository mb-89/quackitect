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

func changeOf(uri string, kind int) map[string]any {
	return map[string]any{"uri": uri, "type": kind}
}

func frameOf(changes ...map[string]any) json.RawMessage {
	said, _ := json.Marshal(map[string]any{"changes": changes})
	return said
}

func changeFrame(uris ...string) json.RawMessage {
	changes := []map[string]any{}
	for _, uri := range uris {
		changes = append(changes, changeOf(uri, changed))
	}
	return frameOf(changes...)
}

// A name past the word cap draws on any path, so a moved file carries a finding wherever it lands. [[spec/tickets/a-move-redraws-both-files]]
const longName = "one-two-three-four-five-six.md"

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

// The rows the bridge drew for a file read the text it held before the disk changed, so they go with the change, whether or not a bridge answers. [[spec/design_output/lsp#the-panel-follows-the-disk]]
func TestAFileTheDiskChangesDropsTheBridgesOldRows(t *testing.T) {
	tree := sweptTree(t, nil)
	bridge := bridgeFor(t, tree)
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	uri := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	one.panel.extra["HANDOVER.md"] = []Finding{{File: "HANDOVER.md", Rule: "VoiceParagraph.Sentence", Line: 40, Column: 1, Severity: SeverityWarning, Source: fromVale}}
	one.shows(tree, "HANDOVER.md")
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 1 {
		t.Fatalf("the fixture draws %d row(s) before the change, and it draws its one", said)
	}

	if err := os.WriteFile(filepath.Join(tree.Root, "HANDOVER.md"), []byte(standing), 0o644); err != nil {
		t.Fatal(err)
	}
	one.refreshes(changeFrame(uri))

	if said, drew := urisDrawn(spoken(t, out.String()))[uri]; !drew || said != 0 {
		t.Fatalf("the changed file still draws %d row(s) off the bridge, drawn %v", said, drew)
	}
	bridge.waits(t, lintQuiet, 1)
	if asks := bridge.asked(); fmt.Sprint(asks[0]) != "[HANDOVER.md]" {
		t.Fatalf("the ask after the change names %v", asks[0])
	}
}

func TestAChangeUnderTheFoldersNoRuleReadsRedrawsNothing(t *testing.T) {
	root := t.TempDir()
	got, gone := changedIn(root, changeFrame(
		uriOf(filepath.Join(root, ".se", ".log", "session.jsonl")),
		uriOf(filepath.Join(root, "node_modules", "x", "a.js")),
		uriOf(filepath.Join(root, "src", "a.js")),
		uriOf(filepath.Join(root, "src", "a.js")),
	))
	if fmt.Sprint(got) != "[src/a.js]" || len(gone) != 0 {
		t.Fatalf("the change reads %v, and drops %v", got, gone)
	}
}

// The watcher's own types say which path redraws and which path goes, and a path named twice reads its last type. [[spec/tickets/a-move-redraws-both-files]]
func TestADeleteAndACreateEachNameTheirPath(t *testing.T) {
	root := t.TempDir()
	got, gone := changedIn(root, frameOf(
		changeOf(uriOf(filepath.Join(root, "src", "old.go")), deleted),
		changeOf(uriOf(filepath.Join(root, "src", "new.go")), created),
		changeOf(uriOf(filepath.Join(root, "src", "back.go")), deleted),
		changeOf(uriOf(filepath.Join(root, "src", "back.go")), created),
	))
	if fmt.Sprint(got) != "[src/new.go src/back.go]" || fmt.Sprint(gone) != "[src/old.go]" {
		t.Fatalf("the change redraws %v, and drops %v", got, gone)
	}
}

func TestARenameOnDiskClearsTheOldRowAndDrawsTheNew(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	old := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	moved := uriOf(filepath.Join(tree.Root, longName))
	one.panel.own["HANDOVER.md"] = one.checker.Over("HANDOVER.md")
	one.shows(tree, "HANDOVER.md")

	if err := os.Rename(filepath.Join(tree.Root, "HANDOVER.md"), filepath.Join(tree.Root, longName)); err != nil {
		t.Fatal(err)
	}
	one.refreshes(frameOf(changeOf(old, deleted), changeOf(moved, created)))

	drawn := urisDrawn(spoken(t, out.String()))
	if drawn[old] != 0 {
		t.Fatalf("the old path still draws %d finding(s)", drawn[old])
	}
	if drawn[moved] == 0 {
		t.Fatal("the new path draws nothing")
	}
	if _, held := one.panel.own["HANDOVER.md"]; held {
		t.Fatal("the server's own list still names the old path")
	}
}

func TestADeletedFolderTakesEveryRowUnderIt(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	rows := []string{"src/viewer/a.go", "src/viewer/b.go"}
	for _, path := range rows {
		one.panel.own[path] = []Finding{{File: path, Rule: "Gofmt", Line: 1, Column: 1, Severity: SeverityWarning, Source: "tree"}}
		one.panel.shown[path] = true
	}

	one.refreshes(frameOf(changeOf(uriOf(filepath.Join(tree.Root, "src", "viewer")), deleted)))

	drawn := urisDrawn(spoken(t, out.String()))
	for _, path := range rows {
		uri := uriOf(filepath.Join(tree.Root, path))
		if said, drew := drawn[uri]; !drew || said != 0 {
			t.Fatalf("%s draws %d finding(s), drawn %v", path, said, drew)
		}
	}
}

func TestACreatedFolderDrawsEveryFileUnderIt(t *testing.T) {
	tree := sweptTree(t, map[string]string{"moved/" + longName: standing})
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}

	one.refreshes(frameOf(changeOf(uriOf(filepath.Join(tree.Root, "moved")), created)))

	if drawn := urisDrawn(spoken(t, out.String())); drawn[uriOf(filepath.Join(tree.Root, "moved", longName))] == 0 {
		t.Fatal("the file under the new folder draws nothing")
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

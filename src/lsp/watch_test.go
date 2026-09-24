// The panel follows the index. A file something else changes redraws once a
// pull names it, so a finding leaves once the file mends, with no editor
// event on it.
// [[spec/design_output/lsp#the-panel-follows-the-index]]
package main

import (
	"bytes"
	"fmt"
	"os"
	"path/filepath"
	"testing"
	"time"
)

// A name past the word cap draws on any path, so a moved file carries a finding wherever it lands. [[spec/tickets/a-move-redraws-both-files]]
const longName = "one-two-three-four-five-six.md"

func TestAFileTheIndexMendsLeavesThePanel(t *testing.T) {
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
	one.redraws([]string{"HANDOVER.md"}, nil)

	if said, drew := urisDrawn(spoken(t, out.String()))[uri]; !drew || said != 0 {
		t.Fatalf("the mended file draws %d finding(s), drawn %v", said, drew)
	}
}

// The rows the bridge drew for a file read the text it held before it moved, so they go with the move, whether or not a bridge answers. [[spec/design_output/lsp#the-panel-follows-the-index]]
func TestAFileTheIndexMovesDropsTheBridgesOldRows(t *testing.T) {
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
	one.redraws([]string{"HANDOVER.md"}, nil)

	if said, drew := urisDrawn(spoken(t, out.String()))[uri]; !drew || said != 0 {
		t.Fatalf("the moved file still draws %d row(s) off the bridge, drawn %v", said, drew)
	}
	bridge.waits(t, lintQuiet, 1)
	if asks := bridge.asked(); fmt.Sprint(asks[0]) != "[HANDOVER.md]" {
		t.Fatalf("the ask after the move names %v", asks[0])
	}
}

func TestARenameClearsTheOldRowAndDrawsTheNew(t *testing.T) {
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
	one.redraws([]string{longName}, []string{"HANDOVER.md"})

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

func TestADroppedFolderTakesEveryRowUnderIt(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	rows := []string{"src/viewer/a.go", "src/viewer/b.go"}
	for _, path := range rows {
		one.panel.own[path] = []Finding{{File: path, Rule: "Gofmt", Line: 1, Column: 1, Severity: SeverityWarning, Source: "tree"}}
		one.panel.shown[path] = true
	}

	one.redraws(nil, []string{"src/viewer"})

	drawn := urisDrawn(spoken(t, out.String()))
	for _, path := range rows {
		uri := uriOf(filepath.Join(tree.Root, path))
		if said, drew := drawn[uri]; !drew || said != 0 {
			t.Fatalf("%s draws %d finding(s), drawn %v", path, said, drew)
		}
	}
}

func TestAnOpenFileFollowsTheEditorAndNotTheIndex(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	one.panel.open["HANDOVER.md"] = true

	one.redraws([]string{"HANDOVER.md"}, nil)

	if out.Len() != 0 {
		t.Fatalf("an open file redraws off the index: %s", out.String())
	}
}

// The whole road: the door's tick lands, the server pulls, and the file the sweep moved redraws with no editor event. [[spec/design_output/lsp#the-panel-follows-the-index]]
func TestASweepTheDoorLandsRedrawsTheFileItMoved(t *testing.T) {
	door := newFakeIndex(map[string]string{"spec/one.md": "# A heading\n\nA line.\n"})
	disk, err := overIndex("/tree", door.ask, false)
	if err != nil {
		t.Fatal(err)
	}
	tree := treeOver("/tree", disk)
	tree.Words = 1
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	go one.follows()

	door.writes("spec/one.md", "# A heading\n\nA line naming [[nobody-wrote-this]].\n")
	uri := uriOf(filepath.Join("/tree", "spec/one.md"))
	for waited := 0; waited < 100; waited++ {
		if urisDrawn(spoken(t, out.String()))[uri] > 0 {
			return
		}
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatalf("the file the sweep moved draws nothing: %s", out.String())
}

// A server over a fake door holding a note and a second note pointing at it. [[spec/design_output/lsp#the-panel-follows-the-index]]
func leaningServer(t *testing.T, pointer string) (*fakeIndex, *server, *guardedBuffer, string) {
	t.Helper()
	door := newFakeIndex(map[string]string{
		"spec/one.md": "# A heading\n\nA line.\n",
		"spec/two.md": "# Two\n\nA line naming " + pointer + ".\n",
	})
	disk, err := overIndex("/tree", door.ask, false)
	if err != nil {
		t.Fatal(err)
	}
	tree := treeOver("/tree", disk)
	tree.Words = 1
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	one.panel.own["spec/two.md"] = one.checker.Over("spec/two.md")
	one.shows(tree, "spec/two.md")
	return door, one, out, uriOf(filepath.Join("/tree", "spec/two.md"))
}

// The note a pointer names gains the heading, and the file carrying the pointer clears where it stands. [[spec/design_output/lsp#the-panel-follows-the-index]]
func TestAHeadingThatLandsClearsTheFilePointingAtIt(t *testing.T) {
	door, one, out, uri := leaningServer(t, "[[spec/one#a-second-heading]]")
	if said := urisDrawn(spoken(t, out.String()))[uri]; said == 0 {
		t.Fatal("the pointing file draws nothing before the heading lands")
	}

	door.writes("spec/one.md", "# A heading\n\nA line.\n\n## A second heading\n\nA line.\n")
	moved, gone, err := one.checker.Tree().Pulls()
	if err != nil {
		t.Fatal(err)
	}
	one.redraws(moved, gone)

	if said, drew := urisDrawn(spoken(t, out.String()))[uri]; !drew || said != 0 {
		t.Fatalf("the pointing file still draws %d finding(s), drawn %v", said, drew)
	}
}

// The note a pointer names leaves the index, and the file carrying the pointer draws the dead pointer. [[spec/design_output/lsp#the-panel-follows-the-index]]
func TestANoteTheIndexDropsDrawsTheFilePointingAtIt(t *testing.T) {
	door, one, out, uri := leaningServer(t, "[[spec/one#a-heading]]")
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 0 {
		t.Fatalf("the pointing file draws %d finding(s) before the drop", said)
	}

	door.lands(func() { delete(door.files, "spec/one.md") })
	moved, gone, err := one.checker.Tree().Pulls()
	if err != nil {
		t.Fatal(err)
	}
	one.redraws(moved, gone)

	if said := urisDrawn(spoken(t, out.String()))[uri]; said == 0 {
		t.Fatalf("the pointing file draws nothing once its note goes: %s", out.String())
	}
}

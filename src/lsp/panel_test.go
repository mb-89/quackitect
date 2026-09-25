// The panel draws this server's findings beside the tools' rows, and an open
// file leaves Biome alone to its own server.
// [[spec/design_output/lsp#the-panel-reads-the-battery]]
package main

import (
	"bytes"
	"fmt"
	"path/filepath"
	"sync"
	"testing"
	"time"
)

// The quiet span a test waits, short so a case gathers a burst and ends soon. [[spec/tickets/the-panel-lints-on-change]]
const testQuiet = 50 * time.Millisecond

// A writer the timer's goroutine and the test share. [[spec/tickets/the-panel-lints-on-change]]
type guardedBuffer struct {
	guard  sync.Mutex
	buffer bytes.Buffer
}

func (one *guardedBuffer) Write(said []byte) (int, error) {
	one.guard.Lock()
	defer one.guard.Unlock()
	return one.buffer.Write(said)
}

func (one *guardedBuffer) String() string {
	one.guard.Lock()
	defer one.guard.Unlock()
	return one.buffer.String()
}

// A server over the tree whose checker runs the fake tools. [[spec/design_output/lsp#the-server-runs-the-tools]]
func toolServer(tree *Tree, quiet time.Duration) (*server, *fakeTools, *guardedBuffer) {
	tools := toolsFor(tree.Root)
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree, outside: tools.outside()}, out: out, panel: newPanel(), quiet: quiet}
	return one, tools, out
}

func TestAnOpenFileLeavesBiomeToItsOwnServerAndKeepsTheRest(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	path := "HANDOVER.md"
	uri := uriOf(filepath.Join(tree.Root, path))
	one.panel.extra[path] = []Finding{
		{File: path, Rule: "VoiceVale.Tense", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromVale},
		{File: path, Rule: "noUnusedImports", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromBiome},
		{File: path, Rule: "MagicNumber", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromTree},
	}

	one.panel.open[path] = true
	one.shows(tree, path)
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 2 {
		t.Fatalf("an open file draws %d of the tools' rows, and every one but Biome's is two", said)
	}

	delete(one.panel.open, path)
	one.shows(tree, path)
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 3 {
		t.Fatalf("a closed file draws %d of the tools' rows, and every one is three", said)
	}
}

func TestAPathAToolSpellsWithBackslashesMeetsTheSamePath(t *testing.T) {
	got := grouped([]Finding{{File: "src\\tui\\wrap.go"}, {File: "src/tui/wrap.go"}})
	if len(got["src/tui/wrap.go"]) != 2 {
		t.Fatalf("the two spellings stand apart: %v", got)
	}
}

// A move or a delete leaves the file's findings behind in both lists, and the row must go with the file. [[spec/design_output/lsp#the-panel-follows-the-index]]
func TestAFileTheDiskNoLongerHoldsDrawsNothingAndDropsItsLists(t *testing.T) {
	tree := sweptTree(t, nil)
	out := &bytes.Buffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel()}
	path := "src/viewer/gone.go"
	uri := uriOf(filepath.Join(tree.Root, path))
	one.panel.own[path] = []Finding{{File: path, Rule: "Gofmt", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromTree}}
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
		t.Fatal("the tools' list still names the file")
	}

	tree.Holds(path, "package main\n")
	one.panel.extra[path] = []Finding{{File: path, Rule: "VoiceVale.Tense", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromVale}}
	one.shows(tree, path)
	if said := urisDrawn(spoken(t, out.String()))[uri]; said != 1 {
		t.Fatalf("an open file the disk lacks draws %d findings, and it draws its one", said)
	}
}

// A change to an open file runs Vale over the buffer inside the quiet span, and the file redraws with its rows. [[spec/tickets/the-panel-lints-on-change]]
func TestAChangeToAnOpenFileRunsValeWithinASecond(t *testing.T) {
	tree := sweptTree(t, nil)
	one, tools, _ := toolServer(tree, lintQuiet)
	where := filepath.Join(tree.Root, "HANDOVER.md")

	one.draws(where, standing, opens)
	one.draws(where, departing+"\n"+spooky+" stands.\n", changes)
	until := time.Now().Add(lintQuiet + lintQuiet/2)
	for time.Now().Before(until) {
		if names(extraOn(one, "HANDOVER.md"), "Spooky") == 1 {
			if said := tools.naming("vale", "--path="); said != 1 {
				t.Fatalf("Vale reads the buffer %d time(s)", said)
			}
			return
		}
		time.Sleep(time.Millisecond)
	}
	t.Fatalf("the buffer's row reaches the panel nowhere: %v", tools.asked())
}

// A burst of changes inside the quiet span costs one run, naming every file changed. [[spec/tickets/the-panel-lints-on-change]]
func TestTheChangesOfAQuietSpanJoinOneRun(t *testing.T) {
	tree := sweptTree(t, map[string]string{"README.md": "# One\n"})
	one, tools, _ := toolServer(tree, testQuiet)
	handover := filepath.Join(tree.Root, "HANDOVER.md")
	readme := filepath.Join(tree.Root, "README.md")

	one.draws(handover, standing, opens)
	one.draws(readme, "# One\n", opens)
	for i := 0; i < 3; i++ {
		one.draws(handover, departing, changes)
		one.draws(readme, "# Two\n", changes)
	}
	settles(t, one)

	runs := [][]string{}
	for _, call := range tools.asked() {
		if call[0] == "biome" {
			runs = append(runs, call)
		}
	}
	if len(runs) != 1 || fmt.Sprint(runs[0][len(runs[0])-2:]) != "[HANDOVER.md README.md]" {
		t.Fatalf("the tools run %v, and one run naming both files stands wanted", runs)
	}
}

// A file the editor closes before the span ends reads off the disk, because its buffer stands no more. [[spec/tickets/the-panel-lints-on-change]]
func TestAFileClosedInsideTheQuietSpanReadsTheDisk(t *testing.T) {
	tree := sweptTree(t, nil)
	one, tools, _ := toolServer(tree, testQuiet)
	where := filepath.Join(tree.Root, "HANDOVER.md")

	one.draws(where, standing, opens)
	one.draws(where, departing+"\n"+spooky+" stands.\n", changes)
	one.closes(where)
	time.Sleep(testQuiet * 3)
	settles(t, one)

	if said := tools.naming("vale", "--path="); said != 0 {
		t.Fatalf("Vale reads a closed file's buffer %d time(s)", said)
	}
	if tools.naming("vale", "HANDOVER.md") != 1 {
		t.Fatalf("Vale reads the closed file off the disk nowhere: %v", tools.asked())
	}
	if said := extraOn(one, "HANDOVER.md"); len(said) != 0 {
		t.Fatalf("the closed file draws the buffer's rows: %v", said)
	}
}

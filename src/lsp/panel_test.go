// The panel draws this server's findings beside the bridge's, and an open file
// leaves Biome alone to its own server.
// [[spec/design_output/lsp]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"sort"
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

// A bridge the tests stand up: it keeps every ask over held buffers, and answers one finding a buffer. [[spec/tickets/the-panel-lints-on-change]]
type fakeBridge struct {
	guard sync.Mutex
	asks  [][]string
}

func bridgeFor(t *testing.T, tree *Tree) *fakeBridge {
	t.Helper()
	one := &fakeBridge{}
	served := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		var said struct {
			Held []struct {
				Path string `json:"path"`
			} `json:"held"`
		}
		_ = json.NewDecoder(r.Body).Decode(&said)
		paths := []string{}
		found := []Finding{}
		for _, each := range said.Held {
			paths = append(paths, each.Path)
			found = append(found, Finding{File: each.Path, Rule: "Sentence", Line: 1, Column: 1, Severity: SeverityWarning, Source: fromVale})
		}
		sort.Strings(paths)
		one.guard.Lock()
		one.asks = append(one.asks, paths)
		one.guard.Unlock()
		_ = json.NewEncoder(w).Encode(bridgeAnswer{OK: true, Found: found})
	}))
	t.Cleanup(served.Close)
	port := served.Listener.Addr().(*net.TCPAddr).Port
	at := filepath.Join(tree.Root, filepath.FromSlash(pointerAt))
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(at, []byte(fmt.Sprintf(`{"port":%d}`, port)), 0o644); err != nil {
		t.Fatal(err)
	}
	return one
}

func (one *fakeBridge) asked() [][]string {
	one.guard.Lock()
	defer one.guard.Unlock()
	return append([][]string{}, one.asks...)
}

func (one *fakeBridge) waits(t *testing.T, span time.Duration, asks int) {
	t.Helper()
	until := time.Now().Add(span)
	for time.Now().Before(until) {
		if len(one.asked()) >= asks {
			return
		}
		time.Sleep(time.Millisecond)
	}
	t.Fatalf("the bridge hears %d ask(s) inside %v, and %d stand wanted", len(one.asked()), span, asks)
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

// A change to an open file asks the bridge again inside the quiet span, off the buffer, and the file redraws with the answer. [[spec/tickets/the-panel-lints-on-change]]
func TestAChangeToAnOpenFileAsksTheBridgeWithinASecond(t *testing.T) {
	tree := sweptTree(t, nil)
	bridge := bridgeFor(t, tree)
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel(), quiet: lintQuiet}
	where := filepath.Join(tree.Root, "HANDOVER.md")

	one.draws(where, standing, opens)
	one.draws(where, departing, changes)
	bridge.waits(t, lintQuiet+lintQuiet/2, 1)

	if asks := bridge.asked(); fmt.Sprint(asks[0]) != "[HANDOVER.md]" {
		t.Fatalf("the ask names %v", asks[0])
	}
	until := time.Now().Add(lintQuiet)
	for time.Now().Before(until) {
		one.guard.Lock()
		drawn := len(one.panel.extra["HANDOVER.md"])
		one.guard.Unlock()
		if drawn == 1 {
			return
		}
		time.Sleep(time.Millisecond)
	}
	t.Fatal("the bridge's finding reaches the panel nowhere")
}

// A burst of changes inside the quiet span costs one ask, naming every file changed. [[spec/tickets/the-panel-lints-on-change]]
func TestTheChangesOfAQuietSpanJoinOneAsk(t *testing.T) {
	tree := sweptTree(t, map[string]string{"README.md": "# One\n"})
	bridge := bridgeFor(t, tree)
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel(), quiet: testQuiet}
	handover := filepath.Join(tree.Root, "HANDOVER.md")
	readme := filepath.Join(tree.Root, "README.md")

	one.draws(handover, standing, opens)
	one.draws(readme, "# One\n", opens)
	for i := 0; i < 3; i++ {
		one.draws(handover, departing, changes)
		one.draws(readme, "# Two\n", changes)
	}
	bridge.waits(t, lintQuiet, 1)
	time.Sleep(testQuiet * 2)

	asks := bridge.asked()
	if len(asks) != 1 || fmt.Sprint(asks[0]) != "[HANDOVER.md README.md]" {
		t.Fatalf("the bridge hears %v, and one ask naming both files stands wanted", asks)
	}
}

// A file the editor closes before the span ends asks nothing, because its buffer stands no more. [[spec/tickets/the-panel-lints-on-change]]
func TestAFileClosedInsideTheQuietSpanAsksNothing(t *testing.T) {
	tree := sweptTree(t, nil)
	bridge := bridgeFor(t, tree)
	out := &guardedBuffer{}
	one := &server{checker: &Checker{tree: tree}, out: out, panel: newPanel(), quiet: testQuiet}
	where := filepath.Join(tree.Root, "HANDOVER.md")

	one.draws(where, standing, opens)
	one.draws(where, departing, changes)
	one.closes(where)
	time.Sleep(testQuiet * 3)

	if asks := bridge.asked(); len(asks) != 0 {
		t.Fatalf("the bridge hears %v for a closed file", asks)
	}
}

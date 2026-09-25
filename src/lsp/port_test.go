// The port answers the list the panel holds, the check answers the same list
// with no server standing, a save that mends a file takes its row from both,
// and the pointer goes with the server.
// [[spec/design_output/lsp#a-port-serves-the-list]]
package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"testing"
)

// A tree carrying a row of every source: Vale, the tense reader, a marker, Biome, a magic number and a pointer of this server's own. [[spec/design_output/lsp#a-port-serves-the-list]]
func portTree(t *testing.T) *Tree {
	t.Helper()
	return wholeTree(t, map[string]string{
		"spec/one.md": "# One\n\nA " + spooky + " line.\n\nIt " + pastWord + ".\n\nThe " + vetoed + " line " + pastWord + ".\n\n" + markerOpens + "NO -->\n",
		"src/one.js":  "debugger;\n",
		"src/two.go":  "package two\n\nfunc two() int { return 7 }\n",
		"README.md":   "A line naming [[nobody-wrote-this]].\n",
	})
}

// A second tree over the same folder, read fresh the way the check reads it. [[spec/design_output/lsp#a-port-serves-the-list]]
func freshOver(like *Tree) *Tree {
	tree := treeOver(like.Root, realDisk{})
	tree.Words, tree.Node, tree.Survey, tree.Box = like.Words, like.Node, like.Survey, like.Box
	return tree
}

// A server over the tree, standing on a port with its sweep landed. [[spec/design_output/lsp#a-port-serves-the-list]]
func portServer(t *testing.T, tree *Tree) (*server, Pointer) {
	t.Helper()
	one, _, _ := toolServer(tree, testQuiet)
	drops, err := one.listens(tree.Root)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(drops)
	one.took(message{Method: "initialized"})
	var said Pointer
	text, err := os.ReadFile(pointerPath(tree.Root))
	if err != nil || json.Unmarshal(text, &said) != nil {
		t.Fatalf("the pointer reads %q, %v", text, err)
	}
	return one, said
}

func asksPort(t *testing.T, at Pointer, query string) Listing {
	t.Helper()
	answer, err := http.Get(fmt.Sprintf("http://127.0.0.1:%d%s%s", at.Port, findingsRoute, query))
	if err != nil {
		t.Fatal(err)
	}
	defer answer.Body.Close()
	var said Listing
	if err := json.NewDecoder(answer.Body).Decode(&said); err != nil {
		t.Fatal(err)
	}
	return said
}

// Each finding as one line, in one order, so two lists compare whole. [[spec/design_output/lsp#a-port-serves-the-list]]
func linesOf(found []Finding) []string {
	out := []string{}
	for _, one := range found {
		out = append(out, fmt.Sprintf("%s:%d:%d %s %s %s %s", one.File, one.Line, one.Column, one.Rule, one.Severity, one.Source, one.Message))
	}
	sort.Strings(out)
	return out
}

// [[spec/design_output/lsp#a-port-serves-the-list]]
func TestThePortAnswersWhatTheCheckAnswers(t *testing.T) {
	tree := portTree(t)
	_, at := portServer(t, tree)
	said := asksPort(t, at, "")
	if !said.OK || !said.Settled {
		t.Fatalf("the port answers ok %v, settled %v", said.OK, said.Settled)
	}

	check := (&Checker{tree: freshOver(tree), outside: toolsFor(tree.Root).outside()}).Whole()
	port, fresh := linesOf(said.Found), linesOf(check)
	if fmt.Sprint(port) != fmt.Sprint(fresh) {
		t.Fatalf("the port and the check part:\nport  %v\ncheck %v", port, fresh)
	}
	for _, rule := range []string{"Spooky", "PastTense", Unreasoned, "suspicious/noDebugger", MagicNumber, "EveryPointerResolves"} {
		if names(check, rule) != 1 {
			t.Fatalf("the list names %d %s row(s), and one stands wanted: %v", names(check, rule), rule, fresh)
		}
	}
}

// A query naming a folder keeps the rows under it, and one naming a file keeps that file's. [[spec/design_output/lsp#a-port-serves-the-list]]
func TestAQueryKeepsTheRowsUnderThePathsItNames(t *testing.T) {
	tree := portTree(t)
	_, at := portServer(t, tree)
	for query, wanted := range map[string]int{"?path=src": 2, "?path=src/one.js": 1, "?path=src/o": 0, "?path=README.md&path=src/two.go": 2} {
		if said := asksPort(t, at, query).Found; len(said) != wanted {
			t.Fatalf("%s keeps %d row(s), and %d stand wanted: %v", query, len(said), wanted, linesOf(said))
		}
	}
}

// A save that mends a file takes its tool rows from the panel and the port at once. [[spec/design_output/lsp#the-panel-reads-the-battery]]
func TestASaveThatMendsAFileTakesItsRowFromThePanelAndThePort(t *testing.T) {
	tree := portTree(t)
	one, at := portServer(t, tree)
	where := filepath.Join(tree.Root, "spec", "one.md")
	if said := names(asksPort(t, at, "?path=spec/one.md").Found, "Spooky"); said != 1 {
		t.Fatalf("the file draws %d Spooky row(s) before the save", said)
	}

	mended := "# One\n\nA line.\n"
	one.draws(where, mended, opens)
	if err := os.WriteFile(where, []byte(mended), 0o644); err != nil {
		t.Fatal(err)
	}
	one.draws(where, "", saves)

	said := asksPort(t, at, "?path=spec/one.md")
	if len(said.Found) != 0 || fmt.Sprint(said.Open) != "[spec/one.md]" {
		t.Fatalf("the saved file still holds %v, open %v", linesOf(said.Found), said.Open)
	}
	if rows := extraOn(one, "spec/one.md"); len(rows) != 0 {
		t.Fatalf("the panel still holds the tools' rows %v", rows)
	}
}

// The pointer names this process, and goes with the server. A pointer another process wrote stays. [[spec/design_output/lsp#a-port-serves-the-list]]
func TestThePointerGoesWithTheServer(t *testing.T) {
	tree := portTree(t)
	one, _, _ := toolServer(tree, testQuiet)
	drops, err := one.listens(tree.Root)
	if err != nil {
		t.Fatal(err)
	}
	var said Pointer
	text, _ := os.ReadFile(pointerPath(tree.Root))
	if json.Unmarshal(text, &said) != nil || said.Port == 0 || said.Pid != os.Getpid() || said.Root != tree.Root {
		t.Fatalf("the pointer reads %s", text)
	}
	drops()
	drops()
	if _, err := os.Stat(pointerPath(tree.Root)); !os.IsNotExist(err) {
		t.Fatal("the pointer outlives the server")
	}

	other := []byte(`{"port":1,"pid":1,"root":"elsewhere"}`)
	if err := os.WriteFile(pointerPath(tree.Root), other, 0o644); err != nil {
		t.Fatal(err)
	}
	dropsPointer(tree.Root, os.Getpid())
	if _, err := os.Stat(pointerPath(tree.Root)); err != nil {
		t.Fatal("a server drops the pointer another process wrote")
	}
}

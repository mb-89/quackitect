// quack lsp relays the editor's stdio to the lsp IO module whole, the token
// line first.
// [[spec/tickets/the-lsp-door-lands]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"encoding/json"
	"io"
	"os" // level0: OutsideInDoors - the case reads the tree's own wiring, as a build check reads source
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"quackitect/src/modules/check"
	manager "quackitect/src/modules/index"
	"quackitect/src/modules/lsp"
	"quackitect/src/modules/tickets"
	"quackitect/src/q"
)

// The marks read a ticket's drawing under the name the tickets module projects it at. [[spec/tickets/lsp-marks-the-held-fields]]
func TestTheMarksReadTheDrawingTheTicketsModuleProjects(t *testing.T) {
	t.Parallel()
	if want := "tickets/" + tickets.DrawnPort + "/"; drawnTickets != want {
		t.Fatalf("the marks read the drawing under %q, and the tickets module projects it under %q", drawnTickets, want)
	}
}

// A press answers as the extension's index door read a post: the output on an end, the handle past the wait, and the fault on a refusal. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func TestAPressAnswersAsTheIndexDoorDid(t *testing.T) {
	t.Parallel()
	for _, one := range []struct {
		says string
		said manager.Answer
		err  error
		want lsp.Ran
	}{
		{says: "an end hands its output", said: manager.Answer{Result: "work\n  the next leaf\n"}, want: lsp.Ran{Out: "work\n  the next leaf\n"}},
		{says: "a run past the wait names its handle", said: manager.Answer{Running: true, Handle: "op-1"}, want: lsp.Ran{Out: "wait\nticket/pull runs on at op-1"}},
		{says: "a refusal hands its fault", said: manager.Answer{Error: "refused\n  the step stands for agent"}, want: lsp.Ran{Code: 1, Err: "refused\n  the step stands for agent"}},
		{says: "a call that fails hands its error", err: io.ErrUnexpectedEOF, want: lsp.Ran{Code: 1, Err: io.ErrUnexpectedEOF.Error()}},
	} {
		if got := ranOf("ticket/pull", one.said, one.err); got != one.want {
			t.Errorf("%s: the press reads %+v, and wants %+v", one.says, got, one.want)
		}
	}
}

// A hand-back writes the buffer to the file under the root. [[spec/tickets/lsp-draws-the-ticket-lenses]]
func TestTheBufferLandsUnderTheRoot(t *testing.T) {
	t.Parallel()
	var at, text string
	write := func(path string, data []byte, _ os.FileMode) error {
		at, text = path, string(data)
		return nil
	}
	none := func(string, any, string, time.Duration) (manager.Answer, error) { return manager.Answer{}, nil }
	ports := lspTickets("/tree", nil, none, write)
	if err := ports.Save("spec/tickets/one.md", "the approach"); err != nil || at != filepath.Join("/tree", "spec", "tickets", "one.md") || text != "the approach" {
		t.Fatalf("the save writes %q at %q, %v", text, at, err)
	}
}

// The lsp module reads the check module's rules through the ports quack wires, so a text fault reaches it as check draws it. [[spec/tickets/lsp-module-draws-the-tools]]
func TestThePortsAnswerTheCheckModulesRows(t *testing.T) {
	t.Parallel()
	const path, function, file = "src/over.go", 2, 3
	texts := map[string]string{path: "package over\n\nfunc a() {\n\tb()\n\tb()\n\tb()\n}\n"}
	ports := lspChecks("")
	got := ports.Faults(ports.Tree(texts), path, function, file, "tree")
	want := check.TextFaults(check.TreeOver("", check.Texts(texts)), path, function, file, "tree")
	if len(want) == 0 {
		t.Fatal("the fixture draws no row from the check module, so the case decides nothing")
	}
	if len(got) != len(want) {
		t.Fatalf("the ports answer %d rows, and the check module draws %d: %v", len(got), len(want), got)
	}
	for i := range want {
		if got[i] != lsp.Finding(want[i]) {
			t.Fatalf("row %d reads %+v through the ports, and %+v off the check module", i, got[i], want[i])
		}
	}
}

// The lsp module reads the check module's features through the ports quack wires, so a hover, a completion, a link and a fold reach it as check reads them. [[spec/tickets/lsp-module-serves-the-features]]
func TestTheFeaturePortsAnswerTheCheckModulesReads(t *testing.T) {
	t.Parallel()
	texts := map[string]string{
		"spec/schemas/paragraph.schema.yaml": "kind: paragraph\nlayers:\n  vocabulary:\n    terms: spec/vocabulary/terms.yml\n    endings: spec/config/stems.yaml\n",
		"spec/vocabulary/terms.yml":          "terms:\n  - {word: door, means: \"the one place the tree guards an outside thing\"}\n",
		"spec/config/stems.yaml":             "endings:\n  - end: s\n    to: [none]\n",
		"spec/schemas/flag.schema.yaml":      "kind: flag\ngoverns:\n  - spec/flags/**\nfrontmatter:\n  type: object\n  properties:\n    kind:\n      const: flag\n      x-link: true\nbody:\n  sections:\n    - header: Ask\n",
		"spec/design_output/one.md":          "# Scope\n",
		"spec/notes/one.md":                  "---\nkind: [[flag]]\n---\n\nThe doors hold. See [[spec/design_output/one]].\n",
		"spec/free.md":                       "",
	}
	const note = "spec/notes/one.md"
	fresh := func() *check.Tree { return check.TreeOver("", check.Texts(texts)) }
	ports := lspChecks("")
	cases := []struct {
		name        string
		port        lsp.Feature
		path        string
		line, where int
		want        any
	}{
		{"Hover", ports.Hover, note, 4, 5, check.HoverAt(fresh(), note, 4, 5)},
		{"Complete", ports.Complete, "spec/free.md", 0, 0, check.Offers(fresh(), "spec/free.md", 0, 0)},
		{"Links", ports.Links, note, 0, 0, check.LinksIn(fresh(), note)},
		{"Folds", ports.Folds, note, 0, 0, check.FoldsOf(texts[note])},
	}
	for _, one := range cases {
		want, _ := json.Marshal(one.want)
		if string(want) == "null" || string(want) == "[]" {
			t.Errorf("the fixture draws no %s from the check module, so the case decides nothing", one.name)
			continue
		}
		if one.port == nil {
			t.Errorf("lspChecks fills no %s port", one.name)
			continue
		}
		got, _ := json.Marshal(one.port(ports.Tree(texts), one.path, one.line, one.where))
		if string(got) != string(want) {
			t.Errorf("the %s port answers %s, and the check module reads %s", one.name, got, want)
		}
	}
}

// The tools and the features read the tracked texts, so the wiring binds the lsp module's inputs to the files the index mirrors and the paths git tracks. [[spec/tickets/lsp-module-draws-the-tools]]
func TestTheWiringHandsTheLspModuleTheTrackedFiles(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	for local, want := range map[string]string{"files/<path...>": "files/<path...>", "tracked": "git/tracked"} {
		if got := w.Bound(lspModule, local); got != want {
			t.Errorf("the lsp module's %s binds %s, and wants %s", local, got, want)
		}
	}
}

// A connection to a fake IO module, which hears the stream until its write side half-closes, then answers its reply and ends. [[spec/tickets/test-walks-move-onto-fakes]]
type hq1Conn struct {
	mu    sync.Mutex
	heard bytes.Buffer
	ended chan struct{}
	reply *io.PipeReader
}

// The fake module's connection, answering the reply once the stream ends. [[spec/tickets/test-walks-move-onto-fakes]]
func hq1Module(reply string) *hq1Conn {
	read, write := io.Pipe()
	conn := &hq1Conn{ended: make(chan struct{}), reply: read}
	go func() {
		<-conn.ended
		write.Write([]byte(reply))
		write.Close()
	}()
	return conn
}

func (conn *hq1Conn) Read(p []byte) (int, error) { return conn.reply.Read(p) }

func (conn *hq1Conn) Write(p []byte) (int, error) {
	conn.mu.Lock()
	defer conn.mu.Unlock()
	return conn.heard.Write(p)
}

func (conn *hq1Conn) CloseWrite() error { close(conn.ended); return nil }

func (conn *hq1Conn) Close() error { return nil }

// What the module heard. [[spec/tickets/test-walks-move-onto-fakes]]
func (conn *hq1Conn) said() string {
	conn.mu.Lock()
	defer conn.mu.Unlock()
	return conn.heard.String()
}

func TestQuackLspRelaysTheStreamWhole(t *testing.T) {
	t.Parallel()
	frame := "Content-Length: 2\r\n\r\n{}"
	conn := hq1Module(frame)
	var out bytes.Buffer
	if err := relays(strings.NewReader(frame), &out, conn, "tok"); err != nil {
		t.Fatal(err)
	}
	if said := conn.said(); said != "tok\n"+frame {
		t.Fatalf("the IO module hears %q, and wants the token line, then the frame whole", said)
	}
	if out.String() != frame {
		t.Fatalf("the editor reads %q, and wants the reply frame whole", out.String())
	}
}

func TestQuackLspDialsThePortTheStandingFileNames(t *testing.T) {
	t.Parallel()
	root, disk := "/tree", newFakeDisk()
	body, _ := json.Marshal(lsp.Standing{Port: 4711, Token: "tok"})
	hq1SeedDisk(t, disk, root, map[string]string{lsp.StandingFile: string(body)})
	conn := hq1Module("")
	dialed := 0
	dial := func(port int) (io.ReadWriteCloser, error) { dialed = port; return conn, nil }
	started := false
	var out bytes.Buffer
	if err := lsps(disk, dial, root, func() error { started = true; return nil }, strings.NewReader("{}"), &out); err != nil {
		t.Fatal(err)
	}
	if !started || dialed != 4711 {
		t.Fatalf("the verb starts an index %v, and dials %d where the standing file names 4711", started, dialed)
	}
	if said := conn.said(); said != "tok\n{}" {
		t.Fatalf("the IO module hears %q, and wants the token line, then the input", said)
	}
}

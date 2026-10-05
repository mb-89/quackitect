// quack lsp relays the editor's stdio to the lsp IO module whole, the token
// line first.
// [[spec/tickets/the-lsp-door-lands]]
package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/check"
	"quackitect/src/modules/lsp"
	"quackitect/src/q"
)

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

func TestQuackLspRelaysTheStreamWhole(t *testing.T) {
	t.Parallel()
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listen.Close()
	frame := "Content-Length: 2\r\n\r\n{}"
	heard := make(chan string, 1)
	go func() {
		conn, err := listen.Accept()
		if err != nil {
			heard <- ""
			return
		}
		defer conn.Close()
		read, _ := io.ReadAll(conn)
		conn.Write([]byte(frame))
		heard <- string(read)
	}()
	conn, err := net.Dial("tcp", listen.Addr().String())
	if err != nil {
		t.Fatal(err)
	}
	var out bytes.Buffer
	if err := relays(strings.NewReader(frame), &out, conn, "tok"); err != nil {
		t.Fatal(err)
	}
	conn.Close()
	select {
	case said := <-heard:
		if said != "tok\n"+frame {
			t.Fatalf("the IO module hears %q, and wants the token line, then the frame whole", said)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the IO module hears nothing")
	}
	if out.String() != frame {
		t.Fatalf("the editor reads %q, and wants the reply frame whole", out.String())
	}
}

func TestQuackLspDialsThePortTheStandingFileNames(t *testing.T) {
	t.Parallel()
	listen, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatal(err)
	}
	defer listen.Close()
	root := t.TempDir()
	standing := filepath.Join(root, filepath.FromSlash(lsp.StandingFile))
	os.MkdirAll(filepath.Dir(standing), 0o755)
	body, _ := json.Marshal(lsp.Standing{Port: listen.Addr().(*net.TCPAddr).Port, Token: "tok"})
	os.WriteFile(standing, body, 0o600)
	heard := make(chan string, 1)
	go func() {
		conn, err := listen.Accept()
		if err != nil {
			heard <- ""
			return
		}
		defer conn.Close()
		read, _ := io.ReadAll(conn)
		heard <- string(read)
	}()
	started := false
	var out bytes.Buffer
	if err := lsps(root, func() error { started = true; return nil }, strings.NewReader("{}"), &out); err != nil {
		t.Fatal(err)
	}
	if !started {
		t.Fatal("the verb starts no index")
	}
	select {
	case said := <-heard:
		if said != "tok\n{}" {
			t.Fatalf("the IO module hears %q, and wants the token line, then the input", said)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("the IO module hears nothing")
	}
}

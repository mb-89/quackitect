package main

import (
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"path/filepath"
	"strings"
	"testing"
)

func framed(said ...string) io.Reader {
	out := &bytes.Buffer{}
	for _, one := range said {
		fmt.Fprintf(out, "Content-Length: %d\r\n\r\n%s", len(one), one)
	}
	return out
}

func spoken(t *testing.T, text string) []message {
	t.Helper()
	out := []message{}
	reader := bufio.NewReader(strings.NewReader(text))
	for {
		said, err := reads(reader)
		if err != nil {
			return out
		}
		out = append(out, said)
	}
}

func drawnOn(said []message, uri string) []diagnostic {
	for _, one := range said {
		if one.Method != "textDocument/publishDiagnostics" {
			continue
		}
		var told struct {
			URI   string       `json:"uri"`
			Drawn []diagnostic `json:"diagnostics"`
		}
		if json.Unmarshal(one.Params, &told) == nil && told.URI == uri {
			return told.Drawn
		}
	}
	return nil
}

func TestTheServerAnswersInitialize(t *testing.T) {
	tree := wholeTree(t, nil)
	out := &bytes.Buffer{}
	said := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`
	if err := Speaks(&Checker{tree: tree}, framed(said), out); err != nil {
		t.Fatal(err)
	}

	answers := spoken(t, out.String())
	if len(answers) != 1 {
		t.Fatalf("initialize answers %d messages", len(answers))
	}
	body, _ := json.Marshal(answers[0].Result)
	if !strings.Contains(string(body), `"textDocumentSync":1`) {
		t.Errorf("the capabilities read %s", body)
	}
	if !strings.Contains(string(body), `"se-lsp"`) {
		t.Errorf("the server names itself %s", body)
	}
}

func TestADepartingNoteDrawsARedLine(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"HANDOVER.md":                       "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
	})
	at := filepath.Join(tree.Root, "HANDOVER.md")
	uri := uriOf(at)

	out := &bytes.Buffer{}
	open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`,
		uri, "---\nkind: [[handover]]\nstatus: maybe\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n")
	if err := Speaks(&Checker{tree: tree}, framed(open), out); err != nil {
		t.Fatal(err)
	}

	drawn := drawnOn(spoken(t, out.String()), uri)
	if len(drawn) != 1 {
		t.Fatalf("a departing note draws %v", drawn)
	}
	if drawn[0].Code != "Schema.status" || drawn[0].Severity != 1 {
		t.Errorf("the diagnostic reads %+v", drawn[0])
	}
	if drawn[0].Range.Start.Line != 2 {
		t.Errorf("the diagnostic draws on line %d", drawn[0].Range.Start.Line)
	}
	if drawn[0].Source != "se-lsp" {
		t.Errorf("the diagnostic names %q", drawn[0].Source)
	}
}

func TestAFixedNoteClearsTheLine(t *testing.T) {
	tree := wholeTree(t, map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"HANDOVER.md":                       "---\nkind: [[handover]]\nstatus: maybe\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n",
	})
	uri := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	whole := "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n"

	out := &bytes.Buffer{}
	open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`,
		uri, "---\nkind: [[handover]]\nstatus: maybe\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n")
	change := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didChange","params":{"textDocument":{"uri":%q},"contentChanges":[{"text":%q}]}}`,
		uri, whole)
	if err := Speaks(&Checker{tree: tree}, framed(open, change), out); err != nil {
		t.Fatal(err)
	}

	answers := spoken(t, out.String())
	if len(answers) != 2 {
		t.Fatalf("two writes draw %d messages", len(answers))
	}
	if drawn := drawnOn(answers[1:], uri); len(drawn) != 0 {
		t.Fatalf("a fixed note still draws %v", drawn)
	}
}

func TestASecondFileDrawsItsOwnLine(t *testing.T) {
	tree := wholeTree(t, map[string]string{Install: "here() {\n  case $1 in\n    node) have node ;;\n  esac\n}\n"})
	uri := uriOf(filepath.Join(tree.Root, filepath.FromSlash(Settings)))

	out := &bytes.Buffer{}
	open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`,
		uri, goodSettings)
	if err := Speaks(&Checker{tree: tree}, framed(open), out); err != nil {
		t.Fatal(err)
	}

	answers := spoken(t, out.String())
	drawn := drawnOn(answers, uriOf(filepath.Join(tree.Root, filepath.FromSlash(Install))))
	if len(drawn) != 2 {
		t.Fatalf("the script the settings name draws %v", drawn)
	}
}

func TestAUriReadsBothWays(t *testing.T) {
	for _, one := range []string{"/at/root/spec/one note.md", "/at/root/spec/one.md"} {
		if said := pathOf(uriOf(one)); said != filepath.FromSlash(one) {
			t.Errorf("%q reads back as %q", one, said)
		}
	}
}

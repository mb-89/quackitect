// The panel over every file. Each case drives the server through its own
// frames, over a tree the case writes, so no editor and no disk outside the
// temporary root answer any of it.
// [[spec/tickets/the-panel-draws-every-file]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"path/filepath"
	"testing"
)

const departing = "---\nkind: [[handover]]\nstatus: maybe\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n"
const standing = "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# What waits\n\n1. Go.\n"

func sweptTree(t *testing.T, more map[string]string) *Tree {
	t.Helper()
	files := map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"HANDOVER.md":                       departing,
		"spec/_parked.md":                   departing,
	}
	for name, text := range more {
		files[name] = text
	}
	return wholeTree(t, files)
}

func urisDrawn(said []message) map[string]int {
	out := map[string]int{}
	for _, one := range said {
		if one.Method != "textDocument/publishDiagnostics" {
			continue
		}
		var told struct {
			URI   string       `json:"uri"`
			Drawn []diagnostic `json:"diagnostics"`
		}
		if json.Unmarshal(one.Params, &told) == nil {
			out[told.URI] = len(told.Drawn)
		}
	}
	return out
}

func openFrame(uri, text string) string {
	return fmt.Sprintf(
		`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`,
		uri, text)
}

func closeFrame(uri string) string {
	return fmt.Sprintf(
		`{"jsonrpc":"2.0","method":"textDocument/didClose","params":{"textDocument":{"uri":%q}}}`, uri)
}

const initialized = `{"jsonrpc":"2.0","method":"initialized","params":{}}`

// [[spec/tickets/the-panel-draws-every-file]]
func TestInitializedDrawsAFileNoEditorOpens(t *testing.T) {
	tree := sweptTree(t, nil)
	uri := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))

	out := &bytes.Buffer{}
	if err := Speaks(&Checker{tree: tree}, framed(initialized), out); err != nil {
		t.Fatal(err)
	}

	drawn := drawnOn(spoken(t, out.String()), uri)
	if len(drawn) != 1 {
		t.Fatalf("the sweep draws %v for a file nobody opens", drawn)
	}
	if drawn[0].Code != "Schema.status" {
		t.Errorf("the diagnostic reads %+v", drawn[0])
	}
}

// [[spec/tickets/the-panel-draws-every-file]]
func TestAParkedFileDrawsNothingFromTheSweep(t *testing.T) {
	tree := sweptTree(t, nil)
	parked := uriOf(filepath.Join(tree.Root, "spec", "_parked.md"))

	out := &bytes.Buffer{}
	if err := Speaks(&Checker{tree: tree}, framed(initialized), out); err != nil {
		t.Fatal(err)
	}

	if _, drew := urisDrawn(spoken(t, out.String()))[parked]; drew {
		t.Fatal("a parked file draws nothing, and the sweep publishes for it")
	}
}

// [[spec/tickets/the-panel-draws-every-file]]
func TestAnOpenAfterTheSweepKeepsEverySweptFileDrawn(t *testing.T) {
	tree := sweptTree(t, map[string]string{"spec/tickets/one.md": departing})
	kept := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	opens := uriOf(filepath.Join(tree.Root, "spec", "tickets", "one.md"))

	out := &bytes.Buffer{}
	if err := Speaks(&Checker{tree: tree},
		framed(initialized, openFrame(opens, departing)), out); err != nil {
		t.Fatal(err)
	}

	if count := urisDrawn(spoken(t, out.String()))[kept]; count != 1 {
		t.Fatalf("the open leaves the swept file drawing %d finding(s)", count)
	}
}

// [[spec/tickets/the-panel-draws-every-file]]
func TestACloseClearsItsOwnFileAndKeepsTheSweptOnes(t *testing.T) {
	tree := sweptTree(t, map[string]string{"spec/tickets/one.md": departing})
	kept := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	opens := uriOf(filepath.Join(tree.Root, "spec", "tickets", "one.md"))

	out := &bytes.Buffer{}
	frames := framed(initialized, openFrame(opens, departing), closeFrame(opens))
	if err := Speaks(&Checker{tree: tree}, frames, out); err != nil {
		t.Fatal(err)
	}

	said := urisDrawn(spoken(t, out.String()))
	if said[kept] != 1 {
		t.Fatalf("the close leaves the swept file drawing %d finding(s)", said[kept])
	}
	if said[opens] != 0 {
		t.Fatalf("the close leaves its own file drawing %d finding(s)", said[opens])
	}
}

// [[spec/tickets/the-panel-draws-every-file]]
func TestASweepAfterAnOpenReadsTheBufferAndNotTheDisk(t *testing.T) {
	tree := sweptTree(t, nil)
	uri := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))

	out := &bytes.Buffer{}
	frames := framed(openFrame(uri, standing), initialized)
	if err := Speaks(&Checker{tree: tree}, frames, out); err != nil {
		t.Fatal(err)
	}

	if count := urisDrawn(spoken(t, out.String()))[uri]; count != 0 {
		t.Fatalf("the buffer stands clean, and the sweep draws %d finding(s)", count)
	}
}

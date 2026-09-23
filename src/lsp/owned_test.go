// An open buffer writing a field the verbs own draws a warning, and the sweep
// draws nothing for it.
// [[spec/design_output/lsp#an-engine-field-warns]]
package main

import (
	"bytes"
	"fmt"
	"path/filepath"
	"strings"
	"testing"
)

const engineSchema = `kind: ticket
governs:
  - spec/tickets/**
frontmatter:
  type: object
  properties:
    kind:
      const: ticket
      x-link: true
    state:
      enum: [draft, open, closed]
      x-engine: true
    steps:
      type: array
      x-engine: true
    group:
      type: string
body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
`

const heldTicket = "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: do\ngroup: g\n---\n\n# Ask\n\nA thing.\n"

func ownedTree(t *testing.T) *Tree {
	t.Helper()
	return fixture(t, map[string]string{
		"spec/schemas/ticket.schema.yaml": engineSchema,
		"spec/tickets/a.md":               heldTicket,
	})
}

// [[spec/design_output/lsp#an-engine-field-warns]]
func TestAnEngineFieldTheBufferChangesWarns(t *testing.T) {
	tree := ownedTree(t)
	checker := &Checker{tree: tree}
	if found := checker.Over("spec/tickets/a.md"); names(found, EngineOwnsField) != 0 {
		t.Fatalf("a file no editor holds draws %v", rules(found))
	}

	tree.Holds("spec/tickets/a.md", strings.Replace(heldTicket, "state: open", "state: closed", 1))
	one := onlyOne(t, checker.Over("spec/tickets/a.md"), EngineOwnsField)
	if one.Line != 3 || one.Severity != SeverityWarning || !strings.Contains(one.Message, "./RUNME.sh ticket pull") {
		t.Fatalf("the state edit draws %+v", one)
	}
	if found := checker.Sweep(); names(found, EngineOwnsField) != 0 {
		t.Fatalf("the sweep draws %v", rules(found))
	}

	tree.Holds("spec/tickets/a.md", strings.Replace(heldTicket, "  - name: do", "  - name: review", 1))
	if one := onlyOne(t, checker.Over("spec/tickets/a.md"), EngineOwnsField); one.Line != 4 {
		t.Fatalf("a nested step edit draws on line %d", one.Line)
	}

	tree.Holds("spec/tickets/a.md", strings.Replace(heldTicket, "group: g", "group: h", 1))
	if found := checker.Over("spec/tickets/a.md"); names(found, EngineOwnsField) != 0 {
		t.Fatalf("a field a hand owns draws %v", rules(found))
	}
}

// The warning reaches the editor at severity two. [[spec/design_output/lsp#an-engine-field-warns]]
func TestAnEngineFieldDrawsAsAWarning(t *testing.T) {
	tree := ownedTree(t)
	uri := uriOf(filepath.Join(tree.Root, "spec", "tickets", "a.md"))
	open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`,
		uri, strings.Replace(heldTicket, "state: open", "state: draft", 1))
	out := &bytes.Buffer{}
	if err := Speaks(&Checker{tree: tree}, framed(open), out); err != nil {
		t.Fatal(err)
	}
	for _, one := range drawnOn(spoken(t, out.String()), uri) {
		if one.Code == EngineOwnsField && one.Severity == severityWarning && one.Range.Start.Line == 2 {
			return
		}
	}
	t.Fatalf("the open draws %v", drawnOn(spoken(t, out.String()), uri))
}

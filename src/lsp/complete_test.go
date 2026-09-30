// The completion offers what the schema allows at the cursor, off the buffer
// the tree holds.
// [[spec/design_output/lsp#the-completion-reads-the-schema]]
package main

import (
	"encoding/json"
	"fmt"
	"path/filepath"
	"sort"
	"strings"
	"testing"

	"quackitect/src/modules/check"
)

const flagSchema = `kind: flag
governs:
  - spec/flags/**
frontmatter:
  type: object
  properties:
    kind:
      const: flag
      x-link: true
    urgent:
      type: boolean
      description: whether it stops work
    group:
      enum: [one, two]
      x-link: true
body:
  headingLevel: 2
  sections:
    - header: Why
      required: true
`

func offeredTree(t *testing.T, more map[string]string) *Tree {
	t.Helper()
	files := map[string]string{
		"spec/schemas/handover.schema.yaml": handoverSchema,
		"spec/schemas/flag.schema.yaml":     flagSchema,
		"spec/schemas/ticket.schema.yaml":   ticketSchema,
		"spec/design_output/one.md":         "# Scope\n\nA line.\n\n# The stop hook holds a turn\n\nMore.\n",
	}
	for name, text := range more {
		files[name] = text
	}
	return fixture(t, files)
}

func labels(said []check.Completion) []string {
	out := []string{}
	for _, one := range said {
		out = append(out, one.Label)
	}
	sort.Strings(out)
	return out
}

// The server reads the open buffer and no disk, and names the completion in its capabilities. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestTheServerAnswersACompletion(t *testing.T) {
	tree := offeredTree(t, map[string]string{"HANDOVER.md": "---\nkind: [[handover]]\nstatus: todo\n---\n"})
	uri := uriOf(filepath.Join(tree.Root, "HANDOVER.md"))
	initialize := `{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}`
	open := fmt.Sprintf(`{"jsonrpc":"2.0","method":"textDocument/didOpen","params":{"textDocument":{"uri":%q,"text":%q}}}`,
		uri, "---\nkind: [[handover]]\n\n---\n")
	ask := fmt.Sprintf(`{"jsonrpc":"2.0","id":2,"method":"textDocument/completion","params":{"textDocument":{"uri":%q},"position":{"line":2,"character":0}}}`, uri)
	out := &guardedBuffer{}
	if err := Speaks(&Checker{tree: tree}, framed(initialize, open, ask), out); err != nil {
		t.Fatal(err)
	}

	said := spoken(t, out.String())
	capabilities, _ := json.Marshal(said[0].Result)
	if !strings.Contains(string(capabilities), `"completionProvider":{"triggerCharacters":[":"," ","#","["]}`) {
		t.Fatalf("the capabilities read %s", capabilities)
	}
	for _, one := range said {
		if string(one.ID) != "2" {
			continue
		}
		body, _ := json.Marshal(one.Result)
		var got []check.Completion
		if json.Unmarshal(body, &got) != nil || strings.Join(labels(got), ",") != "depends_on,status" {
			t.Fatalf("the completion answers %s", body)
		}
		return
	}
	t.Fatal("the completion answers nothing")
}

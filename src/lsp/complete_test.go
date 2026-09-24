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

func labels(said []completion) []string {
	out := []string{}
	for _, one := range said {
		out = append(out, one.Label)
	}
	sort.Strings(out)
	return out
}

// The cursor at the end of the given line. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func endOfLine(text string, line int) position {
	return position{Line: line, Character: units(strings.Split(text, "\n")[line])}
}

func offeredAt(t *testing.T, tree *Tree, path, text string, line int) []completion {
	t.Helper()
	tree.Holds(path, text)
	return offers(tree, path, endOfLine(text, line))
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAKeyOffersThePropertiesTheNoteLacks(t *testing.T) {
	tree := offeredTree(t, nil)
	text := "---\nkind: [[handover]]\n\n---\n"
	got := offeredAt(t, tree, "HANDOVER.md", text, 2)
	if said := strings.Join(labels(got), ","); said != "depends_on,status" {
		t.Fatalf("a key offers %s", said)
	}
	for _, one := range got {
		if one.Label == "status" && (one.InsertText != "status: " || one.Detail != "where the work stands") {
			t.Fatalf("status offers %+v", one)
		}
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAValueOffersTheEnumTheConstAndABoolean(t *testing.T) {
	tree := offeredTree(t, nil)
	status := offeredAt(t, tree, "HANDOVER.md", "---\nkind: [[handover]]\nstatus:\n---\n", 2)
	if said := strings.Join(labels(status), ","); said != "done,held,todo" {
		t.Fatalf("status offers %s", said)
	}
	if edit := status[0].TextEdit; edit.NewText != " todo" || edit.Range.Start.Character != 7 {
		t.Fatalf("a value replaces the text past the colon, and it answers %+v", edit)
	}
	kind := offeredAt(t, tree, "HANDOVER.md", "---\nkind: \n---\n", 1)
	if said := strings.Join(labels(kind), ","); said != "[[handover]]" {
		t.Fatalf("kind offers %s on a governed path", said)
	}
	urgent := offeredAt(t, tree, "spec/flags/a.md", "---\nkind: [[flag]]\nurgent: \n---\n", 2)
	if said := strings.Join(labels(urgent), ","); said != "false,true" {
		t.Fatalf("a boolean offers %s", said)
	}
	group := offeredAt(t, tree, "spec/flags/a.md", "---\nkind: [[flag]]\ngroup:\n---\n", 2)
	if said := strings.Join(labels(group), ","); said != "[[one]],[[two]]" {
		t.Fatalf("a link offers %s", said)
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestANoteWithNoKindOffersOne(t *testing.T) {
	tree := offeredTree(t, nil)
	governed := offeredAt(t, tree, "spec/flags/b.md", "---\n\n---\n", 1)
	if said := strings.Join(labels(governed), ","); said != "group,kind: [[flag]],urgent" {
		t.Fatalf("a governed note with no kind offers %s", said)
	}
	bare := offeredAt(t, tree, "spec/free.md", "", 0)
	if said := strings.Join(labels(bare), ","); said != "kind: [[flag]],kind: [[handover]],kind: [[ticket]]" {
		t.Fatalf("a bare note offers %s", said)
	}
	if bare[0].InsertText != "---\nkind: [[flag]]\n---\n" {
		t.Fatalf("a bare note opens its frontmatter, and it answers %q", bare[0].InsertText)
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAHeadingOffersTheChaptersTheNoteLacks(t *testing.T) {
	tree := offeredTree(t, nil)
	text := "---\nkind: [[handover]]\nstatus: todo\n---\n\n# Where it stands\n\n# "
	if said := strings.Join(labels(offeredAt(t, tree, "HANDOVER.md", text, 7)), ","); said != "What waits" {
		t.Fatalf("a heading offers %s", said)
	}
	deeper := strings.TrimSuffix(text, "# ") + "## "
	if got := offeredAt(t, tree, "HANDOVER.md", deeper, 7); len(got) != 0 {
		t.Fatalf("a heading past the schema's level offers %v", labels(got))
	}
	ticket := "---\nkind: [[ticket]]\nsteps:\n  - name: do\n---\n\n# Ask\n\n# "
	if said := strings.Join(labels(offeredAt(t, tree, "spec/tickets/a.md", ticket, 8)), ","); said != "Discussion,do" {
		t.Fatalf("a ticket's heading offers %s, and a step names its own chapter", said)
	}
}

// [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestAPointerOffersPathsAndSlugs(t *testing.T) {
	tree := offeredTree(t, nil)
	paths := offeredAt(t, tree, "spec/two.md", "See [[spec/des", 0)
	found := false
	for _, one := range paths {
		if one.Label == "spec/design_output/one" && one.TextEdit.NewText == "spec/design_output/one]]" && one.TextEdit.Range.Start.Character == 6 {
			found = true
		}
	}
	if !found {
		t.Fatalf("a pointer offers %v", labels(paths))
	}
	slugs := offeredAt(t, tree, "spec/two.md", "See [[spec/design_output/one#", 0)
	if said := strings.Join(labels(slugs), ","); said != "scope,the-stop-hook-holds-a-turn" {
		t.Fatalf("a chapter offers %s", said)
	}
}

// The editor counts the cursor in UTF-16 units, so a wide character before it keeps the cursor in place. [[spec/design_output/lsp#the-completion-reads-the-schema]]
func TestTheCursorCountsUTF16Units(t *testing.T) {
	tree := offeredTree(t, nil)
	got := offeredAt(t, tree, "spec/two.md", "ä 😀 [[", 0)
	if len(got) == 0 {
		t.Fatal("a pointer past ä and an emoji offers nothing")
	}
	if at := got[0].TextEdit.Range.Start.Character; at != 7 {
		t.Fatalf("the item opens at unit %d", at)
	}
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
		var got []completion
		if json.Unmarshal(body, &got) != nil || strings.Join(labels(got), ",") != "depends_on,status" {
			t.Fatalf("the completion answers %s", body)
		}
		return
	}
	t.Fatal("the completion answers nothing")
}

// A key naming a folder under x-values offers every file there as a link. [[spec/design_input/the-editor-draws-the-ticket#a-ticket-picks-a-process]]
const pickedSchema = `kind: ticket
governs:
  - spec/tickets/**
frontmatter:
  type: object
  properties:
    kind:
      const: ticket
      x-link: true
    process:
      x-link: true
      x-values: spec/processes
      description: the route the mint copies from
body:
  headingLevel: 1
  sections:
    - header: Ask
      required: true
`

func TestAProcessKeyOffersEveryProcess(t *testing.T) {
	tree := offeredTree(t, map[string]string{
		"spec/schemas/ticket.schema.yaml": pickedSchema,
		"spec/processes/standard.yaml":    "for: a change\n",
		"spec/processes/trivial.yaml":     "for: a fix\n",
	})
	text := "---\nkind: [[ticket]]\nprocess: \n---\n"
	got := offeredAt(t, tree, "spec/tickets/a.md", text, 2)
	if said := strings.Join(labels(got), ","); said != "[[spec/processes/standard]],[[spec/processes/trivial]]" {
		t.Fatalf("the process key offers %s", said)
	}
}

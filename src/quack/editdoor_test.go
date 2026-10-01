// The edit door's rules past the schema and the voice, each driven through a
// patch over a tree in a temp folder.
// [[spec/tickets/edit-door-rules-port]]
package main

import (
	"strings"
	"testing"
)

// A ticket schema giving state to the engine, a projection over one folder, and a raw note carrying a token. [[spec/tickets/edit-door-rules-port]]
const (
	engineSchema = "kind: ticket\ngoverns:\n  - spec/tickets/**\nfrontmatter:\n  type: object\n  properties:\n    kind:\n      const: ticket\n      x-link: true\n    state:\n      x-engine: true\nbody:\n  headingLevel: 1\n  sections:\n    - header: Ask\n"
	owningFile   = `{"projections": [{"name": "the made files", "target": "made", "from": "spec/made.yaml"}]}`
	noteToken    = "sk_live_abcdefghijkl"
	closedPath   = "spec/tickets/a-closed-thing.md"
)

// A patch of one op over the tree, and what it answers. [[spec/tickets/edit-door-rules-port]]
func doorCall(t *testing.T, root string, op map[string]any) string {
	t.Helper()
	return editCall(t, root, patchAction, patchOf(editTicket, op))
}

// [[spec/tickets/edit-door-rules-port]]
func TestAnEditReachesNoBlessFile(t *testing.T) {
	root := editTree(t)
	said := doorCall(t, root, map[string]any{"op": "create", "file": ".se/.runtime/bless.json", "new": "{}\n"})
	if !strings.Contains(said, "is the owner's word on who blesses") {
		t.Errorf("a write to the bless file answers %q", said)
	}
	if _, ok := readIn(root, ".se/.runtime/bless.json"); ok {
		t.Errorf("the bless file stands after the edit")
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestADraftPassesEveryRule(t *testing.T) {
	root := editTree(t)
	path := "spec/design_input/_draft.md"
	said := doorCall(t, root, map[string]any{"op": "create", "file": path, "new": "---\nkind: [[rationale]]\n---\n\nA draft.\n"})
	if _, ok := readIn(root, path); !ok {
		t.Errorf("a draft stands nowhere after the edit, which answers %q", said)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestAnOpenTicketTakesAnEditUnderDiscussionAlone(t *testing.T) {
	root := editTree(t)
	path := "spec/tickets/" + editTicket + ".md"
	said := doorCall(t, root, map[string]any{"op": "exact", "file": path, "old": "A thing.", "new": "Another thing."})
	if !strings.Contains(said, path+" stands open, and the engine writes it.") {
		t.Errorf("an edit of an open ticket's Ask answers %q", said)
	}
	doorCall(t, root, map[string]any{"op": "append", "file": path, "new": "\n# Discussion\n\nA word.\n"})
	if got, _ := readIn(root, path); !strings.HasSuffix(got, "# Discussion\n\nA word.\n") {
		t.Errorf("a Discussion line reads %q after the edit", got)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestTheEngineFieldsComeBackAndTheEditLands(t *testing.T) {
	root := editTree(t)
	seedFile(t, root, "spec/schemas/ticket.schema.yaml", engineSchema)
	said := doorCall(t, root, map[string]any{"op": "exact", "file": closedPath, "old": "state: closed\n---\n\n# Ask\n\nA thing done.", "new": "state: open\n---\n\n# Ask\n\nA thing done well."})
	got, _ := readIn(root, closedPath)
	if !strings.Contains(got, "state: closed") || !strings.Contains(got, "A thing done well.") {
		t.Errorf("the closed ticket reads %q after the edit, which answers %q", got, said)
	}
	if !strings.Contains(said, "state stand as the engine holds them in "+closedPath) {
		t.Errorf("the edit answers %q, and names no field put back", said)
	}
	alone := doorCall(t, root, map[string]any{"op": "exact", "file": closedPath, "old": "state: closed", "new": "state: open"})
	if !strings.Contains(alone, "This edit changes state alone") {
		t.Errorf("an edit of the engine's field alone answers %q", alone)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestAProjectedFileTakesNoEdit(t *testing.T) {
	root := editTree(t)
	seedFile(t, root, projectionsFile, owningFile)
	said := doorCall(t, root, map[string]any{"op": "create", "file": "made/one.txt", "new": "one\n"})
	if !strings.Contains(said, "made/one.txt is projected, so nothing may write it by hand.") {
		t.Errorf("a write to a projected file answers %q", said)
	}
}

// [[spec/tickets/edit-door-rules-port]]
func TestAnEditCarriesNoTokenOutOfANote(t *testing.T) {
	root := editTree(t)
	seedFile(t, root, ".se/notes/a-note.md", "The key is "+noteToken+".\n")
	said := doorCall(t, root, map[string]any{"op": "create", "file": "docs/two.txt", "new": "use " + noteToken + "\n"})
	if !strings.Contains(said, "straight from a note under .se/notes") {
		t.Errorf("a write carrying a note's token answers %q", said)
	}
	if _, ok := readIn(root, "docs/two.txt"); ok {
		t.Errorf("docs/two.txt stands after the door refuses it")
	}
}

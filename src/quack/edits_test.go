// The edit tools answer in Go: a patch lands through the write door with a
// journal an undo reads back, and a mint writes a note in its schema's shape.
// Each case calls the action by name over a tree in a temp folder.
// [[spec/tickets/edit-tools-answer-in-go]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"os" // level0: OutsideInDoors - the case copies the tree's own schemas and reads its wiring, as a build check reads source
	"path/filepath"
	"strings"
	"testing"
)

// The module type the edit actions stand in, and the actions each case calls by name. [[spec/tickets/edit-tools-answer-in-go]]
const (
	editModuleType = "edits"
	patchAction    = "edits/patch"
	undoAction     = "edits/undo"
	mintAction     = "edits/mint"
	editTicket     = "a-thing"
	editOn         = "a-case"
)

// src/modules/check/folders.go owns the undo journal folder, and the package spells it again. [[spec/tickets/edit-tools-answer-in-go]]
const journalFolder = ".se/.runtime/undo"

// The schemas a case copies into its tree, off the repo's own. [[spec/tickets/edit-tools-answer-in-go]]
var editSchemas = []string{"design_input.schema.yaml", "rationale.schema.yaml"}

// A tree in a temp folder: an open ticket, a closed one, a file to edit, and the schemas a mint reads. [[spec/tickets/edit-tools-answer-in-go]]
func editTree(t *testing.T) string {
	t.Helper()
	root := t.TempDir()
	seedFile(t, root, "spec/tickets/"+editTicket+".md", "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA thing.\n")
	seedFile(t, root, "spec/tickets/a-closed-thing.md", "---\nkind: [[ticket]]\nstate: closed\n---\n\n# Ask\n\nA thing done.\n")
	seedFile(t, root, "docs/one.txt", "one\n")
	for _, name := range editSchemas {
		body, err := os.ReadFile(filepath.Join(treeRoot, "spec", "schemas", name))
		if err != nil {
			t.Fatal(err)
		}
		seedFile(t, root, "spec/schemas/"+name, string(body))
	}
	return root
}

// The journal entries standing under the root. [[spec/tickets/edit-tools-answer-in-go]]
func journalsIn(root string) []string {
	found, _ := filepath.Glob(filepath.Join(root, filepath.FromSlash(journalFolder), "*.json"))
	return found
}

// Calls an edit action by name over the root. [[spec/tickets/edit-tools-answer-in-go]]
func editCall(t *testing.T, root, name string, input any) string {
	t.Helper()
	return servedCall(t, root, editModuleType, nil, name, input)
}

// A patch serving the open ticket, as the bridge's tool takes it. [[spec/tickets/edit-tools-answer-in-go]]
func patchOf(ticket string, ops ...map[string]any) map[string]any {
	return map[string]any{"ticket": ticket, "on": editOn, "ops": ops}
}

// The two ops a landing patch carries: an exact edit of a file standing, and a create of a new one. [[spec/tickets/edit-tools-answer-in-go]]
func landingOps() []map[string]any {
	return []map[string]any{
		{"op": "exact", "file": "docs/one.txt", "old": "one", "new": "uno"},
		{"op": "create", "file": "docs/two.txt", "new": "two\n"},
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAPatchLandsAtomicallyThroughTheWriteDoor(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	said := editCall(t, root, patchAction, patchOf(editTicket, landingOps()...))
	if got, _ := readIn(root, "docs/one.txt"); got != "uno\n" {
		t.Errorf("docs/one.txt reads %q after the patch, and wants %q; the patch answers %q", got, "uno\n", said)
	}
	if got, ok := readIn(root, "docs/two.txt"); !ok || got != "two\n" {
		t.Errorf("docs/two.txt reads %q, standing %v, after the patch, and wants %q", got, ok, "two\n")
	}
	if found := journalsIn(root); len(found) != 1 {
		t.Errorf("%s holds %v after the patch, and wants one entry", journalFolder, found)
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAFailingOpInAPatchWritesNothing(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	ops := append(landingOps(), map[string]any{"op": "exact", "file": "docs/one.txt", "old": "nowhere", "new": "x"})
	said := editCall(t, root, patchAction, patchOf(editTicket, ops...))
	if !strings.Contains(said, "the text stands nowhere in the file") {
		t.Errorf("the patch answers %q, and wants the op's fault: the text stands nowhere in the file", said)
	}
	if got, _ := readIn(root, "docs/one.txt"); got != "one\n" {
		t.Errorf("docs/one.txt reads %q after a refused patch, and wants %q", got, "one\n")
	}
	if _, ok := readIn(root, "docs/two.txt"); ok {
		t.Errorf("docs/two.txt stands after a refused patch")
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAPatchTheSchemaRefusesWritesNoFile(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	path, text := "spec/design_input/stranger.md", "---\nkind: [[rationale]]\n---\n\n# Why\n\nA reason.\n"
	if judged := writeSchema(root, path, text); !judged.Stranger {
		t.Fatalf("the seed reads %+v off the schema door, and wants a stranger fault", judged)
	}
	said := editCall(t, root, patchAction, patchOf(editTicket, map[string]any{"op": "create", "file": path, "new": text}))
	if !strings.Contains(said, "refuses the batch, and nothing is written") {
		t.Errorf("the patch answers %q, and wants the door's refusal: refuses the batch, and nothing is written", said)
	}
	if _, ok := readIn(root, path); ok {
		t.Errorf("%s stands after the schema refuses it", path)
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAPatchNamingNoOpenTicketWritesNothing(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	said := editCall(t, root, patchAction, patchOf("a-closed-thing", landingOps()...))
	if !strings.Contains(said, "a-closed-thing stands closed") {
		t.Errorf("the patch answers %q, and wants the ticket's fault: a-closed-thing stands closed", said)
	}
	if got, _ := readIn(root, "docs/one.txt"); got != "one\n" {
		t.Errorf("docs/one.txt reads %q after a patch naming a closed ticket, and wants %q", got, "one\n")
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAnUndoPutsEveryFileBack(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	editCall(t, root, patchAction, patchOf(editTicket, landingOps()...))
	if got, _ := readIn(root, "docs/one.txt"); got != "uno\n" {
		t.Errorf("docs/one.txt reads %q after the patch, and wants %q before the undo", got, "uno\n")
	}
	said := editCall(t, root, undoAction, map[string]any{"on": editOn})
	if !strings.Contains(said, "2 file(s) come back") {
		t.Errorf("the undo answers %q, and wants: 2 file(s) come back", said)
	}
	if got, _ := readIn(root, "docs/one.txt"); got != "one\n" {
		t.Errorf("docs/one.txt reads %q after the undo, and wants %q", got, "one\n")
	}
	if _, ok := readIn(root, "docs/two.txt"); ok {
		t.Errorf("docs/two.txt stands after the undo of the patch that made it")
	}
	if found := journalsIn(root); len(found) != 0 {
		t.Errorf("%s holds %v after the undo, and wants none", journalFolder, found)
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAnUndoRefusesAFileThatMovesSinceThePatch(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	editCall(t, root, patchAction, patchOf(editTicket, landingOps()...))
	seedFile(t, root, "docs/one.txt", "moved by hand\n")
	said := editCall(t, root, undoAction, map[string]any{"on": editOn})
	if !strings.Contains(said, "docs/one.txt moves since the apply") {
		t.Errorf("the undo answers %q, and wants the drift refusal: docs/one.txt moves since the apply", said)
	}
	if got, _ := readIn(root, "docs/one.txt"); got != "moved by hand\n" {
		t.Errorf("docs/one.txt reads %q after a refused undo, and wants the hand's text", got)
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestTheJournalReadsAsTheBridgeWritesIt(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	editCall(t, root, patchAction, patchOf(editTicket, landingOps()...))
	found := journalsIn(root)
	if len(found) != 1 {
		t.Fatalf("%s holds %v after the patch, and wants one entry", journalFolder, found)
	}
	body, err := realDisk().read(found[0])
	if err != nil {
		t.Fatal(err)
	}
	var entry struct {
		On     string `json:"on"`
		By     string `json:"by"`
		At     string `json:"at"`
		Ticket string `json:"ticket"`
		Files  []struct {
			File        string `json:"file"`
			Was         string `json:"was"`
			Made        string `json:"made"`
			DidNotExist bool   `json:"did_not_exist"`
			DidNotStay  bool   `json:"did_not_stay"`
		} `json:"files"`
	}
	if err := json.Unmarshal(body, &entry); err != nil {
		t.Fatalf("the journal reads as no JSON: %v", err)
	}
	if entry.On != editOn || entry.Ticket != editTicket || entry.At == "" || len(entry.Files) != 2 {
		t.Errorf("the journal reads %s, and wants on %s, ticket %s, a time and two files", body, editOn, editTicket)
	}
	for _, one := range entry.Files {
		if one.File == "docs/two.txt" && (!one.DidNotExist || one.Made != "two\n") {
			t.Errorf("the journal holds %+v for the created file", one)
		}
		if one.File == "docs/one.txt" && (one.Was != "one\n" || one.Made != "uno\n") {
			t.Errorf("the journal holds %+v for the edited file", one)
		}
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAMintWritesANoteInItsSchemasShape(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	path := "spec/design_input/a-want.md"
	said := editCall(t, root, mintAction, map[string]any{
		"kind": "design_input", "path": path, "ticket": editTicket,
		"fields": map[string]any{"Scope": "The owner wants one thing."},
	})
	got, ok := readIn(root, path)
	if !ok {
		t.Fatalf("%s stands nowhere after the mint, which answers %q", path, said)
	}
	if !strings.HasPrefix(got, "---\nkind: [[design_input]]\n---\n") || !strings.Contains(got, "# Scope\n\nThe owner wants one thing.\n") {
		t.Errorf("%s reads %q, and wants the design_input front and its Scope chapter", path, got)
	}
	if judged := writeSchema(root, path, got); len(judged.Found) != 0 {
		t.Errorf("the schema finds %+v in the minted note", judged.Found)
	}
}

// [[spec/tickets/edit-tools-answer-in-go]]
func TestAMintRefusesAPathAnotherKindGoverns(t *testing.T) {
	t.Parallel()
	root := editTree(t)
	path := "spec/design_input/a-reason.md"
	said := editCall(t, root, mintAction, map[string]any{"kind": "rationale", "path": path, "ticket": editTicket})
	if !strings.Contains(said, "design_input governs "+path) {
		t.Errorf("the mint answers %q, and wants: design_input governs %s", said, path)
	}
	if _, ok := readIn(root, path); ok {
		t.Errorf("%s stands after a mint another kind's path refuses", path)
	}
}

// [[spec/tickets/edit-tools-answer-in-go]] [[spec/tickets/level0-tools-leave-the-bridge]]
func TestTheEditModuleStandsOnTheWiring(t *testing.T) {
	t.Parallel()
	if _, ok := modules[editModuleType]; !ok {
		t.Errorf("the root loads no module type %s", editModuleType)
	}
	w := treeWiring(t)
	if !wiresType(w, editModuleType) {
		t.Errorf("the wiring loads no %s", editModuleType)
	}
}

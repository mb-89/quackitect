// retro notes reads tickets/all off the index and prints what the verb's program prints,
// and the wiring loads the retro topic.
// [[spec/tickets/retro-verbs-become-actions]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/index"
	"quackitect/src/q"
	"quackitect/src/ticket"
)

// A door holding tickets/all as the case seeds it, and the V1 answering its base. [[spec/tickets/retro-verbs-become-actions]]
func notesTree(t *testing.T, rows []ticket.Ticket) func() (string, error) {
	t.Helper()
	root := t.TempDir()
	if err := os.MkdirAll(filepath.Join(root, index.Runtime), 0o755); err != nil {
		t.Fatal(err)
	}
	c := q.New()
	hand := q.OutIn(c, "tickets/all", []ticket.Ticket{}, q.Doc("the tickets as the case seeds them"))
	seeds := func(_ string, commit index.Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{"tickets/all": rows})
	}
	stop, _, err := index.Serve(root, filepath.Join(t.TempDir(), "index.db"), c, seeds)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	body, err := os.ReadFile(filepath.Join(root, index.Runtime, "index.json"))
	if err != nil {
		t.Fatal(err)
	}
	var standing index.Standing
	if err := json.Unmarshal(body, &standing); err != nil {
		t.Fatal(err)
	}
	base := fmt.Sprintf("http://127.0.0.1:%d/v1", standing.V1)
	return func() (string, error) { return base, nil }
}

var notesRows = []ticket.Ticket{
	{Name: "a-doubt", Path: ".se/tickets/a-doubt.md", State: "open"},
	{Name: "b-bug", Path: ".se/tickets/b-bug.md", State: "draft"},
	{Name: "c-done", Path: ".se/tickets/c-done.md", State: "closed"},
	{Name: "d-public", Path: "spec/tickets/d-public.md", State: "open"},
}

// retro notes names each note under .se/tickets standing open, and exits 1. [[spec/tickets/retro-verbs-become-actions]]
func TestRetroNotesPrintsTheOpenNotesAsCliJsDoes(t *testing.T) {
	t.Parallel()
	var out, errs strings.Builder
	code := retroNotes(notesTree(t, notesRows))([]string{"retro", "notes"}, true, &out, &errs)
	want := "2 note(s) stand open under .se/tickets. Decide each one, then run this again:\n  a-doubt\n  b-bug\n"
	if code != 1 || out.String() != want {
		t.Fatalf("retro notes answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// retro notes passes where every note under .se/tickets stands closed. [[spec/tickets/retro-verbs-become-actions]]
func TestRetroNotesPassesWhereNoNoteStandsOpen(t *testing.T) {
	t.Parallel()
	var out, errs strings.Builder
	code := retroNotes(notesTree(t, notesRows[2:]))([]string{"retro", "notes"}, true, &out, &errs)
	want := ".se/tickets holds no open note, so the box leaves nothing behind.\n"
	if code != 0 || out.String() != want {
		t.Fatalf("retro notes answers %d and prints %q, %q", code, out.String(), errs.String())
	}
}

// The wiring loads the retro topic, so an agent calls retro/collect through the index. [[spec/tickets/retro-verbs-become-actions]]
func TestTheWiringLoadsTheRetroTopic(t *testing.T) {
	t.Parallel()
	text, err := os.ReadFile(filepath.Join("..", "..", filepath.FromSlash(q.WiringFile)))
	if err != nil {
		t.Fatal(err)
	}
	w, err := q.ReadWiring(string(text))
	if err != nil {
		t.Fatal(err)
	}
	c := q.New()
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	if _, ok := q.NewStore(c).Declared("retro/collect"); !ok {
		t.Fatal("the wiring declares no retro/collect")
	}
}

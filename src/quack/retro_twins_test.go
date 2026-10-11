// retro notes reads tickets/all off the index and prints what the verb's program prints,
// and the wiring loads the retro topic.
// [[spec/tickets/retro-verbs-become-actions]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"

	"quackitect/src/ticket"
)

// A door holding tickets/all as the case seeds it. [[spec/tickets/retro-verbs-become-actions]]
func notesTree(t *testing.T, rows []ticket.Ticket) func() (string, error) {
	return seededTree(t, "tickets/all", []ticket.Ticket{}, rows)
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

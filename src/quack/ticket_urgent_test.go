// ticket urgent flips a ticket's urgent mark, and drops it where it turns off,
// off the roads test/level0/ticket-edit.test.js covers.
// [[spec/tickets/view-actions-run-through-verbs]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

func TestTicketUrgent(t *testing.T) {
	t.Run("a dry run says the flip, and writes nothing", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		code, out, _ := runsApart(t, root, true, "ticket", "urgent", "a-thing")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != "spec/tickets/a-thing.md carries urgent: true.\n" || got != editCaseTicket("") {
			t.Fatalf("the dry urgent answers %d, %q, and writes %q", code, out, got)
		}
	})
}

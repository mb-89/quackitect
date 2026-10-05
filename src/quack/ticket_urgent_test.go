// ticket urgent flips a ticket's urgent mark, and drops it where it turns off,
// off the roads test/level0/ticket-edit.test.js covers.
// [[spec/tickets/view-actions-run-through-verbs]]
package main

import (
	"strings"
	"testing"
)

func TestTicketUrgent(t *testing.T) {
	t.Run("urgent writes the mark, and drops it where it turns off", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		code, out, errs := runsApart(t, root, false, "ticket", "urgent", "a-thing")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != "spec/tickets/a-thing.md carries urgent: true.\n" || errs != "" || !strings.Contains(got, "\nurgent: true\n") {
			t.Fatalf("urgent answers %d, %q, %q, and writes %q", code, out, errs, got)
		}
		code, out, _ = runsApart(t, root, false, "ticket", "urgent", "a-thing")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != "spec/tickets/a-thing.md carries urgent: false.\n" || got != editCaseTicket("") {
			t.Fatalf("the second urgent answers %d, %q, and writes %q", code, out, got)
		}
	})
	t.Run("urgent names the ticket it fails to find", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		for _, one := range []struct {
			argv []string
			want string
		}{
			{[]string{"ticket", "urgent"}, "ticket urgent"},
			{[]string{"ticket", "urgent", "nowhere"}, "nowhere"},
		} {
			code, out, errs := runsApart(t, root, false, one.argv...)
			if want := one.want + " names no ticket: ./RUNME.sh ticket urgent slow-lint\n"; code != 2 || out != "" || errs != want {
				t.Errorf("%v answers %d, %q, %q", one.argv, code, out, errs)
			}
		}
	})
	t.Run("a dry run says the flip, and writes nothing", func(t *testing.T) {
		root := editCaseTree(t, "a-thing")
		code, out, _ := runsApart(t, root, true, "ticket", "urgent", "a-thing")
		if got, _ := readsBack(t, root, aThing); code != 0 || out != "spec/tickets/a-thing.md carries urgent: true.\n" || got != editCaseTicket("") {
			t.Fatalf("the dry urgent answers %d, %q, and writes %q", code, out, got)
		}
	})
}

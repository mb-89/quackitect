// ticket todo parks a ticket for the next pull, and --off takes the tag away.
// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"
)

// A ticket as ticket-todo.test.js seeds it, at the state with the extra rows. [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
func todoCaseTicket(state, extra string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\nurgency: soon\n" + extra + "steps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n"
}

const slowLint = ".se/tickets/slow-lint.md"

func TestTicketTodo(t *testing.T) {
	t.Run("--off takes the tag away", func(t *testing.T) {
		root := editCaseTree(t)
		seedsFile(t, root, slowLint, todoCaseTicket("open", "todo: true\n"))
		code, out, _ := runsApart(t, root, false, "ticket", "todo", "slow-lint", "--off")
		if got, _ := readsBack(t, root, slowLint); code != 0 || out != slowLint+" carries no todo, and a push takes it away from here.\n" || got != todoCaseTicket("open", "") {
			t.Fatalf("todo --off answers %d, %q, and writes %q", code, out, got)
		}
	})
	t.Run("todo reaches a tracked ticket too", func(t *testing.T) {
		root := editCaseTree(t)
		seedsFile(t, root, aThing, todoCaseTicket("open", ""))
		if code, _, _ := runsApart(t, root, false, "ticket", "todo", "a-thing"); code != 0 {
			t.Fatalf("todo answers %d", code)
		}
		if got, _ := readsBack(t, root, aThing); !strings.Contains(got, "\ntodo: true\n") {
			t.Fatalf("the ticket holds %q", got)
		}
	})
	t.Run("a closed note steps aside for the tracked ticket of its name, and an open one stands first", func(t *testing.T) {
		for state, tagged := range map[string]string{"closed": aThing, "open": ".se/tickets/a-thing.md"} {
			root := editCaseTree(t)
			seedsFile(t, root, ".se/tickets/a-thing.md", todoCaseTicket(state, ""))
			seedsFile(t, root, aThing, todoCaseTicket("open", ""))
			runsApart(t, root, false, "ticket", "todo", "a-thing")
			for _, path := range []string{aThing, ".se/tickets/a-thing.md"} {
				got, _ := readsBack(t, root, path)
				if strings.Contains(got, "\ntodo: true\n") != (path == tagged) {
					t.Errorf("with the note %s, %s holds %q", state, path, got)
				}
			}
		}
	})
	t.Run("--off reaches a ticket riding a branch, so a tag never sticks", func(t *testing.T) {
		root := editCaseTree(t)
		seedsFile(t, root, aThing, todoCaseTicket("open", "todo: true\ngroup: the-flag-parks-work\n"))
		code, _, _ := runsApart(t, root, false, "ticket", "todo", "a-thing", "--off")
		if got, _ := readsBack(t, root, aThing); code != 0 || strings.Contains(got, "\ntodo:") {
			t.Fatalf("todo --off answers %d, and writes %q", code, got)
		}
	})
	t.Run("a dry run says so, and writes nothing", func(t *testing.T) {
		root := editCaseTree(t)
		seedsFile(t, root, slowLint, todoCaseTicket("open", ""))
		code, out, _ := runsApart(t, root, true, "ticket", "todo", "slow-lint")
		if got, _ := readsBack(t, root, slowLint); code != 0 || !strings.Contains(out, "stands at todo") || got != todoCaseTicket("open", "") {
			t.Fatalf("the dry todo answers %d, %q, and writes %q", code, out, got)
		}
	})
}

// ticket todo parks a ticket for the next pull, and --off takes the tag away.
// [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	// level0: OutsideInDoors - the case writes the config into a temp root and hands the real streams, the doors' own test
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/modules/git"
)

// A ticket as ticket-todo.test.js seeds it, at the state with the extra rows. [[spec/design_input/the-agent-pulls-tickets#the-to-do-flag]]
func todoCaseTicket(state, extra string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\nurgency: soon\n" + extra + "steps:\n  - name: do\n    does: makes the change\n---\n\n# Ask\n\nA thing.\n\n# do\n\nNothing yet.\n\n# Discussion\n\nNothing yet.\n"
}

const slowLint = ".se/tickets/slow-lint.md"

func TestTicketTodo(t *testing.T) {
	t.Run("--off takes the tag away", func(t *testing.T) {
		root := editCaseTree(t)
		seedFile(t, root, slowLint, todoCaseTicket("open", "todo: true\n"))
		code, out, _ := runsApart(t, root, false, "ticket", "todo", "slow-lint", "--off")
		if got, _ := readIn(root, slowLint); code != 0 || out != slowLint+" carries no todo, and a push takes it away from here.\n" || got != todoCaseTicket("open", "") {
			t.Fatalf("todo --off answers %d, %q, and writes %q", code, out, got)
		}
	})
	t.Run("todo reaches a tracked ticket too, and a dry run says so and writes nothing", func(t *testing.T) {
		for _, dry := range []bool{false, true} {
			root := editCaseTree(t)
			seedFile(t, root, aThing, todoCaseTicket("open", ""))
			code, out, _ := runsApart(t, root, dry, "ticket", "todo", "a-thing")
			if got, _ := readIn(root, aThing); code != 0 || !strings.Contains(out, "stands at todo") || strings.Contains(got, "\ntodo: true\n") == dry {
				t.Fatalf("todo, dry %v, answers %d, %q, and the ticket holds %q", dry, code, out, got)
			}
		}
	})
	t.Run("a closed note steps aside for the tracked ticket of its name, and an open one stands first", func(t *testing.T) {
		for state, tagged := range map[string]string{"closed": aThing, "open": ".se/tickets/a-thing.md"} {
			root := editCaseTree(t)
			seedFile(t, root, ".se/tickets/a-thing.md", todoCaseTicket(state, ""))
			seedFile(t, root, aThing, todoCaseTicket("open", ""))
			runsApart(t, root, false, "ticket", "todo", "a-thing")
			for _, path := range []string{aThing, ".se/tickets/a-thing.md"} {
				got, _ := readIn(root, path)
				if strings.Contains(got, "\ntodo: true\n") != (path == tagged) {
					t.Errorf("with the note %s, %s holds %q", state, path, got)
				}
			}
		}
	})
	t.Run("--off reaches a ticket riding a branch, so a tag never sticks", func(t *testing.T) {
		root := editCaseTree(t)
		seedFile(t, root, aThing, todoCaseTicket("open", "todo: true\ngroup: the-flag-parks-work\n"))
		code, _, _ := runsApart(t, root, false, "ticket", "todo", "a-thing", "--off")
		if got, _ := readIn(root, aThing); code != 0 || strings.Contains(got, "\ntodo:") {
			t.Fatalf("todo --off answers %d, and writes %q", code, got)
		}
	})
}

// [[spec/design_input/level-two#the-size-cap]]
func TestThePullTakesItsCapAndMarginOffTheConfig(t *testing.T) {
	root := t.TempDir() // level0: FixtureOutsideHome - the case writes its own config into a root of its own
	t.Setenv(workRootVar, "")
	t.Setenv("SE_PULL_CAP", "")
	t.Setenv("SE_PULL_MARGIN", "650")
	if err := os.MkdirAll(filepath.Join(root, "spec", "config"), 0o755); err != nil {
		t.Fatal(err)
	}
	tracked := `{"pull": {"cap": 9000, "margin": 700}}`
	if err := os.WriteFile(filepath.Join(root, "spec", "config", "level0.json"), []byte(tracked), 0o644); err != nil {
		t.Fatal(err)
	}
	it, code := pullHere(func() (string, error) { return root, nil }, func(string) git.Repo { return nil }, os.Stdout, os.Stderr)
	if code != 0 {
		t.Fatalf("the pull builds with the code %d", code)
	}
	if it.CapBytes != 9000 || it.CapMargin != 650 {
		t.Fatalf("the pull carries the cap %d and the margin %d, and wants 9000 off the file and 650 off SE_PULL_MARGIN", it.CapBytes, it.CapMargin)
	}
}

// ticket new writes the bare ticket where no file stands, and leaves a
// standing one, off the roads test/level0/ticket-new.test.js covers.
// [[spec/tickets/the-sidebar-writes-through-actions]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

const newCasePath = "spec/tickets/a-new-one.md"

func TestTicketNew(t *testing.T) {
	t.Run("new writes the bare ticket where no file stands", func(t *testing.T) {
		root := editCaseTree(t)
		code, out, errs := runsApart(t, root, false, "ticket", "new", newCasePath)
		want := "---\nkind: [[ticket]]\nprocess: \"\"\n---\n\n# Ask\n"
		if got, _ := readsBack(t, root, newCasePath); code != 0 || out != newCasePath+" stands bare\n" || errs != "" || got != want {
			t.Fatalf("new answers %d, %q, %q, and writes %q", code, out, errs, got)
		}
	})
	t.Run("new writes a private one under a folder nothing holds yet", func(t *testing.T) {
		root := editCaseTree(t)
		if code, _, _ := runsApart(t, root, false, "ticket", "new", ".se/tickets/mine.md"); code != 0 {
			t.Fatalf("new answers %d", code)
		}
		if _, stands := readsBack(t, root, ".se/tickets/mine.md"); !stands {
			t.Fatal("the private ticket stands nowhere")
		}
	})
	t.Run("a ticket standing keeps what it holds, and new says nothing", func(t *testing.T) {
		root := editCaseTree(t)
		standing := "---\nkind: [[ticket]]\nprocess: [[spec/processes/trivial]]\n---\n\n# Ask\n\nA line the owner wrote.\n"
		seedsFile(t, root, newCasePath, standing)
		code, out, errs := runsApart(t, root, false, "ticket", "new", newCasePath)
		if got, _ := readsBack(t, root, newCasePath); code != 0 || out != "" || errs != "" || got != standing {
			t.Fatalf("new answers %d, %q, %q, and writes %q", code, out, errs, got)
		}
	})
	t.Run("new refuses a path naming no ticket", func(t *testing.T) {
		root := editCaseTree(t)
		for _, argv := range [][]string{{"ticket", "new"}, {"ticket", "new", "spec/a.md"}, {"ticket", "new", "spec/tickets/Big.md"}} {
			code, out, errs := runsApart(t, root, false, argv...)
			if code != 2 || out != "" || errs != "ticket new needs a ticket path: ./RUNME.sh ticket new spec/tickets/slow-lint.md\n" {
				t.Errorf("%v answers %d, %q, %q", argv, code, out, errs)
			}
		}
	})
	t.Run("a dry run says so, and writes nothing", func(t *testing.T) {
		root := editCaseTree(t)
		code, out, _ := runsApart(t, root, true, "ticket", "new", newCasePath)
		if _, stands := readsBack(t, root, newCasePath); code != 0 || out != newCasePath+" stands bare\n" || stands {
			t.Fatalf("the dry new answers %d, %q, and writes", code, out)
		}
	})
}

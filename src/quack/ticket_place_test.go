// ticket place writes the override the work tab writes into the plan file,
// off the rows the index answers.
// [[spec/tickets/view-actions-run-through-verbs]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/index"
	"quackitect/src/modules/work"
	"quackitect/src/q"
)

// A door holding work/rows as the case seeds it, and the V1 answering its base. [[spec/tickets/view-actions-run-through-verbs]]
func rowsIndex(t *testing.T, rows []work.Row) func() (string, error) {
	t.Helper()
	root := t.TempDir()
	c := q.New()
	hand := q.OutIn(c, placeRows, []work.Row{}, q.Doc("the rows as the case seeds them"))
	seeds := func(_ string, commit index.Commit) (func(), error) {
		return func() {}, commit(hand, map[string]any{placeRows: rows})
	}
	stop, _, err := index.Serve(wall, root, filepath.Join(t.TempDir(), "index.db"), c, seeds)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(stop)
	base := hq3V1Of(t, root)
	return func() (string, error) { return base, nil }
}

// Three loose tickets, a todo row past them, and a standing branch with two children. [[spec/tickets/view-actions-run-through-verbs]]
var placeCaseRows = []work.Row{
	{Name: "g", Kind: "group"},
	{Name: "k1", Kind: "ticket", Group: "g", Queue: "1", Path: "spec/tickets/k1.md"},
	{Name: "k2", Kind: "ticket", Group: "g", Queue: "2", Path: "spec/tickets/k2.md"},
	{Name: "a", Kind: "ticket", Queue: "1", Path: "spec/tickets/a.md"},
	{Name: "b", Kind: "ticket", Queue: "2", Path: "spec/tickets/b.md"},
	{Name: "c", Kind: "group", Queue: "3", Path: "spec/tickets/c.md"},
	{Name: "d", Kind: "ticket", Group: "c", Queue: "4", Todo: true, Path: "spec/tickets/d.md"},
}

const planCase = ".se/.runtime/plan.json"

// Runs place over a tree and the seeded rows, and answers its code, its stdout and its stderr apart. [[spec/tickets/view-actions-run-through-verbs]]
func runsPlace(t *testing.T, root string, v1 func() (string, error), dry bool, words ...string) (int, string, string) {
	t.Helper()
	t.Setenv(workRootVar, "")
	var out, errs strings.Builder
	code := ticketPlace(func() (string, error) { return root, nil }, v1)(append([]string{"ticket", "place"}, words...), dry, &out, &errs)
	return code, out.String(), errs.String()
}

func TestTicketPlace(t *testing.T) {
	v1 := rowsIndex(t, placeCaseRows)
	t.Run("place writes the value into the plan file, off the siblings the queue answers", func(t *testing.T) {
		root := t.TempDir()
		code, out, errs := runsPlace(t, root, v1, false, "b", "1")
		if got, _ := readsBack(t, root, planCase); code != 0 || out != "b takes place 1 once the queue reads it.\n" || errs != "" || got != "{\n  \"places\": {\n    \"b\": \"true\"\n  }\n}\n" {
			t.Fatalf("place answers %d, %q, %q, and writes %q", code, out, errs, got)
		}
	})
	t.Run("a loose ticket's level holds every root, its group's children among them", func(t *testing.T) {
		root := t.TempDir()
		seedsFile(t, root, planCase, `{"working":"w","places":{"x":"last"}}`)
		code, out, _ := runsPlace(t, root, v1, false, "a", "4")
		want := "{\n  \"working\": \"w\",\n  \"places\": {\n    \"x\": \"last\",\n    \"a\": \"last\"\n  }\n}\n"
		if got, _ := readsBack(t, root, planCase); code != 0 || out != "a takes place 4 once the queue reads it.\n" || got != want {
			t.Fatalf("place answers %d, %q, and writes %q", code, out, got)
		}
	})
	t.Run("a branch's child places among its siblings", func(t *testing.T) {
		root := t.TempDir()
		code, _, errs := runsPlace(t, root, v1, false, "k1", "2")
		if got, _ := readsBack(t, root, planCase); code != 0 || !strings.Contains(got, `"k1": "last"`) {
			t.Fatalf("place answers %d, %q, and writes %q", code, errs, got)
		}
		code, _, errsOut := runsPlace(t, root, v1, false, "k1", "3")
		if code != 2 || errsOut != "the places at this level end at 2, so no row stands at 3\n" {
			t.Fatalf("a place past the branch's end answers %d, %q", code, errsOut)
		}
	})
	t.Run("the same place again takes a todo off", func(t *testing.T) {
		root := t.TempDir()
		seedsFile(t, root, planCase, `{"places":{"d":"true"}}`)
		code, _, _ := runsPlace(t, root, v1, false, "d", "4")
		if got, _ := readsBack(t, root, planCase); code != 0 || got != "{\n  \"places\": {}\n}\n" {
			t.Fatalf("place answers %d, and writes %q", code, got)
		}
	})
	t.Run("place refuses, and writes nothing", func(t *testing.T) {
		for _, one := range []struct {
			argv []string
			want string
		}{
			{[]string{"nowhere", "2"}, "nowhere stands in no row of the queue."},
			{[]string{"b", "2"}, "b stands at 2 already"},
			{[]string{"b", "0"}, placeNeeds},
			{[]string{"b", "10"}, placeNeeds},
			{[]string{"b", "1.5"}, placeNeeds},
			{[]string{"b", "two"}, placeNeeds},
			{[]string{"b"}, placeNeeds},
			{[]string{"b", ""}, placeNeeds},
			{[]string{}, placeNeeds},
		} {
			root := t.TempDir()
			code, out, errs := runsPlace(t, root, v1, false, one.argv...)
			if _, stands := readsBack(t, root, planCase); code != 2 || out != "" || errs != one.want+"\n" || stands {
				t.Errorf("%v answers %d, %q, %q", one.argv, code, out, errs)
			}
		}
	})
	t.Run("a place reads as Number reads it", func(t *testing.T) {
		code, out, _ := runsPlace(t, t.TempDir(), v1, false, "b", "01")
		if code != 0 || out != "b takes place 1 once the queue reads it.\n" {
			t.Fatalf("place 01 answers %d, %q", code, out)
		}
	})
	t.Run("a dry run says so, and writes nothing", func(t *testing.T) {
		root := t.TempDir()
		code, out, _ := runsPlace(t, root, v1, true, "b", "1")
		if _, stands := readsBack(t, root, planCase); code != 0 || out != "b takes place 1 once the queue reads it.\n" || stands {
			t.Fatalf("the dry place answers %d, %q, and writes", code, out)
		}
	})
	t.Run("the registry refuses a place out of range before it asks the index", func(t *testing.T) {
		code, out, errs := runsApart(t, t.TempDir(), false, "ticket", "place", "b", "12")
		if code != 2 || out != "" || errs != placeNeeds+"\n" {
			t.Fatalf("place 12 answers %d, %q, %q", code, out, errs)
		}
	})
}

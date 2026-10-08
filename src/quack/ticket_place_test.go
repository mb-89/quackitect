// ticket place writes the override the work tab writes into the plan file,
// off the rows the index answers.
// [[spec/tickets/view-actions-run-through-verbs]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"strings"
	"testing"

	"quackitect/src/modules/work"
	"quackitect/src/q"
)

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
	v1 := seededTree(t, placeRows, []work.Row{}, placeCaseRows)
	t.Run("place writes the value into the plan file, off the siblings the queue answers, a place reads as Number reads it, and a dry run writes nothing", func(t *testing.T) {
		for _, one := range []struct {
			dry         bool
			place, want string
		}{{false, "1", "{\n  \"places\": {\n    \"b\": \"true\"\n  }\n}\n"}, {false, "01", "{\n  \"places\": {\n    \"b\": \"true\"\n  }\n}\n"}, {true, "1", ""}} {
			root := t.TempDir()
			code, out, errs := runsPlace(t, root, v1, one.dry, "b", one.place)
			if got, _ := readIn(root, planCase); code != 0 || out != "b takes place 1 once the queue reads it.\n" || errs != "" || got != one.want {
				t.Fatalf("place %s answers %d, %q, %q, and writes %q", one.place, code, out, errs, got)
			}
		}
	})
	t.Run("a loose ticket's level holds every root, its group's children among them", func(t *testing.T) {
		root := t.TempDir()
		seedFile(t, root, planCase, `{"working":"w","places":{"x":"last"}}`)
		code, out, _ := runsPlace(t, root, v1, false, "a", "4")
		want := "{\n  \"working\": \"w\",\n  \"places\": {\n    \"x\": \"last\",\n    \"a\": \"last\"\n  }\n}\n"
		if got, _ := readIn(root, planCase); code != 0 || out != "a takes place 4 once the queue reads it.\n" || got != want {
			t.Fatalf("place answers %d, %q, and writes %q", code, out, got)
		}
	})
	t.Run("a branch's child places among its siblings", func(t *testing.T) {
		root := t.TempDir()
		code, _, errs := runsPlace(t, root, v1, false, "k1", "2")
		if got, _ := readIn(root, planCase); code != 0 || !strings.Contains(got, `"k1": "last"`) {
			t.Fatalf("place answers %d, %q, and writes %q", code, errs, got)
		}
		code, _, errsOut := runsPlace(t, root, v1, false, "k1", "3")
		if code != 2 || errsOut != "the places at this level end at 2, so no row stands at 3\n" {
			t.Fatalf("a place past the branch's end answers %d, %q", code, errsOut)
		}
	})
	t.Run("the same place again takes a todo off", func(t *testing.T) {
		root := t.TempDir()
		seedFile(t, root, planCase, `{"places":{"d":"true"}}`)
		code, _, _ := runsPlace(t, root, v1, false, "d", "4")
		if got, _ := readIn(root, planCase); code != 0 || got != "{\n  \"places\": {}\n}\n" {
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
			if _, stands := readIn(root, planCase); code != 2 || out != "" || errs != one.want+"\n" || stands {
				t.Errorf("%v answers %d, %q, %q", one.argv, code, out, errs)
			}
		}
	})
	t.Run("the registry refuses a place out of range before it asks the index", func(t *testing.T) {
		code, out, errs := runsApart(t, t.TempDir(), false, "ticket", "place", "b", "12")
		if code != 2 || out != "" || errs != placeNeeds+"\n" {
			t.Fatalf("place 12 answers %d, %q, %q", code, out, errs)
		}
	})
}

// The minute the case stands at, and the seconds of a day. [[spec/design_output/pull#the-queue-is-a-score]]
const (
	caseMinute = int64(29_000_000)
	aDay       = int64(86400)
)

// Two open tickets tie on every term but their age. The name puts a-new first, and the day it stood puts b-old first, as the verb's program orders them. [[spec/design_output/pull#the-queue-is-a-score]]
func TestTheWiredQueueWeighsTheDaysATicketStood(t *testing.T) {
	t.Parallel()
	all := treeWiring(t)
	w := q.Wiring{Wires: all.Wires}
	for _, one := range all.Instances {
		if one.Module == "tickets" || one.Module == "queue" || one.Module == "work" {
			w.Instances = append(w.Instances, one)
		}
	}
	c := q.New()
	files := q.OutIn(c, "files/<path...>", q.Content{}, q.Doc("a file"))
	minute := q.OutIn(c, "clock/minute", int64(0), q.Doc("the minute"))
	resolved := q.OutIn(c, q.ResolvedName, q.Resolved{}, q.Doc("the config values"))
	stood := q.OutIn(c, stoodName, map[string]int64{}, q.Doc("the second each ticket path came in"))
	noTips(c)
	if _, err := load(w, c); err != nil {
		t.Fatal(err)
	}
	s := q.NewStore(c)
	now := caseMinute * 60
	open := q.Content{Hash: "open", Text: "---\nkind: [[ticket]]\nstate: open\n---\n\n# Ask\n\nA thing.\n"}
	for _, seed := range []struct {
		hand   q.Writer
		values map[string]any
	}{
		{files, map[string]any{"files/spec/tickets/a-new.md": open, "files/spec/tickets/b-old.md": open}},
		{minute, map[string]any{"clock/minute": caseMinute}},
		{resolved, map[string]any{q.ResolvedName: q.Resolved{"queue/config/block": "10", "queue/config/day": "1", "queue/config/fail": "5"}}},
		{stood, map[string]any{stoodName: map[string]int64{"spec/tickets/a-new.md": now - 60, "spec/tickets/b-old.md": now - 3*aDay}}},
	} {
		if _, err := s.Commit(0, seed.hand, seed.values); err != nil {
			t.Fatal(err)
		}
	}
	for _, name := range []string{"tickets/all", "tickets/branched", "tickets/branches", "tickets/cloud", "queue/config/block", "queue/config/day", "queue/config/fail", "queue/places"} {
		if err := s.Run(name); err != nil {
			t.Fatalf("the run of %s answers %v", name, err)
		}
	}
	if said, _ := s.Snapshot().Read("queue/places").(map[string]string); said["b-old"] != "1" || said["a-new"] != "2" {
		t.Fatalf("queue/places reads %v, and wants b-old at 1 and a-new at 2", said)
	}
}

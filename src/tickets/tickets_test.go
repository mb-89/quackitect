// The one reading of a ticket: its Ask, its held rule, its fields and the
// standing a child reads off its group.
// [[spec/tickets/the-tickets-topic-lands]]
package tickets

import (
	"reflect"
	"testing"

	"quackitect/src/q"
)

const heldGroup = `---
kind: [[ticket]]
state: open
urgent: true
process: [[spec/processes/group]]
step: children
record:
  - step: sync
    hand: box one
    hash_before: aaa
    hash_after: bbb
  - step: children
    hand: box one
    hash_before: bbb
---

# Ask

<!-- goal, as text: what these tickets add up to -->
Two tickets that land as one.

# children
`

func TestAskDropsComments(t *testing.T) {
	text := "---\nkind: [[ticket]]\n---\n\n# Ask\n\nline one\n<!-- one row -->\nline two\n<!--\nmany rows\n-->\nline three\n\n# design\n\nnot the ask\n"
	if said := Ask(text); said != "line one\nline two\nline three" {
		t.Fatalf("the Ask reads %q", said)
	}
}

func TestAskReadsFencesAsText(t *testing.T) {
	text := "---\nkind: [[ticket]]\n---\n\n# Ask\n\nsays\n\n```\n# no heading\n```\n\nafter\n\n## sub\n\nnot the ask\n"
	if said := Ask(text); said != "says\n\n```\n# no heading\n```\n\nafter" {
		t.Fatalf("the Ask reads %q", said)
	}
}

func TestHeldReadsTheLastOpenItem(t *testing.T) {
	cases := map[string]bool{
		"---\nstate: open\nrecord:\n  - step: sync\n    hash_before: aaa\n    hash_after: bbb\n---\n":                        false,
		"---\nstate: open\nsteps:\n  - name: do\n---\n":                                                                      false,
		"---\nrecord:\n  - step: sync\n    hash_before: aaa\nurgent: true\n---\n":                                            true,
		"---\nrecord:\n  - step: sync\n    hash_before: aaa\n  - step: do\n    hash_before: bbb\n    hash_after: ccc\n---\n": false,
		heldGroup: true,
	}
	for text, want := range cases {
		if Held(text) != want {
			t.Errorf("held reads %v over %q", !want, text)
		}
	}
}

func TestOfReadsTheFront(t *testing.T) {
	said := Of("spec/tickets/grows.md", "grows", heldGroup, 7)
	want := Ticket{
		Name: "grows", Path: "spec/tickets/grows.md", State: "open", Step: "children",
		Route: "group", Urgent: true, Standing: StandingHeld,
		Says: "Two tickets that land as one.", Changed: 7,
	}
	if !reflect.DeepEqual(said, want) {
		t.Fatalf("the ticket reads %#v", said)
	}
	loose := Of(".se/tickets/parked.md", "parked", "---\nkind: [[ticket]]\ntodo: \"grows\"\n---\n\n# Ask\n\nlater\n", 1)
	if loose.State != "open" || !loose.Todo || loose.Standing != "" {
		t.Fatalf("a loose ticket reads %#v", loose)
	}
}

func TestChildReadsItsGroup(t *testing.T) {
	child := Of("spec/tickets/one.md", "one", "---\nkind: [[ticket]]\nstate: open\ngroup: grows\n---\n", 1)
	closed := Of("spec/tickets/done.md", "done", "---\nkind: [[ticket]]\nstate: closed\nprocess: [[group]]\n---\n", 1)
	late := Of("spec/tickets/two.md", "two", "---\nkind: [[ticket]]\ngroup: done\n---\n", 1)
	said := All([]Ticket{child, Of("spec/tickets/grows.md", "grows", heldGroup, 1), closed, late})
	if said[0].Standing != StandingHeld || said[2].Standing != StandingDone || said[3].Standing != StandingDone {
		t.Fatalf("the standings read %q, %q and %q", said[0].Standing, said[2].Standing, said[3].Standing)
	}
}

func TestPathTakesTheTwoFoldersAlone(t *testing.T) {
	cases := map[string]bool{
		"spec/tickets/one.md":                    true,
		".se/tickets/two.md":                     true,
		"spec/tickets/deeper/three.md":           false,
		".claude/worktrees/spec/tickets/four.md": false,
	}
	for rel, want := range cases {
		if Path(rel) != want {
			t.Errorf("%s reads %v", rel, !want)
		}
	}
}

func TestRegistersTakeTheCatalogServeTakes(t *testing.T) {
	catalog := q.New()
	Registers(catalog)
	store := q.NewStore(catalog, nil)
	if _, err := store.Commit(0, map[string]any{AllName: []Ticket{{Name: "one"}}}); err != nil {
		t.Fatal(err)
	}
	if said, _ := store.Snapshot().Read(AllName).([]Ticket); len(said) != 1 || said[0].Name != "one" {
		t.Fatalf("%s reads %#v", AllName, said)
	}
}

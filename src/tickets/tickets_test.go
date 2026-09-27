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

// [[spec/tickets/the-queue-moves-to-plan]]
func TestOfReadsTheWaitsAndTheFails(t *testing.T) {
	flow := "---\nstate: open\ndepends_on: [a-first, \"a-second\"]\nrecord:\n  - step: do\n    returns: 2\n  - step: do\n    returns: 0\n  - step: review\n    returns: 1\n---\n"
	one := Of("spec/tickets/one.md", "one", flow, 0)
	if want := []string{"a-first", "a-second"}; !reflect.DeepEqual(one.DependsOn, want) {
		t.Errorf("the waits read %v, and want %v", one.DependsOn, want)
	}
	if one.Fails != 2 {
		t.Errorf("the fails read %d, and two hand-backs carry returns", one.Fails)
	}
	block := "---\nstate: open\ndepends_on:\n  - one\n  - two, three\n---\n"
	if said := Of("spec/tickets/two.md", "two", block, 0).DependsOn; !reflect.DeepEqual(said, []string{"one", "two", "three"}) {
		t.Errorf("the waits read %v off a list, and a comma splits a line", said)
	}
}

// [[spec/tickets/the-queue-moves-to-plan]]
func TestAReturnsReadingNoNumberCountsNoFail(t *testing.T) {
	text := "---\nstate: open\nrecord:\n  - step: do\n    returns: soon\n  - step: do\n    returns: 1\n---\n"
	if said := Of("spec/tickets/one.md", "one", text, 0).Fails; said != 1 {
		t.Fatalf("the fails read %d, and one returns reads as a number", said)
	}
}

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

func TestHeldReadsAnyOpenItem(t *testing.T) {
	cases := map[string]bool{
		"---\nstate: open\nrecord:\n  - step: sync\n    hash_before: aaa\n    hash_after: bbb\n---\n":                        false,
		"---\nstate: open\nsteps:\n  - name: do\n---\n":                                                                      false,
		"---\nrecord:\n  - step: sync\n    hash_before: aaa\nurgent: true\n---\n":                                            true,
		"---\nrecord:\n  - step: sync\n    hash_before: aaa\n  - step: do\n    hash_before: bbb\n    hash_after: ccc\n---\n": true,
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
	all := Registers(catalog)
	store := q.NewStore(catalog, nil)
	if _, err := store.Commit(0, all, map[string]any{AllName: []Ticket{{Name: "one"}}}); err != nil {
		t.Fatal(err)
	}
	if said, _ := store.Snapshot().Read(AllName).([]Ticket); len(said) != 1 || said[0].Name != "one" {
		t.Fatalf("%s reads %#v", AllName, said)
	}
}

// A note keeps its state, and its route says what it is, which the tab draws as a letter. [[spec/design_output/tree-view#a-flag-draws-a-letter]]
func TestANoteKeepsItsStateAndNamesItsRoute(t *testing.T) {
	said := Of(".se/tickets/parked.md", "parked", "---\nkind: [[ticket]]\nstate: open\nprocess: [[note]]\n---\n\n# Ask\n\nA thought.\n", 1)
	if said.State != openState || said.Route != "note" {
		t.Fatalf("a note reads open on the route note, and reads %+v", said)
	}
}

// A todo names the row the ticket stands before, or reads true, and either lights the flag. [[spec/design_output/pull#the-queue-is-an-outline]]
func TestATodoNamingARowLightsTheFlag(t *testing.T) {
	for said, want := range map[string]bool{"true": true, "a-loose-one": true, `"a-loose-one"`: true, "false": false, "": false} {
		one := Of("spec/tickets/one.md", "one", "---\nkind: [[ticket]]\ntodo: "+said+"\n---\n", 1)
		if one.Todo != want {
			t.Errorf("todo %q reads %v", said, one.Todo)
		}
	}
}

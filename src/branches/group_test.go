// The group reads: the front, the record, the step, the ask and the spans.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported group readers: fieldOf, spanOf, stepOf, aged, groupStanding and the with editors

import (
	"slices"
	"strings"
	"testing"

	"quackitect/src/front"
)

// A field reads bare of its link, and a group reads off its route's last name. [[spec/design_output/work#a-group-is-a-ticket]]
func TestAFieldReadsBareAndAGroupReadsOffItsRoute(t *testing.T) {
	t.Parallel()
	if fieldOf(groupNote, "process") != "spec/processes/group" {
		t.Fatalf("the process reads %q", fieldOf(groupNote, "process"))
	}
	if !isGroup(groupNote) || isGroup(childNote) {
		t.Fatal("the group reads as a group, and the child reads as none")
	}
	if askOf(groupNote) != "The group's ask." || stepOf(childNote) != "build" {
		t.Fatalf("the ask reads %q and the step %q", askOf(groupNote), stepOf(childNote))
	}
}

// A take writes the open record row, a hash after closes it, and every take closes at a release. [[spec/design_output/work#held-derives-from-the-record]]
func TestATakeHoldsUntilItsHashAfterLands(t *testing.T) {
	t.Parallel()
	taken := withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box one"}, {Key: "hash_before", Value: "abc"}})
	take := heldIn(taken)
	if take == nil || take.Hand != "box one" || take.HashBefore != "abc" {
		t.Fatalf("the take holds %+v", take)
	}
	if heldIn(withEveryTakeClosed(taken, "def")) != nil {
		t.Fatal("a release leaves a take open")
	}
	if groupStanding(taken) != held || groupStanding(groupNote) != todo || groupStanding(withField(groupNote, "state", closedState)) != done {
		t.Fatal("the standings read apart from the record")
	}
}

// A group is the ticket on the group route alone, and a missing field reads empty. [[spec/design_output/work#a-group-is-a-ticket]]
func TestAGroupIsTheTicketOnTheGroupRouteAlone(t *testing.T) {
	t.Parallel()
	for _, text := range []string{strings.Replace(groupNote, "process: [[spec/processes/group]]\n", "", 1), ""} {
		if isGroup(text) {
			t.Fatalf("a ticket off the group route reads as a group:\n%s", text)
		}
	}
	if fieldOf(groupNote, "group") != "" || ticketAt("a-group") != "spec/tickets/a-group.md" {
		t.Fatalf("the missing field reads %q and the ticket stands at %q", fieldOf(groupNote, "group"), ticketAt("a-group"))
	}
}

// A ticket with no step stands at the first leaf of its route, its path joined by slashes. [[spec/design_output/work#the-take-writes-the-record]]
func TestTheStepWithNoneIsTheFirstLeafOfTheRoute(t *testing.T) {
	t.Parallel()
	cases := map[string]string{
		strings.Replace(groupNote, "step: children\n", "", 1):                         "children",
		"---\nsteps:\n  - name: a\n    steps:\n      - name: one\n  - name: b\n---\n": "a/one",
		"---\nsteps: []\n---\n":                     "",
		withField(groupNote, "step", "retro/write"): "retro/write",
	}
	for text, want := range cases {
		if said := stepOf(text); said != want {
			t.Errorf("the step reads %q, not %q, off\n%s", said, want, text)
		}
	}
}

// The newest open take holds, a hand-back past it leaves the claim standing, and the release closes the take alone. [[spec/design_output/work#held-derives-from-the-record]]
func TestAReleaseClosesTheOpenTakeAndLeavesTheRowsPastIt(t *testing.T) {
	t.Parallel()
	took := withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box one"}, {Key: "hash_before", Value: "a1"}})
	skipped := withEntry(took, front.Ordered{{Key: "step", Value: "children"}, {Key: "skipped", Value: true}, {Key: "why", Value: "the box runs off the cloud"}})
	ran := withEntry(skipped, front.Ordered{{Key: "step", Value: "split"}, {Key: "hand", Value: "box one"}, {Key: "hash_before", Value: "a1"}, {Key: "hash_after", Value: "b2"}})
	if take := heldIn(ran); take == nil || take.Step != "children" || take.Hand != "box one" {
		t.Fatalf("the claim reads %+v past a hand-back", take)
	}
	gave := withHashAfter(ran, "ff")
	after := []string{}
	for _, row := range recordIn(gave) {
		after = append(after, entryField(row, "hash_after"))
	}
	if heldIn(gave) != nil || !slices.Equal(after, []string{"ff", "", "b2"}) {
		t.Fatalf("the release leaves hashes after %v", after)
	}
	again := withEntry(gave, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box two"}, {Key: "hash_before", Value: "c3"}})
	if take := heldIn(again); take == nil || take.Hand != "box two" {
		t.Fatalf("the newest take reads %+v", take)
	}
}

// Closing every take shuts each open row a merge left, keeps a closed row between them, and a free group stays as it stands. [[spec/design_output/work#held-derives-from-the-record]]
func TestClosingEveryTakeShutsEachOpenRowAndKeepsAClosedOne(t *testing.T) {
	t.Parallel()
	one := withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box one"}, {Key: "hash_before", Value: "a1"}})
	done := withEntry(one, front.Ordered{{Key: "step", Value: "split"}, {Key: "hand", Value: "box one"}, {Key: "hash_before", Value: "a1"}, {Key: "hash_after", Value: "b2"}})
	both := withEntry(done, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box two"}, {Key: "hash_before", Value: "d4"}})
	shut := withEveryTakeClosed(both, "ff")
	after := []string{}
	for _, row := range recordIn(shut) {
		after = append(after, entryField(row, "hash_after"))
	}
	if heldIn(shut) != nil || !slices.Equal(after, []string{"ff", "b2", "ff"}) {
		t.Fatalf("closing every take leaves hashes after %v", after)
	}
	if withEveryTakeClosed(shut, "ee") != shut {
		t.Fatal("a second close changes a free group")
	}
}

// A ticket loses its group, the route under it stands, and a second drop changes nothing. [[spec/design_output/work#the-merge-frees-the-tickets]]
func TestAGroupDropLeavesTheRouteStanding(t *testing.T) {
	t.Parallel()
	child := strings.Replace(childNote, "step: build\n", "", 1)
	loose := withoutField(child, groupField)
	if fieldOf(loose, groupField) != "" || fieldOf(loose, "state") != openState || stepOf(loose) != "build" {
		t.Fatalf("the drop leaves\n%s", loose)
	}
	if withoutField(loose, groupField) != loose {
		t.Fatal("a second drop changes the ticket")
	}
}

// A todo reads as nothing, as first for a bare tag, or as the row it stands before. [[spec/design_output/pull#the-queue-is-an-outline]]
func TestATodoReadsAsNothingFirstOrTheRowItNames(t *testing.T) {
	t.Parallel()
	cases := map[string]string{
		"":                    "",
		"todo: false\n":       "",
		"todo: \"false\"\n":   "",
		"todo: true\n":        "first",
		"todo: \"true\"\n":    "first",
		"todo: a-loose-one\n": "a-loose-one",
		"todo: \" last \"\n":  "last",
	}
	for rows, want := range cases {
		if said := todoOf(frontOf("---\nstate: open\n" + rows + "---\n")); said != want {
			t.Errorf("the todo off %q reads %q, not %q", rows, said, want)
		}
	}
}

// A span names minutes, hours or days, and an age reads in its largest unit. [[spec/design_output/work#a-stale-group-is-yours]]
func TestASpanAndAnAgeReadInTheirUnits(t *testing.T) {
	t.Parallel()
	if spanOf("12h") != 12*hour || spanOf("3d") != 3*day || spanOf("soon") != 0 {
		t.Fatal("the spans read apart")
	}
	if aged(59) != "0m" || aged(2*hour) != "2h" || aged(3*day+5) != "3d" {
		t.Fatal("the ages read apart")
	}
}

// A dependency list drops its brackets, its quotes and the branch prefix. [[spec/design_output/work#the-mark-and-what-waits]]
func TestADependencyReadsBare(t *testing.T) {
	t.Parallel()
	text := "---\ndepends_on: [\"work/a\", b]\n---\n"
	if got := dependsOnText(text); !slices.Equal(got, []string{"a", "b"}) {
		t.Fatalf("the waits read %v", got)
	}
	listed := "---\ndepends_on:\n  - c\n  - 'd'\nstate: open\n---\n"
	if got := dependsOnText(listed); !slices.Equal(got, []string{"c", "d"}) {
		t.Fatalf("the listed waits read %v", got)
	}
}

// A hash_after reading false leaves the take open, as JavaScript reads the field. [[spec/tickets/shared-helpers-stand-once]]
func TestAHashAfterReadingFalseLeavesTheTakeOpen(t *testing.T) {
	t.Parallel()
	taken := withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box one"}, {Key: "hash_before", Value: "abc"}, {Key: "hash_after", Value: "false"}})
	if take := heldIn(taken); take == nil || take.HashBefore != "abc" {
		t.Fatalf("the take holds %+v", take)
	}
}

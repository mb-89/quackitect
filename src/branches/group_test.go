// The group reads: the front, the record, the step, the ask and the spans.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"slices"
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

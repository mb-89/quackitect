// The fleet routine the trigger names, and the pull request event the route
// hands to the box that holds its branch.
// [[spec/tickets/one-routine-checks-the-fleet]]
package branches // level0: InPackageTest - it drives the unexported fleet routine parts fleetPrompt, fleetRoutineKey and pullRouteOf

import (
	"testing"

	"quackitect/src/front"
)

// A group held by a box whose take names its session. [[spec/tickets/one-routine-checks-the-fleet]]
func routineHeld(session string) string {
	return withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box 9e1f"}, {Key: "hash_before", Value: "a1b2c3"}, {Key: "session", Value: session}})
}

// Runs the cloud verb over the tree, and answers its code. [[spec/tickets/one-routine-checks-the-fleet]]
func (one *tree) cloudSays(argv ...string) int {
	one.out.Reset()
	one.errs.Reset()
	return Cloud(one.d, argv)
}

func TestTriggerNamesTheStoredFleetRoutineAndItsPrompt(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.d.Config = func(key string) any {
		if key == fleetRoutineKey {
			return "trig_fleet"
		}
		return nil
	}
	if code := one.cloudSays("trigger"); code != codeOK {
		t.Fatalf("cloud trigger answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), fleetRoutineName+" checks the fleet on its schedule")
	holds(t, one.out.String(), "action=run  trigger_id=trig_fleet")
	holds(t, one.out.String(), fleetPrompt)
}

func TestTriggerSaysWhereNoFleetRoutineStands(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.cloudSays("trigger"); code != codeOK {
		t.Fatalf("cloud trigger answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "No "+fleetRoutineName+" id stands under "+fleetRoutineKey)
	holds(t, one.out.String(), fleetPrompt)
}

func TestAPullRequestEventRoutesToTheBoxThatHoldsItsBranch(t *testing.T) {
	t.Parallel()
	rows := fleetRows([]stand{
		{ref: ref{Branch: "work/other"}, Name: "other", Ticket: routineHeld("cse_other")},
		{ref: ref{Branch: "work/g"}, Name: "g", Ticket: routineHeld("cse_holder")},
	}, map[string]string{"work/other": held, "work/g": held})
	if said := pullRouteOf("work/g", rows); said != "cse_holder" {
		t.Fatalf("the event on work/g routes to %q", said)
	}
}

func TestAPullRequestEventOnAFreeBranchRoutesToNoBox(t *testing.T) {
	t.Parallel()
	rows := fleetRows([]stand{{ref: ref{Branch: "work/g"}, Name: "g", Ticket: routineHeld("cse_gone")}}, map[string]string{"work/g": todo})
	if said := pullRouteOf("work/g", rows); said != "" {
		t.Fatalf("the event on a free branch routes to %q", said)
	}
	if said := pullRouteOf("work/none", rows); said != "" {
		t.Fatalf("the event on no branch routes to %q", said)
	}
}

func TestRouteReadsTheEventFile(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): routineHeld("cse_holder")})
	if err := one.disk.Write(".se/event.json", `{"action":"synchronize","pull_request":{"number":7,"head":{"ref":"work/g"}}}`); err != nil {
		t.Fatal(err)
	}
	one.d.Env["GITHUB_EVENT_PATH"] = ".se/event.json"
	if code := one.cloudSays("route"); code != codeOK {
		t.Fatalf("cloud route answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "work/g goes to session cse_holder")
}

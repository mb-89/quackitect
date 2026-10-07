// The fleet rows: one a work branch, off the record its group carries.
// [[spec/tickets/boxes-write-their-final-record]]
package branches

import (
	"slices"
	"testing"
	"time"

	"quackitect/src/front"
	"quackitect/src/modules/git"
)

// The idle span in seconds the wake cases read. [[spec/tickets/the-fleet-verb-watches-boxes]]
const fleetIdle = 30 * 60

// Fails where the wakes differ from the ones named. [[spec/tickets/the-fleet-verb-watches-boxes]]
func wakesAre(t *testing.T, rows []boxRow, want ...wake) {
	t.Helper()
	if said := wakesOf(rows, fleetIdle); !slices.Equal(said, want) {
		t.Fatalf("the wakes read %+v, not %+v", said, want)
	}
}

func TestAnIdleBoxRaisesAWake(t *testing.T) {
	t.Parallel()
	wakesAre(t, []boxRow{{Branch: "work/a", Standing: held, AgeSeconds: fleetIdle + 60}}, wake{Branch: "work/a", Why: wakeIdle})
}

func TestAStoppedBoxRaisesAWake(t *testing.T) {
	t.Parallel()
	wakesAre(t, []boxRow{
		{Branch: "work/a", Standing: done},
		{Branch: "work/b", Standing: done, Pull: "#7"},
	}, wake{Branch: "work/a", Why: wakeStopped})
}

func TestAFailedBoxRaisesAWake(t *testing.T) {
	t.Parallel()
	wakesAre(t, []boxRow{
		{Branch: "work/a", Standing: todo, Final: "The box stops short: the check stays red."},
		{Branch: "work/b", Standing: todo},
	}, wake{Branch: "work/a", Why: wakeFailed})
}

func TestABusyBoxRaisesNoWake(t *testing.T) {
	t.Parallel()
	wakesAre(t, []boxRow{
		{Branch: "work/a", Standing: held, AgeSeconds: fleetIdle - 60},
		{Branch: "work/b", Standing: merged},
	})
}

// A held branch pushed at the date, with a pull request on its tip, and the box's session on its take. [[spec/tickets/the-fleet-verb-watches-boxes]]
func fleetTree(t *testing.T, date string) *tree {
	t.Helper()
	one := newTree(t, nil)
	at, err := time.Parse(time.RFC3339, date)
	one.must(err)
	one.branchAt("g", map[string]string{ticketAt("g"): withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box 9e1f"}, {Key: "hash_before", Value: "a1b2c3"}, {Key: "session", Value: "cse_holder"}})}, at)
	one.pushAt("origin/work/g", "refs/pull/7/head")
	return one
}

func TestFleetListsEachBranchWithTipAgeHolderAndPullRequest(t *testing.T) {
	t.Parallel()
	one := fleetTree(t, "2026-01-02T02:54:05Z")
	if code := one.cloudSays("fleet"); code != codeOK {
		t.Fatalf("cloud fleet answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	tip := shortOf(one.rev("origin/work/g"))
	for _, said := range []string{"work/g", held, tip, "10m", "box 9e1f", "cse_holder", "#7"} {
		holds(t, one.out.String(), said)
	}
}

func TestFleetPrintsTheFinalRecord(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): withEntry(groupNote, front.Ordered{{Key: "step", Value: "retro"}, {Key: "hand", Value: "box 9e1f"}, {Key: "hash_before", Value: "a1b2c3"}, {Key: "hash_after", Value: "d4e5f6"}, {Key: "model", Value: "claude-test"}, {Key: "cost", Value: "1.25"}, {Key: "final", Value: "The group lands."}})})
	one.cloudSays("fleet")
	for _, said := range []string{"claude-test", "1.25", "The group lands."} {
		holds(t, one.out.String(), said)
	}
}

func TestFleetExitsRedOnAWake(t *testing.T) {
	t.Parallel()
	one := fleetTree(t, "2026-01-02T02:00:05Z")
	if code := one.cloudSays("fleet"); code != codeRed {
		t.Fatalf("cloud fleet answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	holds(t, one.out.String(), "wake work/g idle")
}

func TestPullsReadEachPullHeadByItsTip(t *testing.T) {
	t.Parallel()
	said := pullsOf([]git.Ref{{Name: "refs/pull/7/head", Hash: "a1b2"}, {Name: "refs/pull/7/merge", Hash: "c3d4"}})
	if len(said) != 1 || said["a1b2"] != "#7" {
		t.Fatalf("the pulls read %v", said)
	}
}

// A box the dispatch fires takes its branch, and its take names the hand and the session the fire opened. [[spec/tickets/boxes-write-their-final-record]]
func TestFleetHoldsTheBoxesTheDispatchFires(t *testing.T) {
	t.Parallel()
	fired := withEntry(groupNote, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box 9e1f · claude-code-remote"}, {Key: "hash_before", Value: "a1b2c3"}, {Key: "session", Value: "cse_fired"}})
	stood := []stand{
		{ref: ref{Branch: "work/fired"}, Name: "fired", Ticket: fired},
		{ref: ref{Branch: "work/free"}, Name: "free", Ticket: groupNote},
	}
	rows := fleetRows(stood, map[string]string{"work/fired": held, "work/free": todo})
	want := []boxRow{
		{Branch: "work/fired", Standing: held, Hand: "box 9e1f · claude-code-remote", Session: "cse_fired"},
		{Branch: "work/free", Standing: todo},
	}
	if len(rows) != len(want) {
		t.Fatalf("the fleet holds %+v", rows)
	}
	for at, one := range want {
		if rows[at] != one {
			t.Fatalf("row %d reads %+v, not %+v", at, rows[at], one)
		}
	}
}

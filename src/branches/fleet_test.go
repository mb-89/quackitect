// The fleet rows: one a work branch, off the record its group carries.
// [[spec/tickets/boxes-write-their-final-record]]
package branches

import (
	"testing"

	"quackitect/src/front"
)

// A box the dispatch fires takes its branch, and its take names the hand and the session the fire opened. [[spec/tickets/boxes-write-their-final-record]]
func TestFleetHoldsTheBoxesTheDispatchFires(t *testing.T) {
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

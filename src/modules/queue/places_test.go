// The places the queue answers over a handful of tickets and a plan.
// [[spec/tickets/the-queue-becomes-a-module]]
package queue

import (
	"testing"

	"quackitect/src/ticket"
)

func TestACloudRowStandsAtInfinity(t *testing.T) {
	said := placesOver(t, map[string]any{
		RowsPort:  []ticket.Ticket{{Name: "marked", Path: "spec/tickets/marked.md", State: "open"}, {Name: "free", Path: "spec/tickets/free.md", State: "open"}},
		CloudPort: []string{"marked"},
	})
	if said["marked"] != CloudPlace || said["free"] != "1" {
		t.Fatalf("the places read %v, and want marked at %s and free at 1", said, CloudPlace)
	}
}

func TestTheWorkingTicketStandsAtZero(t *testing.T) {
	said := placesOver(t, map[string]any{
		RowsPort: []ticket.Ticket{{Name: "in-hand", Path: "spec/tickets/in-hand.md", State: "open"}, {Name: "next", Path: "spec/tickets/next.md", State: "open"}},
		PlanPort: planText(t, map[string]any{"working": "in-hand"}),
	})
	if said["in-hand"] != "0" || said["next"] != "1" {
		t.Fatalf("the places read %v, and want in-hand at 0 and next at 1", said)
	}
}

func TestANoteAndAClosedTicketTakeNoPlace(t *testing.T) {
	said := placesOver(t, map[string]any{
		RowsPort: []ticket.Ticket{
			{Name: "a-note", Path: ".se/tickets/a-note.md", State: "open", Route: "note"},
			{Name: "done", Path: "spec/tickets/done.md", State: "closed"},
			{Name: "open", Path: "spec/tickets/open.md", State: "open"},
		},
	})
	if len(said) != 1 || said["open"] != "1" {
		t.Fatalf("the places read %v, and want open at 1 alone", said)
	}
}

// A key no layer sets reads the file's weight, so the older of two tickets stands first. [[spec/tickets/index-reads-loaded-projections]]
func TestTheBuiltInWeightsOrderTheOlderFirst(t *testing.T) {
	const minute, day = int64(29_000_000), int64(86400)
	said := placesOver(t, map[string]any{
		RowsPort:   []ticket.Ticket{{Name: "a-new", Path: "spec/tickets/a-new.md", State: "open"}, {Name: "b-old", Path: "spec/tickets/b-old.md", State: "open"}},
		StoodPort:  map[string]int64{"spec/tickets/a-new.md": minute*60 - 60, "spec/tickets/b-old.md": minute*60 - 3*day},
		MinutePort: minute,
	})
	if said["b-old"] != "1" || said["a-new"] != "2" {
		t.Fatalf("the places read %v, and want b-old at 1 and a-new at 2", said)
	}
}

func TestAPersonStepCountsDownFirst(t *testing.T) {
	said := placesOver(t, map[string]any{
		RowsPort: []ticket.Ticket{
			{Name: "agent", Path: "spec/tickets/agent.md", State: "open"},
			{Name: "owner", Path: "spec/tickets/owner.md", State: "open", Person: true},
			{Name: "a-draft", Path: "spec/tickets/a-draft.md", State: "draft", Route: "standard"},
		},
	})
	if said["a-draft"] != "-2" || said["owner"] != "-1" || said["agent"] != "1" {
		t.Fatalf("the places read %v, and want a-draft at -2, owner at -1 and agent at 1", said)
	}
}

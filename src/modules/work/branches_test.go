// A standing work branch draws one row with no state, and a trunk ticket
// naming its group rides the branch and draws no row.
// [[spec/tickets/the-index-reads-standing-branches]]
package work

import (
	"testing"

	"quackitect/src/ticket"
)

// A closed group on trunk with two later drafts naming it, as the branch's copy leaves it open at retro/cloud. [[spec/tickets/fix-verbs-shadow-yours-2]]
func laterChildren() []ticket.Ticket {
	return []ticket.Ticket{
		{Name: "the-group", Path: "spec/tickets/the-group.md", Route: "group", State: "open", Step: "retro/cloud", Says: "the ask"},
		{Name: "first-draft", Path: "spec/tickets/first-draft.md", Group: "the-group", State: "draft", Step: "do"},
		{Name: "second-draft", Path: "spec/tickets/second-draft.md", Group: "the-group", State: "draft", Step: "do"},
	}
}

func laterPlaces() map[string]string {
	return map[string]string{"the-group": "-5", "first-draft": "-5.4", "second-draft": "-5.5"}
}

func yoursBy(t *testing.T, seeds map[string]any) []YoursRow {
	t.Helper()
	said, _ := read(t, YoursPort, seeds).([]YoursRow)
	return said
}

func TestAStandingBranchDrawsItsRowWithNoStateAndDropsTrunkChildren(t *testing.T) {
	branch := ticket.Branch{Name: "the-group", Ticket: laterChildren()[0]}
	said := yoursBy(t, map[string]any{TicketsPort: laterChildren(), PlacesPort: laterPlaces(), BranchesPort: []ticket.Branch{branch}})
	want := YoursRow{Ticket: "the-group", Path: "spec/tickets/the-group.md", Step: "retro/cloud", Queue: "-5"}
	if len(said) != 1 || said[0] != want {
		t.Fatalf("the branch draws one row with no state and no child, and yours holds %+v", said)
	}
	rows := rowsBy(t, map[string]any{TicketsPort: laterChildren(), PlacesPort: laterPlaces(), BranchesPort: []ticket.Branch{branch}})
	if row := rows["the-group"]; row.Kind != "group" || row.State != "" || row.Says != "the ask" {
		t.Errorf("the branch row reads %+v", row)
	}
	if _, stands := rows["first-draft"]; stands {
		t.Errorf("a trunk child of a standing branch draws no row, and the rows read %v", rows)
	}
}

func TestTheSameTicketsWithNoBranchDrawTheGroupAndBothChildren(t *testing.T) {
	said := yoursBy(t, map[string]any{TicketsPort: laterChildren(), PlacesPort: laterPlaces()})
	if len(said) != 3 || said[0].Ticket != "the-group" || said[0].State != "open" || said[1].Ticket != "first-draft" || said[2].Ticket != "second-draft" {
		t.Fatalf("the group and both children draw, and yours holds %+v", said)
	}
}

// The children on the branch's tip draw under it, with the tip's step. [[spec/tickets/the-index-reads-standing-branches]]
func TestABranchDrawsTheChildrenOnItsTip(t *testing.T) {
	own := ticket.Ticket{Name: "own-child", Group: "the-group", State: "open", Step: "implement/change"}
	branch := ticket.Branch{Name: "the-group", Ticket: laterChildren()[0], Children: []ticket.Ticket{own}}
	places := laterPlaces()
	places["own-child"] = "-5.1"
	said := yoursBy(t, map[string]any{TicketsPort: append(laterChildren(), own), PlacesPort: places, BranchesPort: []ticket.Branch{branch}})
	if len(said) != 2 || said[1].Ticket != "own-child" || said[1].Step != "implement/change" || said[1].State != "open" || said[1].Path != "" {
		t.Fatalf("the tip's child draws under its branch, and yours holds %+v", said)
	}
}

// A branch whose ticket runs no group route draws its row with no step, and its own ticket draws no second row. [[spec/tickets/the-index-reads-standing-branches]]
func TestABranchWithNoGroupCopyDrawsNoStep(t *testing.T) {
	one := ticket.Ticket{Name: "one-ticket", Path: "spec/tickets/one-ticket.md", State: "open", Step: "design/tests-red"}
	said := yoursBy(t, map[string]any{
		TicketsPort:  []ticket.Ticket{one},
		PlacesPort:   map[string]string{"one-ticket": "0"},
		BranchesPort: []ticket.Branch{{Name: "one-ticket"}},
	})
	want := YoursRow{Ticket: "one-ticket", Path: "spec/tickets/one-ticket.md", Queue: "0"}
	if len(said) != 1 || said[0] != want {
		t.Fatalf("the branch draws one row with no step and no state, and yours holds %+v", said)
	}
}

// A branch holding a place with no ticket behind it draws its branch row and no todo row beside it. [[spec/tickets/the-index-reads-standing-branches]]
func TestAPlacedBranchWithNoTicketDrawsNoTodoRow(t *testing.T) {
	rows := rowsBy(t, map[string]any{
		PlacesPort:   map[string]string{"a-branch": "2"},
		BranchesPort: []ticket.Branch{{Name: "a-branch"}},
	})
	if row := rows["a-branch"]; len(rows) != 1 || row.Kind != "group" || row.Todo {
		t.Fatalf("the branch draws one group row, and the rows read %+v", rows)
	}
}

// The cloud letter reads the group's mark alone, the rule the queue's cloud place reads, so an unmarked standing branch and its child stand off the cloud. [[spec/tickets/rows-cloud-matches-branches]]
func TestTheCloudLetterReadsTheGroupsMarkAlone(t *testing.T) {
	child := ticket.Ticket{Name: "a-child", Group: "unmarked", State: "open"}
	branches := []ticket.Branch{
		{Name: "unmarked", Ticket: ticket.Ticket{Name: "unmarked", Route: "group"}, Children: []ticket.Ticket{child}},
		{Name: "marked", Ticket: ticket.Ticket{Name: "marked", Route: "group"}},
	}
	rows := rowsBy(t, map[string]any{BranchesPort: branches, CloudPort: []string{"marked"}})
	if rows["unmarked"].Cloud || rows["a-child"].Cloud {
		t.Fatalf("an unmarked branch and its child stand off the cloud, and read %+v, %+v", rows["unmarked"], rows["a-child"])
	}
	if !rows["marked"].Cloud {
		t.Fatalf("the marked group stands on the cloud, and reads %+v", rows["marked"])
	}
}

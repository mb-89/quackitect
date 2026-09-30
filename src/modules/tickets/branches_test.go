// A standing branch speaks for its group and the tickets naming it, its copy
// wins over trunk's by name, and a branch trunk reads closed speaks for
// nothing, the rule ticketsIn in src/scripts/work-answer.js holds.
// [[spec/tickets/the-index-reads-standing-branches]]
package tickets

import (
	"testing"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

func groupAt(state, step string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\nprocess: [[spec/processes/group]]\nstep: " + step +
		"\nsteps:\n  - name: children\n    by: children\n  - name: retro\n    steps:\n      - name: cloud\n---\n\n# Ask\n\nThe group's ask.\n\n# Discussion\n"
}

// Trunk holds the group at children and a child minted after the branch, and the branch holds the group at retro/cloud, a child of its own and a stale copy of a loose ticket. [[spec/tickets/the-index-reads-standing-branches]]
func branchTree() (map[string]any, []ticket.Tip) {
	files := map[string]any{
		"files/spec/tickets/the-group.md":   file(groupAt("open", "children")),
		"files/spec/tickets/later-child.md": file(child("the-group", "draft")),
		"files/spec/tickets/a-loose-one.md": file("---\nkind: ticket\nstate: open\nstep: do\n---\n\n# Ask\n\nOn trunk.\n"),
	}
	tips := []ticket.Tip{{
		Name:  "the-group",
		Trunk: groupAt("open", "children"),
		Files: []ticket.File{
			{Path: "spec/tickets/a-loose-one.md", Text: "---\nkind: ticket\nstate: closed\n---\n\n# Ask\n\nA stale copy.\n"},
			{Path: "spec/tickets/own-child.md", Text: child("the-group", "open")},
			{Path: "spec/tickets/the-group.md", Text: groupAt("open", "retro/cloud")},
		},
	}}
	return files, tips
}

// The module over a tips port the case feeds, as the wiring binds it to the git module. [[spec/design_output/model#the-fake-index]]
func withTips(c *q.Catalog) q.Writer {
	hand := q.Join(
		q.OutIn(c, TipsPort, []ticket.Tip{}, q.Doc("the tips, as the case seeds them")),
		q.OutIn(c, TrunkPort, []ticket.File{}, q.Doc("trunk's ticket files, as the case seeds them")),
	)
	Registers(c)
	return hand
}

func tipsRead(t *testing.T, port string, files map[string]any, tips []ticket.Tip) any {
	t.Helper()
	return gitRead(t, port, files, tips, []ticket.File{})
}

// What a port answers over the files, the tips and trunk's ticket files a case seeds. [[spec/tickets/index-reads-trunk-off-origin]]
func gitRead(t *testing.T, port string, files map[string]any, tips []ticket.Tip, trunk []ticket.File) any {
	t.Helper()
	var hand q.Writer
	index := qtest.New(t, func(c *q.Catalog) { hand = withTips(c) })
	index.Seed(files)
	index.SeedAs(hand, map[string]any{TipsPort: tips, TrunkPort: trunk})
	return index.Run(port)
}

func branchedBy(t *testing.T, files map[string]any, tips []ticket.Tip) map[string]Ticket {
	t.Helper()
	said, ok := tipsRead(t, BranchedPort, files, tips).([]Ticket)
	if !ok {
		t.Fatalf("%s reads no ticket list", BranchedPort)
	}
	out := map[string]Ticket{}
	for _, one := range said {
		out[one.Name] = one
	}
	return out
}

func TestAStandingBranchCopyWinsOverTrunkByName(t *testing.T) {
	files, tips := branchTree()
	rows := branchedBy(t, files, tips)
	if group := rows["the-group"]; group.Step != "retro/cloud" || group.Path != "spec/tickets/the-group.md" {
		t.Errorf("the group reads the branch's step and the working tree's path, and reads %+v", group)
	}
	if own := rows["own-child"]; own.Group != "the-group" || own.Path != "" {
		t.Errorf("a child standing on the branch alone reads no path, and reads %+v", own)
	}
	if later := rows["later-child"]; later.State != "draft" {
		t.Errorf("a child trunk alone holds stays, and reads %+v", later)
	}
	if loose := rows["a-loose-one"]; loose.State != "open" {
		t.Errorf("a ticket the branch does not own reads trunk's copy, and reads %+v", loose)
	}
}

func TestAMergedBranchSpeaksForNothing(t *testing.T) {
	files, tips := branchTree()
	tips[0].Trunk = groupAt("closed", "children")
	rows := branchedBy(t, files, tips)
	if group := rows["the-group"]; group.Step != "children" {
		t.Errorf("a branch trunk reads closed leaves trunk's copy, and the group reads %+v", group)
	}
	if _, stands := rows["own-child"]; stands {
		t.Errorf("a merged branch adds no ticket, and own-child stands")
	}
	branches, _ := tipsRead(t, BranchesPort, files, tips).([]ticket.Branch)
	if len(branches) != 1 || !branches[0].Merged {
		t.Fatalf("the branch reads merged, and reads %+v", branches)
	}
}

func TestABranchCarriesItsGroupCopyAndTheChildrenOnItsTip(t *testing.T) {
	files, tips := branchTree()
	branches, _ := tipsRead(t, BranchesPort, files, tips).([]ticket.Branch)
	if len(branches) != 1 {
		t.Fatalf("one branch stands, and branches reads %+v", branches)
	}
	one := branches[0]
	if one.Name != "the-group" || one.Merged || one.Ticket.Step != "retro/cloud" || one.Ticket.Route != "group" {
		t.Errorf("the branch reads its group's copy off the tip, and reads %+v", one)
	}
	if len(one.Children) != 1 || one.Children[0].Name != "own-child" {
		t.Errorf("the branch's children are the tip's tickets naming the group, and read %+v", one.Children)
	}
}

// A branch whose ticket runs no group route carries no group copy, so the work draws its row with no step, as the verb's program does. [[spec/tickets/the-index-reads-standing-branches]]
func TestABranchWhoseTicketIsNoGroupCarriesNoGroupCopy(t *testing.T) {
	tips := []ticket.Tip{{Name: "one-ticket", Files: []ticket.File{{Path: "spec/tickets/one-ticket.md", Text: "---\nkind: ticket\nstate: open\nstep: design/tests-red\n---\n\n# Ask\n\nOne.\n"}}}}
	branches, _ := tipsRead(t, BranchesPort, map[string]any{}, tips).([]ticket.Branch)
	if len(branches) != 1 || branches[0].Name != "one-ticket" || branches[0].Ticket.Name != "" {
		t.Fatalf("the branch carries no group copy, and reads %+v", branches)
	}
	if rows := branchedBy(t, map[string]any{}, tips); rows["one-ticket"].Step != "design/tests-red" {
		t.Fatalf("the branch's own ticket still speaks for its name, and reads %+v", rows["one-ticket"])
	}
}

// A child standing on the branch of a marked group alone stands on the cloud, as cloudsIn in src/scripts/work-answer.js reads the folded list. [[spec/tickets/the-queue-reads-the-marker]]
func TestTheCloudReadsATipChildOfAMarkedGroup(t *testing.T) {
	marked := "---\nkind: [[ticket]]\nstate: open\ncloud: true\nprocess: [[spec/processes/group]]\n---\n\n# Ask\n\nMarked.\n"
	files := map[string]any{"files/spec/tickets/the-group.md": file(marked)}
	tips := []ticket.Tip{{Name: "the-group", Trunk: marked, Files: []ticket.File{
		{Path: "spec/tickets/the-group.md", Text: marked},
		{Path: "spec/tickets/own-child.md", Text: child("the-group", "open")},
	}}}
	said, _ := tipsRead(t, CloudPort, files, tips).([]string)
	if len(said) != 2 || said[0] != "own-child" || said[1] != "the-group" {
		t.Fatalf("the marked group and its child on the tip stand on the cloud, and the cloud reads %v", said)
	}
}

// A ticket trunk holds and the working tree lacks joins with no path, and the working tree's copy wins where both hold one, as answerOf reads trunk off origin. [[spec/tickets/index-reads-trunk-off-origin]]
func TestATrunkTicketTheWorkingTreeLacksJoinsWithNoPath(t *testing.T) {
	files := map[string]any{"files/spec/tickets/on-disk.md": file("---\nkind: ticket\nstate: open\nstep: here\n---\n\n# Ask\n\nOn disk.\n")}
	trunk := []ticket.File{
		{Path: "spec/tickets/on-disk.md", Text: "---\nkind: ticket\nstate: open\nstep: there\n---\n\n# Ask\n\nOn trunk.\n"},
		{Path: "spec/tickets/minted-later.md", Text: "---\nkind: ticket\nstate: draft\nstep: do\n---\n\n# Ask\n\nMinted on trunk.\n"},
	}
	said, _ := gitRead(t, BranchedPort, files, []ticket.Tip{}, trunk).([]Ticket)
	rows := map[string]Ticket{}
	for _, one := range said {
		rows[one.Name] = one
	}
	if rows["on-disk"].Step != "here" {
		t.Errorf("the working tree's copy wins, and on-disk reads %+v", rows["on-disk"])
	}
	if later := rows["minted-later"]; later.State != "draft" || later.Path != "" {
		t.Errorf("a ticket trunk alone holds joins with no path, and reads %+v", later)
	}
}

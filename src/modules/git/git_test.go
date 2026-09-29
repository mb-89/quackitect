// The start commits the tips at once, and again on a tick where they change,
// and a tick that finds them unchanged commits nothing.
// [[spec/tickets/the-index-reads-standing-branches]]
package git

import (
	"testing"
	"time"

	"quackitect/src/q"
	"quackitect/src/q/qtest"
	"quackitect/src/ticket"
)

func TestTheStartCommitsTheTipsAndEachChange(t *testing.T) {
	fake := NewFake()
	fake.Push("the-group", map[string]string{"spec/tickets/the-group.md": "open\n"})
	var tick func(time.Time)
	every := func(_ time.Duration, hand func(time.Time)) func() {
		tick = hand
		return func() {}
	}
	var commits [][]ticket.Tip
	Start(fake, every, func(values map[string]any) error {
		commits = append(commits, values[Port].([]ticket.Tip))
		return nil
	})
	if len(commits) != 1 || len(commits[0]) != 1 || commits[0][0].Name != "the-group" {
		t.Fatalf("the start commits the one branch, and commits %+v", commits)
	}
	tick(time.Time{})
	if len(commits) != 1 {
		t.Fatalf("a tick over unchanged tips commits nothing, and commits %+v", commits)
	}
	fake.Drop("the-group")
	tick(time.Time{})
	if len(commits) != 2 || len(commits[1]) != 0 {
		t.Fatalf("a tick after the branch leaves commits no branch, and commits %+v", commits)
	}
}

// The start commits trunk's ticket files beside the tips, and again where trunk moves. [[spec/tickets/index-reads-trunk-off-origin]]
func TestTheStartCommitsTrunksTicketFiles(t *testing.T) {
	fake := NewFake()
	fake.Land(map[string]string{"spec/tickets/one.md": "one\n"})
	var tick func(time.Time)
	every := func(_ time.Duration, hand func(time.Time)) func() {
		tick = hand
		return func() {}
	}
	var trunks [][]ticket.File
	Start(fake, every, func(values map[string]any) error {
		if files, ok := values[TrunkPort].([]ticket.File); ok {
			trunks = append(trunks, files)
		}
		return nil
	})
	fake.Land(map[string]string{"spec/tickets/two.md": "two\n"})
	tick(time.Time{})
	if len(trunks) != 2 || len(trunks[0]) != 1 || len(trunks[1]) != 2 {
		t.Fatalf("the start commits trunk, then trunk again once it moves, and commits %+v", trunks)
	}
}

func TestTheTipsStandUnderTheirLocalPort(t *testing.T) {
	index := qtest.New(t, func(c *q.Catalog) { Registers(c) })
	if got, ok := index.Read(Port).([]ticket.Tip); !ok || len(got) != 0 {
		t.Fatalf("%s reads %#v before any commit", Port, index.Read(Port))
	}
}

// A batch answers a payload an ask and an empty text for a missing object, and a payload holding a newline stays whole. [[spec/design_output/work#the-listing-reads-git-once]]
func TestTheBatchReadsEachPayloadAndNothingForAMissingObject(t *testing.T) {
	said := "aaa blob 6\nab\ncd\n\nmain:spec/tickets/gone.md missing\nbbb blob 3\nxyz\n"
	got := framed([]byte(said), 3)
	if len(got) != 3 || got[0] != "ab\ncd\n" || got[1] != "" || got[2] != "xyz" {
		t.Fatalf("the batch reads %q", got)
	}
}

// The log lists the newest commit first, so a path added twice keeps its newest second, and a blank line reads as nothing. [[spec/tickets/verbs-queue-order]]
func TestTheAgesKeepEachPathsNewestAdd(t *testing.T) {
	said := stoodIn("200\n\nspec/tickets/again.md\n100\n\nspec/tickets/again.md\nspec/tickets/once.md\n")
	if len(said) != 2 || said["spec/tickets/again.md"] != 200 || said["spec/tickets/once.md"] != 100 {
		t.Fatalf("the ages read %v", said)
	}
}

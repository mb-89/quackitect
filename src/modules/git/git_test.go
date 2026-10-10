// The start commits the tips at once, and again on a tick where they change,
// and a tick that finds them unchanged commits nothing.
// [[spec/tickets/the-index-reads-standing-branches]]
package git

import (
	"errors"
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
		if tips, ok := values[Port].([]ticket.Tip); ok {
			commits = append(commits, tips)
		}
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

// A port the bus refuses leaves the tracked paths landing, and the next tick sends it again. [[spec/tickets/sweep-reads-tracked-after-restart]]
func TestARefusedPortLeavesTheOthersLandingAndRetries(t *testing.T) {
	fake := NewFake()
	fake.Push("the-group", map[string]string{"spec/tickets/the-group.md": "open\n"})
	fake.Add(1, "spec/tickets/the-group.md")
	var tick func(time.Time)
	every := func(_ time.Duration, hand func(time.Time)) func() {
		tick = hand
		return func() {}
	}
	refused, landed := 0, map[string]bool{}
	Start(fake, every, func(values map[string]any) error {
		if _, ok := values[Port]; ok && refused == 0 {
			refused++
			return errors.New("maximum payload exceeded")
		}
		for port := range values {
			landed[port] = true
		}
		return nil
	})
	if !landed[TrackedPort] || landed[Port] {
		t.Fatalf("the start lands %v, and wants the tracked paths beside the refused tips", landed)
	}
	tick(time.Time{})
	if !landed[Port] {
		t.Fatalf("the next tick lands %v, and wants the tips sent again", landed)
	}
}

// A git whose tips read fails once the flag stands. [[spec/tickets/git-reads-keep-last-values]]
type failingTips struct {
	*FakeGit
	fails bool
}

func (one *failingTips) Tips() ([]ticket.Tip, error) {
	if one.fails {
		return nil, errors.New("cannot read the packs")
	}
	return one.FakeGit.Tips()
}

// A tick whose read fails commits nothing for its port, so the last value stands. [[spec/tickets/git-reads-keep-last-values]]
func TestAFailedReadKeepsTheLastValue(t *testing.T) {
	fake := NewFake()
	fake.Push("the-group", map[string]string{"spec/tickets/the-group.md": "open\n"})
	from := &failingTips{FakeGit: fake}
	var tick func(time.Time)
	every := func(_ time.Duration, hand func(time.Time)) func() {
		tick = hand
		return func() {}
	}
	var sent [][]ticket.Tip
	Start(from, every, func(values map[string]any) error {
		if tips, ok := values[Port]; ok {
			sent = append(sent, tips.([]ticket.Tip))
		}
		return nil
	})
	from.fails = true
	tick(time.Time{})
	if len(sent) != 1 || len(sent[0]) != 1 {
		t.Fatalf("the tips commit %v, and want the one branch once, with nothing on the failed tick", sent)
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
	got := framed(said, 3)
	if len(got) != 3 || got[0] != "ab\ncd\n" || got[1] != "" || got[2] != "xyz" {
		t.Fatalf("the batch reads %q", got)
	}
}

// A payload cut short keeps what the batch carries, as every reader of the one framer reads it. [[spec/tickets/git-parsers-stand-once]]
func TestAShortPayloadKeepsWhatTheBatchCarries(t *testing.T) {
	got := framed("aaa blob 3\nxyz\nbbb blob 6\nab", 2)
	if len(got) != 2 || got[0] != "xyz" || got[1] != "ab" {
		t.Fatalf("the batch reads %q", got)
	}
}

// The one framer names each kind, leaves a missing object and a size it cannot parse empty, and reads on at the next ask. [[spec/tickets/git-parsers-stand-once]]
func TestTheFramerKeepsKindsAndReadsPastABadSize(t *testing.T) {
	said := "main:gone missing\nttt tree 2\nt1\nbad blob x\nccc blob 2\nok\n"
	got := frames(said, 4)
	want := []frame{{}, {kind: "tree", payload: "t1"}, {}, {kind: blobKind, payload: "ok"}}
	if len(got) != len(want) {
		t.Fatalf("the batch reads %+v", got)
	}
	for at := range want {
		if got[at] != want[at] {
			t.Fatalf("the batch reads %+v, and wants %+v", got, want)
		}
	}
}

// The log lists the newest commit first, so a path added twice keeps its newest second, and a blank line reads as nothing. [[spec/tickets/verbs-queue-order]]
func TestTheAgesKeepEachPathsNewestAdd(t *testing.T) {
	said := addedIn("200\n\nspec/tickets/again.md\n100\n\nspec/tickets/again.md\nspec/tickets/once.md\n", asPrinted)
	if len(said) != 2 || said["spec/tickets/again.md"] != 200 || said["spec/tickets/once.md"] != 100 {
		t.Fatalf("the ages read %v", said)
	}
}

// Both readers parse one log: Stood keeps a quoted path as git prints it, and Added reads it back. [[spec/tickets/git-parsers-stand-once]]
func TestBothReadersParseOneLogWithAQuotedPath(t *testing.T) {
	log := "300\n\n\"spec/tickets/caf\\303\\251.md\"\nspec/tickets/plain.md\n"
	stood := addedIn(log, asPrinted)
	if len(stood) != 2 || stood[`"spec/tickets/caf\303\251.md"`] != 300 || stood["spec/tickets/plain.md"] != 300 {
		t.Fatalf("the stood ages read %v", stood)
	}
	added := addedIn(log, unquoted)
	if len(added) != 2 || added["spec/tickets/café.md"] != 300 || added["spec/tickets/plain.md"] != 300 {
		t.Fatalf("the added ages read %v", added)
	}
}

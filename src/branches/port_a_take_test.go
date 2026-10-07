// The take over a fake clone, as test/level0/work.test.js drives it through
// fake doors: the uncommitted check, the parked ticket, the unpushed branch,
// and the stuck hand-over handed out first.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported staleKey and the group editors after take runs

import (
	"fmt"
	"strings"
	"testing"
	"time"
)

// A ticket carrying the todo tag, which parks it on this box. [[spec/tickets/work-verbs-port-to-go]]
const paParked = "---\nkind: [[ticket]]\nstate: open\nurgency: whenever\ntodo: true\n---\n\n# Ask\n\nLook at the lint.\n\n# Discussion\n\nNothing yet.\n"

// Where the parked ticket stands. [[spec/tickets/work-verbs-port-to-go]]
const paParkedAt = "spec/tickets/slow-lint.md"

// A tree whose main tracks slow-lint and a source file, with the group pushed and slow-lint parked on disk. [[spec/tickets/work-verbs-port-to-go]]
func paParkedTree(t *testing.T) *tree {
	t.Helper()
	one := newTree(t, map[string]string{paParkedAt: "---\nkind: [[ticket]]\nstate: open\n---\n", "src/scripts/work.js": "one\n"})
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	one.write(map[string]string{paParkedAt: paParked})
	return one
}

// Take stops on a tree carrying uncommitted work, and moves nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeStopsOnUncommittedWork(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"a.md": "a\n"})
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	one.write(map[string]string{"a.md": "changed\n"})
	if code := one.branchSays("take"); code != codeRefused {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	holds(t, paSaid(one), "uncommitted changes")
	if one.here() != trunk {
		t.Fatal("the refused take moves the box")
	}
}

// The uncommitted check looks past a tagged ticket, and take carries on onto the branch. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeLooksPastATaggedTicket(t *testing.T) {
	t.Parallel()
	one := paParkedTree(t)
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	if strings.Contains(paSaid(one), "uncommitted changes") {
		t.Fatal("the tagged ticket stops the take")
	}
	if one.here() != "work/one-group" {
		t.Fatal("the take leaves the box off the branch")
	}
}

// Take puts every tagged file back, so the reset leaves the tag standing. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeKeepsTheTag(t *testing.T) {
	t.Parallel()
	one := paParkedTree(t)
	one.branchSays("take")
	if said := one.read(paParkedAt); said != paParked {
		t.Fatalf("the tag comes back as %q", said)
	}
}

// An untagged change still stops a take, and the tagged one beside it changes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPAUntaggedChangeStopsTake(t *testing.T) {
	t.Parallel()
	one := paParkedTree(t)
	one.write(map[string]string{"src/scripts/work.js": "two\n"})
	if code := one.branchSays("take"); code != codeRefused {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	holds(t, paSaid(one), "uncommitted changes")
	if one.here() != trunk {
		t.Fatal("the refused take moves the box")
	}
}

// Take refuses where this box stands ahead of origin, and leaves the commit standing. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeRefusesBoxAhead(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("fix-lsp", map[string]string{"a.md": "a\n"})
	paOn(one, "fix-lsp")
	one.land("ahead", map[string]string{"b.md": "b\n"})
	tip := one.rev("HEAD")
	if code := one.branchSays("take"); code != codeRefused {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	holds(t, paSaid(one), "holds 1 commit(s) origin lacks")
	if one.rev("HEAD") != tip {
		t.Fatal("the take resets the commit away")
	}
}

// Take refuses where the branch it picks holds a commit origin lacks, and leaves that branch standing. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeRefusesPickedBranchAhead(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	paOn(one, "one-group")
	for at := range 3 {
		one.land(fmt.Sprintf("ahead %d", at), map[string]string{fmt.Sprintf("a%d.md", at): "a\n"})
	}
	tip := one.rev("HEAD")
	one.switchTo("main")
	if code := one.branchSays("take"); code != codeRefused {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	holds(t, paSaid(one), "work/one-group holds 3 commit(s) origin lacks")
	if one.rev("work/one-group") != tip {
		t.Fatal("the take resets the commits away")
	}
}

// A take naming the branch the box stands on carries its commits ahead of origin on, claims on top of them, and pushes them. [[spec/design_output/work#a-branch-moves-clean]]
func TestPATakeNamedKeepsTheBranchItStandsOnAhead(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	paOn(one, "one-group")
	one.land("ahead", map[string]string{"a.md": "a\n"})
	tip := one.rev("HEAD")
	if code := one.branchSays("take", "one-group"); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	if !one.d.Repo.IsAncestor(tip, "HEAD") {
		t.Fatal("the take resets the commit away")
	}
	if one.rev("origin/work/one-group") != one.rev("HEAD") {
		t.Fatal("the take leaves the commit and its claim unpushed")
	}
}

// A tree with a closed hand-over on work/landing and a free group on work/one-group. [[spec/tickets/work-verbs-port-to-go]]
func paHandOver(t *testing.T, landingDate time.Time) *tree {
	t.Helper()
	one := newTree(t, nil)
	if landingDate.IsZero() {
		landingDate = testNow
	}
	one.branchAt("landing", map[string]string{ticketAt("landing"): withField(paGroupNote, "state", closedState)}, landingDate)
	one.branch("one-group", map[string]string{ticketAt("one-group"): paGroupNote})
	return one
}

// Moves main two commits on and pushes it, so every branch stands behind. [[spec/tickets/work-verbs-port-to-go]]
func paTrunkMoves(one *tree) {
	one.t.Helper()
	one.land("trunk one", map[string]string{"t1.md": "t\n"})
	one.land("trunk two", map[string]string{"t2.md": "t\n"})
	one.push("main")
}

// Branch take hands out a stuck hand-over first, prints sync, check and push, and writes no record. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeHandsStuckFirst(t *testing.T) {
	t.Parallel()
	one := paHandOver(t, time.Time{})
	paTrunkMoves(one)
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	if one.here() != "work/landing" {
		t.Fatal("the take leaves the box off the stuck branch")
	}
	said := paSaid(one)
	holds(t, said, "You are on work/landing, whose hand-over stands behind")
	holds(t, said, "Run ./RUNME.sh branch sync, then ./RUNME.sh check, then push the branch")
	if one.read(ticketAt("landing")) != withField(paGroupNote, "state", closedState) {
		t.Fatal("the take writes a record on a closed group")
	}
	if one.show("origin/work/one-group", ticketAt("one-group")) != strings.TrimSpace(paGroupNote) {
		t.Fatal("the free group moves")
	}
}

// Branch take naming a free group passes a stuck hand-over by. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeNamedPassesStuckBy(t *testing.T) {
	t.Parallel()
	one := paHandOver(t, time.Time{})
	paTrunkMoves(one)
	one.branchSays("take", "one-group")
	if one.here() == "work/landing" {
		t.Fatal("the take moves onto the stuck branch")
	}
	if strings.Contains(paSaid(one), "You are on work/landing") {
		t.Fatal("the take hands out the stuck branch")
	}
}

// Branch take hands out a hand-over past work.staleAfter, by the clock. [[spec/tickets/work-verbs-port-to-go]]
func TestPATakeHandsStaleByTheClock(t *testing.T) {
	t.Parallel()
	from := time.Date(2026, 1, 2, 0, 0, 0, 0, time.UTC)
	one := paHandOver(t, from.Add(-48*time.Hour))
	one.d.Now = func() time.Time { return from }
	one.d.Config = func(key string) any {
		if key == staleKey {
			return "12h"
		}
		return nil
	}
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, paSaid(one))
	}
	if one.here() != "work/landing" {
		t.Fatal("the take leaves the box off the stale branch")
	}
	holds(t, paSaid(one), "You are on work/landing, whose hand-over stands stale")
	now := from.Unix()
	if got := one.d.staleClaim(stand{ref: ref{When: now - 13*hour}}, now); !got.Stale || got.Age != "13h" {
		t.Fatalf("an old claim reads %+v", got)
	}
	if got := one.d.staleClaim(stand{ref: ref{When: now - hour}}, now); got.Stale {
		t.Fatalf("a fresh claim reads %+v", got)
	}
}

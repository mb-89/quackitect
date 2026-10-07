// A take naming a branch on a box holding another, a take over a stale hold,
// and a release of another box's hold, ported from test/level0/work-held.test.js.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported heldIn, recordIn and staleKey, and declares pcOther and pcClock

import (
	"strings"
	"testing"
	"time"
)

// The hand another box holds the group under. [[spec/tickets/work-verbs-port-to-go]]
const pcOther = "box 0ther1d"

// The old group's ask, which no brief of the new take prints. [[spec/tickets/work-verbs-port-to-go]]
const pcOldAsk = "The old work."

// How the held old group stands when the named take runs. [[spec/tickets/work-verbs-port-to-go]]
type pcPast int

// The ways the old group stands: closed, merged into trunk, stale, or in work. [[spec/tickets/work-verbs-port-to-go]]
const (
	pcClosed pcPast = iota
	pcMerged
	pcStale
	pcInWork
)

// Sets the stale span to half an hour and the clock the span named past now. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcClock(ahead time.Duration) {
	one.d.Config = func(key string) any {
		if key == staleKey {
			return "30m"
		}
		return nil
	}
	one.d.Now = func() time.Time { return testNow.Add(ahead) }
}

// The commit subjects a ref carries. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcSubjects(ref string) string { return one.subjects(ref) }

// The newest commit a ref holds whose subject carries the words, or nothing. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) pcCommitSaying(ref, words string) string {
	log, _ := one.repo.Log("", ref, false)
	for _, each := range log {
		if strings.Contains(each.Subject, words) {
			return each.Hash
		}
	}
	return ""
}

// A take on a box holding its branch hands the ask again, and claims nothing new. [[spec/tickets/work-verbs-port-to-go]]
func TestPCATakeOnAHeldBranchHandsTheAskAgain(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{{"take"}, {"take", pcGroup}} {
		one := newTree(t, nil)
		hand := one.pcHand()
		pcOnGroup(one, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, hand, "b818c390")})
		head := one.rev("HEAD")
		if code := one.branchSays(argv...); code != codeOK {
			t.Fatalf("%v answers %d: %s", argv, code, one.pcSaid())
		}
		holds(t, one.pcSaid(), "You already hold work/one-group")
		holds(t, one.pcSaid(), "Two tickets that land as one")
		if one.here() != workBranch+pcGroup || one.rev("HEAD") != head {
			t.Fatalf("%v moves the box or writes a second claim", argv)
		}
	}
}

// A box holding work/old-group, a free work/one-group, and the box on old-group, the old group standing as named. [[spec/tickets/work-verbs-port-to-go]]
func pcTakingPast(t *testing.T, past pcPast) *tree {
	t.Helper()
	one := newTree(t, nil)
	hand := one.pcHand()
	old := pcTake(strings.Replace(pcGroupNote, "Two tickets that land as one.", pcOldAsk, 1), hand, "b818c390")
	if past == pcClosed {
		old = withField(old, "state", closedState)
	}
	one.branch("old-group", map[string]string{ticketAt("old-group"): old})
	one.branch(pcGroup, map[string]string{ticketAt(pcGroup): pcGroupNote})
	if past == pcMerged {
		one.mergeIn("origin/work/old-group", "")
		one.land("old-group lands", map[string]string{ticketAt("old-group"): withField(old, "state", closedState)})
		one.push(trunk)
	}
	one.cut("work/old-group", "origin/work/old-group")
	ahead := time.Duration(0)
	if past == pcStale {
		ahead = 48 * time.Hour
	}
	one.pcClock(ahead)
	one.d.Config = nil
	return one
}

// A named take drops a hold standing done, merged or stale, and lands on the name. [[spec/tickets/work-verbs-port-to-go]]
func TestPCANamedTakeDropsAHoldPastItsWork(t *testing.T) {
	t.Parallel()
	for _, past := range []pcPast{pcClosed, pcMerged, pcStale} {
		one := pcTakingPast(t, past)
		if code := one.branchSays("take", pcGroup); code != codeOK {
			t.Fatalf("the take past hold %d answers %d: %s", past, code, one.pcSaid())
		}
		if on := one.here(); on != workBranch+pcGroup {
			t.Fatalf("the take past hold %d lands on %s: %s", past, on, one.pcSaid())
		}
		pcLacks(one, one.pcSaid(), pcOldAsk)
		pcLacks(one, one.pcSaid(), "You already hold")
	}
}

// A named take refuses while the held branch stands in work, and names both. [[spec/tickets/work-verbs-port-to-go]]
func TestPCANamedTakeRefusesAHoldInWork(t *testing.T) {
	t.Parallel()
	one := pcTakingPast(t, pcInWork)
	if code := one.branchSays("take", pcGroup); code != codeRed {
		t.Fatalf("the take answers %d: %s", code, one.pcSaid())
	}
	for _, line := range []string{"work/old-group", "work/one-group", "./RUNME.sh branch release"} {
		holds(t, one.pcSaid(), line)
	}
	pcLacks(one, one.pcSaid(), pcOldAsk)
	if on := one.here(); on != "work/old-group" {
		t.Fatalf("the refusal moves the box to %s", on)
	}
}

// A group another box holds, pushed on work/one-group, the box on main, the clock the span named ahead. [[spec/tickets/work-verbs-port-to-go]]
func pcTakingHeld(t *testing.T, ahead time.Duration, behind int) *tree {
	t.Helper()
	one := newTree(t, nil)
	one.pcHand()
	one.branch(pcGroup, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, pcOther, "a1b2c3")})
	for at := range behind {
		one.land("main moves", map[string]string{"moves/" + string(rune('a'+at)): "moved"})
	}
	if behind > 0 {
		one.push(trunk)
	}
	one.pcClock(ahead)
	return one
}

// A take over a hold past work.staleAfter closes that hold and writes its own. [[spec/tickets/work-verbs-port-to-go]]
func TestPCATakeOverAStaleHoldClosesIt(t *testing.T) {
	t.Parallel()
	one := pcTakingHeld(t, time.Hour, 0)
	if code := one.branchSays("take", pcGroup); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, one.pcSaid())
	}
	if on := one.here(); on != workBranch+pcGroup {
		t.Fatalf("the take lands on %s", on)
	}
	text := one.pcTicket(pcGroup)
	rows := recordIn(text)
	if len(rows) == 0 || entryField(rows[0], "hand") != pcOther || entryField(rows[0], "hash_after") == "" {
		t.Fatalf("the stale hold stays open: %s", text)
	}
	if held := heldIn(text); held == nil || held.Hand == pcOther {
		t.Fatalf("the take holds nothing: %+v", held)
	}
	holds(t, one.pcSubjects("origin/"+workBranch+pcGroup), "over from "+pcOther)
}

// A take over a stale hold behind main pushes the claim, then takes main in. [[spec/tickets/work-verbs-port-to-go]]
func TestPCATakeOverAStaleHoldPushesBeforeTrunk(t *testing.T) {
	t.Parallel()
	one := pcTakingHeld(t, time.Hour, 3)
	if code := one.branchSays("take", pcGroup); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, one.pcSaid())
	}
	claim := one.pcCommitSaying("HEAD", "over from "+pcOther)
	if claim == "" {
		t.Fatalf("no claim commit stands: %s", one.pcSubjects("HEAD"))
	}
	if !one.repo.IsAncestor(claim, "origin/"+workBranch+pcGroup) {
		t.Fatal("the claim stays off origin")
	}
	if one.repo.IsAncestor("origin/"+trunk, claim) {
		t.Fatal("main comes in before the claim")
	}
	if !one.repo.IsAncestor("origin/"+trunk, "HEAD") {
		t.Fatal("main stays out after the claim")
	}
}

// A take over a hold under work.staleAfter refuses, and writes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPCATakeUnderTheStaleSpanRefuses(t *testing.T) {
	t.Parallel()
	one := pcTakingHeld(t, 0, 0)
	tip := one.pcTip("origin/" + workBranch + pcGroup)
	if code := one.branchSays("take", pcGroup); code != codeRed {
		t.Fatalf("the take answers %d: %s", code, one.pcSaid())
	}
	one.fetch()
	if one.pcTip("origin/"+workBranch+pcGroup) != tip {
		t.Fatal("the refusal writes a claim")
	}
	if held := heldIn(one.show("origin/"+workBranch+pcGroup, ticketAt(pcGroup))); held == nil || held.Hand != pcOther {
		t.Fatalf("the hold moves: %+v", held)
	}
}

// A release of another box's hold closes it, and the commit names the hand-over. [[spec/tickets/work-verbs-port-to-go]]
func TestPCAReleaseOfAnotherHoldNamesTheHandOver(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.pcHand()
	pcOnGroup(one, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, pcOther, "a1b2c3")})
	if code := one.branchSays("release"); code != codeOK {
		t.Fatalf("the release answers %d: %s", code, one.pcSaid())
	}
	if held := heldIn(one.pcTicket(pcGroup)); held != nil {
		t.Fatalf("the hold stands: %+v", held)
	}
	holds(t, one.pcSubjects("origin/"+workBranch+pcGroup), "frees it from "+pcOther)
}

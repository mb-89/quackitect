// A take over opens on what the box before left: its last beat, the step in
// hand, the last record entry, the commits since its take and its handover.
// [[spec/tickets/crash-leaves-a-handover]]
package branches // level0: InPackageTest - it adds beat methods to the unexported tree fixture and reads aged, holdAt and the exit codes

import (
	"strings"
	"testing"
	"time"

	"quackitect/src/front"
)

// The child the dead box held, the step it stood at, the record entry before it, the half step it landed, and its handover. [[spec/tickets/crash-leaves-a-handover]]
const (
	leftChild    = "alpha"
	leftStep     = "design/tests-red"
	leftEntry    = "design/draft"
	leftLanded   = "alpha: the parser half lands"
	leftHandover = "The parser half stands in src/x.txt, and the lexer waits."
)

// A closed child carrying one record entry, so the take reads it and claims past it. [[spec/tickets/crash-leaves-a-handover]]
func leftChildNote() string {
	note := "---\nkind: [[ticket]]\nstate: closed\ngroup: " + pcGroup + "\nstep: " + leftStep + "\n---\n\n# Ask\n\nThe child.\n"
	return withEntry(note, front.Ordered{{Key: "step", Value: leftEntry}, {Key: "hand", Value: pcOther}, {Key: "hash_before", Value: "a1b2c3"}, {Key: "hash_after", Value: "d4e5f6"}})
}

// Pushes a beat carrying files on top of its empty commit, as a box holding a step writes it. [[spec/tickets/crash-leaves-a-handover]]
func (one *tree) beatLeaving(group, hand string, at time.Time, files map[string]string) {
	one.t.Helper()
	was := one.clock.Swap(at.Unix())
	sha, err := one.repo.EmptyCommit(hand + " beats")
	one.must(err)
	sha, err = one.repo.CommitFiles(sha, files, hand+" beats")
	one.clock.Store(was)
	one.must(err)
	if pushed := one.repo.ForcePushTo(sha, beatsOn+group); !pushed.OK {
		one.t.Fatalf("the beat's push answers %s", pushed.Err)
	}
}

// A group another box took at a real commit and moved one half step past, its beat an hour old, and this box on main. [[spec/tickets/crash-leaves-a-handover]]
func leftBehind(t *testing.T) *tree {
	t.Helper()
	one := newTree(t, nil)
	one.pcHand()
	one.branch(pcGroup, map[string]string{ticketAt(pcGroup): pcGroupNote, ticketAt(leftChild): leftChildNote()})
	base := one.rev("origin/" + workBranch + pcGroup)
	one.cut(workBranch+pcGroup, "origin/"+workBranch+pcGroup)
	one.land(pcGroup+": "+pcOther+" takes it", map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, pcOther, base)})
	one.land(leftLanded, map[string]string{"src/x.txt": "half\n"})
	one.push(workBranch + pcGroup)
	one.switchTo(trunk)
	one.drop(workBranch + pcGroup)
	one.fetch()
	one.pcClock(time.Hour)
	return one
}

// Takes the group over and answers what the take prints. [[spec/tickets/crash-leaves-a-handover]]
func (one *tree) takenOver() string {
	one.t.Helper()
	if code := one.branchSays("take", "--over", pcGroup); code != codeOK {
		one.t.Fatalf("the take --over answers %d: %s", code, one.pcSaid())
	}
	return one.pcSaid()
}

// The beat a box holding a step writes carries the step and the handover beside its subject. [[spec/tickets/crash-leaves-a-handover]]
func TestABeatCarriesTheStepAndTheHandover(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	hand := one.pcHand()
	pcOnGroup(one, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, hand, "b818c390")})
	pfHold(one, one.d.handOf(), leftChild, leftStep)
	one.write(map[string]string{".se/HANDOVER.md": leftHandover})
	if code := one.branchSays("beat"); code != codeOK {
		t.Fatalf("the beat answers %d: %s", code, one.pcSaid())
	}
	tip := one.beatTip(pcGroup)
	holds(t, one.subject(tip), hand+" beats")
	holds(t, one.show(tip, "step"), ticketAt(leftChild)+" at "+leftStep)
	holds(t, one.show(tip, "HANDOVER.md"), leftHandover)
}

// A take over prints the last beat's age, the step in hand and the last record entry of that ticket, ahead of the ask. [[spec/tickets/crash-leaves-a-handover]]
func TestATakeOverPrintsWhatTheBoxBeforeLeft(t *testing.T) {
	t.Parallel()
	one := leftBehind(t)
	one.beatLeaving(pcGroup, pcOther, testNow, map[string]string{"step": ticketAt(leftChild) + " at " + leftStep})
	said := one.takenOver()
	holds(t, said, "What the box before left:")
	holds(t, said, "last beat "+aged(int64(time.Hour/time.Second))+" ago")
	holds(t, said, leftChild+" at "+leftStep)
	holds(t, said, leftEntry+" by "+pcOther)
	if strings.Index(said, "What the box before left:") > strings.Index(said, "Run ./RUNME.sh branch done") {
		t.Fatalf("what the box before left prints after the ask: %s", said)
	}
}

// A take over prints every commit since the dead box's take, and the rescue it takes in. [[spec/tickets/crash-leaves-a-handover]]
func TestATakeOverPrintsTheCommitsSinceTheDeadTake(t *testing.T) {
	t.Parallel()
	one := leftBehind(t)
	one.cut(rescueOf, "origin/"+workBranch+pcGroup)
	one.land("the red work", map[string]string{"src/y.txt": "red\n"})
	one.push(rescueOf)
	one.switchTo(trunk)
	one.drop(rescueOf)
	one.fetch()
	one.beatOn(pcGroup, pcOther, "beats", testNow)
	said := one.takenOver()
	holds(t, said, "What the box before left:")
	holds(t, said, leftLanded)
	holds(t, said, rescueOf)
}

// A take over prints the handover the dead box's beat carries. [[spec/tickets/crash-leaves-a-handover]]
func TestATakeOverPrintsTheHandoverTheBeatCarries(t *testing.T) {
	t.Parallel()
	one := leftBehind(t)
	one.beatLeaving(pcGroup, pcOther, testNow, map[string]string{"HANDOVER.md": leftHandover})
	holds(t, one.takenOver(), leftHandover)
}

// A take over whose dead box left no handover says so in one line. [[spec/tickets/crash-leaves-a-handover]]
func TestATakeOverWithNoHandoverSaysNone(t *testing.T) {
	t.Parallel()
	one := leftBehind(t)
	one.beatOn(pcGroup, pcOther, "beats", testNow)
	holds(t, one.takenOver(), "no handover")
}

// A take of a branch nobody held prints nothing of a box before. [[spec/tickets/crash-leaves-a-handover]]
func TestAPlainTakePrintsNothingLeft(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.pcHand()
	one.branch(pcGroup, map[string]string{ticketAt(pcGroup): pcGroupNote})
	if code := one.branchSays("take", pcGroup); code != codeOK {
		t.Fatalf("the take answers %d: %s", code, one.pcSaid())
	}
	said := one.pcSaid()
	holds(t, said, "Run ./RUNME.sh branch done")
	if strings.Contains(said, "What the box before left") || strings.Contains(said, "no handover") {
		t.Fatalf("a plain take prints what a box before left: %s", said)
	}
}

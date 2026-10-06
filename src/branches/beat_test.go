// A hold that reads whether its box still beats: an ended beat frees the
// branch at once under take --over, and a live beat keeps an old hold.
// [[spec/tickets/holds-beat-with-the-session]]
package branches

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"testing"
	"time"
)

// Pushes a beat the hand writes on the group to origin, at the moment named, as another box writes it. [[spec/tickets/holds-beat-with-the-session]]
func (one *tree) beatOn(group, hand, word string, at time.Time) {
	one.t.Helper()
	empty := one.git("hash-object", "-w", "-t", "tree", "/dev/null")
	kept := one.env
	one.env = append(append([]string{}, kept...), fmt.Sprintf("GIT_COMMITTER_DATE=@%d +0000", at.Unix()))
	sha := one.git("commit-tree", empty, "-m", hand+" "+word)
	one.env = kept
	one.git("push", "-q", "-f", "origin", sha+":"+beatPush+group)
}

// The commit the beat ref on origin names, or nothing. [[spec/tickets/holds-beat-with-the-session]]
func (one *tree) beatTip(group string) string {
	said := one.git("ls-remote", "origin", beatPush+group)
	return strings.TrimSpace(strings.Split(said+"\t", "\t")[0])
}

// A hold whose session ended moves under branch take --over at once, though its tip stands fresh. The flag stands before the name, which Branch reads empty. [[spec/tickets/holds-beat-with-the-session]] [[spec/tickets/boxes-hold-and-hand-back]]
func TestAnEndedHoldMovesUnderTakeOverAtOnce(t *testing.T) {
	t.Parallel()
	one := pcTakingHeld(t, 0, 0)
	one.beatOn(pcGroup, pcOther, "ends", time.Now())
	if code := one.branchSays("take", "--over", pcGroup); code != codeOK {
		t.Fatalf("the take --over answers %d: %s", code, one.pcSaid())
	}
	if on := one.git("rev-parse", "--abbrev-ref", "HEAD"); on != workBranch+pcGroup {
		t.Fatalf("the take --over lands on %s: %s", on, one.pcSaid())
	}
	if held := heldIn(one.pcTicket(pcGroup)); held == nil || held.Hand == pcOther {
		t.Fatalf("the ended hold stays with %s: %+v", pcOther, held)
	}
	holds(t, one.pcSubjects("origin/"+workBranch+pcGroup), "over from "+pcOther)
}

// A take, with --over or without, refuses a hold whose box still beats, though its tip stands past the stale span. [[spec/tickets/holds-beat-with-the-session]]
func TestTakeOverRefusesAHoldThatStillBeats(t *testing.T) {
	t.Parallel()
	for _, argv := range [][]string{{"take", "--over", pcGroup}, {"take", pcGroup}} {
		one := pcTakingHeld(t, time.Hour, 0)
		one.beatOn(pcGroup, pcOther, "beats", time.Now().Add(time.Hour-time.Minute))
		if code := one.branchSays(argv...); code != codeRed {
			t.Fatalf("%v over a beating hold answers %d: %s", argv, code, one.pcSaid())
		}
		if argv[1] == pcGroup && !strings.Contains(one.errs.String(), "failure take-branch-held-live ") {
			t.Fatalf("%v raises no take-branch-held-live: %s", argv, one.errs.String())
		}
		if held := heldIn(one.git("show", "origin/"+workBranch+pcGroup+":"+ticketAt(pcGroup))); held == nil || held.Hand != pcOther {
			t.Fatalf("%v moves the beating hold: %+v", argv, held)
		}
	}
}

// branch list names an old hold live while its box still beats, and asks nothing under Yours. Another box's beat reaches this clone through the fetch. [[spec/tickets/holds-beat-with-the-session]]
func TestListNamesAnOldHoldLiveWhileItsBoxBeats(t *testing.T) {
	t.Parallel()
	one := pcTakingHeld(t, 3*time.Hour, 0)
	one.beatOn(pcGroup, pcOther, "beats", time.Now().Add(3*time.Hour-time.Minute))
	one.branchSays("list", "--fetch")
	said := one.out.String()
	if strings.Contains(said, "Yours") {
		t.Fatalf("a beating hold stands under Yours: %s", said)
	}
	if !regexp.MustCompile(`work/one-group\s+held.*\blive\b`).MatchString(said) {
		t.Fatalf("the row names the beating hold no live: %s", said)
	}
}

// branch beat writes the hand's beat on origin, a second beat inside half the span writes nothing, and --end writes the end. [[spec/tickets/holds-beat-with-the-session]]
func TestABeatInsideHalfTheSpanWritesNothing(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	hand := one.pcHand()
	pcOnGroup(one, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, hand, "b818c390")})
	if code := one.branchSays("beat"); code != codeOK {
		t.Fatalf("the beat answers %d: %s", code, one.pcSaid())
	}
	first := one.beatTip(pcGroup)
	if first == "" {
		t.Fatal("the beat writes nothing on origin")
	}
	holds(t, one.git("log", "-1", "--format=%s", first), hand+" beats")
	if code := one.branchSays("beat"); code != codeOK || one.beatTip(pcGroup) != first {
		t.Fatalf("a second beat inside half the span answers %d and moves the ref: %s", code, one.pcSaid())
	}
	if code := one.branchSays("beat", "--end"); code != codeOK {
		t.Fatalf("the end answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.git("log", "-1", "--format=%s", one.beatTip(pcGroup)), hand+" ends")
}

// The Stop hook runs the beat at every turn's end, so off a branch this box holds, and on a refused push, it answers 0, prints nothing and writes nothing. [[spec/tickets/beat-hook-stays-quiet]]
func TestABeatStaysQuietWhereItWritesNothing(t *testing.T) {
	t.Parallel()
	offHold := newTree(t, nil)
	if code := offHold.branchSays("beat"); code != codeOK || offHold.pcSaid() != "" || offHold.beatTip(pcGroup) != "" {
		t.Fatalf("a beat on %s answers %d and prints %q", trunk, code, offHold.pcSaid())
	}
	refused := newTree(t, nil)
	hand := refused.pcHand()
	pcOnGroup(refused, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, hand, "b818c390")})
	refused.git("remote", "set-url", "--push", "origin", t.TempDir())
	if code := refused.branchSays("beat", "--end"); code != codeOK || refused.pcSaid() != "" || refused.beatTip(pcGroup) != "" {
		t.Fatalf("a refused beat answers %d and prints %q", code, refused.pcSaid())
	}
}

// Git dates carry seconds alone, so an end stamped in the tip's own second reads the hold dead. [[spec/tickets/ended-beat-ties-the-tip]]
func TestAnEndInTheTipsSecondReadsDead(t *testing.T) {
	t.Parallel()
	one := pcTakingHeld(t, 0, 0)
	tip, err := strconv.ParseInt(one.git("log", "-1", "--format=%ct", "origin/"+workBranch+pcGroup), 10, 64)
	if err != nil {
		t.Fatal(err)
	}
	one.beatOn(pcGroup, pcOther, "ends", time.Unix(tip, 0))
	if code := one.branchSays("take", "--over", pcGroup); code != codeOK {
		t.Fatalf("the take --over over an end in the tip's second answers %d: %s", code, one.pcSaid())
	}
}

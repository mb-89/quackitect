// A takeover takes in the rescue branch a dead box left on origin, and leaves
// a rescue that conflicts standing for a hand.
// [[spec/tickets/takeover-rescues-unpushed-commits]]
package branches

import (
	"testing"
	"time"
)

// The rescue branch the cases read, and the file the old box's work writes. [[spec/tickets/takeover-rescues-unpushed-commits]]
const (
	rescueOf  = "rescue/" + pcGroup
	rescuedAt = "src/x.txt"
)

// A group another box holds past the stale span, carrying a file, and a rescue branch off it that changes the file. [[spec/tickets/takeover-rescues-unpushed-commits]]
func rescuing(t *testing.T) *tree {
	t.Helper()
	one := newTree(t, nil)
	one.pcHand()
	one.branch(pcGroup, map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, pcOther, "a1b2c3"), rescuedAt: "base\n"})
	one.git("switch", "-q", "-c", rescueOf, "origin/"+workBranch+pcGroup)
	one.land("the red work", map[string]string{rescuedAt: "rescued\n"})
	one.git("push", "-q", "origin", rescueOf)
	one.git("switch", "-q", "main")
	one.git("branch", "-q", "-D", rescueOf)
	one.git("fetch", "-q", "origin")
	one.pcClock(time.Hour)
	return one
}

// Whether origin carries the branch. [[spec/tickets/takeover-rescues-unpushed-commits]]
func (one *tree) originCarries(branch string) bool {
	return one.git("ls-remote", "--heads", "origin", branch) != ""
}

// branch take --over takes in the rescue branch the old box left, pushes it on the work branch, and drops the rescue. [[spec/tickets/takeover-rescues-unpushed-commits]]
func TestTakeOverTakesInTheRescueBranch(t *testing.T) {
	t.Parallel()
	one := rescuing(t)
	rescued := one.git("rev-parse", "origin/"+rescueOf)
	if code := one.branchSays("take", "--over", pcGroup); code != codeOK {
		t.Fatalf("the take --over answers %d: %s", code, one.pcSaid())
	}
	if got := one.read(rescuedAt); got != "rescued\n" {
		t.Fatalf("the rescued work reads %q on the work branch: %s", got, one.pcSaid())
	}
	one.git("fetch", "-q", "origin")
	if !one.d.quiet("merge-base", "--is-ancestor", rescued, "origin/"+workBranch+pcGroup).OK {
		t.Fatal("the work branch on origin lacks the rescued commit")
	}
	if one.originCarries(rescueOf) {
		t.Fatal("the rescue branch stands on origin after the take took it in")
	}
	holds(t, one.pcSaid(), rescueOf)
}

// A rescue that conflicts with the work branch stays on origin, the merge stands aborted, and the take names the command that takes it in. [[spec/tickets/takeover-rescues-unpushed-commits]]
func TestTakeOverLeavesAConflictingRescueStanding(t *testing.T) {
	t.Parallel()
	one := rescuing(t)
	one.git("switch", "-q", "-c", workBranch+pcGroup, "origin/"+workBranch+pcGroup)
	one.land("the pushed work", map[string]string{rescuedAt: "pushed\n"})
	one.git("push", "-q", "origin", workBranch+pcGroup)
	one.git("switch", "-q", "main")
	one.git("branch", "-q", "-D", workBranch+pcGroup)
	one.git("fetch", "-q", "origin")
	if code := one.branchSays("take", "--over", pcGroup); code != codeOK {
		t.Fatalf("the take --over answers %d: %s", code, one.pcSaid())
	}
	if !one.originCarries(rescueOf) {
		t.Fatal("the conflicting rescue leaves origin")
	}
	if one.pcTip("MERGE_HEAD") != "" || one.read(rescuedAt) != "pushed\n" {
		t.Fatalf("the conflicting merge stands open: %s", one.pcSaid())
	}
	holds(t, one.pcSaid(), "git merge origin/"+rescueOf)
}

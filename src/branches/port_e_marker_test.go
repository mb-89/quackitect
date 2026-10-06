// The cloud marker over a real tree: open writes it on trunk once the branch
// stands, the merge and the close drop it, and the release leaves it, as
// test/level0/work-cloud-marker.test.js holds.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"

	"quackitect/src/front"
)

// Open marks trunk once the branch push lands: the branch carries the bare group, and trunk the mark. [[spec/tickets/work-verbs-port-to-go]]
func TestPEOpenMarksTrunkAfterTheBranchPush(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): groupNote}).desk()
	if code := one.branchSays("open", "g"); code != codeOK {
		t.Fatalf("the open answers %d: %s", code, one.errs.String())
	}
	if fieldOf(one.read(ticketAt("g")), cloudMark) != "true" {
		t.Fatal("the clone's ticket carries no marker")
	}
	if said := one.git("log", "-1", "--format=%s", "main"); said != "g: opens in the cloud" {
		t.Fatalf("main's last commit reads %q", said)
	}
	if fieldOf(one.peOriginFile("main", ticketAt("g")), cloudMark) != "true" {
		t.Fatal("origin's main carries no marker")
	}
	if fieldOf(one.peOriginFile("work/g", ticketAt("g")), cloudMark) != "" {
		t.Fatal("the branch carries the marker, so it was cut after the trunk push")
	}
}

// Open off trunk refuses, and pushes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPEOpenOffTrunkRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): groupNote}).desk()
	tip := one.peOriginTip("main")
	one.git("switch", "-q", "-c", "work/other")
	if code := one.branchSays("open", "g"); code != codeRefused {
		t.Fatalf("the open answers %d", code)
	}
	holds(t, one.errs.String(), "runs on main")
	if one.peOriginTip("work/g") != "" || one.peOriginTip("main") != tip {
		t.Fatal("the refused open pushes")
	}
}

// A refused branch push leaves trunk without the marker. [[spec/tickets/work-verbs-port-to-go]]
func TestPERefusedBranchPushLeavesTrunkBare(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): groupNote}).desk()
	one.peOriginRefuses(`case "$ref" in refs/heads/work/*) true;; *) false;; esac`)
	tip := one.peOriginTip("main")
	if code := one.branchSays("open", "g"); code != codeRed {
		t.Fatalf("the open answers %d", code)
	}
	if fieldOf(one.read(ticketAt("g")), cloudMark) != "" {
		t.Fatal("the clone's ticket carries the marker")
	}
	if one.peOriginTip("main") != tip {
		t.Fatal("main reaches origin")
	}
}

// Open marks a branch already standing in the cloud, and pushes trunk alone. [[spec/tickets/work-verbs-port-to-go]]
func TestPEOpenMarksABranchAlreadyStanding(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): groupNote}).desk()
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	branchTip := one.peOriginTip("work/g")
	if code := one.branchSays("open", "g"); code != codeOK {
		t.Fatalf("the open answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "already stands in the cloud")
	if fieldOf(one.peOriginFile("main", ticketAt("g")), cloudMark) != "true" {
		t.Fatal("origin's main carries no marker")
	}
	if one.peOriginTip("work/g") != branchTip {
		t.Fatal("the branch moves on origin")
	}
}

// The merge drops the marker inside the merge commit. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergeDropsTheMarkerOnTheMergeCommit(t *testing.T) {
	t.Parallel()
	one := peMergeTree(t, map[string]string{ticketAt("g"): peMarked}, map[string]string{ticketAt("g"): peMarkedDone})
	if code := one.branchSays("merge", "g"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if fieldOf(one.read(ticketAt("g")), cloudMark) != "" {
		t.Fatal("the clone's ticket keeps the marker")
	}
	if parents := strings.Fields(one.git("rev-list", "--parents", "-n", "1", "HEAD")); len(parents) != 3 {
		t.Fatalf("HEAD is no merge commit: %v", parents)
	}
	if fieldOf(one.git("show", "HEAD:"+ticketAt("g")), cloudMark) != "" {
		t.Fatal("the merge commit keeps the marker")
	}
}

// A merge conflicting elsewhere drops the marker and stages the drop, with no amend. [[spec/tickets/work-verbs-port-to-go]]
func TestPEConflictedMergeStagesTheMarkerDrop(t *testing.T) {
	t.Parallel()
	one := peMergeTree(t,
		map[string]string{ticketAt("g"): peMarked, "src/a.txt": "one\n"},
		map[string]string{ticketAt("g"): peMarkedDone, "src/a.txt": "two\n"})
	one.peTrunkMoves(map[string]string{"src/a.txt": "three\n"})
	was := one.git("rev-parse", "HEAD")
	if code := one.branchSays("merge", "g"); code != codeRed {
		t.Fatalf("the merge answers %d: %s", code, one.errs.String())
	}
	holds(t, one.errs.String(), "conflicts")
	if fieldOf(one.read(ticketAt("g")), cloudMark) != "" {
		t.Fatal("the clone's ticket keeps the marker")
	}
	if fieldOf(one.git("show", ":"+ticketAt("g")), cloudMark) != "" {
		t.Fatal("the index keeps the marker")
	}
	if one.git("rev-parse", "HEAD") != was {
		t.Fatal("the conflicted merge commits")
	}
}

// A merge conflicting on the group ticket leaves the marker and the conflict for the person, and names the drop. An empty ticket trunk deletes makes the conflict past the moved-on-trunk read. [[spec/tickets/work-verbs-port-to-go]]
func TestPETicketConflictLeavesTheMarkerUnstaged(t *testing.T) {
	t.Parallel()
	one := peMergeTree(t, map[string]string{ticketAt("g"): ""}, map[string]string{ticketAt("g"): peMarkedDone})
	one.git("rm", "-q", ticketAt("g"))
	one.peTrunkMoves(nil)
	if code := one.branchSays("merge", "g"); code != codeRed {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	holds(t, one.errs.String(), "Drop cloud: true from "+ticketAt("g"))
	if fieldOf(one.read(ticketAt("g")), cloudMark) != "true" {
		t.Fatal("the clone's ticket loses the marker")
	}
	holds(t, one.git("diff", "--name-only", "--diff-filter=U"), ticketAt("g"))
}

// Close drops the marker on trunk, pushes trunk, and then deletes the branch. [[spec/tickets/work-verbs-port-to-go]]
func TestPECloseDropsTheMarkerBeforeTheBranchGoes(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): peMarked}).desk()
	one.branch("g", map[string]string{"src/one.txt": "one\n"})
	if code := one.branchSays("close", "g", "--force"); code != codeOK {
		t.Fatalf("the close answers %d: %s", code, one.errs.String())
	}
	if fieldOf(one.read(ticketAt("g")), cloudMark) != "" {
		t.Fatal("the clone's ticket keeps the marker")
	}
	if said := one.git("log", "-1", "--format=%s", "main"); said != "g: leaves the cloud" {
		t.Fatalf("main's last commit reads %q", said)
	}
	if fieldOf(one.peOriginFile("main", ticketAt("g")), cloudMark) != "" {
		t.Fatal("origin's main keeps the marker")
	}
	if one.peOriginTip("work/g") != "" {
		t.Fatal("the branch stands on origin")
	}
}

// Close off trunk refuses, and deletes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPECloseOffTrunkRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): peMarked}).desk()
	one.branch("g", map[string]string{"src/one.txt": "one\n"})
	one.git("switch", "-q", "-c", "work/other")
	if code := one.branchSays("close", "g", "--force"); code != codeRefused {
		t.Fatalf("the close answers %d", code)
	}
	holds(t, one.errs.String(), "runs on main")
	if one.peOriginTip("work/g") == "" || fieldOf(one.peOriginFile("main", ticketAt("g")), cloudMark) != "true" {
		t.Fatal("the refused close moves origin")
	}
}

// Close on a dirty tree refuses, and deletes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPECloseOnADirtyTreeRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): peMarked, "src/one.js": "one\n"}).desk()
	one.branch("g", map[string]string{"src/two.txt": "two\n"})
	one.write(map[string]string{"src/one.js": "changed\n"})
	if code := one.branchSays("close", "g", "--force"); code != codeRefused {
		t.Fatalf("the close answers %d", code)
	}
	holds(t, one.errs.String(), "uncommitted changes")
	if one.peOriginTip("work/g") == "" || fieldOf(one.peOriginFile("main", ticketAt("g")), cloudMark) != "true" {
		t.Fatal("the refused close moves origin")
	}
}

// Release leaves the marker on the branch's group, pushes no trunk, and the branch stands at todo. [[spec/tickets/work-verbs-port-to-go]]
func TestPEReleaseLeavesTheMarker(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	held := withEntry(peMarked, front.Ordered{{Key: "step", Value: "children"}, {Key: "hand", Value: "box 3f9a"}, {Key: "hash_before", Value: "a1b2c3"}})
	one.branch("g", map[string]string{ticketAt("g"): held})
	tip := one.peOriginTip("main")
	if code := one.branchSays("release", "g"); code != codeOK {
		t.Fatalf("the release answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	holds(t, one.out.String(), "stands at todo again")
	if fieldOf(one.peOriginFile("work/g", ticketAt("g")), cloudMark) != "true" {
		t.Fatal("the release drops the marker")
	}
	if one.peOriginTip("main") != tip {
		t.Fatal("the release pushes main")
	}
}

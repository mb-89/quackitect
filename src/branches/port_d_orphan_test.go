// The orphan, ported off test/level0/work-orphan.test.js: a branch sharing no
// ancestor with trunk reaches no sync, so the take passes it over and the list
// says why, once a shallow clone stands whole.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"
)

// A tree with work/orphan, urgent and sharing no commit with main, and work/fine off main. [[spec/tickets/work-verbs-port-to-go]]
func pdOrphaned(t *testing.T) *tree {
	t.Helper()
	one := newTree(t, nil)
	one.must(one.repo.Orphan("work/orphan"))
	one.land("orphan lands", map[string]string{".gitignore": ".se/\n", ticketAt("orphan"): pdGroupNote})
	one.push("work/orphan")
	one.switchTo(trunk)
	one.drop("work/orphan")
	one.branch("fine", map[string]string{ticketAt("fine"): strings.Replace(pdGroupNote, "urgent: true\n", "", 1)})
	return one
}

// A tree whose clone stands shallow, with work/old cut off main before main moved on. [[spec/tickets/work-verbs-port-to-go]]
func pdShallow(t *testing.T) (*tree, string) {
	t.Helper()
	one := newTree(t, nil)
	one.branch("old", map[string]string{ticketAt("old"): strings.Replace(pdGroupNote, "urgent: true\n", "", 1)})
	pdMainMoves(one, 1)
	base, _ := one.repo.MergeBase("origin/main", "origin/work/old")
	one.disk = newFakeDisk()
	one.repo = one.origin.CloneShallow(one.disk)
	one.d.Repo, one.d.Disk = one.repo, one.disk
	if said, ok := one.repo.MergeBase("origin/main", "origin/work/old"); ok {
		t.Fatalf("the clone stands whole, and finds the base %s", said)
	}
	return one, base
}

// The take passes over a branch sharing no ancestor with trunk, and names it. [[spec/tickets/work-verbs-port-to-go]]
func TestPDTakePassesOverAnOrphan(t *testing.T) {
	t.Parallel()
	one := pdOrphaned(t)
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if here := one.here(); here != "work/fine" {
		t.Fatalf("the take stands on %s", here)
	}
	if one.rev("refs/heads/work/orphan") != "" {
		t.Fatal("the take touches the orphan")
	}
	holds(t, one.out.String(), "work/orphan")
}

// The list marks a branch sharing no ancestor with trunk, and the other reads as it stood. [[spec/tickets/work-verbs-port-to-go]]
func TestPDListMarksAnOrphan(t *testing.T) {
	t.Parallel()
	one := pdOrphaned(t)
	one.branchSays("list")
	pdMatches(t, one.out.String(), `work/orphan\s+orphan`)
	pdMatches(t, one.out.String(), `work/fine\s+todo`)
}

// The list fetches a shallow clone whole before it marks a branch an orphan. [[spec/tickets/work-verbs-port-to-go]]
func TestPDListUnshallowsBeforeTheOrphanMark(t *testing.T) {
	t.Parallel()
	one, _ := pdShallow(t)
	one.branchSays("list")
	if one.repo.Unshallow() {
		t.Fatal("the listing leaves the clone shallow")
	}
	pdMisses(t, one.out.String(), `work/old\s+orphan`)
	pdMatches(t, one.out.String(), `work/old\s+todo`)
}

// The base fetches a shallow clone whole and asks again, answering the shared commit. [[spec/tickets/work-verbs-port-to-go]]
func TestPDBaseUnshallowsAndAsksAgain(t *testing.T) {
	t.Parallel()
	one, base := pdShallow(t)
	shares, said := one.d.baseOnTrunk("work/old")
	if !shares || said != base {
		t.Fatalf("the base answers %v %q, and the shared commit is %q", shares, said, base)
	}
}

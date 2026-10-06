// A group reaching the cloud over a real tree: the open, and the reads that
// tell a fresh cut from a landed branch, as test/level0/work-open.test.js and
// the take case of test/level0/roots.test.js hold.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
)

// A ref reads merged where the merged set names it, and open where it does not. [[spec/tickets/work-verbs-port-to-go]]
func TestPERefsReadMergedOffTheSet(t *testing.T) {
	t.Parallel()
	said := refsIn("origin/work/fresh-cut aaa 0\norigin/work/landed bbb 0", map[string]bool{"work/landed": true})
	var got [][2]any
	for _, one := range said {
		got = append(got, [2]any{one.Branch, one.Merged})
	}
	want := [][2]any{{"work/fresh-cut", false}, {"work/landed", true}}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("the refs read %v", got)
	}
}

// The merged set drops a branch standing at trunk's tip. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergedDropsACutAtTheTip(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.branch("landed", map[string]string{"src/landed.txt": "x\n"})
	one.git("merge", "-q", "--no-ff", "--no-edit", "origin/work/landed")
	one.git("push", "-q", "origin", "main")
	one.git("push", "-q", "origin", "main:refs/heads/work/fresh-cut")
	one.git("fetch", "-q", "origin")
	if got := one.d.mergedHere(); !reflect.DeepEqual(got, map[string]bool{"work/landed": true}) {
		t.Fatalf("the merged set reads %v", got)
	}
}

// The merged set drops a cut on trunk's first-parent line after trunk moves on. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergedDropsACutOnTrunksLine(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	one.git("push", "-q", "origin", "main:refs/heads/work/fresh-cut")
	one.peTrunkMoves(map[string]string{"src/moved.txt": "m\n"})
	one.branch("landed", map[string]string{"src/landed.txt": "x\n"})
	one.git("merge", "-q", "--no-ff", "--no-edit", "origin/work/landed")
	one.git("push", "-q", "origin", "main")
	one.git("fetch", "-q", "origin")
	if got := one.d.mergedHere(); !reflect.DeepEqual(got, map[string]bool{"work/landed": true}) {
		t.Fatalf("the merged set reads %v", got)
	}
}

// A group landed once trunk carries its ticket closed, and a cut or a done-only branch has not. [[spec/tickets/work-verbs-port-to-go]]
func TestPELandedReadsTrunksTicket(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{
		ticketAt("landed"):    "---\nstate: closed\n---\n",
		ticketAt("fresh-cut"): "---\nstate: open\n---\n",
	}).desk()
	got := one.d.landedHere([]string{"work/landed", "work/fresh-cut", "work/done-only"})
	if !reflect.DeepEqual(got, map[string]bool{"work/landed": true}) {
		t.Fatalf("the landed set reads %v", got)
	}
}

// Open pushes a group off trunk, and says it stands at todo. [[spec/tickets/work-verbs-port-to-go]]
func TestPEOpenPushesAGroupOffTrunk(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): groupNote}).desk()
	if code := one.branchSays("open", "g"); code != codeOK {
		t.Fatalf("the open answers %d: %s", code, one.errs.String())
	}
	if one.peOriginTip("work/g") == "" {
		t.Fatal("origin holds no work/g")
	}
	holds(t, one.out.String(), "work/g stands at todo")
}

// Open refuses a name trunk carries no group for, and pushes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPEOpenRefusesAMissingGroup(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	tip := one.peOriginTip("main")
	if code := one.branchSays("open", "g"); code != codeRefused {
		t.Fatalf("the open answers %d", code)
	}
	holds(t, one.errs.String(), "carries no")
	if one.peOriginTip("work/g") != "" || one.peOriginTip("main") != tip {
		t.Fatal("the refused open pushes")
	}
}

// Open leaves a branch already in the cloud alone where trunk carries the marker, and pushes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPEOpenLeavesAStandingBranchAlone(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): peMarked}).desk()
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	trunkTip, branchTip := one.peOriginTip("main"), one.peOriginTip("work/g")
	if code := one.branchSays("open", "g"); code != codeOK {
		t.Fatalf("the open answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "already stands in the cloud")
	if one.peOriginTip("main") != trunkTip || one.peOriginTip("work/g") != branchTip {
		t.Fatal("the open pushes")
	}
}

// On trunk a cloud box takes the group, and the record lands in the ticket under the work root, the method root holding none. [[spec/tickets/work-verbs-port-to-go]]
func TestPETakeWritesTheRecordUnderTheWorkRoot(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.d.Method = t.TempDir()
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	if code := one.branchSays("take"); code != codeOK {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	holds(t, one.out.String(), "holds it")
	holds(t, one.read(ticketAt("g")), "hash_before:")
	if _, err := os.Stat(filepath.Join(one.d.Method, filepath.FromSlash(ticketAt("g")))); err == nil {
		t.Fatal("the method root holds the ticket")
	}
}

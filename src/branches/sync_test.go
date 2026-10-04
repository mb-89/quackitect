// The sync: trunk comes in, and a ticket whose front alone conflicts merges.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A branch carrying every commit of trunk takes nothing, and one behind takes trunk by a merge. [[spec/design_output/work#trunk-comes-in-first]]
func TestTheSyncTakesTrunkIn(t *testing.T) {
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	one.git("switch", "-q", "-c", "work/g", "origin/work/g")
	if code := one.branchSays("sync"); code != 0 {
		t.Fatalf("the sync answers %d", code)
	}
	holds(t, one.out.String(), "work/g already carries every commit on main.")
	one.git("switch", "-q", "main")
	one.land("main moves", map[string]string{"other.txt": "x\n"})
	one.git("push", "-q", "origin", "main")
	one.git("switch", "-q", "work/g")
	if code := one.branchSays("sync"); code != 0 {
		t.Fatalf("the sync answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "work/g took 1 commit(s) from main.")
}

// The sync runs on trunk or a work branch alone. [[spec/design_output/work#trunk-comes-in-first]]
func TestTheSyncRefusesAnyOtherBranch(t *testing.T) {
	one := newTree(t, nil)
	one.git("switch", "-q", "-c", "side")
	if code := one.branchSays("sync"); code != codeRefused {
		t.Fatalf("the sync answers %d", code)
	}
}

// Two sides changing apart keys merge key by key, and the record joins what both append. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func TestTheFrontMergesKeyByKey(t *testing.T) {
	base := "---\nstate: open\nstep: a\nrecord:\n  - step: a\n    hand: x\n---\n\n# Ask\n"
	ours := "---\nstate: open\nstep: b\nrecord:\n  - step: a\n    hand: x\n  - step: b\n    hand: y\n---\n\n# Ask\n"
	theirs := "---\nstate: open\nstep: a\ncloud: true\nrecord:\n  - step: a\n    hand: x\n  - step: c\n    hand: z\n---\n\n# Ask\n"
	said, ok := mergedFront(base, ours, theirs)
	if !ok {
		t.Fatal("the fronts clash")
	}
	want := "---\nstate: open\nstep: b\ncloud: true\nrecord:\n  - step: a\n    hand: x\n  - step: b\n    hand: y\n  - step: c\n    hand: z\n---\n\n# Ask\n"
	if said != want {
		t.Fatalf("the merge reads\n%s", said)
	}
	if _, ok := mergedFront(base, withField(base, "state", "draft"), withField(base, "state", closedState)); ok {
		t.Fatal("a key both sides change apart merges")
	}
}

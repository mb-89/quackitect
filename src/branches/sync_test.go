// The sync: another branch refuses, and a ticket whose front alone conflicts merges.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// The sync runs on trunk or a work branch alone. [[spec/design_output/work#trunk-comes-in-first]]
func TestTheSyncRefusesAnyOtherBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.cut("side", "")
	if code := one.branchSays("sync"); code != codeRefused {
		t.Fatalf("the sync answers %d", code)
	}
}

// Two sides changing apart keys merge key by key, and the record joins what both append. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func TestTheFrontMergesKeyByKey(t *testing.T) {
	t.Parallel()
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

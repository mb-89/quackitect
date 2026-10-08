// The sync: another branch refuses, and a ticket whose front alone conflicts merges.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported mergedFront through the tree fixture

import (
	"strings"
	"testing"
)

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
}

// A key both sides change apart, a record one side rewrites, and a body both sides change apart each stay for a hand. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func TestTheFrontLeavesEachClashForAHand(t *testing.T) {
	t.Parallel()
	base := "---\nstate: open\nrecord:\n  - step: sync\n    hand: agent\n---\n\n# Ask\n\nOne thing.\n"
	ours := strings.Replace(base, "---\n\n", "  - step: split\n    hand: agent\n---\n\n", 1)
	theirs := strings.Replace(base, "---\n\n", "  - step: trunk-step\n    hand: agent\ncloud: true\n---\n\n", 1)
	if _, ok := mergedFront(base, ours, theirs); !ok {
		t.Fatal("the sides clash before any row changes them")
	}
	cases := []struct {
		name         string
		ours, theirs string
	}{
		{"a key", withField(ours, "state", closedState), withField(theirs, "state", draftState)},
		{"a record", ours, strings.Replace(theirs, "step: sync", "step: other", 1)},
		{"the body", strings.Replace(ours, "One thing.", "Three things.", 1), strings.Replace(theirs, "One thing.", "Two things.", 1)},
	}
	for _, one := range cases {
		if said, ok := mergedFront(base, one.ours, one.theirs); ok {
			t.Errorf("%s both sides change apart merges into\n%s", one.name, said)
		}
	}
}

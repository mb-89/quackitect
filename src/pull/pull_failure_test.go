// The pull raises each refusal through the failure door: the id, its level
// and each remedy print beneath the message, and the log row carries the id.
// [[spec/design_output/failures#the-refusals-move-onto-nodes]]
package pull

import (
	"strings"
	"testing"

	"quackitect/src/failure"
)

// The cloud pull over a fake registry, and the failure ids its log takes. [[spec/design_output/failures#the-refusals-move-onto-nodes]]
func raisingPull(t *testing.T, nodes ...failure.Node) (*It, func() string, *[]string) {
	t.Helper()
	it, _, errs := cloudPull(t)
	it.Failures = failure.Fake(nodes...)
	logged := &[]string{}
	it.Log = func(level, kind, said string, extra map[string]any) {
		if kind == failure.RowKind {
			*logged = append(*logged, level+" "+extra[failure.IDField].(string))
		}
	}
	return it, errs.String, logged
}

func TestAPullHoldingALeafRaisesPullHandHoldsWithItsRemedy(t *testing.T) {
	t.Parallel()
	it, errs, logged := raisingPull(t, failure.Node{ID: "pull-hand-holds", Level: "warn", Remedies: []string{"Hand the leaf back."}})
	it.Pulling([]string{"pull"})
	code := it.Pulling([]string{"pull"})
	for _, want := range []string{"refused\n  alpha stands in your hand at do", "  failure pull-hand-holds at warn", "  remedy: Hand the leaf back."} {
		if code != 1 || !strings.Contains(errs(), want) {
			t.Fatalf("the pull answers %d, and lacks %q:\n%s", code, want, errs())
		}
	}
	if strings.Join(*logged, ",") != "warn pull-hand-holds" {
		t.Fatalf("the log takes %q", *logged)
	}
}

func TestAPullOffMainAndOffAWorkBranchRaisesPullBranchOffRoad(t *testing.T) {
	t.Parallel()
	it, errs, logged := raisingPull(t, failure.Node{ID: "pull-branch-off-road", Level: "warn", Remedies: []string{"Switch to main."}})
	gitIn(t, it.Root, "switch", "-q", "-c", "feature")
	code := it.Pulling([]string{"pull"})
	for _, want := range []string{"refused\n  ticket pull runs on main or a work branch, and this is feature.", "  failure pull-branch-off-road at warn", "  remedy: Switch to main."} {
		if code != 2 || !strings.Contains(errs(), want) {
			t.Fatalf("the pull answers %d, and lacks %q:\n%s", code, want, errs())
		}
	}
	if strings.Join(*logged, ",") != "warn pull-branch-off-road" {
		t.Fatalf("the log takes %q", *logged)
	}
}

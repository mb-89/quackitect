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
	must(t, it.Git.Switch("feature", true))
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

func TestRefusalsNameTheirIds(t *testing.T) {
	t.Parallel()
	cases := []struct {
		name   string
		before [][]string
		argv   []string
		id     string
	}{
		{"a hand-back with nothing in hand", nil, []string{"pull", "alpha", "--pass"}, "pull-hand-empty"},
		{"a hand-back naming another ticket", [][]string{{"pull"}}, []string{"pull", "g", "--pass"}, "pull-hand-other-ticket"},
		{"a verdict flag without its word", nil, []string{"pull", "alpha", "--fail"}, "pull-flags-refused"},
		{"a take-back naming a ticket nowhere", nil, []string{"pull", "ghost", "--back", "do"}, "pull-ticket-nowhere"},
		{"a take-back naming no leaf of the ticket", nil, []string{"pull", "alpha", "--back", "nope"}, "pull-leaf-unknown"},
		{"a take-back of a leaf nobody handed back", nil, []string{"pull", "alpha", "--back", "do"}, "pull-back-other-hand"},
		{"fields that read as no JSON object", [][]string{{"pull"}}, []string{"pull", "alpha", "--pass", "--fields", "nope"}, "pull-fields-refused"},
		{"a hand-back missing a field", [][]string{{"pull"}}, []string{"pull", "alpha", "--pass", "--fields", `{"tests":"echo green"}`}, "pull-evidence-refused"},
	}
	for _, one := range cases {
		t.Run(one.name, func(t *testing.T) {
			t.Parallel()
			it, errs, logged := raisingPull(t, failure.Node{ID: one.id, Level: "warn", Remedies: []string{"Do the thing."}})
			for _, argv := range one.before {
				it.Pulling(argv)
			}
			code := it.Pulling(one.argv)
			if code == 0 || !strings.Contains(errs(), "\n  failure "+one.id+" at warn\n  remedy: Do the thing.") {
				t.Fatalf("the pull answers %d, and names no %s:\n%s", code, one.id, errs())
			}
			if strings.Join(*logged, ",") != "warn "+one.id {
				t.Fatalf("the log takes %q", *logged)
			}
		})
	}
}

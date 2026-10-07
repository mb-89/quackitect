// The cloud trigger: the routine, and the branches free.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"testing"
	"time"
)

// The trigger names the routine, and each free branch, past one waiting on another. [[spec/design_output/work#the-routine-a-verb-names]]
func TestTheTriggerNamesTheFreeBranches(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("a", map[string]string{ticketAt("a"): groupNote})
	one.branch("b", map[string]string{ticketAt("b"): withField(groupNote, "depends_on", "[a]")})
	one.out.Reset()
	if code := Cloud(one.d, []string{"trigger"}); code != 0 {
		t.Fatalf("the trigger answers %d", code)
	}
	said := one.out.String()
	holds(t, said, "action=run  trigger_id="+routineID)
	holds(t, said, "  work/a\n")
	if contains(said, "  work/b") {
		t.Fatalf("a waiting branch reads free: %s", said)
	}
}

// The cloud verb with no word prints its usage, and an unknown word refuses. [[spec/design_output/work#the-routine-a-verb-names]]
func TestTheCloudVerbPrintsItsUsage(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := Cloud(one.d, nil); code != 0 {
		t.Fatalf("a bare cloud answers %d", code)
	}
	if code := Cloud(one.d, []string{"nope"}); code != codeRefused {
		t.Fatalf("an unknown word answers %d", code)
	}
	holds(t, one.out.String(), "Usage: ./RUNME.sh cloud <verb>")
}

// What the trigger prints, run once over the tree. [[spec/tickets/branch-scripts-leave]]
func triggered(t *testing.T, one *tree) string {
	t.Helper()
	one.out.Reset()
	if code := Cloud(one.d, []string{"trigger"}); code != 0 {
		t.Fatalf("the trigger answers %d: %s", code, one.errs.String())
	}
	return one.out.String()
}

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
func TestAStaleClaimWaitingOnADependencyStaysOutOfTheTrigger(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	waits := withField(pbTook(), "depends_on", "[two]")
	one.branchAt("one", map[string]string{ticketAt("one"): waits}, testNow.Add(-13*time.Hour))
	one.branch("two", map[string]string{ticketAt("two"): groupNote})
	said := triggered(t, one)
	holds(t, said, "  work/two\n")
	if contains(said, "  work/one") {
		t.Fatalf("a stale claim waiting on work/two reads free: %s", said)
	}
}

// [[spec/design_output/work#a-stale-group-is-yours]]
func TestATreeWithNoClockReadsNoClaimStale(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branchAt("one", map[string]string{ticketAt("one"): pbTook()}, testNow.Add(-13*time.Hour))
	holds(t, triggered(t, one), "  work/one\n")
	one.d.Now = nil
	holds(t, triggered(t, one), "No branch stands free")
}

// [[spec/design_output/work#a-dependency-waits-for-trunk]]
func TestADependencyClosedOnItsBranchHoldsItsDependentUntilTrunkCarriesIt(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	closed := map[string]string{ticketAt("one"): pbClosed(pbGroupNote)}
	one.branch("one", closed)
	one.branch("two", map[string]string{ticketAt("two"): withField(groupNote, "depends_on", "[one]")})
	holds(t, triggered(t, one), "No branch stands free")
	one.land("one lands", closed)
	one.push(trunk)
	one.fetch()
	holds(t, triggered(t, one), "  work/two\n")
}

// The cloud trigger: the routine, and the branches free.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported staleClaim and the stand and routineID readers

import "testing"

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

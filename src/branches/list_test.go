// The listing: a row a group, its tickets under it, and the done ones.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A tree with no branch and no loose ticket lists nothing open. [[spec/design_output/work#a-row-per-group]]
func TestABareTreeListsNothingOpen(t *testing.T) {
	one := newTree(t, nil)
	if code := one.branchSays("list"); code != 0 {
		t.Fatalf("list answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "Nothing stands open.")
}

// A group's branch draws its row at todo, and its open child under it. [[spec/design_output/work#a-ticket-under-its-group]]
func TestAGroupDrawsItsRowAndItsChild(t *testing.T) {
	one := newTree(t, map[string]string{"spec/tickets/loose.md": "---\nstate: open\n---\n"})
	one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote})
	if code := one.branchSays("list"); code != 0 {
		t.Fatalf("list answers %d: %s", code, one.errs.String())
	}
	said := one.out.String()
	holds(t, said, padEnd("work/g", colBranch)+" todo  ")
	holds(t, said, "  "+padEnd("kid", colChild)+" ticket open   build")
	holds(t, said, padEnd("loose", colBranch)+" ticket open")
}

// The done flag lists a closed group with the read that opens it. [[spec/design_output/work#a-merged-branch-goes]]
func TestTheDoneFlagNamesTheRead(t *testing.T) {
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): withField(groupNote, "state", closedState)})
	one.branchSays("list", "--done")
	holds(t, one.out.String(), padEnd("work/g", colBranch)+" ./RUNME.sh branch read g")
}

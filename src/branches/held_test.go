// The release: a held branch goes back to todo.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported groupStanding and todo through the tree fixture

import "testing"

// A release closes the take, pushes, and the branch reads todo again. [[spec/design_output/work#a-stale-group-is-yours]]
func TestAReleaseFreesTheBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote})
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s", code, one.errs.String())
	}
	if code := one.branchSays("release"); code != 0 {
		t.Fatalf("the release answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "work/g stands at todo again, and is free for anybody.")
	if groupStanding(one.git("show", "origin/work/g:"+ticketAt("g"))+"\n") != todo {
		t.Fatal("origin reads the group held")
	}
}

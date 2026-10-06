// The take and the open: the desk refusal, nothing free, and the claim.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported heldIn, cloudMark and fieldOf after take runs

import "testing"

// A desk takes no branch, and the refusal names the merge road. [[spec/design_output/work#a-desk-works-on-trunk]]
func TestADeskTakesNoBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil).desk()
	if code := one.branchSays("take"); code != codeRefused {
		t.Fatalf("a desk take answers %d", code)
	}
	holds(t, one.errs.String(), "A desk works on main alone")
}

// A cloud box with no branch at todo takes nothing, and says so. [[spec/design_output/work#the-take-writes-the-record]]
func TestNothingAtTodoTakesNothing(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "No work branch stands at todo. Nothing to take.")
}

// The take claims a free group: the record names the hand, the claim lands on origin, and the brief prints the ask. [[spec/design_output/work#the-take-writes-the-record]]
func TestTheTakeClaimsAFreeGroup(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote, ticketAt("kid"): childNote})
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if one.git("rev-parse", "--abbrev-ref", "HEAD") != "work/g" {
		t.Fatal("the take leaves the box off the branch")
	}
	held := heldIn(one.read(ticketAt("g")))
	if held == nil || held.Step != "children" {
		t.Fatalf("the claim reads %+v", held)
	}
	if one.git("rev-parse", "HEAD") != one.git("rev-parse", "origin/work/g") {
		t.Fatal("the claim stays off origin")
	}
	holds(t, one.out.String(), "Its tickets stand in spec/tickets, and spec/tickets/g.md is the group itself.")
	holds(t, one.out.String(), "The group's ask.")
}

// An open names a group trunk carries, pushes its branch, and marks trunk's copy. [[spec/tickets/groups-carry-the-cloud-marker]]
func TestTheOpenPushesTheBranchAndMarksTrunk(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{ticketAt("g"): groupNote}).desk()
	if code := one.branchSays("open", "g"); code != 0 {
		t.Fatalf("the open answers %d: %s", code, one.errs.String())
	}
	one.git("fetch", "-q", "origin")
	if fieldOf(one.git("show", "origin/main:"+ticketAt("g")), cloudMark) != "true" {
		t.Fatal("trunk carries no marker")
	}
	holds(t, one.out.String(), "work/g stands at todo in the cloud, carrying spec/tickets/g.md.")
}

// An open naming no group refuses with its usage. [[spec/design_output/work#a-group-is-a-ticket]]
func TestAnOpenNamingNothingRefuses(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("open"); code != codeRefused {
		t.Fatalf("a bare open answers %d", code)
	}
	holds(t, one.errs.String(), "branch open needs a group")
}

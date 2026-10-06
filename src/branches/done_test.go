// The leave: done refuses off a work branch and short of a green stamp, and
// read prints a group.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// Done runs on a work branch alone. [[spec/design_output/work#a-group-is-a-ticket]]
func TestDoneRunsOnAWorkBranchAlone(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if code := one.branchSays("done"); code != codeRefused {
		t.Fatalf("done on main answers %d", code)
	}
	holds(t, one.errs.String(), "branch done runs on a work branch, and this is main.")
}

// A branch with no check stamp claims nothing. [[spec/design_output/work#the-battery-answers-first]]
func TestDoneWantsTheCheckOnHead(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	one.git("switch", "-q", "-c", "work/g", "origin/work/g")
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d", code)
	}
	holds(t, one.errs.String(), "work/g claims nothing yet: no check has run here.")
}

// The stamp reads green on its own commit alone, clean and with no warning. [[spec/design_output/work#the-battery-answers-first]]
func TestTheStampReadsGreenOnItsCommit(t *testing.T) {
	t.Parallel()
	if ok, _ := saysGreen(`{"sha":"abc","ok":true,"clean":true,"warnings":0}`, "abc"); !ok {
		t.Fatal("a green stamp reads red")
	}
	if _, says := saysGreen(`{"sha":"abc","ok":true,"clean":true}`, "def"); says != "the check ran against abc" {
		t.Fatalf("another commit reads %q", says)
	}
	if _, says := saysGreen(`{"sha":"abc","ok":true,"clean":true,"warnings":2,"files":["a"]}`, "abc"); says != "2 warning(s) stand in 1 file(s), which ./RUNME.sh lint names" {
		t.Fatalf("a warned stamp reads %q", says)
	}
}

// The retro's first unwritten leaf stops the leave, and a cloud leaf waits on a desk. [[spec/design_output/work#a-box-leaves]]
func TestTheRetroComesBeforeTheBoxLeaves(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	if open := one.d.retroOpen(groupNote); open != "retro/write" {
		t.Fatalf("the open retro reads %q", open)
	}
	written := withEntry(groupNote, entryRow("retro/write", "a", "b"))
	if open := one.d.retroOpen(written); open != "" {
		t.Fatalf("a written retro reads %q", open)
	}
}

// Read prints the group a branch carries, and refuses a branch carrying none. [[spec/design_output/work#a-group-is-a-ticket]]
func TestReadPrintsTheGroup(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	if code := one.branchSays("read", "g"); code != 0 {
		t.Fatalf("read answers %d", code)
	}
	holds(t, one.out.String(), "The group's ask.")
	if code := one.branchSays("read", "none"); code != codeRed {
		t.Fatalf("a read of nothing answers %d", code)
	}
}

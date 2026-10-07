// The leave: done refuses short of a green stamp, and the retro comes first.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import "testing"

// A branch with no check stamp claims nothing. [[spec/design_output/work#the-battery-answers-first]]
func TestDoneWantsTheCheckOnHead(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", map[string]string{ticketAt("g"): groupNote})
	one.cut("work/g", "origin/work/g")
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

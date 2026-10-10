// A leaf the engine passed belongs to no hand, so the hand on the group's own
// branch takes it back, and a closed group whose last hand is gone reopens.
// [[spec/design_output/pull#a-closed-group-stays-shut]]
package pull // level0: InPackageTest - reaches the in-package helpers cloudPull and must

import (
	"strings"
	"testing"
)

// A group the engine walked past its children, and a gone box closed. [[spec/design_output/pull#a-closed-group-stays-shut]]
const closedGroup = `---
kind: [[ticket]]
state: closed
steps:
  - name: children
    by: children
  - name: accept
    by: agent
process: [[spec/processes/group]]
step: accept
record:
  - step: children
    hand: the engine
  - step: accept
    hand: box d7e2385398cd · claude-code-remote
reason: done
---

# Ask

A group of one change.
`

// The cloud pull on the branch named, with g closed there and on origin alike. [[spec/design_output/pull#a-closed-group-stays-shut]]
func closedPull(t *testing.T, branch string) (*It, func() string) {
	t.Helper()
	it, _, errs := cloudPull(t)
	must(t, it.Git.Switch(branch, false))
	must(t, it.Disk.Write("spec/tickets/g.md", closedGroup))
	must(t, it.Git.AddAll())
	_, err := it.Git.Commit("g closes", nil)
	must(t, err)
	if pushed := it.Git.Push(branch, false); !pushed.OK {
		t.Fatalf("the push answers %q", pushed.Err)
	}
	return it, errs.String
}

func TestTheHandOnAGroupsBranchTakesBackTheLeafTheEnginePassed(t *testing.T) {
	t.Parallel()
	it, errs := closedPull(t, "work/g")
	it.Pulling([]string{"pull", "g", "--back", "children"})
	text, _ := it.Disk.Read("spec/tickets/g.md")
	if FieldOf(text, "state") != Open || FieldOf(text, "step") != "children" {
		t.Fatalf("g stands %q at %q:\n%s\n%s", FieldOf(text, "state"), FieldOf(text, "step"), text, errs())
	}
	if !strings.Contains(text, "why: the hand takes it back") {
		t.Fatalf("the record names no take-back:\n%s", text)
	}
}

func TestTheHandOnAGroupsBranchTakesBackNoLeafAnotherHandPassed(t *testing.T) {
	t.Parallel()
	it, errs := closedPull(t, "work/g")
	code := it.Pulling([]string{"pull", "g", "--back", "accept"})
	if code == 0 || !strings.Contains(errs(), "accept carries no hand-back by") {
		t.Fatalf("the take-back answers %d:\n%s", code, errs())
	}
}

func TestAHandOffTheGroupsBranchTakesBackNoLeafTheEnginePassed(t *testing.T) {
	t.Parallel()
	it, errs := closedPull(t, "main")
	code := it.Pulling([]string{"pull", "g", "--back", "children"})
	if code == 0 || !strings.Contains(errs(), "children carries no hand-back by") {
		t.Fatalf("the take-back answers %d:\n%s", code, errs())
	}
}

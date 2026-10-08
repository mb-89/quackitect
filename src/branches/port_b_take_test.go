// The take over a fake tree: the claim, a group no hand here takes, a named
// take, a refused push, a refused commit and a sync conflict after the claim.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it reads the unexported heldIn, named and waitsAt after take runs

import (
	"strings"
	"testing"
)

// A take claims a group: the record names the hand and the tip it took, the claim lands on origin, and the brief prints the ask. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeClaimsAGroupAndPushes(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	one.branch("one-group", map[string]string{pbAt: pbGroupNote})
	before := one.rev("origin/work/one-group")
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	if one.here() != "work/one-group" {
		t.Fatal("the take leaves the box off the branch")
	}
	taken := heldIn(one.read(pbAt))
	if taken == nil || taken.Step != "sync" || !strings.HasPrefix(taken.Hand, pbBox) || taken.HashBefore != before {
		t.Fatalf("the claim reads %+v", taken)
	}
	if one.rev("HEAD") != one.rev("origin/work/one-group") || one.rev("HEAD^") != before {
		t.Fatal("the claim stays off origin")
	}
	holds(t, pbSaid(one), "Two tickets that land as one")
}

// A group whose open children no hand here takes stays at todo, names the need, and writes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeLeavesAGroupNoHandTakes(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	one.branch("one-group", map[string]string{pbAt: withField(pbGroupNote, "step", "children"), ticketAt("a-child"): pbNeeds()})
	before := one.rev("origin/work/one-group")
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "work/one-group stays at todo")
	holds(t, pbSaid(one), "a-child needs nowhere here at do")
	if one.rev("HEAD") != before || heldIn(one.read(pbAt)) != nil {
		t.Fatal("the take writes a line")
	}
	if one.rev("origin/work/one-group") != before {
		t.Fatal("the take pushes a claim")
	}
}

// A take names the dependency a child waits on, and the need of the one it waits on. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeNamesTheDependencyAChildWaitsOn(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	waiting := strings.Replace(pbChild("one-group", "open"), "group: one-group\n", "group: one-group\ndepends_on: [b-child]\n", 1)
	one.branch("one-group", map[string]string{pbAt: withField(pbGroupNote, "step", "children"), ticketAt("a-child"): waiting, ticketAt("b-child"): pbNeeds()})
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "a-child waits for b-child to close")
	holds(t, pbSaid(one), "b-child needs nowhere here at do")
}

// A take names a person for a by: person step alone, and a step no person holds names none. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeNamesAPersonForAPersonStepAlone(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	one.branch("one-group", map[string]string{pbAt: withField(pbGroupNote, "step", "children"), ticketAt("a-child"): pbNeeds()})
	if code := one.branchSays("take"); code != 0 {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "stays at todo, because no hand here takes an open step")
	if strings.Contains(pbSaid(one), "person") {
		t.Fatalf("a step no person holds names one: %s", pbSaid(one))
	}
	person := strings.Replace(pbChild("one-group", "open"), "    does: makes the change the ask names\n", "    does: makes the change the ask names\n    by: person\n", 1)
	desk := newTree(t, nil)
	desk.d.Env["CLAUDE_CODE_REMOTE"] = ""
	desk.d.Env["CLAUDECODE"] = "1"
	if said := desk.d.waitsAt(named{Name: "a-child", Text: person}, nil); said != "a-child waits for a person at do" {
		t.Fatalf("the wait reads %q", said)
	}
}

// A take with a name takes that branch alone, and refuses a name nobody frees with no switch. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeWithANameTakesThatBranchAlone(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	one.branch("one-group", map[string]string{pbAt: pbGroupNote})
	if code := one.branchSays("take", "one-group"); code != 0 {
		t.Fatalf("the named take answers %d: %s", code, pbSaid(one))
	}
	if one.here() != "work/one-group" {
		t.Fatal("the named take leaves the box off the branch")
	}
	other := pbIdentify(newTree(t, nil))
	other.branch("one-group", map[string]string{pbAt: pbGroupNote})
	if code := other.branchSays("take", "nope"); code != codeRed {
		t.Fatalf("a take of nothing free answers %d", code)
	}
	holds(t, pbSaid(other), "work/nope stands at no free todo")
	if other.here() != trunk {
		t.Fatal("the refused take switches")
	}
}

// A take meeting a rejected push names both roads, and the branch steps back to origin's tip. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeMeetingARejectedPushNamesBothRoads(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	one.branch("one-group", map[string]string{pbAt: pbGroupNote})
	pbHook(one.origin, "pre-receive", "")
	if code := one.branchSays("take"); code != codeRed {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	said := pbSaid(one)
	holds(t, said, "The push of work/one-group came back refused")
	holds(t, said, "Somebody taking it first is one road")
	holds(t, said, "a push door turning it away is another")
	if one.rev("work/one-group") != one.rev("origin/work/one-group") {
		t.Fatal("the refused claim leaves a commit origin lacks")
	}
}

// A take whose claim does not commit stops, puts the ticket back, and pushes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeWhoseClaimRefusesToCommitStops(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, nil))
	one.branch("one-group", map[string]string{pbAt: pbGroupNote})
	before := one.rev("origin/work/one-group")
	pbHook(one.repo, "pre-commit", "the hook refuses")
	if code := one.branchSays("take"); code != codeRed {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	holds(t, pbSaid(one), "would not commit, so the take stands undone")
	if one.read(pbAt) != pbGroupNote {
		t.Fatalf("the ticket reads %q", one.read(pbAt))
	}
	if one.rev("origin/work/one-group") != before {
		t.Fatal("the refused claim pushes")
	}
}

// A take whose sync conflicts after the claim still hands the box its ask. [[spec/tickets/work-verbs-port-to-go]]
func TestPBTakeWhoseSyncConflictsStillHandsTheAsk(t *testing.T) {
	t.Parallel()
	one := pbIdentify(newTree(t, map[string]string{"x.txt": "base\n"}))
	one.branch("one-group", map[string]string{pbAt: pbGroupNote, "x.txt": "branch\n"})
	one.land("main moves", map[string]string{"x.txt": "main\n"})
	one.push("main")
	if code := one.branchSays("take"); code != codeRed {
		t.Fatalf("the take answers %d: %s", code, pbSaid(one))
	}
	said := pbSaid(one)
	holds(t, said, "Resolve the conflict on work/one-group and commit it")
	holds(t, said, "You are on work/one-group, and "+pbBox)
	holds(t, said, "Two tickets that land as one")
}

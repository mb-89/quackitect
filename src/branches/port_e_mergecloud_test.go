// The merge over a real tree: a claude branch comes in by its commits, a work
// branch closes once trunk reaches origin, and a pull request at the tip holds
// the merge back, as test/level0/work-merge-cloud.test.js holds.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"
)

// The merge takes a claude branch in, runs the check, pushes main and then deletes the branch. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergeTakesAClaudeBranchIn(t *testing.T) {
	one := peMergeTree(t, nil, nil)
	one.peClaudeBranch(map[string]string{"src/thing.txt": "thing\n"})
	if code := one.branchSays("merge", peClaude); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if one.read("src/thing.txt") != "thing\n" {
		t.Fatal("main lacks the branch's work")
	}
	if one.peOriginTip("main") != one.git("rev-parse", "HEAD") {
		t.Fatal("main stays off origin")
	}
	if one.peOriginTip(peClaude) != "" {
		t.Fatal("the branch stands on origin")
	}
	holds(t, one.out.String(), peClaude+" is merged")
}

// A refused push of main keeps the claude branch standing. [[spec/tickets/work-verbs-port-to-go]]
func TestPERefusedTrunkPushKeepsTheClaudeBranch(t *testing.T) {
	one := peMergeTree(t, nil, nil)
	one.peClaudeBranch(map[string]string{"src/thing.txt": "thing\n"})
	one.peOriginRefuses(`[ "$ref" = refs/heads/main ]`)
	if code := one.branchSays("merge", peClaude); code != codeRed {
		t.Fatalf("the merge answers %d", code)
	}
	holds(t, one.errs.String(), peClaude+" stands")
	if one.peOriginTip(peClaude) == "" {
		t.Fatal("the branch leaves origin")
	}
}

// Main already carrying a claude branch's work merges nothing, runs the check and deletes the branch. [[spec/tickets/work-verbs-port-to-go]]
func TestPETrunkCarriesTheClaudeBranch(t *testing.T) {
	one := peMergeTree(t, nil, nil)
	one.peClaudeBranch(map[string]string{"src/thing.txt": "thing\n"})
	one.git("cherry-pick", "origin/"+peClaude)
	one.git("push", "-q", "origin", "main")
	was := one.git("rev-parse", "HEAD")
	if code := one.branchSays("merge", peClaude); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if one.git("rev-parse", "HEAD") != was {
		t.Fatal("something merges")
	}
	if one.peOriginTip(peClaude) != "" {
		t.Fatal("the branch stands on origin")
	}
	holds(t, one.out.String(), "main carries "+peClaude)
}

// The merge runs the install over the merged tree before the check. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergeInstallsBeforeTheCheck(t *testing.T) {
	one := peMergeTree(t, map[string]string{"src/scripts/install.sh": "mkdir -p .se && echo ok > .se/installed\n"}, nil)
	one.peClaudeBranch(map[string]string{"src/thing.txt": "thing\n"})
	one.d.Runme = []string{"sh", "-c", "test -f .se/installed"}
	if code := one.branchSays("merge", peClaude); code != codeOK {
		t.Fatalf("the check meets no install: %d %s", code, one.errs.String())
	}
}

// A work branch's merge pushes main and then closes the branch. [[spec/tickets/work-verbs-port-to-go]]
func TestPEWorkMergePushesThenCloses(t *testing.T) {
	one := peMergeTree(t, nil, map[string]string{ticketAt("g"): peDone})
	if code := one.branchSays("merge", "g"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if one.peOriginTip("main") != one.git("rev-parse", "HEAD") {
		t.Fatal("main stays off origin")
	}
	if one.peOriginTip("work/g") != "" {
		t.Fatal("the branch stands on origin")
	}
}

// A refused push of main keeps the work branch, and names the close to run after the push. [[spec/tickets/work-verbs-port-to-go]]
func TestPEWorkMergeKeepsTheBranchOnARefusedPush(t *testing.T) {
	one := peMergeTree(t, nil, map[string]string{ticketAt("g"): peDone})
	one.peOriginRefuses(`[ "$ref" = refs/heads/main ]`)
	if code := one.branchSays("merge", "g"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if one.peOriginTip("work/g") == "" {
		t.Fatal("the branch leaves origin")
	}
	holds(t, one.out.String(), "then run ./RUNME.sh branch close g")
}

// A refused delete leaves the merge green, and says the branch stands on the remote. [[spec/tickets/work-verbs-port-to-go]]
func TestPEWorkMergeGreenOnARefusedDelete(t *testing.T) {
	one := peMergeTree(t, nil, map[string]string{ticketAt("g"): peDone})
	one.peOriginRefuses(`[ "$new" = 0000000000000000000000000000000000000000 ]`)
	if code := one.branchSays("merge", "g"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	holds(t, one.out.String(), "stands on the remote, and trunk carries its ticket closed")
}

// The merge refuses a branch a pull request carries at its tip, names it and the --closed road, and merges nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergeRefusesAPullAtTheTip(t *testing.T) {
	one := peMergeTree(t, nil, map[string]string{ticketAt("g"): peDone})
	one.git("push", "-q", "origin", "main:refs/pull/7/head")
	one.git("push", "-q", "origin", "origin/work/g:refs/pull/42/head")
	was := one.git("rev-parse", "HEAD")
	if code := one.branchSays("merge", "g"); code != codeRed {
		t.Fatalf("the merge answers %d", code)
	}
	holds(t, one.errs.String(), "pull request #42")
	holds(t, one.errs.String(), "branch merge g --closed")
	if one.git("rev-parse", "HEAD") != was {
		t.Fatal("something merges")
	}
}

// --closed takes the merge past a pull request standing at the tip. [[spec/tickets/work-verbs-port-to-go]]
func TestPEMergeClosedRunsPastThePull(t *testing.T) {
	one := peMergeTree(t, nil, map[string]string{ticketAt("g"): peDone})
	one.git("push", "-q", "origin", "origin/work/g:refs/pull/42/head")
	if code := one.branchSays("merge", "g", "--closed"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if parents := strings.Fields(one.git("rev-list", "--parents", "-n", "1", "HEAD")); len(parents) != 3 {
		t.Fatal("the merge runs no merge")
	}
}

// A pull request standing at another commit leaves the merge to run. [[spec/tickets/work-verbs-port-to-go]]
func TestPEPullElsewhereLeavesTheMerge(t *testing.T) {
	one := peMergeTree(t, nil, map[string]string{ticketAt("g"): peDone})
	one.git("push", "-q", "origin", "main:refs/pull/7/head")
	if code := one.branchSays("merge", "g"); code != codeOK {
		t.Fatalf("the merge answers %d: %s %s", code, one.out.String(), one.errs.String())
	}
	if parents := strings.Fields(one.git("rev-list", "--parents", "-n", "1", "HEAD")); len(parents) != 3 {
		t.Fatal("the merge runs no merge")
	}
}

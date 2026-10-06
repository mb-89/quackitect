// The sync, ported off test/level0/work-sync.test.js over a real repository:
// trunk comes into main and into a work branch, the branch's own push first,
// and a conflict whose ticket front alone clashes merges key by key.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it runs sync through the pd helpers and reads the unexported quiet and exit codes

import (
	"strings"
	"testing"
)

// The ticket the front cases conflict on. [[spec/tickets/work-verbs-port-to-go]]
const pdTicket = "spec/tickets/g.md"

// A note with these front rows and a short ask. [[spec/tickets/work-verbs-port-to-go]]
func pdFront(rows ...string) string {
	return "---\n" + strings.Join(rows, "\n") + "\n---\n\n# Ask\n\nOne thing.\n"
}

// The two rows of a record entry for a step. [[spec/tickets/work-verbs-port-to-go]]
func pdEntry(step string) []string {
	return []string{"  - step: " + step, "    hand: agent"}
}

// The base, the branch's side and trunk's side of the front cases. [[spec/tickets/work-verbs-port-to-go]]
func pdStages() (string, string, string) {
	head := []string{"kind: [[ticket]]", "state: open", "record:"}
	base := pdFront(append(append([]string{}, head...), pdEntry("sync")...)...)
	ours := pdFront(append(append(append([]string{}, head...), pdEntry("sync")...), pdEntry("split")...)...)
	theirs := pdFront(append(append(append([]string{}, head...), pdEntry("sync")...), "cloud: true")...)
	return base, ours, theirs
}

// A tree whose main and work/g change the ticket apart, with the box on work/g. Empty theirs retires the ticket on main. [[spec/tickets/work-verbs-port-to-go]]
func pdFrontConflict(t *testing.T, base, ours, theirs string) *tree {
	t.Helper()
	one := newTree(t, map[string]string{pdTicket: base})
	one.branch("g", map[string]string{pdTicket: ours})
	if theirs == "" {
		one.git("rm", "-q", pdTicket)
		one.git("commit", "-q", "-m", "main retires g")
	} else {
		one.land("main moves g", map[string]string{pdTicket: theirs})
	}
	one.land("main moves on", map[string]string{"other.txt": "x\n"})
	one.git("push", "-q", "origin", trunk)
	pdOn(one, "g")
	return one
}

// Sync on main takes the remote's main in. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncOnMainTakesOriginMain(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	pdRemoteAhead(one, nil, nil)
	if code := one.branchSays("sync"); code != codeOK {
		t.Fatalf("the sync answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "main took 2 commit(s) from origin/main")
	if !pdInside(one, "origin/main", "HEAD") {
		t.Fatal("main carries no origin/main")
	}
}

// Sync on main stops on a conflict and leaves the merge open for the hand. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncOnMainStopsOnAConflict(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"x.txt": "base\n"})
	pdRemoteAhead(one, map[string]string{"x.txt": "remote\n"})
	one.land("main here", map[string]string{"x.txt": "local\n"})
	if code := one.branchSays("sync"); code != codeRed {
		t.Fatalf("the sync answers %d", code)
	}
	holds(t, one.errs.String(), "origin/main conflicts with main")
	holds(t, one.errs.String(), "  x.txt")
	if !one.d.quiet("rev-parse", "-q", "--verify", "MERGE_HEAD").OK {
		t.Fatal("the merge stands closed")
	}
}

// Sync on main stops where git refuses the merge outright, and points at git status. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncOnMainNamesGitStatus(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	pdRemoteAhead(one, map[string]string{"y.txt": "remote\n"})
	one.write(map[string]string{"y.txt": "untracked here\n"})
	if code := one.branchSays("sync"); code != codeRed {
		t.Fatalf("the sync answers %d", code)
	}
	holds(t, one.errs.String(), "origin/main conflicts with main")
	holds(t, one.errs.String(), "git status names the files")
}

// Sync on a work branch takes main in with the branch's merge message. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncOnAWorkBranchTakesMain(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", nil)
	pdOn(one, "g")
	pdMainMoves(one, 2)
	if code := one.branchSays("sync"); code != codeOK {
		t.Fatalf("the sync answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "work/g took 2 commit(s) from main")
	if said := one.git("log", "-1", "--format=%s"); said != "work/g: take main in" {
		t.Fatalf("the merge reads %q", said)
	}
}

// Sync on a work branch merges a diverged remote branch before trunk, and keeps both sides. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncMergesTheDivergedRemoteBranchFirst(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", nil)
	pdOn(one, "g")
	pdRemoteAhead(one, nil, nil, nil)
	one.land("this hand lands", map[string]string{"local.txt": "x\n"})
	mine := one.git("rev-parse", "HEAD")
	theirs := one.git("rev-parse", "origin/work/g")
	pdMainMoves(one, 2)
	if code := one.branchSays("sync"); code != codeOK {
		t.Fatalf("the sync answers %d: %s", code, one.errs.String())
	}
	said := one.out.String()
	own := "work/g took 3 commit(s) from origin/work/g"
	fromMain := "work/g took 2 commit(s) from main"
	holds(t, said, own)
	holds(t, said, fromMain)
	if strings.Index(said, own) > strings.Index(said, fromMain) {
		t.Fatal("trunk comes in before the remote branch")
	}
	if !pdInside(one, mine, "HEAD") || !pdInside(one, theirs, "HEAD") {
		t.Fatal("a side is rewritten")
	}
}

// Sync leaves the branch alone where the remote branch carries nothing new. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncLeavesALevelRemoteBranch(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.branch("g", nil)
	pdOn(one, "g")
	pdMainMoves(one, 2)
	if code := one.branchSays("sync"); code != codeOK {
		t.Fatalf("the sync answers %d: %s", code, one.errs.String())
	}
	if strings.Contains(one.out.String(), "from origin/work/g") {
		t.Fatalf("the sync merges a level remote branch: %s", one.out.String())
	}
}

// A conflict with the remote branch stops, names the files, and trunk waits. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncStopsOnTheRemoteBranchConflict(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{"x.txt": "base\n"})
	one.branch("g", nil)
	pdOn(one, "g")
	pdRemoteAhead(one, map[string]string{"x.txt": "remote\n"})
	one.land("this hand lands", map[string]string{"x.txt": "local\n"})
	pdMainMoves(one, 1)
	if code := one.branchSays("sync"); code != codeRed {
		t.Fatalf("the sync answers %d", code)
	}
	holds(t, one.errs.String(), "origin/work/g conflicts with work/g")
	holds(t, one.errs.String(), "  x.txt")
	if strings.Contains(one.out.String(), "from main") || pdInside(one, "origin/main", "HEAD") {
		t.Fatal("trunk comes in past the conflict")
	}
}

// Sync on any other branch refuses, and names where it runs. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncNamesWhereItRuns(t *testing.T) {
	t.Parallel()
	one := newTree(t, nil)
	one.git("switch", "-q", "-c", "claude/a-thing")
	if code := one.branchSays("sync"); code != codeRefused {
		t.Fatalf("the sync answers %d", code)
	}
	holds(t, one.errs.String(), "branch sync runs on main or a work branch, and this is claude/a-thing")
}

// A record the branch appends merges with a key main adds, and the merge commits. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncMergesAFrontConflict(t *testing.T) {
	t.Parallel()
	base, ours, theirs := pdStages()
	one := pdFrontConflict(t, base, ours, theirs)
	if code := one.branchSays("sync"); code != codeOK {
		t.Fatalf("the sync answers %d: %s", code, one.errs.String())
	}
	want := pdFront(append(append(append([]string{"kind: [[ticket]]", "state: open", "record:"}, pdEntry("sync")...), pdEntry("split")...), "cloud: true")...)
	if said := one.read(pdTicket); said != want {
		t.Fatalf("the ticket reads\n%s", said)
	}
	if said := one.git("log", "-1", "--format=%s"); said != "work/g: take main in" {
		t.Fatalf("the last commit reads %q", said)
	}
	holds(t, one.out.String(), "work/g took 2 commit(s) from main")
	holds(t, one.out.String(), "The front of spec/tickets/g.md merges on its own")
}

// A key both sides change apart waits for a hand, and nothing commits. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncLeavesAClashingKeyForAHand(t *testing.T) {
	t.Parallel()
	base, ours, theirs := pdStages()
	one := pdFrontConflict(t, base, strings.Replace(ours, "state: open", "state: closed", 1), strings.Replace(theirs, "state: open", "state: draft", 1))
	if code := one.branchSays("sync"); code != codeRed {
		t.Fatalf("the sync answers %d", code)
	}
	if !one.d.quiet("rev-parse", "-q", "--verify", "MERGE_HEAD").OK {
		t.Fatal("the merge commits")
	}
	holds(t, one.errs.String(), "These wait for a hand:\n  spec/tickets/g.md")
	holds(t, one.errs.String(), "The write door lets a hand write each file until the merge commits")
}

// A ticket main retires while the branch changes it waits for a hand, named. [[spec/tickets/work-verbs-port-to-go]]
func TestPDSyncNamesATicketMainRetires(t *testing.T) {
	t.Parallel()
	base, ours, _ := pdStages()
	one := pdFrontConflict(t, base, ours, "")
	if code := one.branchSays("sync"); code != codeRed {
		t.Fatalf("the sync answers %d", code)
	}
	if !one.d.quiet("rev-parse", "-q", "--verify", "MERGE_HEAD").OK {
		t.Fatal("the merge commits")
	}
	holds(t, one.errs.String(), "g.md: main retires this ticket, and work/g changes it")
}

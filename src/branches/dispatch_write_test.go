// The dispatcher's writes over a fake origin and its clone: one fix group, one
// commit on claude/dispatch-<commit> made off main's tree, and no push of
// main, ported off test/level0/dispatch.test.js.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package branches

import (
	"slices"
	"strconv"
	"strings"
	"testing"

	"quackitect/src/yaml"
)

// The write branch this tree's main names, and the top fix group's name. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpWriteBranch() (string, string) {
	main := shortWrite(one.rev("origin/main"))
	return writesPrefix + main, fixPrefix + "-" + main
}

// A ticket as the write branch on origin carries it. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpWritten(name string) string {
	branch, _ := one.dpWriteBranch()
	return one.peOriginFile(branch, ticketAt(name))
}

// The commits the write branch carries past main. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpWriteCommits() string {
	branch, _ := one.dpWriteBranch()
	one.fetch()
	count, _ := one.repo.Count("origin/main", "origin/"+branch)
	return strconv.Itoa(count)
}

// Whether the clone's disk holds no file past the ones its tree tracks and the box's own. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) dpTouchesNoDisk() bool {
	listed, _ := one.disk.List("")
	tracked, _ := one.repo.Files("HEAD", "")
	return slices.Equal(listed, tracked) && len(one.status()) == 0
}

func (one *tree) dpGreen(argv ...string) {
	one.t.Helper()
	if code := one.dpRun(argv...); code != codeOK {
		one.t.Fatalf("the run answers %d: %s%s", code, one.out.String(), one.errs.String())
	}
}

func TestDispatchWritesOneFixGroupCarryingFixHoldingTheLooseAgentTickets(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose(), "b-loose-one": pcLoose()})
	one.dpGreen()
	_, fix := one.dpWriteBranch()
	group := one.dpWritten(fix)
	if fieldOf(group, fixField) != "true" || !isGroup(group) {
		t.Fatalf("the fix group reads\n%s", group)
	}
	for _, name := range []string{"a-loose-one", "b-loose-one"} {
		if got := fieldOf(one.dpWritten(name), groupField); got != fix {
			t.Fatalf("%s lands in %q", name, got)
		}
	}
}

func TestDispatchMakesOneCommitOnTheWriteBranchAndPushesNoMain(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	main := one.peOriginTip("main")
	one.dpGreen()
	if got := one.dpWriteCommits(); got != "1" {
		t.Fatalf("the write branch carries %s commits", got)
	}
	if one.peOriginTip("main") != main {
		t.Fatal("the run pushes main")
	}
	branch, _ := one.dpWriteBranch()
	holds(t, one.out.String(), "the writes: pushed, on "+branch)
}

func TestDispatchFindsItsBranchStandingOnASecondRunAndWritesNothing(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	one.dpGreen()
	branch, _ := one.dpWriteBranch()
	tip := one.peOriginTip(branch)
	one.dpGreen("--json")
	if one.peOriginTip(branch) != tip {
		t.Fatal("the second run moves the write branch")
	}
	if plan := one.dpJSON(); plan.Write == nil || plan.Write.State != "standing" {
		t.Fatalf("the second run's writes read %#v", plan.Write)
	}
}

func TestDispatchStopsEveryWriteOnAnUnmergedWriteBranchAndStillNamesTheWorkers(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	one.dpGroup("first", groupNote)
	one.cut("old", "main")
	one.land("an old write", map[string]string{"old.txt": "old\n"})
	one.pushAt("HEAD", "refs/heads/"+writesPrefix+"0ld0ld0")
	one.switchTo("main")
	one.dpGreen("--json")
	branch, _ := one.dpWriteBranch()
	if one.peOriginTip(branch) != "" {
		t.Fatal("the run writes past an unmerged write branch")
	}
	plan := one.dpJSON()
	dpSame(t, dpReady(&plan), []string{"first"})
	dpSame(t, *plan.Write, writeRow{Branch: writesPrefix + "0ld0ld0", State: "waits"})
}

func TestDispatchWritesPastAMergedWriteBranch(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	one.pushAt("main", "refs/heads/"+writesPrefix+"0ld0ld0")
	one.dpGreen()
	if got := one.dpWriteCommits(); got != "1" {
		t.Fatalf("the write branch carries %s commits", got)
	}
}

// [[spec/tickets/the-dispatch-opens-no-issues]]
func TestDispatchLeavesAPersonRouteTicketLooseAndNamesItUnderThePersonPart(t *testing.T) {
	t.Parallel()
	trial := pcPersonChild("")
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose(), "a-trial": trial})
	one.dpGreen("--json")
	if got := one.dpWritten("a-trial"); got != strings.TrimSpace(trial) {
		t.Fatalf("the trial moves:\n%s", got)
	}
	plan := one.dpJSON()
	dpSame(t, plan.Person, []personRow{{Ticket: "a-trial", Group: ""}})
}

func TestDispatchOpensABranchForAReadyGroupOnMainAndLeavesABranchedOneAlone(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"new-group": groupNote, "first": groupNote})
	one.dpGroup("first", groupNote)
	first := one.peOriginTip(workBranch + "first")
	one.dpGreen()
	opened := one.peOriginTip(workBranch + "new-group")
	if opened == "" {
		t.Fatal("work/new-group stands nowhere on origin")
	}
	if one.treeOf(opened) != one.treeOf("origin/main") {
		t.Fatal("work/new-group opens off another tree than main's")
	}
	if one.peOriginTip(workBranch+"first") != first {
		t.Fatal("the run moves work/first")
	}
	if fieldOf(one.dpWritten("new-group"), cloudMark) != "true" {
		t.Fatal("the cloud marker rides no write branch")
	}
}

func TestDispatchNamesTheFixGroupWithNamesWordsAtMost(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	one.d.Config = func(key string) any {
		if key == namesWords {
			return 3
		}
		return nil
	}
	one.dpGreen()
	branch, _ := one.dpWriteBranch()
	var made []string
	changes, _ := one.repo.Diff("origin/main", "origin/"+branch)
	for _, change := range changes {
		if name := ticketNamed(strings.TrimPrefix(change.Path, ticketsFolder+"/")); name != "a-loose-one" {
			made = append(made, name)
		}
	}
	if len(made) != 1 || len(strings.Split(made[0], "-")) > 3 {
		t.Fatalf("the fix groups read %v", made)
	}
}

func TestDispatchWritesNothingToTheDiskAndMovesNoCheckout(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	head := one.rev("HEAD")
	one.dpGreen()
	if !one.dpTouchesNoDisk() {
		t.Fatal("the run writes to the box's disk")
	}
	if one.rev("HEAD") != head || one.here() != trunk {
		t.Fatal("the run moves the box's own checkout")
	}
}

func TestDispatchWritesNothingToTheDiskAfterARefusedPushAndAnswersRefused(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	one.peOriginRefuses(func(ref, _ string) bool { return strings.HasPrefix(ref, "refs/heads/claude/") })
	if code := one.dpRun("--json"); code != codeRed {
		t.Fatalf("the run answers %d", code)
	}
	if !one.dpTouchesNoDisk() {
		t.Fatal("the run writes to the box's disk")
	}
	branch, _ := one.dpWriteBranch()
	dpSame(t, *one.dpJSON().Write, writeRow{Branch: branch, State: "refused", Why: "The push of " + branch + " came back refused."})
}

func TestDispatchCutsTheFixNameToACapBelowItsOwnWords(t *testing.T) {
	t.Parallel()
	const main = "c0ffee1234abcdef"
	dpSame(t, cutTo("loose-fixes-abc", 2), "loose-fixes")
	dpSame(t, fixName(2, main, ""), "loose-fixes")
	dpSame(t, fixName(5, main, ""), "loose-fixes-c0ffee1")
}

// A group names its parent under group, and a parent's name rides last. [[spec/tickets/groups-hold-groups]]
func TestDispatchNamesAFixGroupWithItsParentLastSoTheCutKeepsTheCommit(t *testing.T) {
	t.Parallel()
	const main = "c0ffee1234abcdef"
	dpSame(t, fixName(0, main, "big-move"), "loose-fixes-c0ffee1-big-move")
	dpSame(t, fixName(4, main, "big-move"), "loose-fixes-c0ffee1-big")
	dpSame(t, fixName(3, main, "big-move"), "loose-fixes-c0ffee1")
}

func TestDispatchHandsTheMarkOffCommitOffMainsTree(t *testing.T) {
	t.Parallel()
	one := dpTree(t, nil)
	mark := one.d.markOff(workBranch + "new-group")
	if mark == "" || one.treeOf(mark) != one.treeOf("origin/main") || one.rev(mark+"^") != one.rev("origin/main") {
		t.Fatalf("markOff answers %q", mark)
	}
}

// [[spec/tickets/groups-hold-groups]]
func TestDispatchLandsAParentsCloseOnceOverTwoRuns(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"parent": dpCloudy(groupNote), "a-piece": pcChild("parent", closedState)})
	one.dpGreen()
	one.dpGreen()
	if fieldOf(one.dpWritten("parent"), "state") != closedState {
		t.Fatal("the close writes no parent")
	}
	if got := one.dpWriteCommits(); got != "1" {
		t.Fatalf("two runs make %s commits", got)
	}
}

// [[spec/tickets/groups-hold-groups]]
func TestDispatchBundlesEachParentsLooseTicketsIntoAFixGroupUnderIt(t *testing.T) {
	t.Parallel()
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose(), "parent": dpCloudy(groupNote), "p-piece": pcChild("parent", "open")})
	one.dpGreen("--json")
	dpSame(t, one.dpJSON().Bundles, []bundle{{Parent: "", Tickets: []string{"a-loose-one"}}, {Parent: "parent", Tickets: []string{"p-piece"}}})
	fixOf := func(name string) string {
		fix := fieldOf(one.dpWritten(name), groupField)
		if fieldOf(one.dpWritten(fix), fixField) != "true" {
			t.Fatalf("%s lands in %q, which reads no fix group", name, fix)
		}
		return fix
	}
	top, nested := fixOf("a-loose-one"), fixOf("p-piece")
	if top == nested {
		t.Fatal("both parents share one fix group")
	}
	if fieldOf(one.dpWritten(nested), groupField) != "parent" || fieldOf(one.dpWritten(top), groupField) != "" {
		t.Fatal("a fix group stands under the wrong parent")
	}
}

// The route copy hashes a route as processHash in lib/schema-route.js does, over a sample and over the tree's group route. [[spec/design_input/the-agent-pulls-tickets#processes-are-routes]]
func TestDispatchHashesARouteAsTheJavaScriptDoes(t *testing.T) {
	t.Parallel()
	const sample = "for: a test\nask:\n  - name: goal\n    form: text\n    says: what it adds up to\nsteps:\n  - name: sync\n    when: cloud\n    needs: [branch sync]\n    evidence:\n      - name: sync\n        form: command\n        expects: 0\n  - name: children\n    by: children\n    on_fail: split\n    final: true\n"
	held := yaml.AsDoc(yaml.Read(sample))
	dpSame(t, processHash(yaml.Flat(held.Get("ask")), yaml.Flat(held.Get("steps"))), "381bcb1ad042ccf6")
	one := dpTree(t, nil)
	route, why := one.d.processAt(groupRoute)
	if why != "" {
		t.Fatal(why)
	}
	group, found, _ := one.d.Methods.Read(ticketAt("dispatch-verbs-run-in-go"))
	if found && fieldOf(group, "process_hash") != route.Hash {
		t.Fatalf("the group route hashes %s, and the group ticket carries %s", route.Hash, fieldOf(group, "process_hash"))
	}
	if _, why := one.d.processAt("none-such"); why == "" {
		t.Fatal("a missing route reads as standing")
	}
}

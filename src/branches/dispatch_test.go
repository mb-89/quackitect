// The dispatcher's plan over a real origin and its clone: what stands ready,
// held, waiting, stuck, loose and left for a person, ported off
// test/level0/dispatch.test.js.
// [[spec/tickets/dispatch-verbs-port-to-go]]
package branches

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"reflect"
	"slices"
	"strings"
	"testing"
	"time"
)

// The span a hold goes stale past in these cases, past the default. [[spec/tickets/dispatch-verbs-port-to-go]]
const dpPastStale = 13 * time.Hour

// A tree whose method root is this repository, so the mint reads the tree's own schema and group route. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpTree(t *testing.T, trunkFiles map[string]string) *tree {
	t.Helper()
	files := map[string]string{}
	for name, text := range trunkFiles {
		files[ticketAt(name)] = text
	}
	one := newTree(t, files)
	method, err := filepath.Abs(filepath.Join("..", ".."))
	if err != nil {
		t.Fatal(err)
	}
	one.d.Method = method
	return one
}

// A send door with no network behind it. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpNoSend(string, Request) (Reply, error) {
	return Reply{}, errors.New("a case reaches no network")
}

// A group branch whose one commit stands at a time of its own, so a case reads the hold's age. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpBranchAt(name string, files map[string]string, at time.Time) {
	one.t.Helper()
	one.git("switch", "-q", "-c", workBranch+name, "main")
	one.write(files)
	one.git("add", "-A")
	date := fmt.Sprintf("@%d +0000", at.Unix())
	cmd := exec.Command("git", "commit", "-q", "--allow-empty", "-m", name+" lands")
	cmd.Dir = one.root
	cmd.Env = append(os.Environ(), "GIT_CONFIG_NOSYSTEM=1", "GIT_AUTHOR_DATE="+date, "GIT_COMMITTER_DATE="+date)
	if said, err := cmd.CombinedOutput(); err != nil {
		one.t.Fatalf("the dated commit answers %v: %s", err, said)
	}
	one.git("push", "-q", "origin", workBranch+name)
	one.git("switch", "-q", "main")
	one.git("branch", "-q", "-D", workBranch+name)
	one.git("fetch", "-q", "origin")
}

// A group branch carrying its group ticket alone. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpGroup(name, note string) {
	one.t.Helper()
	one.branch(name, map[string]string{ticketAt(name): note})
}

// The plan off the tree as it stands. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpPlan() *dispatchPlan {
	plan, _ := one.d.planned()
	return plan
}

// Runs the dispatch with the words named, and answers its code. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpRun(argv ...string) int {
	one.out.Reset()
	one.errs.Reset()
	return Dispatch(one.d, dpNoSend, argv)
}

// The plan the last run printed as JSON. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) dpJSON() dispatchPlan {
	one.t.Helper()
	text := strings.TrimSpace(one.out.String())
	if strings.Contains(text, "\n") || !strings.HasPrefix(text, "{") || !strings.HasSuffix(text, "}") {
		one.t.Fatalf("the run prints no one JSON object: %q", text)
	}
	var plan dispatchPlan
	if err := json.Unmarshal([]byte(text), &plan); err != nil {
		one.t.Fatal(err)
	}
	return plan
}

// The group names of the ready rows, sorted. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpReady(plan *dispatchPlan) []string {
	out := []string{}
	for _, one := range plan.Ready {
		out = append(out, one.Group)
	}
	slices.Sort(out)
	return out
}

// A group ticket waiting on the group named. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpWaiting(name string) string {
	return strings.Replace(groupNote, "state: open\n", "state: open\ndepends_on: "+name+"\n", 1)
}

// A group ticket naming its parent under group. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpUnder(parent string) string {
	return strings.Replace(groupNote, "state: open\n", "state: open\ngroup: "+parent+"\n", 1)
}

// A group ticket closed. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpShut(note string) string { return withField(note, "state", closedState) }

// A parent marked for the cloud, so no case pushes a branch for it. [[spec/tickets/groups-hold-groups]]
func dpCloudy(note string) string { return withField(note, cloudMark, "true") }

// The group held by box 3f9a. [[spec/tickets/dispatch-verbs-port-to-go]]
func dpHeld() string { return pcTake(groupNote, "box 3f9a", "a1b2c3") }

func dpSame(t *testing.T, got, want any) {
	t.Helper()
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("got %#v, want %#v", got, want)
	}
}

// A group reads merged where main carries its ticket closed. [[spec/design_output/work#a-dependency-waits-for-trunk]]
func TestDispatchReadsAGroupReadyWhoseDependencyIsMerged(t *testing.T) {
	one := dpTree(t, nil)
	one.dpGroup("first", groupNote)
	one.peTrunkMoves(map[string]string{ticketAt("first"): dpShut(groupNote)})
	one.dpGroup("second", dpWaiting("first"))
	dpSame(t, dpReady(one.dpPlan()), []string{"second"})
}

func TestDispatchReadsAGroupWaitingOnAnOpenGroupAsWaitingAndNotReady(t *testing.T) {
	one := dpTree(t, nil)
	one.dpGroup("first", groupNote)
	one.dpGroup("second", dpWaiting("first"))
	plan := one.dpPlan()
	dpSame(t, dpReady(plan), []string{"first"})
	dpSame(t, plan.Waiting, []waitRow{{Group: "second", Waits: []string{"first"}}})
}

func TestDispatchReadsAStaleHoldReadyAndAFreshHoldHeld(t *testing.T) {
	one := dpTree(t, nil)
	one.dpBranchAt("left", map[string]string{ticketAt("left"): dpHeld()}, testNow.Add(-dpPastStale))
	one.dpBranchAt("worked", map[string]string{ticketAt("worked"): dpHeld()}, testNow.Add(-time.Hour))
	plan := one.dpPlan()
	dpSame(t, dpReady(plan), []string{"left"})
	if len(plan.Held) != 1 || plan.Held[0].Group != "worked" || plan.Held[0].Age == "" {
		t.Fatalf("the held part reads %#v", plan.Held)
	}
}

// A box answers a question like any open work, and the person route alone waits for the owner. [[spec/tickets/the-dispatch-opens-no-issues]]
func TestDispatchBundlesALooseQuestionAndLeavesThePersonRouteToThePersonPart(t *testing.T) {
	one := dpTree(t, map[string]string{
		"a-loose-one":  pcLoose(),
		"a-closed-one": strings.Replace(pcChild("", closedState), "group: \n", "", 1),
		"a-question":   pcLoosePerson,
		"a-trial":      pcPersonChild(""),
	})
	plan := one.dpPlan()
	dpSame(t, plan.Bundles, []bundle{{Parent: "", Tickets: []string{"a-loose-one", "a-question"}}})
	dpSame(t, plan.Person, []personRow{{Ticket: "a-trial", Group: ""}})
}

func TestDispatchReadsADoneGroupBehindMainAsAStuckHandOver(t *testing.T) {
	one := dpTree(t, nil)
	one.dpGroup("landing", dpShut(groupNote))
	one.peTrunkMoves(map[string]string{"notes.txt": "main moves on\n"})
	plan := one.dpPlan()
	dpSame(t, plan.Stuck, []stuckRow{{Group: "landing", Why: "behind"}})
	dpSame(t, plan.Ready, []readyRow{})
}

func TestDispatchReadsADoneGroupPastTheStaleSpanAsAStuckHandOver(t *testing.T) {
	one := dpTree(t, nil)
	one.dpBranchAt("landing", map[string]string{ticketAt("landing"): dpShut(groupNote)}, testNow.Add(-dpPastStale))
	dpSame(t, one.dpPlan().Stuck, []stuckRow{{Group: "landing", Why: "stale"}})
}

func TestDispatchLeavesADoneGroupLevelAndFreshOutOfTheStuckPart(t *testing.T) {
	one := dpTree(t, nil)
	one.dpBranchAt("landing", map[string]string{ticketAt("landing"): dpShut(groupNote)}, testNow.Add(-time.Hour))
	dpSame(t, one.dpPlan().Stuck, []stuckRow{})
}

func TestDispatchDryRunWritesNoFileMakesNoCommitAndPushesNothing(t *testing.T) {
	one := dpTree(t, map[string]string{"a-loose-one": pcLoose()})
	one.dpGroup("first", groupNote)
	head := one.git("rev-parse", "HEAD")
	if code := one.dpRun("--dry"); code != codeOK {
		t.Fatalf("the dry run answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "work/first")
	holds(t, one.out.String(), "the top: a-loose-one")
	if one.git("rev-parse", "HEAD") != head || one.git("status", "--porcelain") != "" {
		t.Fatal("the dry run moves the checkout")
	}
	if said := one.git("ls-remote", "origin", "refs/heads/"+writesPrefix+"*"); said != "" {
		t.Fatalf("the dry run pushes %s", said)
	}
	if _, err := os.Stat(one.d.at(writeTree)); err == nil {
		t.Fatal("the dry run opens a worktree")
	}
}

func TestDispatchPrintsThePlanAsOneJSONObject(t *testing.T) {
	one := dpTree(t, nil)
	one.dpGroup("first", groupNote)
	if code := one.dpRun("--dry", "--json"); code != codeOK {
		t.Fatalf("the run answers %d", code)
	}
	plan := one.dpJSON()
	dpSame(t, dpReady(&plan), []string{"first"})
	for _, key := range []string{`"ready":`, `"held":[]`, `"waiting":[]`, `"stuck":[]`, `"bundles":[]`, `"opens":[]`, `"closes":[]`, `"person":[]`} {
		holds(t, one.out.String(), key)
	}
}

func TestDispatchNamesTheSameReadyGroupsTheFreeReadNames(t *testing.T) {
	one := dpTree(t, nil)
	one.dpGroup("first", groupNote)
	one.dpGroup("second", dpWaiting("first"))
	one.dpGroup("third", groupNote)
	var free []string
	for _, each := range one.d.readFree(one.d.nowSeconds()).Free {
		free = append(free, each.Name)
	}
	slices.Sort(free)
	dpSame(t, dpReady(one.dpPlan()), free)
}

func TestDispatchReadsAChildOffItsOwnGroupsBranch(t *testing.T) {
	asked := strings.Replace(pcLoosePerson, "state: open\n", "state: open\ngroup: first\n", 1)
	one := dpTree(t, map[string]string{"a-child": asked})
	one.branch("first", map[string]string{ticketAt("first"): groupNote, ticketAt("a-child"): pcChild("first", "open")})
	one.branch("second", map[string]string{ticketAt("second"): groupNote})
	dpSame(t, one.dpPlan().Person, []personRow{})
}

// A dependency reads off its group ticket on origin/main alone, so a parent standing on no branch still holds. [[spec/tickets/groups-hold-groups]]
func TestDispatchHoldsADependentOnAParentWithNoBranch(t *testing.T) {
	one := dpTree(t, map[string]string{"after": dpWaiting("move"), "move": groupNote, "a-part": pcChild("move", "open")})
	one.dpGroup("after", dpWaiting("move"))
	plan := one.dpPlan()
	dpSame(t, plan.Ready, []readyRow{})
	dpSame(t, plan.Waiting, []waitRow{{Group: "after", Waits: []string{"move"}}})
}

// A group names its parent under group, and a parent hands no worker. [[spec/tickets/groups-hold-groups]]
func TestDispatchHandsAParentNoWorker(t *testing.T) {
	one := dpTree(t, map[string]string{"top": groupNote, "child": dpUnder("top")})
	one.dpGroup("top", groupNote)
	one.dpGroup("child", dpUnder("top"))
	dpSame(t, dpReady(one.dpPlan()), []string{"child"})
}

func TestDispatchClosesAParentOnceEveryChildStandsClosedOnMain(t *testing.T) {
	one := dpTree(t, map[string]string{
		"parent":      groupNote,
		"a-part":      dpShut(dpUnder("parent")),
		"a-piece":     pcChild("parent", closedState),
		"open-parent": groupNote,
		"b-piece":     pcChild("open-parent", "open"),
	})
	dpSame(t, one.dpPlan().Closes, []string{"parent"})
}

// A leaf under a middle group under a grandparent waiting on a blocker. [[spec/tickets/groups-hold-groups]]
func dpChained(t *testing.T, blocker string) *dispatchPlan {
	notes := map[string]string{"grand": dpWaiting("blocker"), "mid": dpUnder("grand"), "leaf": dpUnder("mid")}
	trunkFiles := map[string]string{"blocker": blocker}
	for name, note := range notes {
		trunkFiles[name] = note
	}
	one := dpTree(t, trunkFiles)
	for _, name := range []string{"grand", "mid", "leaf"} {
		one.dpGroup(name, notes[name])
	}
	return one.dpPlan()
}

func TestDispatchHoldsAGroupBackOnAGrandparentsOpenDependency(t *testing.T) {
	plan := dpChained(t, groupNote)
	if slices.Contains(dpReady(plan), "leaf") {
		t.Fatalf("ready reads %v", dpReady(plan))
	}
	if !slices.ContainsFunc(plan.Waiting, func(one waitRow) bool {
		return one.Group == "leaf" && reflect.DeepEqual(one.Waits, []string{"blocker"})
	}) {
		t.Fatalf("waiting reads %#v", plan.Waiting)
	}
}

func TestDispatchFreesThatGroupOnceTheDependencyCloses(t *testing.T) {
	plan := dpChained(t, dpShut(groupNote))
	dpSame(t, dpReady(plan), []string{"leaf"})
	if slices.ContainsFunc(plan.Waiting, func(one waitRow) bool { return one.Group == "leaf" }) {
		t.Fatalf("waiting reads %#v", plan.Waiting)
	}
}

func TestDispatchPrintsEveryPartUnderItsHead(t *testing.T) {
	plan := &dispatchPlan{
		Ready:   []readyRow{{Group: "a", Branch: "work/a"}},
		Held:    []heldRow{{Group: "b", Branch: "work/b", Age: "2h"}},
		Waiting: []waitRow{{Group: "c", Waits: []string{"a", "b"}}},
		Stuck:   []stuckRow{{Group: "d", Why: "behind"}},
		Bundles: []bundle{{Parent: "", Tickets: []string{"e"}}, {Parent: "p", Tickets: []string{"f", "g"}}},
		Opens:   []string{"h"},
		Closes:  []string{},
		Person:  []personRow{{Ticket: "i", Group: "p"}},
		Write:   &writeRow{Branch: "claude/dispatch-abc1234", State: "refused", Why: "The push came back refused."},
	}
	want := strings.Join([]string{
		"ready groups, one worker each:", "  work/a",
		"stuck hand-overs, one worker each:", "  work/d, behind",
		"groups a fresh hold keeps:", "  work/b, held 2h",
		"groups waiting on another:", "  work/c waits for a, b",
		"loose agent tickets, one fix group per parent:", "  the top: e", "  p: f, g",
		"groups on main that open a branch:", "  work/h",
		"parent groups whose children all read closed:", "  none",
		"tickets a person alone can do, loose on main:", "  i, holding p open",
		"the writes: refused, on claude/dispatch-abc1234", "  The push came back refused.",
	}, "\n")
	if got := strings.Join(printedPlan(plan), "\n"); got != want {
		t.Fatalf("the plan prints\n%s\nand the JavaScript prints\n%s", got, want)
	}
}

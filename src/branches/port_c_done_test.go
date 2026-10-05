// branch done over a real tree, ported from test/level0/work-done.test.js:
// the box leaves, closes its group on the branch, and hands the branch back.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"slices"
	"sort"
	"strings"
	"testing"
)

// The branch tip on origin. [[spec/tickets/work-verbs-port-to-go]]
const pcOrigin = "origin/" + workBranch + pcGroup

// A desk tree on work/one-group carrying the files, the check green on HEAD. [[spec/tickets/work-verbs-port-to-go]]
func pcDone(t *testing.T, files map[string]string) *tree {
	t.Helper()
	one := pcOnGroup(newTree(t, nil).desk(), files)
	one.pcGreen()
	return one
}

// The last record row's hash_after on the group the disk holds. [[spec/tickets/work-verbs-port-to-go]]
func pcLastAfter(one *tree) string {
	rows := recordIn(one.pcTicket(pcGroup))
	if len(rows) == 0 {
		return ""
	}
	return entryField(rows[len(rows)-1], "hash_after")
}

// The group at children held, a fix marker where asked, and the tickets the branch adds beside it, as leaving in the JS writes it. [[spec/tickets/work-verbs-port-to-go]]
func pcLeaving(t *testing.T, fix bool, added, more map[string]string) *tree {
	t.Helper()
	group := pcAtChildren()
	if fix {
		group = withField(group, "fix", "true")
	}
	files := map[string]string{ticketAt(pcGroup): group}
	for name, text := range added {
		files[ticketAt(name)] = text
	}
	for at, text := range more {
		files[at] = text
	}
	return pcDone(t, files)
}

// The group of a nested case: it names big-move as its parent, and big-move stands beside it. [[spec/tickets/work-verbs-port-to-go]]
func pcNested(more map[string]string) map[string]string {
	out := map[string]string{
		ticketAt(pcGroup):    withField(pcAtChildren(), groupField, "big-move"),
		ticketAt("big-move"): pcGroupNote,
	}
	for at, text := range more {
		out[at] = text
	}
	return out
}

// freeChildren takes the group off each open and draft ticket, and stages it. [[spec/tickets/work-verbs-port-to-go]]
func TestPCFreeChildrenTakesTheGroupOff(t *testing.T) {
	t.Parallel()
	one := newTree(t, map[string]string{
		ticketAt("a-child"):  pcChild(pcGroup, "open"),
		ticketAt("a-draft"):  pcChild(pcGroup, "draft"),
		ticketAt("shut-one"): pcChild(pcGroup, "closed"),
	})
	freed := one.d.freeChildren(pcGroup, "")
	sort.Strings(freed)
	if !slices.Equal(freed, []string{"a-child", "a-draft"}) {
		t.Fatalf("freeChildren frees %v", freed)
	}
	pcField(one, "shut-one", "group", pcGroup)
	pcField(one, "a-draft", "group", "")
	holds(t, one.git("diff", "--cached", "--name-only"), ticketAt("a-draft"))
}

// done writes hash_after, and closes a group whose every ticket is closed. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneClosesAFinishedGroup(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):   pcAtChildren(),
		ticketAt("a-child"): pcChild(pcGroup, "closed"),
	})
	head := one.git("rev-parse", "HEAD")
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	if after := pcLastAfter(one); after != head {
		t.Fatalf("the take closes on %q, and HEAD read %q", after, head)
	}
	pcField(one, pcGroup, "state", closedState)
	pcField(one, pcGroup, "reason", doneReason)
	holds(t, one.pcSaid(), "every ticket in it is closed")
	if one.pcTip(pcOrigin) != one.git("rev-parse", "HEAD") {
		t.Fatal("the leave stays off origin")
	}
}

// done on a top group refuses while an open or draft child stands, and names the pull of each. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneRefusesAnOpenChild(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):    pcAtChildren(),
		ticketAt("a-child"):  pcChild(pcGroup, "open"),
		ticketAt("a-draft"):  pcChild(pcGroup, "draft"),
		ticketAt("shut-one"): pcChild(pcGroup, "closed"),
	})
	pushed := one.pcTip(pcOrigin)
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", "open")
	for _, name := range []string{"a-child", "a-draft"} {
		pcField(one, name, "group", pcGroup)
		holds(t, one.pcSaid(), "./RUNME.sh ticket pull "+name)
	}
	pcLacks(one, one.pcSaid(), "shut-one")
	holds(t, one.pcSaid(), "--process=person")
	if one.pcTip(pcOrigin) != pushed {
		t.Fatal("the refusal pushes")
	}
}

// done on a top group hands a child on the person route loose, and closes. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneHandsThePersonRouteLoose(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):    pcAtChildren(),
		ticketAt("a-trial"):  pcPersonChild(pcGroup),
		ticketAt("shut-one"): pcChild(pcGroup, "closed"),
	})
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", closedState)
	pcField(one, "a-trial", "group", "")
	pcField(one, "shut-one", "group", pcGroup)
	holds(t, one.pcSaid(), "a-trial")
	if fieldOf(one.git("show", pcOrigin+":"+ticketAt("a-trial")), groupField) != "" {
		t.Fatal("the loose trial stays off the pushed branch")
	}
}

// done refuses a ticket waiting for a helper, and a ticket of another group counts nowhere. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneRefusesAHelperTicket(t *testing.T) {
	t.Parallel()
	helper := strings.Replace(pcChild(pcGroup, "open"), "    does: makes", "    by: helper\n    does: makes", 1)
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):     pcAtChildren(),
		ticketAt("a-child"):   helper,
		ticketAt("elsewhere"): pcChild("another-group", "open"),
	})
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", "open")
	pcField(one, "a-child", "group", pcGroup)
	pcField(one, "elsewhere", "group", "another-group")
	holds(t, one.pcSaid(), "a-child")
	pcLacks(one, one.pcSaid(), "elsewhere")
}

// done on a group refuses while the battery answers nothing green. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneWantsAGreenBattery(t *testing.T) {
	t.Parallel()
	one := pcOnGroup(newTree(t, nil).desk(), map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, "box 3f9a", "a1b2c3")})
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "no check has run here")
	if after := pcLastAfter(one); after != "" {
		t.Fatalf("the take closes on %q", after)
	}
}

// done on a group refuses where trunk stands ahead of it, and names the sync. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneWantsTrunkIn(t *testing.T) {
	t.Parallel()
	one := pcOnGroup(newTree(t, nil).desk(), map[string]string{ticketAt(pcGroup): pcTake(pcGroupNote, "box 3f9a", "a1b2c3")})
	one.git("switch", "-q", trunk)
	for _, step := range []string{"one", "two", "three"} {
		one.land("main moves "+step, map[string]string{"moves/" + step: step})
	}
	one.git("push", "-q", "origin", trunk)
	one.git("switch", "-q", workBranch+pcGroup)
	one.pcGreen()
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "main holds 3 commit(s) work/one-group lacks")
	holds(t, one.pcSaid(), "branch sync")
	if after := pcLastAfter(one); after != "" {
		t.Fatalf("the record closes on %q where the sync is owed", after)
	}
}

// done refuses while the group's retro stands open, and names the retro step. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneWantsTheRetro(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):   pcRetroGroup(),
		ticketAt("a-child"): pcChild(pcGroup, "closed"),
	})
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "retro/notes")
	holds(t, one.pcSaid(), "ticket pull one-group")
	if after := pcLastAfter(one); after != "" {
		t.Fatalf("the box leaves on %q", after)
	}
	pcField(one, pcGroup, "state", "open")
	pcField(one, "a-child", "group", pcGroup)
}

// done names the open retro before it hands a ticket on, and hands none of it on. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneNamesTheRetroBeforeTheHandOn(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):   pcRetroGroup(),
		ticketAt("a-child"): pcPersonChild(pcGroup),
	})
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "retro/notes")
	pcField(one, "a-child", "group", pcGroup)
}

// done on a cloud box refuses while the cloud leaf of the retro stands open. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneOnACloudBoxWantsTheCloudLeaf(t *testing.T) {
	t.Parallel()
	one := pcOnGroup(newTree(t, nil), map[string]string{ticketAt(pcGroup): pcWritten(pcRetroGroup(), "notes", "write")})
	one.pcGreen()
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "retro/cloud")
	pcField(one, pcGroup, "state", "open")
}

// done hands the group back once the retro leaves that apply here stand written. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneLeavesOnceTheRetroStandsWritten(t *testing.T) {
	t.Parallel()
	one := pcDone(t, map[string]string{
		ticketAt(pcGroup):    pcWritten(pcRetroGroup(), "notes", "write"),
		ticketAt("shut-one"): pcChild(pcGroup, "closed"),
	})
	head := one.git("rev-parse", "HEAD")
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done on a desk answers %d: %s", code, one.pcSaid())
	}
	rows := recordIn(one.pcTicket(pcGroup))
	if len(rows) == 0 || entryField(rows[0], "hash_after") != head {
		t.Fatal("the take entry stays open")
	}
	pcField(one, pcGroup, "state", closedState)
	pcField(one, "shut-one", "group", pcGroup)
}

// done on a fix group refuses an agent ticket it leaves, and names the pull and the person route for it. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneOnAFixGroupRefusesAnAgentTicket(t *testing.T) {
	t.Parallel()
	one := pcLeaving(t, true, map[string]string{
		"a-follow-up": pcLoose(),
		"b-follow-up": pcLoose(),
		"a-trial":     pcPersonChild(""),
	}, nil)
	pushed := one.pcTip(pcOrigin)
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", "open")
	for _, name := range []string{"a-follow-up", "b-follow-up"} {
		holds(t, one.pcSaid(), "./RUNME.sh ticket pull "+name+"\n")
	}
	holds(t, one.pcSaid(), "./RUNME.sh mint ticket spec/tickets/<name>-person.md --process=person")
	holds(t, one.pcSaid(), "./RUNME.sh ticket pull <name> --became <name>-person")
	pcLacks(one, one.pcSaid(), "a-trial")
	if one.pcTip(pcOrigin) != pushed {
		t.Fatal("the refusal pushes")
	}
}

// done passes where every ticket the group leaves stands on the person route. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDonePassesThePersonRoute(t *testing.T) {
	t.Parallel()
	one := pcLeaving(t, true, map[string]string{"a-trial": pcPersonChild("")}, nil)
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", closedState)
	pcField(one, "a-trial", "group", "")
}

// done refuses a question ticket the branch adds, since the box answers it. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneRefusesAQuestionTicket(t *testing.T) {
	t.Parallel()
	one := pcLeaving(t, false, map[string]string{"a-question": pcLoosePerson}, nil)
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "a-question")
	pcField(one, pcGroup, "state", "open")
}

// done on a feature group refuses an open agent ticket it adds, as a fix group does. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneOnAFeatureGroupRefusesAnAgentTicket(t *testing.T) {
	t.Parallel()
	one := pcLeaving(t, false, map[string]string{"a-follow-up": pcLoose()}, nil)
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	holds(t, one.pcSaid(), "a-follow-up")
	pcField(one, pcGroup, "state", "open")
}

// branch done on a child group refuses an open child, and files none under the parent. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneOnAChildGroupRefusesAnOpenChild(t *testing.T) {
	t.Parallel()
	one := pcDone(t, pcNested(map[string]string{
		ticketAt("a-child"):  pcChild(pcGroup, "open"),
		ticketAt("shut-one"): pcChild(pcGroup, "closed"),
	}))
	if code := one.branchSays("done"); code != codeRed {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", "open")
	pcField(one, "a-child", "group", pcGroup)
}

// branch done on a child group hands the person route loose, past the parent. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneOnAChildGroupHandsThePersonRouteLoose(t *testing.T) {
	t.Parallel()
	one := pcDone(t, pcNested(map[string]string{
		ticketAt("a-trial"): pcPersonChild(""),
		ticketAt("b-trial"): pcPersonChild(pcGroup),
	}))
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", closedState)
	pcField(one, "a-trial", "group", "")
	pcField(one, "b-trial", "group", "")
}

// branch done closes on the branch alone, files the children and drops the marker. [[spec/tickets/work-verbs-port-to-go]]
func TestPCDoneClosesOnTheBranchAlone(t *testing.T) {
	t.Parallel()
	one := pcDone(t, pcNested(map[string]string{
		ticketAt("a-child"): pcPersonChild(pcGroup),
	}))
	one.git("switch", "-q", workBranch+pcGroup)
	marked := withField(one.pcTicket(pcGroup), cloudMark, "true")
	one.land("the group carries the marker", map[string]string{ticketAt(pcGroup): marked})
	one.git("push", "-q", "origin", workBranch+pcGroup)
	one.pcGreen()
	trunkTip := one.pcTip("origin/" + trunk)
	if code := one.branchSays("done"); code != codeOK {
		t.Fatalf("done answers %d: %s", code, one.pcSaid())
	}
	pcField(one, pcGroup, "state", closedState)
	pcField(one, pcGroup, cloudMark, "")
	pcField(one, "a-child", "group", "")
	one.git("fetch", "-q", "origin")
	if one.pcTip("origin/"+trunk) != trunkTip {
		t.Fatal("main takes a push")
	}
	if one.pcTip(pcOrigin) != one.git("rev-parse", "HEAD") {
		t.Fatal("the branch stays unpushed")
	}
	holds(t, one.pcSaid(), "Open the pull request over work/one-group against main, with auto-merge on")
	pcLacks(one, one.pcSaid(), "branch merge")
}

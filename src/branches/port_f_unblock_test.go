// The unblock over a real clone, ported off test/level0/unblock.test.js: the
// child closes as became, the successor carries the question in its shape, and
// every road it refuses on leaves the child open.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"regexp"
	"strings"
	"testing"
)

// The question the child's person step asks. [[spec/tickets/work-verbs-port-to-go]]
const pfAsksLine = "        asks: \"the verdict failed back 2 times: no test drives the hook\"\n"

// A child of one-group standing at a step, its person step asking the question. [[spec/tickets/work-verbs-port-to-go]]
func pfUChild(step, more string) string {
	return `---
kind: [[ticket]]
state: open
urgency: soon
step: ` + step + `
steps:
  - name: design
    evidence:
      - name: approach
        form: text
        says: the approach
  - name: implement
    steps:
      - name: person-1
        does: answers the question the engine asks
        by: person
        to: engine
` + pfAsksLine + `        evidence:
          - name: answer
            form: text
            says: the answer
      - name: change
        does: makes the change
        evidence:
          - name: lint
            form: command
            expects: 0
            says: the tree lints
group: one-group
` + more + `---

# Ask

One piece of it.

# design

## approach

<!-- the approach -->

# implement

## person-1

### answer

<!-- the answer -->

## change

### lint
`
}

// The successor, on the person route, opening at a step a person takes. [[spec/tickets/work-verbs-port-to-go]]
const pfSuccessor = `---
kind: [[ticket]]
state: open
urgency: soon
process: [[spec/processes/person]]
steps:
  - name: do
    does: answers the question the person step asks
    by: person
    evidence:
      - name: lint
        form: command
        expects: 0
        says: the tree lints
---

# Ask

What the person decides, and what rides on it.

# do

## lint

# Discussion

Nothing stands here yet.
`

// The group the child stands in. [[spec/tickets/work-verbs-port-to-go]]
const pfUGroup = "---\nkind: [[ticket]]\nstate: open\nurgency: soon\nstep: children\nsteps:\n  - name: children\n    by: children\n---\n\n# Ask\n\nThe group itself.\n\n# children\n"

// A desk tree holding the group, the child and the successor, standing on work/one-group where onBranch says so. [[spec/tickets/work-verbs-port-to-go]]
func pfUnblockTree(t *testing.T, child, successor string, onBranch bool) *tree {
	t.Helper()
	one := newTree(t, map[string]string{
		ticketAt("one-group"):   pfUGroup,
		ticketAt("a-child"):     child,
		ticketAt("a-successor"): successor,
	}).desk()
	if onBranch {
		one.git("switch", "-q", "-c", workBranch+"one-group")
	}
	return one
}

// Runs the unblock of a-child onto a-successor. [[spec/tickets/work-verbs-port-to-go]]
func pfUnblock(one *tree) int { return one.branchSays("unblock", "a-child", "a-successor") }

// Fails where the child stands anything but open. [[spec/tickets/work-verbs-port-to-go]]
func pfStaysOpen(t *testing.T, one *tree) {
	t.Helper()
	if state := fieldOf(one.read(ticketAt("a-child")), "state"); state != openState {
		t.Fatalf("the child stands %s", state)
	}
}

// Fails where the child stands anything but closed as became. [[spec/tickets/work-verbs-port-to-go]]
func pfClosedBecame(t *testing.T, one *tree) string {
	t.Helper()
	now := one.read(ticketAt("a-child"))
	if fieldOf(now, "state") != closedState || fieldOf(now, "reason") != "became" {
		t.Fatalf("the child stands %s as %s", fieldOf(now, "state"), fieldOf(now, "reason"))
	}
	return now
}

// A cloud box refuses the unblock, names the pull, and leaves the child open. [[spec/tickets/work-verbs-port-to-go]]
func TestPFUnblockRefusesACloudBox(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), pfSuccessor, true)
	one.d.Env["CLAUDE_CODE_REMOTE"] = "true"
	if code := pfUnblock(one); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "hands no question out")
	holds(t, one.errs.String(), "ticket pull a-child")
	pfStaysOpen(t, one)
}

// The unblock closes a child waiting on a person as became, and names its successor. [[spec/tickets/work-verbs-port-to-go]]
func TestPFUnblockClosesTheChildAsBecame(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), pfSuccessor, true)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	holds(t, pfClosedBecame(t, one), "successors: [a-successor]")
	holds(t, one.out.String(), "a-child closes became a-successor")
}

// The unblock commits the child and its successor alone, and sweeps no other change in. [[spec/tickets/work-verbs-port-to-go]]
func TestPFUnblockStagesTheTwoTicketsAlone(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), pfSuccessor, true)
	one.write(map[string]string{ticketAt("one-group"): pfUGroup + "\nAn edit in hand.\n", "src/loose.txt": "loose\n"})
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	landed := one.git("show", "--name-only", "--format=", "HEAD")
	if landed != ticketAt("a-child")+"\n"+ticketAt("a-successor") {
		t.Fatalf("the commit carries %q", landed)
	}
	still := one.git("status", "--porcelain", "-uall")
	holds(t, still, ticketAt("one-group"))
	holds(t, still, "src/loose.txt")
}

// The successor carries the question and the ticket it comes from under Discussion, the empty line gone. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheSuccessorCarriesTheQuestion(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), pfSuccessor, true)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	next := one.read(ticketAt("a-successor"))
	holds(t, next, "no test drives the hook")
	holds(t, next, "[[spec/tickets/a-child]]")
	holds(t, next, "# Discussion")
	if strings.Contains(next, "Nothing stands here yet") {
		t.Fatal("the empty line stays")
	}
}

// A question carrying a table lands as that table, and TL;DR stays whole. [[spec/tickets/work-verbs-port-to-go]]
func TestPFATabledQuestionLandsAsATable(t *testing.T) {
	child := strings.Replace(pfUChild("implement/person-1", ""), pfAsksLine, `        asks: TL;DR pick a road\n\n| road | cost |\n| --- | --- |\n| one | two |`+"\n", 1)
	one := pfUnblockTree(t, child, pfSuccessor, true)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	next := one.read(ticketAt("a-successor"))
	for _, row := range []string{`(?m)^\| road \| cost \|$`, `(?m)^\| one \| two \|$`, `TL;DR pick a road`} {
		if !regexp.MustCompile(row).MatchString(next) {
			t.Fatalf("the successor holds no %s:\n%s", row, next)
		}
	}
	if regexp.MustCompile(`(?m)^\s+- DR`).MatchString(next) {
		t.Fatalf("a cut falls inside TL;DR:\n%s", next)
	}
}

// Two questions land one list item each. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTwoQuestionsLandAnItemEach(t *testing.T) {
	child := strings.Replace(pfUChild("implement/person-1", ""), pfAsksLine, "        asks: \"the first road; the second road\"\n", 1)
	one := pfUnblockTree(t, child, pfSuccessor, true)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	next := one.read(ticketAt("a-successor"))
	holds(t, next, "\n  - the first road\n")
	holds(t, next, "\n  - the second road\n")
}

// A findings table a verdict fails with rides the person step the escalation writes, and lands under unblock as that table. [[spec/tickets/work-verbs-port-to-go]]
func TestPFAFailedVerdictTableLandsAsATable(t *testing.T) {
	reason := `the rows split:; | road | cost |\n| --- | --- |\n| one | two |; no test drives the hook`
	one := pfUnblockTree(t, pfUChild("implement/change", ""), pfSuccessor, true)
	one.d.Method = pfMethod(t)
	text, path := one.d.withPersonStep(note{Name: "a-child", Text: pfUChild("implement/change", "")}, "implement/change", "implement/change fails back 2 times: "+reason, nil)
	if path != "implement/person-2" {
		t.Fatalf("the person step goes in at %q", path)
	}
	one.land("the verdict fails", map[string]string{ticketAt("a-child"): text})
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	next := one.read(ticketAt("a-successor"))
	for _, row := range []string{`(?m)^\| road \| cost \|$`, `(?m)^\| one \| two \|$`, `(?m)^ {2}- no test drives the hook$`} {
		if !regexp.MustCompile(row).MatchString(next) {
			t.Fatalf("the successor holds no %s:\n%s", row, next)
		}
	}
}

// A successor whose first step admits an agent refuses, names what it read, and leaves the child open. [[spec/tickets/work-verbs-port-to-go]]
func TestPFASuccessorAdmittingAnAgentRefuses(t *testing.T) {
	for _, one := range [][2]string{{"", "anyone"}, {"anyone", "anyone"}, {"agent", "agent"}} {
		by := ""
		if one[0] != "" {
			by = "    by: " + one[0] + "\n"
		}
		open := strings.Replace(pfSuccessor, "    by: person\n", by, 1)
		its := pfUnblockTree(t, pfUChild("implement/person-1", ""), open, true)
		if code := pfUnblock(its); code != codeRefused {
			t.Fatalf("by: %s answers %d", one[1], code)
		}
		holds(t, its.errs.String(), "waits for a person")
		holds(t, its.errs.String(), one[1])
		pfStaysOpen(t, its)
	}
}

// The placeholder the mint writes under Discussion goes, and the question still lands. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheMintPlaceholderGoes(t *testing.T) {
	minted := strings.Replace(pfSuccessor, "Nothing stands here yet.", "<!-- what anybody adds, at any time, on this ticket -->", 1)
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), minted, true)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	next := one.read(ticketAt("a-successor"))
	if strings.Contains(next, "<!--") {
		t.Fatalf("the comment stays:\n%s", next)
	}
	holds(t, next, "no test drives the hook")
}

// A successor off the person route refuses, names the mint onto it, and leaves the child open. [[spec/tickets/work-verbs-port-to-go]]
func TestPFASuccessorOffThePersonRouteNamesTheMint(t *testing.T) {
	question := strings.Replace(pfSuccessor, "[[spec/processes/person]]", "[[spec/processes/question]]", 1)
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), question, true)
	if code := pfUnblock(one); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "--process=person")
	pfStaysOpen(t, one)
}

// A child standing at a step an agent takes refuses, names the step, and stays open. [[spec/tickets/work-verbs-port-to-go]]
func TestPFAChildAtAnAgentStepRefuses(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/change", ""), pfSuccessor, true)
	if code := pfUnblock(one); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "implement/change")
	holds(t, one.errs.String(), "a hand can take")
	pfStaysOpen(t, one)
}

// A successor standing inside the group it leaves refuses. [[spec/tickets/work-verbs-port-to-go]]
func TestPFASuccessorInsideTheGroupRefuses(t *testing.T) {
	inside := strings.Replace(pfSuccessor, "urgency: soon\n", "urgency: soon\ngroup: one-group\n", 1)
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), inside, true)
	if code := pfUnblock(one); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "a-successor stands in one-group")
}

// On main the unblock reads the group off the child's own field, and names it. [[spec/tickets/work-verbs-port-to-go]]
func TestPFUnblockOnMainReadsTheChildsGroup(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), pfSuccessor, false)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	pfClosedBecame(t, one)
	holds(t, one.out.String(), "stands outside one-group")
}

// On main a child standing in no group hands its person step out, and the verb names no empty group. [[spec/tickets/work-verbs-port-to-go]]
func TestPFUnblockOnMainFreesAChildInNoGroup(t *testing.T) {
	one := pfUnblockTree(t, strings.Replace(pfUChild("implement/person-1", ""), "group: one-group\n", "", 1), pfSuccessor, false)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	pfClosedBecame(t, one)
	if regexp.MustCompile(`stands (in|outside) [,.]`).MatchString(one.out.String() + one.errs.String()) {
		t.Fatalf("the verb names an empty group: %s", one.out.String())
	}
}

// A successor standing nowhere refuses, and the verb names the mint and mints none. [[spec/tickets/work-verbs-port-to-go]]
func TestPFUnblockNamesTheSuccessorItNeeds(t *testing.T) {
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), pfSuccessor, true)
	if code := one.branchSays("unblock", "a-child", "no-such-next"); code != codeRefused {
		t.Fatalf("the unblock answers %d", code)
	}
	holds(t, one.errs.String(), "no-such-next stands nowhere yet")
	holds(t, one.errs.String(), "mint ticket")
	if one.read(ticketAt("no-such-next")) != "" {
		t.Fatal("the verb mints a successor of its own")
	}
}

// A successor written off the person route, as the mint copies it, opens at a person step and the verb takes it. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheVerbTakesASuccessorOffThePersonRoute(t *testing.T) {
	minted := `---
kind: [[ticket]]
state: open
process: [[spec/processes/person]]
steps:
  - name: do
    does: does the work the ask names
    by: person
    to: engine
    input: ask
    evidence:
      - name: result
        form: text
        says: what came back
  - name: follow
    does: carries the result into the tree
    from: anyone
    by: anyone
    to: retro
    input: result
    evidence:
      - name: says
        form: text
        says: what changes and why
---

# Ask

## work

<!-- what the person does -->

# do

## result

# follow

## says

# Discussion

<!-- what anybody adds, at any time, on this ticket -->
`
	one := pfUnblockTree(t, pfUChild("implement/person-1", ""), minted, true)
	if code := pfUnblock(one); code != 0 {
		t.Fatalf("the unblock answers %d: %s", code, one.errs.String())
	}
	pfClosedBecame(t, one)
	next := one.read(ticketAt("a-successor"))
	holds(t, next, "no test drives the hook")
	holds(t, next, "# Discussion")
}

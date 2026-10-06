// The escalation over a real clone, ported off test/level0/pull-escalate.test.js:
// the person step it puts in, the choice its options write, the hand it reads,
// and the roads it refuses on.
// [[spec/tickets/work-verbs-port-to-go]]
package branches // level0: InPackageTest - it drives the unexported escalate parsers and holdOf, handOf and splitsKey

import (
	"regexp"
	"slices"
	"testing"
)

// A tree holding a-child at design/draft, a schema to re-route by, and a pull that answers green. [[spec/tickets/work-verbs-port-to-go]]
func pfEscalateTree(t *testing.T, group string, more map[string]string) *tree {
	t.Helper()
	files := map[string]string{ticketAt("a-child"): pfChild("design/draft", group)}
	for at, text := range more {
		files[at] = text
	}
	one := newTree(t, files)
	one.d.Method = pfMethod(t)
	one.d.Runme = []string{"true"}
	return one
}

// A desk escalation puts a person step before the held leaf, drops the hold, lands one commit and pushes nothing. [[spec/tickets/work-verbs-port-to-go]]
func TestPFADeskEscalationInsertsAPersonStep(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "", nil).desk()
	hand := one.d.handOf()
	pfHold(one, hand, "a-child", "design/draft")
	before := one.sh(one.from, "git", "rev-parse", "main")
	if code := one.branchSays("escalate", "which road does the owner want"); code != 0 {
		t.Fatalf("the escalation answers %d: %s", code, one.errs.String())
	}
	now := one.read(ticketAt("a-child"))
	if fieldOf(now, "step") != "design/person-1" {
		t.Fatalf("the ticket stands at %q", fieldOf(now, "step"))
	}
	shape := regexp.MustCompile(`- name: person-1\n\s+does: answers the question the engine asks\n\s+by: person\n\s+to: engine\n\s+asks: which road does the owner want`)
	if !shape.MatchString(now) {
		t.Fatalf("the person step reads apart:\n%s", now)
	}
	if held := one.d.holdOf(hand); held != nil && held.Step == "design/draft" {
		t.Fatal("the hold on the escalated leaf stands")
	}
	holds(t, one.git("log", "-1", "--format=%s"), "a-child: ")
	if after := one.sh(one.from, "git", "rev-parse", "main"); after != before {
		t.Fatal("a desk's escalation pushes main")
	}
}

// After an escalation on trunk the pull runs, and its hand-out of the next free ticket prints. [[spec/tickets/work-verbs-port-to-go]]
func TestPFAnEscalationOnTrunkHandsTheNextFreeTicket(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "", map[string]string{ticketAt("b-other"): pfChild("design/draft", "")}).desk()
	one.d.Runme = []string{"echo", "work  b-other at design/draft"}
	pfHold(one, one.d.handOf(), "a-child", "design/draft")
	if code := one.branchSays("escalate", "which road"); code != 0 {
		t.Fatalf("the escalation answers %d: %s", code, one.errs.String())
	}
	if !regexp.MustCompile(`(?m)^work {2}b-other at design/draft`).MatchString(one.out.String()) {
		t.Fatalf("the free ticket comes not next: %q", one.out.String())
	}
}

// An escalation with options writes a choice answer carrying the words, and a cloud box pushes the branch. [[spec/tickets/work-verbs-port-to-go]]
func TestPFEscalationOptionsWriteAChoice(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "one-group", nil)
	pfOnBranch(one, "one-group")
	pfHold(one, one.d.handOf(), "a-child", "design/draft")
	if code := one.branchSays("escalate", "which road", "--options", "left,right"); code != 0 {
		t.Fatalf("the escalation answers %d: %s", code, one.errs.String())
	}
	now := one.read(ticketAt("a-child"))
	holds(t, now, "form: choice")
	holds(t, now, "left")
	holds(t, now, "right")
	holds(t, one.sh(one.from, "git", "log", "-1", "--format=%s", workBranch+"one-group"), "a-child: ")
}

// An escalation under --as reads that hand's hold, and keeps the name out of the question. [[spec/tickets/work-verbs-port-to-go]]
func TestPFEscalationUnderAsReadsThatHand(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "one-group", nil)
	pfOnBranch(one, "one-group")
	pfHold(one, one.d.handOf()+" · helper-2", "a-child", "design/draft")
	if code := one.branchSays("escalate", "which road", "--as", "helper-2"); code != 0 {
		t.Fatalf("the escalation answers %d: %s", code, one.errs.String())
	}
	now := one.read(ticketAt("a-child"))
	if fieldOf(now, "step") != "design/person-1" {
		t.Fatalf("the ticket stands at %q", fieldOf(now, "step"))
	}
	if !regexp.MustCompile(`(?m)asks: which road$`).MatchString(now) {
		t.Fatalf("the hand's name rides the question:\n%s", now)
	}
}

// An escalation with no question refuses, and says what it takes. [[spec/tickets/work-verbs-port-to-go]]
func TestPFEscalationWithNoQuestionRefuses(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "one-group", nil)
	pfHold(one, one.d.handOf(), "a-child", "design/draft")
	if code := one.branchSays("escalate"); code != codeRefused {
		t.Fatalf("a bare escalation answers %d", code)
	}
	if !regexp.MustCompile(`(?m)^refused`).MatchString(one.errs.String()) {
		t.Fatalf("the refusal reads %q", one.errs.String())
	}
	holds(t, one.errs.String(), "takes the question a person answers")
}

// An escalation with no hold standing refuses, and names the pull. [[spec/tickets/work-verbs-port-to-go]]
func TestPFEscalationWithNoHoldNamesThePull(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "one-group", nil)
	if code := one.branchSays("escalate", "which road"); code != codeRed {
		t.Fatalf("an escalation with no hold answers %d", code)
	}
	if !regexp.MustCompile(`(?m)^refused`).MatchString(one.errs.String()) {
		t.Fatalf("the refusal reads %q", one.errs.String())
	}
	holds(t, one.errs.String(), "ticket pull")
}

// A ticket at the split cap refuses another person step, and asks for a split. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheSplitCapRefusesAnotherPersonStep(t *testing.T) {
	t.Parallel()
	one := pfEscalateTree(t, "one-group", nil)
	one.d.Config = func(key string) any {
		if key == splitsKey {
			return 1
		}
		return nil
	}
	first, path := one.d.withPersonStep(note{Name: "a-child", Text: pfChild("design/review", "one-group")}, "design/draft", "first", nil)
	if path != "design/person-1" {
		t.Fatalf("the first person step goes in at %q", path)
	}
	if _, again := one.d.withPersonStep(note{Name: "a-child", Text: first}, "design/draft", "second", nil); again != "" {
		t.Fatalf("the second person step goes in at %q", again)
	}
	holds(t, one.errs.String(), "carries 1 person steps already, so split it")
}

// The question reads every word past the hand's flag, and a comma list reads its words. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheEscalationReadsItsWords(t *testing.T) {
	t.Parallel()
	if got := askedIn([]string{"--as", "helper", "which", "road?"}); got != "which road?" {
		t.Fatalf("the question reads %q", got)
	}
	if got := wordsIn("left, right,"); !slices.Equal(got, []string{"left", "right"}) {
		t.Fatalf("the words read %v", got)
	}
	if got := wordsIn(""); len(got) != 0 {
		t.Fatalf("an empty list reads %v", got)
	}
}

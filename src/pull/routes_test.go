// The routes this tree ships hold the shape the verbs read: where each opens,
// who passes each leaf, and what the gates and the asks name, off the cases
// test/contract/process.test.js held.
// [[spec/tickets/pull-scripts-leave]]
package pull

import (
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"testing"

	"quackitect/src/yaml"
)

// The process the tree ships under the name. [[spec/tickets/pull-scripts-leave]]
func shipped(t *testing.T, name string) Process {
	t.Helper()
	held, why := ProcessAt(OSDisk{Root: method}, name)
	if why != "" {
		t.Fatalf("the %s route reads no process: %s", name, why)
	}
	return held
}

// The top step of a route under the name, or nil. [[spec/tickets/pull-scripts-leave]]
func stepNamed(steps []any, name string) *yaml.Doc {
	for _, one := range steps {
		if said := yaml.AsDoc(one); said != nil && yaml.AsString(said.Get("name")) == name {
			return said
		}
	}
	return nil
}

// The evidence field of a step under the name, or nil. [[spec/tickets/pull-scripts-leave]]
func evidenceNamed(step *yaml.Doc, name string) *yaml.Doc {
	return stepNamed(yaml.Flat(step.Get("evidence")), name)
}

// The retro note under spec/guidance/retro. [[spec/tickets/pull-scripts-leave]]
func retroNote(t *testing.T, name string) string {
	t.Helper()
	said, err := os.ReadFile(filepath.Join(method, "spec", "guidance", "retro", name+".md"))
	if err != nil {
		t.Fatal(err)
	}
	return string(said)
}

func TestTheQuestionRouteOpensAtAStepWaitingForAPerson(t *testing.T) {
	t.Parallel()
	front := shipped(t, "question").Said
	path := StepPathOf(front)
	if leaf := LeafOf(front, path); path != "answer" || leaf == nil || leaf.By != Person {
		t.Fatalf("the question route opens at %q, read %+v, and wants its answer step waiting for a person", path, leaf)
	}
}

func TestThePersonRouteOpensAtAPersonStepAndAnyHandCarriesOn(t *testing.T) {
	t.Parallel()
	front := shipped(t, "person").Said
	path := StepPathOf(front)
	if leaf := LeafOf(front, path); path != "do" || leaf == nil || leaf.By != Person {
		t.Fatalf("the person route opens at %q, read %+v, and wants its do step waiting for a person", path, leaf)
	}
	if follow := LeafOf(front, "follow"); follow == nil || follow.By != "anyone" {
		t.Fatalf("the follow step reads %+v, and wants any hand to carry the result on", follow)
	}
}

func TestTheGroupRouteReadsItsChildrenThroughAFinalAcceptance(t *testing.T) {
	t.Parallel()
	children, final := -1, -1
	for at, one := range shipped(t, "group").Route {
		step := yaml.AsDoc(one)
		if yaml.AsString(step.Get("name")) == "children" {
			children = at
		}
		if yaml.AsString(step.Get("final")) == "true" {
			final = at
		}
	}
	if final < 0 || final < children {
		t.Fatalf("the final gate stands at %d and the children at %d, and the final gate wants to follow the children", final, children)
	}
}

func TestTheStandardRouteGatesTheDesignOnceAndHandsOnToTheRetro(t *testing.T) {
	t.Parallel()
	front := shipped(t, "standard").Said
	paths := []string{}
	for _, one := range LeavesOf(front) {
		paths = append(paths, one.Path)
	}
	want := "design/owner-read design/draft design/tests-red gate implement/change implement/tests-green accept view"
	if got := strings.Join(paths, " "); got != want {
		t.Fatalf("the standard leaves read %s, and want %s: one gate on the design, then the acceptance and the owner's view", got, want)
	}
	gate := LeafOf(front, "gate")
	if gate.Gate == "" || gate.Not != "design/draft" {
		t.Fatalf("the gate reads %+v, and wants its question and no review by the draft's author", gate)
	}
	draft := LeafOf(front, "design/draft")
	for _, name := range []string{"tests", "size"} {
		if field := draft.holdsField(name); field == nil || yaml.AsString(field.Get("form")) != "list" {
			t.Fatalf("the draft's %s field reads %v, and wants a list, one a line", name, field)
		}
	}
	if len(yaml.Flat(draft.Said.Get("checklist"))) == 0 {
		t.Fatalf("the draft leaf holds no checklist of its own")
	}
	if to := yaml.AsString(LeafOf(front, "implement/tests-green").Said.Get("to")); to != "retro" {
		t.Fatalf("the tests-green leaf hands on to %q, and wants the retro", to)
	}
	for _, one := range WalkOf(front) {
		if one.Path == "implement" {
			if got := strings.Join(yaml.StringsOf(one.Said.Get("input")), " "); got != "design/draft gate" {
				t.Fatalf("the code reads %s, and wants the draft and the gate's verdict", got)
			}
		}
	}
}

// The evidence field of a leaf under the name, or nil. [[spec/tickets/pull-scripts-leave]]
func (leaf *Leaf) holdsField(name string) *yaml.Doc {
	for _, one := range leaf.Evidence {
		if yaml.AsString(one.Get("name")) == name {
			return one
		}
	}
	return nil
}

// [[spec/tickets/the-retro-reads-the-backlog]]
func TestTheRetroRouteHoldsBacklogAfterAudit(t *testing.T) {
	t.Parallel()
	steps := shipped(t, "retro").Route
	names := []string{}
	for _, one := range steps {
		names = append(names, yaml.AsString(yaml.AsDoc(one).Get("name")))
	}
	at := strings.Index(strings.Join(names, " "), "audit backlog")
	backlog := stepNamed(steps, "backlog")
	if at < 0 || yaml.AsString(backlog.Get("input")) != "audit" || yaml.AsString(stepNamed(steps, "chapter").Get("input")) != "backlog" {
		t.Fatalf("the retro route reads %v, and wants backlog after audit, reading it, and feeding the chapter", names)
	}
	if says := yaml.AsString(yaml.AsDoc(yaml.Flat(backlog.Get("evidence"))[0]).Get("says")); !strings.Contains(says, "retro backlog") {
		t.Fatalf("the backlog says %q, and wants it to name the retro backlog", says)
	}
}

func TestTheRetroRouteEndsOnTheReportThenTheMint(t *testing.T) {
	t.Parallel()
	steps := shipped(t, "retro").Route
	last := []string{}
	for _, one := range steps[len(steps)-3:] {
		last = append(last, yaml.AsString(yaml.AsDoc(one).Get("name")))
	}
	if got := strings.Join(last, " "); got != "check report mint" {
		t.Fatalf("the retro route ends on %s, and wants check, report and mint", got)
	}
	report := stepNamed(steps, "report")
	if yaml.AsString(report.Get("by")) != Person || yaml.AsString(report.Get("on_fail")) != "check" || yaml.AsString(yaml.AsDoc(yaml.Flat(report.Get("evidence"))[0]).Get("form")) != "verdict" {
		t.Fatalf("the report reads %v, and wants a person's verdict that fails back to the check", report)
	}
	if says := yaml.AsString(yaml.AsDoc(yaml.Flat(stepNamed(steps, "check").Get("evidence"))[0]).Get("says")); !strings.Contains(says, "retro matrix") {
		t.Fatalf("the check says %q, and wants it to name the retro matrix", says)
	}
	if says := yaml.AsString(yaml.AsDoc(yaml.Flat(stepNamed(steps, "mint").Get("evidence"))[0]).Get("says")); !strings.Contains(says, "retro mint") {
		t.Fatalf("the mint says %q, and wants it to name the retro mint", says)
	}
	if check := retroNote(t, "check"); !strings.Contains(check, "`report` step") || !strings.Contains(check, "`mint` step") {
		t.Fatalf("the check note names no report step or no mint step")
	}
}

func TestTheRetroAuditReadsWholeAndCollectNamesTheScriptsFolder(t *testing.T) {
	t.Parallel()
	steps := shipped(t, "retro").Route
	for _, one := range yaml.Flat(stepNamed(steps, "audit").Get("checklist")) {
		if _, ok := one.(string); !ok {
			t.Fatalf("an audit item reads %#v, and wants text", one)
		}
	}
	if !strings.Contains(retroNote(t, "collect"), "`.se/scripts`") {
		t.Fatalf("the collect note names no .se/scripts")
	}
	if says := yaml.AsString(yaml.AsDoc(yaml.Flat(stepNamed(steps, "collect").Get("evidence"))[0]).Get("says")); !strings.Contains(says, ".se/scripts") {
		t.Fatalf("the collect step says %q, and wants it to name .se/scripts", says)
	}
}

func TestTheGroupsWriteStepAsksThePromptsAndErrorsWithTheirTimes(t *testing.T) {
	t.Parallel()
	write := stepNamed(yaml.Flat(stepNamed(shipped(t, "group").Route, "retro").Get("steps")), "write")
	says := yaml.AsString(evidenceNamed(write, "badly").Get("says"))
	for _, want := range []string{"each error of the run", "each owner prompt", "with its time"} {
		if !strings.Contains(says, want) {
			t.Fatalf("the badly field says %q, and wants %q", says, want)
		}
	}
	checklist := strings.Join(yaml.StringsOf(write.Get("checklist")), "\n")
	for _, want := range []string{
		"the chapter carries the run's owner prompts and errors off the transcript, each with its time",
		"the chapter says the role, and carries no name, address or path of the box",
	} {
		if !strings.Contains(checklist, want) {
			t.Fatalf("the write checklist lacks %q", want)
		}
	}
}

func TestTheReaderRuleHandsEachGroupChapterByItsClose(t *testing.T) {
	t.Parallel()
	rules := []string{}
	for _, row := range strings.Split(retroNote(t, "read"), "\n") {
		if regexp.MustCompile(`^\d+\. `).MatchString(row) {
			rules = append(rules, row)
		}
	}
	reach := ""
	for _, row := range rules {
		if strings.Contains(row, "input/groups/closed.json") {
			reach = row
		}
	}
	if reach == "" || !strings.Contains(reach, "`input/groups/<group>.md`") || !strings.Contains(reach, "hours hold") {
		t.Fatalf("the reach rule reads %q, and wants the closes, the group chapter and the hours", reach)
	}
	number := strings.SplitN(reach, ".", 2)[0]
	if !strings.Contains(rules[0], "the one reach rule "+number+" names") {
		t.Fatalf("rule one reads %q, and wants it to name reach rule %s", rules[0], number)
	}
}

func TestTheStandardRouteAsksForTheViewInTheOwnersWords(t *testing.T) {
	t.Parallel()
	held := shipped(t, "standard")
	view := stepNamed(held.Ask, "view")
	if view == nil || yaml.AsString(view.Get("form")) != "text" || !strings.Contains(yaml.AsString(view.Get("says")), "owner's words") {
		t.Fatalf("the view ask reads %v, and wants text in the owner's words", view)
	}
	last := yaml.AsDoc(held.Route[len(held.Route)-1])
	if yaml.AsString(last.Get("name")) != "view" || yaml.AsString(last.Get("by")) != Person || yaml.AsString(last.Get("when")) != "view" || yaml.AsString(last.Get("on_fail")) != "implement" {
		t.Fatalf("the last step reads %v, and wants the person's view, where the ask names one, failing back to the code", last)
	}
}

func TestTheNoteRouteAsksForTheOwnersQuotedWords(t *testing.T) {
	t.Parallel()
	said := stepNamed(shipped(t, "note").Ask, "said")
	if said == nil || yaml.AsString(said.Get("form")) != "list" || !strings.Contains(yaml.AsString(said.Get("says")), "transcript line") {
		t.Fatalf("the note's said ask reads %v, and wants a list of the owner's words, each with its transcript line", said)
	}
}

func TestTheStandardRouteOpensOnTheOwnersReadOffAHandover(t *testing.T) {
	t.Parallel()
	held := shipped(t, "standard")
	if from := stepNamed(held.Ask, "from"); from == nil || yaml.AsString(from.Get("form")) != "text" {
		t.Fatalf("the from ask reads %v, and wants text", from)
	}
	if first := LeavesOf(held.Said)[0].Path; first != "design/owner-read" {
		t.Fatalf("the standard route opens at %s, and wants the owner's read", first)
	}
	if read := LeafOf(held.Said, "design/owner-read"); read.By != Person || read.When != "handed" {
		t.Fatalf("the owner's read reads %+v, and wants a person's step where the ask comes off a handover", read)
	}
}

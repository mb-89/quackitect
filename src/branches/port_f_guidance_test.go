// The guidance verb under --step over a real clone, ported off
// test/level0/guidance-tags.test.js and topic-readers.test.js: the notes a
// process step resolves, and the refusals of a step or a process standing nowhere.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"strings"
	"testing"

	gmod "quackitect/src/modules/guidance"
)

// A guidance note with its front, its rules and its examples. [[spec/tickets/work-verbs-port-to-go]]
func pfNote(front, rules, examples string) string {
	return "---\nkind: [[guidance]]\nscope: [\"a hand\"]\n" + front + "---\n\n# Actionables\n\n" + rules + "\n" + examples
}

// The notes and the fixture route the tag cases resolve over. [[spec/tickets/work-verbs-port-to-go]]
func pfNotes() map[string]string {
	return map[string]string{
		"spec/guidance/code/code.md":    pfNote("", "1. Reach the outside through a door.\n2. Name a test as its claim. *\n", "\n# Examples\n\n| the rule | do | do not |\n|---|---|---|\n| 1 | a door | a read in place |\n"),
		"spec/guidance/code/testing.md": pfNote("tags: [testing]\n", "1. Watch a test fail first.\n", ""),
		"spec/guidance/cloud/cloud.md":  pfNote("env: [SE_CLOUD]\n", "1. Push each finished thing.\n", ""),
		"spec/guidance/voice.md":        pfNote("", "1. Say what is.\n", ""),
		"spec/processes/fixture.yaml":   "for: a fixture route\nsteps:\n  - name: sync\n    tags: [cloud]\n    does: takes trunk in\n  - name: implement\n    tags: [code]\n    steps:\n      - name: tests-red\n        tags: [testing]\n        does: writes the tests\n      - name: change\n        does: makes the change\n",
	}
}

// A tree over the files whose guidance door resolves them through the Go guidance module, under an empty env. [[spec/tickets/work-verbs-port-to-go]]
func pfGuidanceTree(t *testing.T, files map[string]string) *tree {
	t.Helper()
	texts := map[string]string{}
	for at, text := range files {
		texts[at] = text
	}
	one := newTree(t, files)
	one.d.Guidance = func() (map[string][]string, error) {
		out := map[string][]string{}
		for key, reads := range gmod.Resolve(texts) {
			out[key] = gmod.Notes(reads, map[string]string{})
		}
		return out, nil
	}
	return one
}

// The guidance verb prints the notes a named step resolves, and refuses a step standing nowhere. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheGuidanceVerbPrintsAStepsNotes(t *testing.T) {
	t.Parallel()
	one := pfGuidanceTree(t, pfNotes())
	if code := one.branchSays("guidance", "--step", "fixture:implement/tests-red"); code != 0 {
		t.Fatalf("the guidance answers %d: %s", code, one.errs.String())
	}
	said := one.out.String()
	holds(t, said, "# Reads spec/guidance/code/code")
	holds(t, said, "# Reads spec/guidance/code/testing\n\n1. Watch a test fail first.")
	if strings.Contains(said, "cloud") {
		t.Fatalf("a note binding an unset env prints:\n%s", said)
	}
	if code := one.branchSays("guidance", "--step", "fixture:nowhere"); code != codeRed {
		t.Fatalf("a step standing nowhere answers %d", code)
	}
	holds(t, one.errs.String(), "fixture names no step nowhere")
}

// The guidance verb refuses a step naming a process that stands nowhere. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheGuidanceVerbRefusesAProcessStandingNowhere(t *testing.T) {
	t.Parallel()
	one := pfGuidanceTree(t, pfNotes())
	if code := one.branchSays("guidance", "--step", "nowhere:do"); code != codeRed {
		t.Fatalf("a process standing nowhere answers %d", code)
	}
	holds(t, one.errs.String(), "nowhere names no process")
}

// The guidance verb prints the notes the guidance topic answers for a step, and no other. [[spec/tickets/work-verbs-port-to-go]]
func TestPFTheGuidanceVerbPrintsWhatTheTopicAnswers(t *testing.T) {
	t.Parallel()
	note := func(word string) string {
		return "---\nkind: [[guidance]]\n---\n\n# Actionables\n\n1. Read " + word + ".\n"
	}
	one := newTree(t, map[string]string{
		"spec/processes/standard.yaml": "steps:\n  - name: draft\n    tags: [\"code\"]\n",
		"spec/guidance/code/style.md":  note("style"),
		"spec/guidance/other.md":       note("other"),
	})
	one.d.Guidance = func() (map[string][]string, error) {
		return map[string][]string{"standard:draft": {"spec/guidance/other"}}, nil
	}
	if code := one.branchSays("guidance", "--step", "standard:draft"); code != 0 {
		t.Fatalf("the guidance answers %d: %s", code, one.errs.String())
	}
	holds(t, one.out.String(), "Read other")
	if strings.Contains(one.out.String(), "Read style") {
		t.Fatalf("a note the topic names not prints:\n%s", one.out.String())
	}
}

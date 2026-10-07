// The x-under glob holds a field to its chapters, whether the path reads from
// the tree root or whole, as the write door holds it.
// [[spec/design_output/examples#the-places]]
package check

import (
	"strings"
	"testing"
)

// A tree registering two verbs and two tabs, with one example naming one verb and one tab. [[spec/design_output/examples#the-checks]]
func coveredTree(more Texts) *Tree {
	texts := Texts{
		"src/quack/pull.go":                 "package main\n\nfunc init() { register(\"ticket pull\", pullVerb()) }\n",
		"src/quack/doctor.go":               "package main\n\nfunc init() { registerBox(\"doctor\", doctorVerb) }\n",
		"src/quack/pull_test.go":            "package main\n\nfunc init() { register(\"planted\", nil) }\n",
		"src/quack/tui_verb.go":             "package main\n\nvar tuiTabs = []string{\"log\", \"work\"}\n",
		"spec/examples/110_tickets/pull.md": "---\nkind: [[example]]\ntitle: A pull hands out a leaf\nkeywords: [pull]\ninterface: [ticket pull, tui log]\n---\n\nA box pulls.\n\n```sh\n./RUNME.sh ticket pull\n# expect: exit 0\n```\n",
	}
	for path, text := range more {
		texts[path] = text
	}
	return TreeOver("/tree", texts)
}

// The names of the findings a rule answers under its rule, each as its file and line, all at warning. [[spec/design_output/examples#the-checks]]
func warned(t *testing.T, found []Finding, rule string) map[string]int {
	t.Helper()
	out := map[string]int{}
	for _, one := range found {
		if one.Rule != rule || one.Severity != SeverityWarning {
			t.Fatalf("the rule answers %+v, and wants %s at warning", one, rule)
		}
		out[one.File] = one.Line
	}
	return out
}

func TestAVerbNoExampleNamesTakesAWarning(t *testing.T) {
	t.Parallel()
	got := warned(t, exampleCovers(coveredTree(nil)), "ExampleCovers")
	if line, held := got["src/quack/doctor.go"]; !held || line != 3 {
		t.Fatalf("the rule names %v, and wants doctor at src/quack/doctor.go line 3", got)
	}
	if _, held := got["src/quack/pull.go"]; held {
		t.Fatalf("the rule names ticket pull, which an example shows: %v", got)
	}
	if _, held := got["src/quack/pull_test.go"]; held {
		t.Fatalf("the rule reads a test file: %v", got)
	}
}

func TestATabNoExampleNamesTakesAWarning(t *testing.T) {
	t.Parallel()
	found := exampleCovers(coveredTree(nil))
	work, log := false, false
	for _, one := range found {
		if one.File == "src/quack/tui_verb.go" {
			work = work || containsWord(one.Message, "work")
			log = log || containsWord(one.Message, "log")
		}
	}
	if !work || log {
		t.Fatalf("the rule answers %+v, and wants the work tab alone", found)
	}
}

func TestAStandardTicketNamingNoExampleTakesAWarning(t *testing.T) {
	t.Parallel()
	ticket := func(state, process, proof string) string {
		return "---\nkind: [[ticket]]\nstate: " + state + "\nprocess: [[spec/processes/" + process + "]]\n---\n\n# Ask\n\nA gain.\n\nA break.\n\n- " + proof + "\n- `./RUNME.sh check` exits 0\n\nnone\n\nnone\n"
	}
	tree := coveredTree(Texts{
		"spec/tickets/bare.md":    ticket("open", "standard", "the verb answers"),
		"spec/tickets/proved.md":  ticket("open", "standard", "spec/examples/110_tickets/pull.md holds"),
		"spec/tickets/closed.md":  ticket("closed", "standard", "the verb answers"),
		"spec/tickets/trivial.md": ticket("open", "trivial", "the verb answers"),
	})
	got := warned(t, exampleProves(tree), "ExampleProves")
	if len(got) != 1 || got["spec/tickets/bare.md"] != 13 {
		t.Fatalf("the rule names %v, and wants spec/tickets/bare.md at line 13 alone", got)
	}
}

// Whether the message names the word in quotes, as a finding names a tab. [[spec/design_output/examples#the-checks]]
func containsWord(message, word string) bool {
	return strings.Contains(message, "tui "+word)
}

func TestAnUnderGlobMatchesATailOfThePath(t *testing.T) {
	t.Parallel()
	glob := "spec/examples/9*_dev_*/**"
	for path, want := range map[string]bool{
		"spec/examples/910_dev_check/empty.md":           true,
		"/srv/tree/spec/examples/910_dev_check/empty.md": true,
		"spec/examples/110_check/runs.md":                false,
		"/srv/tree/spec/examples/110_check/runs.md":      false,
	} {
		if got := underGlob(glob, path); got != want {
			t.Fatalf("%s reads under the glob %v, and wants %v", path, got, want)
		}
	}
}

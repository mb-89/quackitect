// Every example under spec/examples runs as a behavior test, a false expect
// names its file, its step and its line, and the verdicts land for the tab.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"os" // level0: OutsideInDoors - the cases read the examples the tree ships, as a build check reads source
	"path/filepath"
	"strings"
	"sync"
	"testing"
)

const pullingPath = "spec/examples/110_tickets/pull.md"

// The first user example, pulling the planted child, whose lines the cases swap. [[spec/design_output/examples#the-format]]
var pulling = func() string {
	text, _ := os.ReadFile(filepath.Join(exampleMethod, pullingPath))
	return string(text)
}()

func TestEveryExampleHoldsItsSteps(t *testing.T) {
	t.Parallel()
	paths, _ := filepath.Glob(filepath.Join(exampleMethod, "spec", "examples", "*", "*.md"))
	misses, mu := map[string]string{}, sync.Mutex{}
	t.Cleanup(func() {
		if err := writesVerdicts(exampleMethod, misses); err != nil {
			t.Error(err)
		}
	})
	for _, path := range paths {
		rel, _ := filepath.Rel(exampleMethod, path)
		name := filepath.ToSlash(rel)
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			text, err := os.ReadFile(path)
			miss := runsExample(name, string(text))
			mu.Lock()
			misses[name] = miss
			mu.Unlock()
			if err != nil || miss != "" {
				t.Fatal(err, miss)
			}
		})
	}
}

func TestAMissNamesTheFileTheStepTheLineAndTheVerb(t *testing.T) {
	t.Parallel()
	for _, one := range [][]string{
		{"leaf 1 of 1", "leaf 9 of 9", "line 13"},
		{"./RUNME.sh ticket pull", "./RUNME.sh dispatch", "outside the harness table"},
	} {
		miss := runsExample(pullingPath, strings.Replace(pulling, one[0], one[1], 1))
		for _, part := range []string{pullingPath, "step 1", one[1], one[2]} {
			if !strings.Contains(miss, part) {
				t.Errorf("%s reads the miss %q, which names no %q", one[1], miss, part)
			}
		}
	}
}

// An example parking a note, and the one seeking it, each over its own copy. [[spec/design_output/examples#one-runner-two-drivers]]
const (
	noting  = "---\nkind: [[example]]\ntitle: A note parks a thought\nkeywords: [note]\ninterface: [ticket note]\n---\n\nA box parks a thought as a private note.\n\n```sh\n./RUNME.sh ticket note stray \"a thought for later\"\n# expect: exit 0\n# expect: stands .se/tickets/stray.md\n```\n"
	seeking = "---\nkind: [[example]]\ntitle: A pull meets no stray note\nkeywords: [pull]\ninterface: [ticket pull]\n---\n\nA box pulls over a tree no other example wrote to.\n\n```sh\n./RUNME.sh ticket pull\n# expect: stands .se/tickets/stray.md\n```\n"
)

func TestEachExampleWritesOverItsOwnCopy(t *testing.T) {
	t.Parallel()
	if miss := runsExample("spec/examples/110_tickets/note.md", noting); miss != "" {
		t.Fatalf("the noting example misses: %s", miss)
	}
	if miss := runsExample("spec/examples/110_tickets/seek.md", seeking); !strings.Contains(miss, ".se/tickets/stray.md") {
		t.Fatalf("the note one example writes reaches another: the miss reads %q", miss)
	}
	if _, written := exampleFixture[".se/tickets/stray.md"]; written || len(exampleFixture) == 0 {
		t.Fatal("TestMain builds no fixture tree, or an example writes into it")
	}
}

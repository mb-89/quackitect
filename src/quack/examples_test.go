// Every example under spec/examples runs as a behavior test, a false expect
// names its file, its step and its line, and the verdicts land for the tab.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"testing"

	"quackitect/src/example"
	"quackitect/src/index"
)

// A user example pulling the planted child, whose expect line the case swaps. [[spec/design_output/examples#the-format]]
const pulling = "---\nkind: [[example]]\ntitle: A pull hands out the next leaf\nkeywords: [pull]\ninterface: [ticket pull]\n---\n\nA box pulls, and the engine hands it the first leaf of its group.\n\n```sh\n./RUNME.sh ticket pull\n# expect: exit 0\n# expect: says \"alpha at do, leaf 1 of 1\"\n```\n"

const pullingPath = "spec/examples/110_tickets/pull.md"

func TestEveryExampleHoldsItsSteps(t *testing.T) {
	t.Parallel()
	root := filepath.Join("..", "..")
	paths, _ := filepath.Glob(filepath.Join(root, "spec", "examples", "*", "*.md"))
	misses, mu := map[string]string{}, sync.Mutex{}
	t.Cleanup(func() {
		if err := writesVerdicts(root, misses); err != nil {
			t.Error(err)
		}
	})
	for _, path := range paths {
		name := filepath.ToSlash(strings.TrimPrefix(path, root+string(filepath.Separator)))
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			text, err := os.ReadFile(path)
			if err != nil {
				t.Fatal(err)
			}
			miss := runsExample(name, string(text))
			mu.Lock()
			misses[name] = miss
			mu.Unlock()
			if miss != "" {
				t.Fatal(miss)
			}
		})
	}
}

func TestAPlantedExamplePullsOverTheFakes(t *testing.T) {
	t.Parallel()
	if miss := runsExample(pullingPath, pulling); miss != "" {
		t.Fatalf("the planted example misses: %s", miss)
	}
	if len(exampleFixture) == 0 {
		t.Fatal("TestMain builds no fixture tree")
	}
}

func TestAFalseExpectNamesTheFileTheStepAndTheLine(t *testing.T) {
	t.Parallel()
	miss := runsExample(pullingPath, strings.Replace(pulling, "leaf 1 of 1", "leaf 9 of 9", 1))
	for _, part := range []string{pullingPath, "step 1", "line 13", "leaf 9 of 9"} {
		if !strings.Contains(miss, part) {
			t.Fatalf("the miss reads %q, and names no %q", miss, part)
		}
	}
}

func TestAVerbOutsideTheTableMissesNamingIt(t *testing.T) {
	t.Parallel()
	miss := runsExample(pullingPath, strings.Replace(pulling, "./RUNME.sh ticket pull", "./RUNME.sh dispatch", 1))
	if !strings.Contains(miss, "dispatch") || !strings.Contains(miss, "step 1") {
		t.Fatalf("the miss reads %q, and names no verb", miss)
	}
}

func TestTheVerdictsLandInTheRuntimeFile(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	if err := writesVerdicts(root, map[string]string{"spec/examples/110_a/b.md": "", "spec/examples/110_a/c.md": "a miss"}); err != nil {
		t.Fatal(err)
	}
	text, err := os.ReadFile(filepath.Join(root, index.Runtime, example.VerdictFile))
	if err != nil {
		t.Fatalf("the verdicts stand nowhere: %v", err)
	}
	said := map[string]struct {
		Verdict string `json:"verdict"`
		Miss    string `json:"miss"`
	}{}
	if json.Unmarshal(text, &said) != nil || said["spec/examples/110_a/b.md"].Verdict != "pass" || said["spec/examples/110_a/c.md"].Verdict != "fail" || said["spec/examples/110_a/c.md"].Miss != "a miss" {
		t.Fatalf("the verdicts read %s", text)
	}
}

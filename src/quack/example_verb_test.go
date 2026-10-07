// example run clones the tree, runs each step in its own process there, prints
// each step and its verdicts, and leaves the user's tree as it stands.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"io/fs"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"quackitect/src/proc"
)

// An example of one step, whose call writes a ticket and says its leaf. [[spec/design_output/examples#the-format]]
const runnable = "---\nkind: [[example]]\ntitle: A pull hands out a leaf\nkeywords: [pull]\ninterface: [ticket pull]\n---\n\nA box pulls, and the engine hands it a leaf.\n\n```sh\n./RUNME.sh ticket pull\n# expect: exit 0\n# expect: says \"leaf 1 of 1\"\n# expect: stands spec/tickets/made.md\n```\n"

const runnablePath = "spec/examples/110_tickets/pull.md"

// Every file under the root past the runtime folder, by its path. [[spec/design_output/examples#one-runner-two-drivers]]
func treeOf(t *testing.T, root string) map[string]string {
	t.Helper()
	out := map[string]string{}
	_ = filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
		rel, _ := filepath.Rel(root, path)
		if err != nil || entry.IsDir() || strings.HasPrefix(filepath.ToSlash(rel), ".se/") {
			return err
		}
		body, _ := os.ReadFile(path)
		out[filepath.ToSlash(rel)] = string(body)
		return nil
	})
	return out
}

// Runs example run over a root holding the example, one ticket and what the case plants, on a box whose git clones by copying and whose ./RUNME.sh writes a ticket and says a leaf. Answers the root, the code, the output, the calls and the output at each pause. [[spec/design_output/doors#the-process-door]]
func runsOver(t *testing.T, text string, plant map[string]string) (string, int, string, []proc.Command, []string) {
	t.Helper()
	root, calls, seen := t.TempDir(), []proc.Command{}, []string{}
	seedTree(t, root, map[string]string{runnablePath: text, "spec/tickets/one.md": "---\nkind: [[ticket]]\n---\n"})
	seedTree(t, root, plant)
	box := &proc.FakeRunner{Programs: map[string]proc.Program{
		"git": func(one proc.Command) proc.Said {
			calls = append(calls, one)
			seedTree(t, one.Argv[len(one.Argv)-1], treeOf(t, one.Argv[len(one.Argv)-2]))
			return proc.Said{}
		},
		"./RUNME.sh": func(one proc.Command) proc.Said {
			calls = append(calls, one)
			_ = os.WriteFile(filepath.Join(one.Dir, "spec", "tickets", "made.md"), []byte("made"), 0o644)
			return proc.Said{Out: "work  alpha at do, leaf 1 of 1\n"}
		},
	}}
	var said strings.Builder
	verb := exampleVerb(func() (string, error) { return root, nil }, box.Run, func() { seen = append(seen, said.String()) })
	code := verb([]string{"example", "run", runnablePath}, false, &said, &said)
	return root, code, said.String(), calls, seen
}

// level0: FixtureOutsideHome - the run clones into a root of the case's own
func TestARunPrintsEachStepPausesBetweenAndLeavesTheUsersTree(t *testing.T) {
	t.Parallel()
	twoSteps := runnable + "\nA second pull hands the same leaf.\n\n```sh\n./RUNME.sh ticket note\n```\n"
	root, code, said, calls, seen := runsOver(t, twoSteps, nil)
	for _, part := range []string{"A box pulls, and the engine hands it a leaf.", "./RUNME.sh ticket pull", "leaf 1 of 1", "exit 0", "stands spec/tickets/made.md"} {
		if code != 0 || !strings.Contains(said, part) {
			t.Fatalf("the run exits %d, and prints no %q:\n%s", code, part, said)
		}
	}
	if len(seen) != 1 || !strings.Contains(seen[0], "stands spec/tickets/made.md") || strings.Contains(seen[0], "./RUNME.sh ticket note") {
		t.Fatalf("the run pauses after %q, and wants once, between the two steps", seen)
	}
	clone := filepath.Join(root, ".se", ".runtime", "examples", "pull")
	if len(calls) != 3 || !strings.Contains(strings.Join(calls[0].Argv, " "), "git clone --local") || calls[1].Dir != clone {
		t.Fatalf("the run calls %+v, and wants a local clone, then each step in %s", calls, clone)
	}
	if _, err := os.Stat(filepath.Join(clone, "spec", "tickets", "made.md")); err != nil {
		t.Fatalf("the clone stands nowhere for the user to read: %v", err)
	}
	if after := treeOf(t, root); len(after) != 2 || after[runnablePath] != twoSteps || after["spec/tickets/one.md"] != "---\nkind: [[ticket]]\n---\n" {
		t.Fatalf("the user's tree changes over the run: %v", after)
	}
}

// level0: FixtureOutsideHome - the run clones into a root of the case's own
func TestAMissExitsOneAndASecondRunClearsTheClone(t *testing.T) {
	t.Parallel()
	stale := ".se/.runtime/examples/pull/stale.md"
	root, code, said, _, _ := runsOver(t, strings.Replace(runnable, "leaf 1 of 1", "leaf 9 of 9", 1), map[string]string{stale: "stale"})
	if code != 1 || !strings.Contains(said, "leaf 9 of 9") {
		t.Fatalf("the run exits %d, and wants 1 naming the miss:\n%s", code, said)
	}
	if _, err := os.Stat(filepath.Join(root, stale)); err == nil {
		t.Fatal("the run leaves the last clone's file standing")
	}
	_, code, said, calls, _ := runsOver(t, strings.Replace(runnable, "./RUNME.sh ticket pull", "git status", 1), nil)
	if code != 1 || !strings.Contains(said, "line 11") || len(calls) != 0 {
		t.Fatalf("an example out of shape exits %d after %d calls, and wants 1 naming line 11 before any:\n%s", code, len(calls), said)
	}
}

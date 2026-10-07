// example run clones the tree, runs each step in its own process there, prints
// each step and its verdicts, and leaves the user's tree as it stands.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

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

// A root holding the example and one ticket. [[spec/design_output/examples#one-runner-two-drivers]]
func runRoot(t *testing.T, text string) string {
	t.Helper()
	root := t.TempDir()
	for path, body := range map[string]string{runnablePath: text, "spec/tickets/one.md": "---\nkind: [[ticket]]\n---\n"} {
		at := filepath.Join(root, filepath.FromSlash(path))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return root
}

// Every file under the root past the runtime folder, by its path. [[spec/design_output/examples#one-runner-two-drivers]]
func treeOf(t *testing.T, root string) map[string]string {
	t.Helper()
	out := map[string]string{}
	_ = filepath.WalkDir(root, func(path string, entry fs.DirEntry, err error) error {
		if err != nil || entry.IsDir() {
			return err
		}
		rel, _ := filepath.Rel(root, path)
		if strings.HasPrefix(filepath.ToSlash(rel), ".se/") {
			return nil
		}
		body, _ := os.ReadFile(path)
		out[filepath.ToSlash(rel)] = string(body)
		return nil
	})
	return out
}

// A box whose git clones by copying the tree, and whose ./RUNME.sh writes a ticket in its folder and says a leaf. [[spec/design_output/doors#the-process-door]]
func cloningBox(t *testing.T, calls *[]proc.Command) *proc.FakeRunner {
	t.Helper()
	return &proc.FakeRunner{Programs: map[string]proc.Program{
		"git": func(one proc.Command) proc.Said {
			*calls = append(*calls, one)
			from, to := one.Argv[len(one.Argv)-2], one.Argv[len(one.Argv)-1]
			for path, body := range treeOf(t, from) {
				at := filepath.Join(to, filepath.FromSlash(path))
				_ = os.MkdirAll(filepath.Dir(at), 0o755)
				_ = os.WriteFile(at, []byte(body), 0o644)
			}
			return proc.Said{}
		},
		"./RUNME.sh": func(one proc.Command) proc.Said {
			*calls = append(*calls, one)
			_ = os.WriteFile(filepath.Join(one.Dir, "spec", "tickets", "made.md"), []byte("made"), 0o644)
			return proc.Said{Out: "work  alpha at do, leaf 1 of 1\n"}
		},
	}}
}

// Runs example run over the root, and answers its code and its output. [[spec/design_output/examples#one-runner-two-drivers]]
func runsOver(root string, box *proc.FakeRunner) (int, string) {
	var said strings.Builder
	verb := exampleVerb(func() (string, error) { return root, nil }, box.Run, func() {})
	code := verb([]string{"example", "run", runnablePath}, false, &said, &said)
	return code, said.String()
}

func TestARunPrintsEachStepAndItsVerdicts(t *testing.T) {
	t.Parallel()
	root := runRoot(t, runnable)
	calls := []proc.Command{}
	code, said := runsOver(root, cloningBox(t, &calls))
	if code != 0 {
		t.Fatalf("the run exits %d:\n%s", code, said)
	}
	for _, part := range []string{"A box pulls, and the engine hands it a leaf.", "./RUNME.sh ticket pull", "leaf 1 of 1", "exit 0", "stands spec/tickets/made.md"} {
		if !strings.Contains(said, part) {
			t.Fatalf("the run prints no %q:\n%s", part, said)
		}
	}
	clone := filepath.Join(root, ".se", ".runtime", "examples", "pull")
	if len(calls) != 2 || calls[0].Argv[0] != "git" || !strings.Contains(strings.Join(calls[0].Argv, " "), "clone --local") || calls[1].Dir != clone {
		t.Fatalf("the run calls %+v, and wants a local clone, then the step in %s", calls, clone)
	}
	if _, err := os.Stat(filepath.Join(clone, "spec", "tickets", "made.md")); err != nil {
		t.Fatalf("the clone stands nowhere for the user to read: %v", err)
	}
}

func TestARunLeavesTheUsersTreeByteForByte(t *testing.T) {
	t.Parallel()
	root := runRoot(t, runnable)
	before := treeOf(t, root)
	calls := []proc.Command{}
	if code, said := runsOver(root, cloningBox(t, &calls)); code != 0 {
		t.Fatalf("the run exits %d:\n%s", code, said)
	}
	after := treeOf(t, root)
	if len(after) != len(before) {
		t.Fatalf("the tree holds %d files after the run, and %d before", len(after), len(before))
	}
	for path, body := range before {
		if after[path] != body {
			t.Fatalf("%s changes over the run", path)
		}
	}
}

func TestAMissExitsOneAndASecondRunClearsTheClone(t *testing.T) {
	t.Parallel()
	root := runRoot(t, strings.Replace(runnable, "leaf 1 of 1", "leaf 9 of 9", 1))
	stale := filepath.Join(root, ".se", ".runtime", "examples", "pull", "stale.md")
	_ = os.MkdirAll(filepath.Dir(stale), 0o755)
	_ = os.WriteFile(stale, []byte("stale"), 0o644)
	calls := []proc.Command{}
	code, said := runsOver(root, cloningBox(t, &calls))
	if code != 1 || !strings.Contains(said, "leaf 9 of 9") {
		t.Fatalf("the run exits %d, and wants 1 naming the miss:\n%s", code, said)
	}
	if _, err := os.Stat(stale); err == nil {
		t.Fatal("the run leaves the last clone's file standing")
	}
}

func TestAnInteractiveRunPausesBetweenSteps(t *testing.T) {
	t.Parallel()
	second := "\nA second pull hands the same leaf.\n\n```sh\n./RUNME.sh ticket note\n```\n"
	root := runRoot(t, runnable+second)
	calls := []proc.Command{}
	var said strings.Builder
	seen := []string{}
	verb := exampleVerb(func() (string, error) { return root, nil }, cloningBox(t, &calls).Run, func() { seen = append(seen, said.String()) })
	if code := verb([]string{"example", "run", runnablePath}, false, &said, &said); code != 0 {
		t.Fatalf("the run exits %d:\n%s", code, said.String())
	}
	if len(seen) != 1 {
		t.Fatalf("the run pauses %d times over two steps, and wants once between them", len(seen))
	}
	if !strings.Contains(seen[0], "stands spec/tickets/made.md") || strings.Contains(seen[0], "./RUNME.sh ticket note") {
		t.Fatalf("the pause comes at the wrong place, after:\n%s", seen[0])
	}
}

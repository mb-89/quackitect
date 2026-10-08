// The harness running every example over a fixture tree in memory: the disk,
// git, the process and the clock all faked, and each call dispatched in process.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"os" // level0: OutsideInDoors - the fixture reads the schemas the tree ships, and the verdicts land where the tutorial tab reads them
	"path/filepath"
	"strings"
	"sync"
	"testing"
	"time"

	"quackitect/src/branches"
	"quackitect/src/example"
	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/examples"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/proc"
	"quackitect/src/pull"
)

// The tree every example copies, built once as the package loads, which no example writes to. [[spec/design_output/examples#one-runner-two-drivers]]
var exampleFixture = buildsFixture()

// The tree this package stands in, whose schemas the pull reads. [[spec/design_output/examples#one-runner-two-drivers]]
var exampleMethod, _ = filepath.Abs(filepath.Join("..", ".."))

// The work root the fake box names, the planted group's branch, the box file a cloud hold reads, and the file a commit on origin's main lands past the seed, so a sync has a commit to take. [[spec/design_output/examples#one-runner-two-drivers]]
const (
	exampleRoot      = "work"
	exampleBranch    = "work/g"
	exampleBox       = ".se/.runtime/box.json"
	exampleMainMoves = "MAIN.md"
)

// The planted group and its one child, the leaf a first pull hands out. [[spec/design_output/examples#doors-fixtures-and-the-ratio]]
var plantedTickets = map[string]string{
	"spec/tickets/g.md":         "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/group]]\n---\n\n# Ask\n\nA group of one change.\n",
	"spec/tickets/alpha.md":     "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: do\n    does: makes the change\n    evidence:\n      - name: tests\n        form: command\n        expects: green\n        says: the tests\n      - name: says\n        form: text\n        says: what changes\nprocess: [[spec/processes/small]]\ngroup: g\n---\n\n# Ask\n\nSome change the owner asks for.\n\n# do\n\n<!-- makes the change -->\n\n## tests\n\n<!-- the tests -->\n\n## says\n\n<!-- what changes -->\n\n# Discussion\n",
	"spec/processes/small.yaml": "steps: []\n",
	".gitignore":                ".se/\n",
}

// Builds the fixture tree: the tree's processes, config and schemas, and the planted group over them. [[spec/design_output/examples#doors-fixtures-and-the-ratio]]
func buildsFixture() map[string]string {
	out := map[string]string{}
	for _, folder := range []string{"spec/processes", "spec/config", "spec/schemas"} {
		found, _ := os.ReadDir(filepath.Join(exampleMethod, folder))
		for _, one := range found {
			if text, err := os.ReadFile(filepath.Join(exampleMethod, folder, one.Name())); err == nil && !one.IsDir() {
				out[folder+"/"+one.Name()] = string(text)
			}
		}
	}
	for path, text := range plantedTickets {
		out[path] = text
	}
	return out
}

// The one program the fake box knows: sh running an echo, and exit 127 on any other line. [[spec/design_output/doors#the-process-door]]
func exampleShell(one proc.Command) proc.Said {
	if said, ok := strings.CutPrefix(one.Argv[len(one.Argv)-1], "echo "); ok {
		return proc.Said{Out: said + "\n"}
	}
	return proc.Said{Err: "sh: not found\n", Code: 127}
}

// A clone on the planted group's branch of an origin holding a copy of the fixture, and the verbs an example reaches over it on a cloud box. [[spec/design_output/examples#one-runner-two-drivers]]
func exampleTree() (files.Disk, map[string]twin, error) {
	now := func() time.Time { return time.Unix(0, 0) }
	seed, tree, errs := files.NewFakeDisk(), files.NewFakeDisk(), []error{}
	origin := git.NewFakeRepo(seed, now)
	commits := func(message string) error {
		if err := origin.AddAll(); err != nil {
			return err
		}
		_, err := origin.Commit(message, nil)
		return err
	}
	for path, text := range exampleFixture {
		errs = append(errs, seed.Write(path, text))
	}
	errs = append(errs, commits("seed"), origin.Branch(exampleBranch, "main"), seed.Write(exampleMainMoves, "main moves on\n"), commits("main moves on"))
	repo := origin.Clone(tree)
	repo.Set("user.name", "example")
	repo.Set("user.email", "example@example")
	if err := errors.Join(append(errs, repo.Switch(exampleBranch, false), tree.Write(exampleBox, `{"id":"cafecafecafe"}`+"\n"))...); err != nil {
		return nil, nil, err
	}
	box := &proc.FakeRunner{Programs: map[string]proc.Program{"sh": exampleShell}}
	here := func(out, errs io.Writer) (*pull.It, int) {
		return &pull.It{
			Disk: pull.TreeDisk{Tree: tree}, Git: repo, Now: now,
			Out: out, Err: errs, Root: exampleRoot, Method: exampleMethod, Agent: true, Cloud: true,
			Env: map[string]string{"CLAUDE_CODE_REMOTE": "true"}, Binding: "queue", Shell: pull.ShellOver(box.Run, exampleRoot),
			Schemas: func() *check.Kinds { return check.SchemasIn(check.TreeOver(exampleMethod, rootDisk{exampleMethod})) },
		}, 0
	}
	doors := func(out, errs io.Writer) *branches.Doors {
		return &branches.Doors{
			Root: exampleRoot, Method: exampleMethod, Repo: repo, Run: box.Run, Disk: tree, Now: now, Out: out, Errs: errs,
			Env:      map[string]string{"CLAUDE_CODE_REMOTE": "true"},
			Config:   func(string) any { return nil },
			Runme:    []string{"sh", "RUNME.sh"},
			Value:    func(name string, _ any) error { return fmt.Errorf("no index answers %s here", name) },
			Guidance: func() (map[string][]string, error) { return map[string][]string{}, nil },
		}
	}
	// [[spec/design_output/examples#one-runner-two-drivers]]
	checks := func(out, errs io.Writer) checkDoors {
		one := (&checkFake{}).doors()
		one.root, one.disk, one.out, one.errs = exampleRoot, diskOverTree(tree, exampleRoot), out, errs
		return one
	}
	// [[spec/design_output/examples#one-runner-two-drivers]]
	return tree, map[string]twin{
		"branch": branchVerb(doors), "check": checkVerb(checks), "ticket pull": ticketPull(here), "ticket note": ticketNote(here),
		"ticket set": ticketSet(here), "ticket todo": ticketTodo(here), "ticket urgent": ticketUrgent(here),
	}, nil
}

// Runs one example over its own copy of the fixture, and answers its miss, or nothing where every step holds. [[spec/design_output/examples#one-runner-two-drivers]]
func runsExample(path, text string) string {
	read, faults := example.Read(path, text)
	if len(faults) > 0 {
		return fmt.Sprintf("%s: line %d: %s", path, faults[0].Line, faults[0].Message)
	}
	tree, table, err := exampleTree()
	if err != nil {
		return fmt.Sprintf("%s: the fixture tree builds no copy: %v", path, err)
	}
	reads := func(at string) (string, bool) {
		text, ok, err := tree.Read(at)
		return text, ok && err == nil
	}
	for n, step := range read.Steps {
		_, verb := twinOf(step.Call, table)
		if verb == nil {
			return fmt.Sprintf("%s: step %d, line %d: ./RUNME.sh %s stands outside the harness table, so no fake answers it", path, n+1, step.Line, strings.Join(step.Call, " "))
		}
		said := &bytes.Buffer{}
		code := verb(step.Call, false, said, said)
		for _, one := range step.Expects {
			if miss := example.Holds(one, example.Outcome{Code: code, Out: said.String()}, reads); miss != "" {
				return fmt.Sprintf("%s: step %d, line %d: %s", path, n+1, one.Line, miss)
			}
		}
	}
	return ""
}

// Writes each verdict to the runtime file under the root, for the Tutorial tab. [[spec/design_output/examples#the-tutorial-tab]]
func writesVerdicts(root string, misses map[string]string) error {
	folder := filepath.Join(root, index.Runtime)
	return errors.Join(os.MkdirAll(folder, 0o755), os.WriteFile(filepath.Join(folder, example.VerdictFile), []byte(examples.VerdictsText(misses)), 0o644))
}

// The box disk over the fixture tree, each path read under the root the check joins it to. [[spec/design_output/examples#one-runner-two-drivers]]
func diskOverTree(tree files.Disk, root string) diskDoors {
	rel := func(path string) string {
		under, err := filepath.Rel(root, path)
		if err != nil {
			return filepath.ToSlash(path)
		}
		return filepath.ToSlash(under)
	}
	return diskDoors{
		read: func(path string) ([]byte, error) {
			text, ok, err := tree.Read(rel(path))
			if err != nil {
				return nil, err
			}
			if !ok {
				return nil, fs.ErrNotExist
			}
			return []byte(text), nil
		},
		write:   func(path string, data []byte, _ fs.FileMode) error { return tree.Write(rel(path), string(data)) },
		makeAll: func(string, fs.FileMode) error { return nil },
		remove:  func(path string) error { return tree.Remove(rel(path)) },
		list:    func(string) ([]fs.DirEntry, error) { return nil, fs.ErrNotExist },
		stat:    func(string) (fs.FileInfo, error) { return nil, fs.ErrNotExist },
	}
}

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
	verb := exampleVerb(func() (string, error) { return root, nil }, realDisk(), box.Run, func() { seen = append(seen, said.String()) })
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

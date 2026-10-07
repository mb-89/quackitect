// The harness running every example over a fixture tree in memory: the disk,
// git, the process and the clock all faked, and each call dispatched in process.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main // level0: InPackageTest - a main package admits no outside test package

import (
	"bytes"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
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

// The tree every example copies, built once in TestMain, which no example writes to. [[spec/design_output/examples#one-runner-two-drivers]]
var exampleFixture map[string]string

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
		one.root, one.disk, one.out, one.errs = exampleRoot, tree, out, errs
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

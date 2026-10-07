// The harness running every example over a fixture tree in memory: the disk,
// git, the process and the clock all faked, and each call dispatched in process.
// [[spec/design_output/examples#one-runner-two-drivers]]
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strings"
	"time"

	"quackitect/src/example"
	"quackitect/src/index"
	"quackitect/src/modules/check"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/proc"
	"quackitect/src/pull"
)

// The tree every example copies, built once in TestMain, which no example writes to. [[spec/design_output/examples#one-runner-two-drivers]]
var exampleFixture map[string]string

// The tree this package stands in, whose schemas the pull reads. [[spec/design_output/examples#one-runner-two-drivers]]
var exampleMethod, _ = filepath.Abs(filepath.Join("..", ".."))

// The work root the fake box names, the planted group's branch, and the box file a cloud hold reads. [[spec/design_output/examples#one-runner-two-drivers]]
const (
	exampleRoot   = "work"
	exampleBranch = "work/g"
	exampleBox    = ".se/.runtime/box.json"
)

// The fixture's own folders, read off the tree, past which the planted group stands. [[spec/design_output/examples#doors-fixtures-and-the-ratio]]
var fixtureFolders = []string{"spec/processes", "spec/config"}

// The planted group and its one child, the leaf a first pull hands out. [[spec/design_output/examples#doors-fixtures-and-the-ratio]]
var plantedTickets = map[string]string{
	"spec/tickets/g.md":         "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/group]]\n---\n\n# Ask\n\nA group of one change.\n",
	"spec/tickets/alpha.md":     "---\nkind: [[ticket]]\nstate: open\nsteps:\n  - name: do\n    does: makes the change\n    evidence:\n      - name: tests\n        form: command\n        expects: green\n        says: the tests\n      - name: says\n        form: text\n        says: what changes\nprocess: [[spec/processes/small]]\ngroup: g\n---\n\n# Ask\n\nSome change the owner asks for.\n\n# do\n\n<!-- makes the change -->\n\n## tests\n\n<!-- the tests -->\n\n## says\n\n<!-- what changes -->\n\n# Discussion\n",
	"spec/processes/small.yaml": "steps: []\n",
	".gitignore":                ".se/\n",
}

// Builds the fixture tree: the tree's processes and config, and the planted group over them. [[spec/design_output/examples#doors-fixtures-and-the-ratio]]
func buildsFixture() map[string]string {
	out := map[string]string{}
	for _, folder := range fixtureFolders {
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

// A clone on the planted group's branch of an origin holding a copy of the fixture, and the pull over it on a cloud box. [[spec/design_output/examples#one-runner-two-drivers]]
func exampleTree() (files.Disk, pullOver, error) {
	now := func() time.Time { return time.Unix(0, 0) }
	seed := files.NewFakeDisk()
	for path, text := range exampleFixture {
		if err := seed.Write(path, text); err != nil {
			return nil, nil, err
		}
	}
	origin := git.NewFakeRepo(seed, now)
	if err := origin.AddAll(); err != nil {
		return nil, nil, err
	}
	if _, err := origin.Commit("seed", nil); err != nil {
		return nil, nil, err
	}
	if err := origin.Branch(exampleBranch, "main"); err != nil {
		return nil, nil, err
	}
	tree := files.NewFakeDisk()
	repo := origin.Clone(tree)
	if err := repo.Switch(exampleBranch, false); err != nil {
		return nil, nil, err
	}
	repo.Set("user.name", "example")
	repo.Set("user.email", "example@example")
	if err := tree.Write(exampleBox, `{"id":"cafecafecafe"}`+"\n"); err != nil {
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
	return tree, here, nil
}

// The verbs an example reaches, each over the pull on its own copy; a verb joins once its constructor takes every door it reaches. [[spec/design_output/examples#one-runner-two-drivers]]
func exampleTable(here pullOver) map[string]twin {
	return map[string]twin{"ticket pull": ticketPull(here), "ticket note": ticketNote(here)}
}

// The verb a call names in the table, by its longest name. [[spec/design_output/examples#one-runner-two-drivers]]
func verbOf(table map[string]twin, call []string) (twin, bool) {
	for words := min(2, len(call)); words > 0; words-- {
		if verb, ok := table[strings.Join(call[:words], " ")]; ok {
			return verb, true
		}
	}
	return nil, false
}

// Runs one example over its own copy of the fixture, and answers its miss, or nothing where every step holds. [[spec/design_output/examples#one-runner-two-drivers]]
func runsExample(path, text string) string {
	read, faults := example.Read(path, text)
	if len(faults) > 0 {
		return fmt.Sprintf("%s: line %d: %s", path, faults[0].Line, faults[0].Message)
	}
	tree, here, err := exampleTree()
	if err != nil {
		return fmt.Sprintf("%s: the fixture tree builds no copy: %v", path, err)
	}
	reads := func(at string) (string, bool) {
		text, ok, err := tree.Read(at)
		return text, ok && err == nil
	}
	table := exampleTable(here)
	for n, step := range read.Steps {
		verb, ok := verbOf(table, step.Call)
		if !ok {
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

// One example's verdict as the Tutorial tab reads it. [[spec/design_output/examples#the-tutorial-tab]]
type verdict struct {
	Verdict string `json:"verdict"`
	Miss    string `json:"miss,omitempty"`
}

// Writes each verdict to the runtime file under the root. [[spec/design_output/examples#one-runner-two-drivers]]
func writesVerdicts(root string, misses map[string]string) error {
	said := map[string]verdict{}
	for path, miss := range misses {
		said[path] = verdict{Verdict: "pass"}
		if miss != "" {
			said[path] = verdict{Verdict: "fail", Miss: miss}
		}
	}
	text, err := json.MarshalIndent(said, "", "  ")
	if err != nil {
		return err
	}
	folder := filepath.Join(root, index.Runtime)
	if err := os.MkdirAll(folder, 0o755); err != nil {
		return err
	}
	return os.WriteFile(filepath.Join(folder, example.VerdictFile), append(text, '\n'), 0o644)
}

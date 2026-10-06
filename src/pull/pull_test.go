// The pull over a real git origin and clone: the hand-out, the hold, the
// hand-back's checks, the pass and its commit, the drop, the todo in hand and
// the queue binding, off the roads test/level0/pull.test.js covers.
// [[spec/design_output/pull#the-answers]]
package pull

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/modules/check"
)

// The tree this package stands in, whose processes and schemas the cases read. [[spec/design_output/pull#the-answers]]
var method, _ = filepath.Abs(filepath.Join("..", ".."))

// A source over a folder on this box, for the schema reads. [[spec/design_output/pull#the-checks]]
type folderSource struct{ root string }

func (one folderSource) at(path string) string {
	return filepath.Join(one.root, filepath.FromSlash(path))
}
func (one folderSource) Read(path string) (string, bool) {
	said, err := os.ReadFile(one.at(path))
	return string(said), err == nil
}
func (one folderSource) Exists(path string) bool { _, err := os.Stat(one.at(path)); return err == nil }
func (one folderSource) Folder(path string) bool {
	said, err := os.Stat(one.at(path))
	return err == nil && said.IsDir()
}
func (one folderSource) Names(folder string) []string {
	found, _ := os.ReadDir(one.at(folder))
	out := []string{}
	for _, each := range found {
		out = append(out, each.Name())
	}
	return out
}
func (one folderSource) Paths() []string { return nil }

const groupTicket = `---
kind: [[ticket]]
state: open
process: [[spec/processes/group]]
---

# Ask

A group of one change.
`

const childTicket = `---
kind: [[ticket]]
state: open
steps:
  - name: do
    does: makes the change
    evidence:
      - name: tests
        form: command
        expects: green
        says: the tests
      - name: says
        form: text
        says: what changes
process: [[spec/processes/small]]
group: g
---

# Ask

Some change the owner asks for.

# do

<!-- makes the change -->

## tests

<!-- the tests -->

## says

<!-- what changes -->

# Discussion
`

func gitIn(t *testing.T, dir string, args ...string) string {
	t.Helper()
	run := exec.Command("git", args...)
	run.Dir = dir
	said, err := run.CombinedOutput()
	if err != nil {
		t.Fatalf("git %v: %v %s", args, err, said)
	}
	return strings.TrimSpace(string(said))
}

// A clone on work/g of an origin holding the group and its child, and the pull over it on a cloud box. [[spec/design_output/pull#the-answers]]
func cloudPull(t *testing.T) (*It, *bytes.Buffer, *bytes.Buffer) {
	t.Helper()
	base := t.TempDir()
	seed, origin, work := filepath.Join(base, "seed"), filepath.Join(base, "origin.git"), filepath.Join(base, "work")
	gitIn(t, base, "init", "-q", "--bare", "-b", "main", origin)
	gitIn(t, base, "init", "-q", "-b", "main", seed)
	disk := OSDisk{Root: seed}
	_ = disk.Write("spec/tickets/g.md", groupTicket)
	_ = disk.Write("spec/tickets/alpha.md", childTicket)
	_ = disk.Write(".gitignore", ".se/\n")
	gitIn(t, seed, "add", "-A")
	gitIn(t, seed, "-c", "user.name=t", "-c", "user.email=t@t", "commit", "-q", "-m", "seed")
	gitIn(t, seed, "push", "-q", origin, "main", "main:work/g")
	gitIn(t, base, "clone", "-q", "-b", "work/g", origin, work)
	gitIn(t, work, "config", "user.name", "t")
	gitIn(t, work, "config", "user.email", "t@t")
	out, errs := &bytes.Buffer{}, &bytes.Buffer{}
	it := &It{
		Disk: OSDisk{Root: work}, Git: GitDoor{Root: work}, Now: func() time.Time { return time.Unix(0, 0) },
		Out: out, Err: errs, Root: work, Method: method, Agent: true, Cloud: true,
		Env: map[string]string{"CLAUDE_CODE_REMOTE": "true"}, Binding: bindQueue, Shell: OSShell(work),
		Schemas: func() *check.Kinds { return check.SchemasIn(check.TreeOver(method, folderSource{method})) },
	}
	_ = it.Disk.Write(boxFile, `{"id":"cafecafecafe"}`+"\n")
	_ = it.Disk.Write("spec/processes/small.yaml", "steps: []\n")
	return it, out, errs
}

func TestPull(t *testing.T) {
	t.Parallel()
	t.Run("a bare pull hands the child's leaf, and the hold names it", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  alpha at do, leaf 1 of 1") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
		held := it.HoldOf("box cafecafecafe · claude-code-remote")
		if held == nil || held.Ticket != "alpha" || held.Step != "do" || held.Group != "g" || len(held.Hash) != 40 {
			t.Fatalf("the hold reads %+v", held)
		}
	})
	t.Run("a dependency standing as a work branch on origin waits, and one standing nowhere reads as met", func(t *testing.T) {
		for dep, waits := range map[string]bool{"other": true, "gone": false} {
			it, out, _ := cloudPull(t)
			_ = it.Disk.Write("spec/tickets/alpha.md", strings.Replace(childTicket, "group: g\n", "group: g\ndepends_on: ["+dep+"]\n", 1))
			gitIn(t, it.Root, "commit", "-q", "-am", "alpha waits")
			gitIn(t, it.Root, "push", "-q", "origin", "HEAD:work/other")
			gitIn(t, it.Root, "fetch", "-q", "origin")
			it.Pulling([]string{"pull"})
			if got := strings.Contains(out.String(), "alpha waits for "+dep); got != waits {
				t.Fatalf("a dependency on %s waits: %v, and wants %v:\n%s", dep, got, waits, out)
			}
			if held := it.HoldOf("box cafecafecafe · claude-code-remote"); (held == nil) != waits {
				t.Fatalf("a dependency on %s leaves the hold %+v", dep, held)
			}
		}
	})
	t.Run("a second pull refuses while one ticket stands in hand", func(t *testing.T) {
		it, _, errs := cloudPull(t)
		it.Pulling([]string{"pull"})
		if code := it.Pulling([]string{"pull"}); code != 1 || !strings.Contains(errs.String(), "alpha stands in your hand at do, and one hand holds one ticket.") {
			t.Fatalf("the pull answers %d:\n%s", code, errs)
		}
	})
	t.Run("a hand-back missing a field stays refused, and the hold counts it", func(t *testing.T) {
		it, _, errs := cloudPull(t)
		it.Pulling([]string{"pull"})
		code := it.Pulling([]string{"pull", "alpha", "--pass", "--fields", `{"tests":"echo green"}`})
		if code != 1 || !strings.Contains(errs.String(), "says under do holds no text.") || !strings.Contains(errs.String(), "Fix it, and alpha stays in hand at do.") {
			t.Fatalf("the hand-back answers %d:\n%s", code, errs)
		}
		if held := it.HoldOf("box cafecafecafe · claude-code-remote"); held == nil || held.Refused != 1 || held.Payload == "" {
			t.Fatalf("the hold reads %+v", held)
		}
	})
	t.Run("a pass writes the record, closes the ticket, commits, pushes, and hands the group's next leaf", func(t *testing.T) {
		it, out, errs := cloudPull(t)
		it.Pulling([]string{"pull"})
		code := it.Pulling([]string{"pull", "alpha", "--pass", "--fields", `{"tests":"echo green","says":"It changes one thing."}`})
		if code != 0 || !strings.Contains(out.String(), "alpha passes do, closes done.") {
			t.Fatalf("the hand-back answers %d:\n%s\n%s", code, out, errs)
		}
		text, _ := it.Disk.Read("spec/tickets/alpha.md")
		for _, want := range []string{"state: closed", "reason: done", "  - step: do", "    answered:", "      - name: tests", "        exit: 0", "        said: green", "\nIt changes one thing.\n"} {
			if !strings.Contains(text, want) {
				t.Fatalf("the ticket lacks %q:\n%s", want, text)
			}
		}
		if subject := it.Git.Run("log", "-1", "--format=%s", "origin/work/g").Out; subject != "alpha: passes do, closes done" {
			t.Fatalf("origin's tip reads %q", subject)
		}
		if !strings.Contains(out.String(), "wait\n  g stands at no step, which its route lacks") {
			t.Fatalf("the next hand-out reads:\n%s", out)
		}
	})
	t.Run("a drop lets the leaf go, and the next pull hands it again", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		it.Pulling([]string{"pull"})
		out.Reset()
		if code := it.Pulling([]string{"pull", "--drop"}); code != 0 || !strings.Contains(out.String(), "the hold drops, and alpha stays at do for the next pull.") {
			t.Fatalf("the drop answers %d:\n%s", code, out)
		}
		if held := it.HoldOf("box cafecafecafe · claude-code-remote"); held != nil {
			t.Fatalf("the hold stands: %+v", held)
		}
	})
	t.Run("a todo in hand holds the pull back", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		_ = it.Disk.Write(planFile, `{"working":"mend the lint"}`)
		if code := it.Pulling([]string{"pull"}); code != 0 || !strings.Contains(out.String(), "the todo mend the lint stands in hand, so the pull hands nothing else out.") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
	})
	t.Run("a name the queue binds past stands refused", func(t *testing.T) {
		it, _, errs := cloudPull(t)
		if code := it.Pulling([]string{"pull", "alpha"}); code != 2 || !strings.Contains(errs.String(), "alpha stands behind the queue, because this session binds to it.") {
			t.Fatalf("the pull answers %d:\n%s", code, errs)
		}
	})
	t.Run("a desk pull on a work branch hands nothing out", func(t *testing.T) {
		it, _, errs := cloudPull(t)
		it.Cloud = false
		if code := it.Pulling([]string{"pull"}); code != 2 || !strings.Contains(errs.String(), "A desk works on main alone, and a cloud box works each work/ branch, so the pull hands nothing out on work/g.") {
			t.Fatalf("the pull answers %d:\n%s", code, errs)
		}
	})
	t.Run("the tool's input reads as the words a person types", func(t *testing.T) {
		got := strings.Join(PullArgvOf([]string{"pull", "--tool", `{"ticket":"alpha","verdict":"accept","fields":{"b":"x","a":"y"}}`}), " ")
		if got != `pull alpha --pass --fields {"b":"x","a":"y"}` {
			t.Fatalf("the argv reads %s", got)
		}
	})
}

// Each tool input reads into the words a person types, off the cases test/level0/level1.test.js and pull-gate.test.js held. [[spec/design_output/pull#the-hand-out]]
func TestPullArgvOf(t *testing.T) {
	t.Parallel()
	tool := func(said string) []string { return []string{"pull", "--tool", said} }
	for _, one := range []struct {
		name string
		argv []string
		want string
	}{
		{"an empty input", tool(`{}`), "pull"},
		{"a pass", tool(`{"ticket":"a-child","verdict":"pass"}`), "pull|a-child|--pass"},
		{"a fail", tool(`{"ticket":"a-child","verdict":"fail","reason":"thin"}`), "pull|a-child|--fail|thin"},
		{"a became", tool(`{"ticket":"a-child","verdict":"became","reason":"a-group"}`), "pull|a-child|--became|a-group"},
		{"an answered", tool(`{"ticket":"a-child","verdict":"answered","reason":"a-group"}`), "pull|a-child|--answered|a-group"},
		{"a pass with fields", tool(`{"ticket":"a-child","verdict":"pass","fields":{"approach":"x"}}`), `pull|a-child|--pass|--fields|{"approach":"x"}`},
		{"a gate's accept", tool(`{"ticket":"a-child","verdict":"accept"}`), "pull|a-child|--pass"},
		{"a gate's reject", tool(`{"ticket":"a-child","verdict":"reject","reason":"no fail road"}`), "pull|a-child|--fail|no fail road"},
		{"an argv as typed", []string{"pull", "a-child", "--pass"}, "pull|a-child|--pass"},
		{"an input reading as no JSON", tool("not json"), "pull"},
	} {
		if got := strings.Join(PullArgvOf(one.argv), "|"); got != one.want {
			t.Errorf("%s reads %s, and wants %s", one.name, got, one.want)
		}
	}
}

func TestHoldAt(t *testing.T) {
	t.Parallel()
	if got := holdAt("box cafe · claude-code"); got != ".se/.runtime/hold/box-cafe-claude-code.json" {
		t.Fatalf("the hold stands at %s", got)
	}
}

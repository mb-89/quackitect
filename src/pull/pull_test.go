// The pull over an origin and a clone in memory: the hand-out, the hold, the
// hand-back's checks, the pass and its commit, the drop, the todo in hand and
// the queue binding, off the roads test/level0/pull.test.js covers.
// [[spec/design_output/pull#the-answers]]
package pull

import (
	"bytes"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"

	"quackitect/src/failure"
	"quackitect/src/modules/check"
	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/proc"
	"quackitect/src/q"
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

// The work root the fake box names, which no disk reads. [[spec/design_output/pull#the-answers]]
const workRoot = "work"

func must(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}

// The one program the fake box knows: sh running an echo, and exit 127 on any other line. [[spec/design_output/doors#the-process-door]]
func echoes(one proc.Command) proc.Said {
	if said, ok := strings.CutPrefix(one.Argv[len(one.Argv)-1], "echo "); ok {
		return proc.Said{Out: said + "\n"}
	}
	return proc.Said{Err: "sh: not found\n", Code: 127}
}

// A clone on work/g of an origin holding the group and its child, and the pull over it on a cloud box, all of it in memory. [[spec/design_output/pull#the-answers]]
func cloudPull(t *testing.T) (*It, *bytes.Buffer, *bytes.Buffer) {
	t.Helper()
	now := func() time.Time { return time.Unix(0, 0) }
	seed := files.NewFakeDisk()
	for path, text := range map[string]string{"spec/tickets/g.md": groupTicket, "spec/tickets/alpha.md": childTicket, ".gitignore": ".se/\n"} {
		must(t, seed.Write(path, text))
	}
	origin := git.NewFakeRepo(seed, now)
	must(t, origin.AddAll())
	_, err := origin.Commit("seed", nil)
	must(t, err)
	must(t, origin.Branch("work/g", "main"))
	tree := files.NewFakeDisk()
	repo := origin.Clone(tree)
	must(t, repo.Switch("work/g", false))
	repo.Set("user.name", "t")
	repo.Set("user.email", "t@t")
	box := &proc.FakeRunner{Programs: map[string]proc.Program{"sh": echoes}}
	out, errs := &bytes.Buffer{}, &bytes.Buffer{}
	it := &It{
		Disk: TreeDisk{Tree: tree}, Git: repo, Now: now,
		Out: out, Err: errs, Root: workRoot, Method: method, Agent: true, Cloud: true,
		Env: map[string]string{"CLAUDE_CODE_REMOTE": "true"}, Binding: bindQueue, Shell: ShellOver(box.Run, workRoot),
		Schemas: func() *check.Kinds { return check.SchemasIn(check.TreeOver(method, folderSource{method})) },
	}
	_ = it.Disk.Write(boxFile, `{"id":"cafecafecafe"}`+"\n")
	_ = it.Disk.Write("spec/processes/small.yaml", "steps: []\n")
	return it, out, errs
}

// A git door answering the paths main moves past HEAD, and the clone's own door for every other call. [[spec/tickets/running-work-takes-main-fixes]]
type mainMoves struct {
	git.Repo
	paths string
}

func (one mainMoves) Diff(a, b string) ([]git.Change, error) {
	if b != "origin/main" {
		return one.Repo.Diff(a, b)
	}
	var out []git.Change
	for _, path := range strings.Fields(one.paths) {
		out = append(out, git.Change{Status: "M", Path: path})
	}
	return out, nil
}

func TestPull(t *testing.T) {
	t.Parallel()
	t.Run("main moving the cold path asks a sync before any hand-out", func(t *testing.T) {
		it, out, errs := cloudPull(t)
		it.Git = mainMoves{it.Git, "spec/a.md\nsrc/modules/hooks/a.go"}
		if code := it.Pulling([]string{"pull"}); code != 1 || strings.Contains(out.String(), "work  alpha") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
		said := errs.String()
		if !strings.Contains(said, "src/modules/hooks/a.go") || !strings.Contains(said, "./RUNME.sh branch sync") {
			t.Fatalf("the pull says:\n%s", said)
		}
	})
	t.Run("main moving off the cold path hands the leaf out", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		it.Git = mainMoves{it.Git, "spec/a.md"}
		if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  alpha at do, leaf 1 of 1") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
	})
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
	t.Run("a tagged ticket of another group stays out of the pull on work/g", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		_ = it.Disk.Write("spec/tickets/aside.md", strings.Replace(strings.Replace(childTicket, "group: g\n", "group: other\n", 1), "process:", "todo: true\nprocess:", 1))
		if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  alpha at do, leaf 1 of 1") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
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
		if said, err := it.Git.Log("", "origin/work/g", false); err != nil || len(said) == 0 || said[0].Subject != "alpha: passes do, closes done" {
			t.Fatalf("origin's log reads %+v, %v", said, err)
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
	t.Run("a plan naming a free ticket hands it out", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		_ = it.Disk.Write(planFile, `{"working":"alpha"}`)
		if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  alpha at do, leaf 1 of 1") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
	})
	t.Run("a plan naming the group ticket hands its child", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		_ = it.Disk.Write(planFile, `{"working":"g"}`)
		if code := it.Pulling([]string{"pull"}); code != 0 || !strings.HasPrefix(out.String(), "work  alpha at do, leaf 1 of 1") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
	})
	t.Run("a helper's --as takes the ticket the plan names over the queue head", func(t *testing.T) {
		it, out, _ := cloudPull(t)
		_ = it.Disk.Write("spec/tickets/beta.md", childTicket)
		_ = it.Disk.Write(planFile, `{"working":"beta"}`)
		if code := it.Pulling([]string{"pull", "--as", "helper-1"}); code != 0 || !strings.HasPrefix(out.String(), "work  beta at do") {
			t.Fatalf("the pull answers %d:\n%s", code, out)
		}
	})
	t.Run("a working todo that is no ticket still holds the pull", func(t *testing.T) {
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
	// The message carries no remedy, so the node's remedy prints once. [[spec/tickets/go-pull-desk-remedy-once]]
	t.Run("a desk pull prints the node's remedy once", func(t *testing.T) {
		it, _, errs := cloudPull(t)
		it.Cloud = false
		it.Failures = failure.Fake(failure.Node{ID: "desk-works-on-trunk", Level: "warn", Remedies: []string{"Run git switch main, and take a finished cloud branch in with ./RUNME.sh branch merge <name>."}})
		it.Pulling([]string{"pull"})
		if count := strings.Count(errs.String(), "git switch main"); count != 1 {
			t.Fatalf("the pull prints the remedy %d times:\n%s", count, errs)
		}
	})
	t.Run("the tool's input reads as the words a person types", func(t *testing.T) {
		got := strings.Join(PullArgvOf([]string{"pull", "--tool", `{"ticket":"alpha","verdict":"accept","fields":{"b":"x","a":"y"}}`}), " ")
		if got != `pull alpha --pass --fields {"b":"x","a":"y"}` {
			t.Fatalf("the argv reads %s", got)
		}
	})
}

// Each tool input reads into the words a person types. [[spec/design_output/pull#the-hand-out]]
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

// The hand's prompt opens on the line the spawn answer reads to leave it untagged. [[spec/tickets/hand-spawn-skips-session-tag]]
func TestTheHandPromptOpensOnTheHandLine(t *testing.T) {
	t.Parallel()
	if got := spawnPrompt("alpha", &Leaf{}, "helper-1"); !strings.HasPrefix(got, q.HandOfItsOwn+", named helper-1") {
		t.Fatalf("the prompt opens on %q", strings.SplitN(got, "\n", 2)[0])
	}
}

func TestHoldAt(t *testing.T) {
	t.Parallel()
	if got := holdAt("box cafe · claude-code"); got != ".se/.runtime/hold/box-cafe-claude-code.json" {
		t.Fatalf("the hold stands at %s", got)
	}
}

// A cloud variable reading false or zero leaves the box on the desk, and one reading on puts it on the cloud. [[spec/tickets/shared-helpers-stand-once]]
func TestACloudFlagReadsOnOrOff(t *testing.T) {
	t.Parallel()
	if InCloud(map[string]string{"SE_CLOUD": " False "}) || InCloud(map[string]string{"SE_CLOUD": "0"}) || !InCloud(map[string]string{"SE_CLOUD": "1"}) {
		t.Fatal("the cloud flag reads apart from flagOn")
	}
	if got := sortedKeys(map[string]bool{"b": true, "a": true}); len(got) != 2 || got[0] != "a" {
		t.Fatalf("the keys read %v", got)
	}
}

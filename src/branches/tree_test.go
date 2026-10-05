// The tree a branch verb test runs over: a bare origin and a clone of it,
// with main pushed and the doors pointing at the clone, so every git read
// meets a real repository.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// The moment every test clock reads. [[spec/tickets/work-verbs-port-to-go]]
var testNow = time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)

// A group ticket with its children step and a retro to write. [[spec/tickets/work-verbs-port-to-go]]
const groupNote = `---
kind: [[ticket]]
state: open
process: [[spec/processes/group]]
steps:
  - name: children
    by: children
  - name: retro
    steps:
      - name: write
        does: writes the retro
step: children
---

# Ask

The group's ask.
`

// A child of the group g, at a leaf any hand takes. [[spec/tickets/work-verbs-port-to-go]]
const childNote = `---
kind: [[ticket]]
state: open
process: [[spec/processes/standard]]
group: g
steps:
  - name: build
    does: builds it
step: build
---

# Ask

Build it.
`

// A tree over a bare origin: its clone, the origin and the doors over the clone. [[spec/tickets/work-verbs-port-to-go]]
type tree struct {
	t          *testing.T
	root, from string
	out, errs  bytes.Buffer
	d          *Doors
	// The env the tree's own git calls take past the box's, so a test sets a date without touching the process the parallel tests share.
	env []string
}

// A tree with main carrying the files, pushed to origin, on a cloud box. [[spec/tickets/work-verbs-port-to-go]]
func newTree(t *testing.T, files map[string]string) *tree {
	t.Helper()
	one := &tree{t: t, root: t.TempDir(), from: t.TempDir()}
	one.sh(one.from, "git", "init", "-q", "--bare", "-b", "main")
	one.sh(one.from, "git", "config", "receive.autogc", "false")
	one.sh(one.root, "git", "init", "-q", "-b", "main")
	one.git("config", "user.name", "tester")
	one.git("config", "user.email", "tester@example.com")
	one.git("config", "commit.gpgsign", "false")
	// A fixture lives a second, so git's housekeeping after each fetch and commit spends processes on nothing.
	one.git("config", "maintenance.auto", "false")
	one.git("config", "gc.auto", "0")
	one.git("remote", "add", "origin", one.from)
	if files == nil {
		files = map[string]string{}
	}
	files[".gitignore"] = ".se/\n"
	one.land("main opens", files)
	one.git("push", "-q", "-u", "origin", "main")
	one.d = &Doors{
		Root:  one.root,
		Env:   map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_CLOUD": "", "CLAUDECODE": "", "GIT_CONFIG_NOSYSTEM": "1"},
		Now:   func() time.Time { return testNow },
		Out:   &one.out,
		Errs:  &one.errs,
		Runme: []string{"false"},
	}
	return one
}

// The same tree on a desk: no harness and no cloud. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) desk() *tree {
	one.d.Env["CLAUDE_CODE_REMOTE"] = ""
	return one
}

// Runs a program in a folder, and fails the test where it answers red. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) sh(dir string, argv ...string) string {
	one.t.Helper()
	cmd := exec.Command(argv[0], argv[1:]...)
	cmd.Dir = dir
	cmd.Env = append(append(os.Environ(), "GIT_CONFIG_NOSYSTEM=1", "GIT_AUTHOR_NAME=tester", "GIT_AUTHOR_EMAIL=tester@example.com", "GIT_COMMITTER_NAME=tester", "GIT_COMMITTER_EMAIL=tester@example.com"), one.env...)
	said, err := cmd.CombinedOutput()
	if err != nil {
		one.t.Fatalf("%s answers %v: %s", strings.Join(argv, " "), err, said)
	}
	return strings.TrimSpace(string(said))
}

// Runs git in the clone. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) git(args ...string) string {
	one.t.Helper()
	return one.sh(one.root, append([]string{"git"}, args...)...)
}

// Writes files into the clone. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) write(files map[string]string) {
	one.t.Helper()
	for rel, text := range files {
		at := filepath.Join(one.root, filepath.FromSlash(rel))
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			one.t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte(text), 0o644); err != nil {
			one.t.Fatal(err)
		}
	}
}

// Writes files and commits them on the branch HEAD stands on. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) land(message string, files map[string]string) {
	one.t.Helper()
	one.write(files)
	one.git("add", "-A")
	one.git("commit", "-q", "--allow-empty", "-m", message)
}

// Pushes a work branch off main carrying the files, and comes back to main. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) branch(name string, files map[string]string) {
	one.t.Helper()
	one.git("switch", "-q", "-c", workBranch+name, "main")
	one.land(name+" lands", files)
	one.git("push", "-q", "origin", workBranch+name)
	one.git("switch", "-q", "main")
	one.git("branch", "-q", "-D", workBranch+name)
	one.git("fetch", "-q", "origin")
}

// Runs a branch verb, and answers its code. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) branchSays(argv ...string) int {
	one.out.Reset()
	one.errs.Reset()
	return Branch(one.d, argv)
}

// A file in the clone, or nothing. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) read(rel string) string {
	said, _ := os.ReadFile(filepath.Join(one.root, filepath.FromSlash(rel)))
	return string(said)
}

// Fails where the text holds no line. [[spec/tickets/work-verbs-port-to-go]]
func holds(t *testing.T, text, line string) {
	t.Helper()
	if !strings.Contains(text, line) {
		t.Fatalf("%q holds no %q", text, line)
	}
}

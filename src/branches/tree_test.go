// The tree a branch verb test runs over: a bare origin and a clone of it,
// with main pushed and the doors pointing at the clone, so every git read
// meets a real repository.
// [[spec/tickets/work-verbs-port-to-go]]
package branches

import (
	"bytes"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// The bare origin and the configured clone every tree copies, built once a run. [[spec/tickets/branches-fixtures-copy-a-template]]
var template struct{ origin, clone string }

// The env every git call of a tree takes, so no box config and no box author reach a fixture. [[spec/tickets/branches-fixtures-copy-a-template]]
var gitEnv = []string{"GIT_CONFIG_NOSYSTEM=1", "GIT_AUTHOR_NAME=tester", "GIT_AUTHOR_EMAIL=tester@example.com", "GIT_COMMITTER_NAME=tester", "GIT_COMMITTER_EMAIL=tester@example.com"}

// Builds the template, runs the tests, and drops the template. [[spec/tickets/branches-fixtures-copy-a-template]]
func TestMain(m *testing.M) {
	dir, err := os.MkdirTemp("", "branches-template")
	if err == nil {
		err = buildTemplate(dir)
	}
	if err != nil {
		fmt.Fprintln(os.Stderr, "the branches template:", err)
		os.Exit(1)
	}
	code := m.Run()
	os.RemoveAll(dir)
	os.Exit(code)
}

// A bare origin and a clone holding the tester's config, with no remote and no commit. [[spec/tickets/branches-fixtures-copy-a-template]]
func buildTemplate(dir string) error {
	template.origin, template.clone = filepath.Join(dir, "origin"), filepath.Join(dir, "clone")
	steps := [][]string{
		{template.origin, "init", "-q", "--bare", "-b", "main", template.origin},
		{template.origin, "config", "receive.autogc", "false"},
		{dir, "init", "-q", "-b", "main", template.clone},
		{template.clone, "config", "user.name", "tester"},
		{template.clone, "config", "user.email", "tester@example.com"},
		{template.clone, "config", "commit.gpgsign", "false"},
		// A fixture lives a second, so git's housekeeping after each fetch and commit spends processes on nothing.
		{template.clone, "config", "maintenance.auto", "false"},
		{template.clone, "config", "gc.auto", "0"},
	}
	if err := os.MkdirAll(template.origin, 0o755); err != nil {
		return err
	}
	for _, step := range steps {
		cmd := exec.Command("git", step[1:]...)
		cmd.Dir = step[0]
		cmd.Env = append(os.Environ(), gitEnv...)
		if said, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("git %s answers %v: %s", strings.Join(step[1:], " "), err, said)
		}
	}
	return nil
}

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
	one.copyOf(template.origin, one.from)
	one.copyOf(template.clone, one.root)
	one.addOrigin()
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

// Copies a template folder into the test's own. [[spec/tickets/branches-fixtures-copy-a-template]]
func (one *tree) copyOf(from, into string) {
	one.t.Helper()
	if err := os.CopyFS(into, os.DirFS(from)); err != nil {
		one.t.Fatal(err)
	}
}

// Names the test's origin as the clone's remote, in the config file itself, so no process runs for it. [[spec/tickets/branches-fixtures-copy-a-template]]
func (one *tree) addOrigin() {
	one.t.Helper()
	config, err := os.OpenFile(filepath.Join(one.root, ".git", "config"), os.O_APPEND|os.O_WRONLY, 0)
	if err == nil {
		_, err = fmt.Fprintf(config, "[remote \"origin\"]\n\turl = %s\n\tfetch = +refs/heads/*:refs/remotes/origin/*\n", one.from)
		err = errors.Join(err, config.Close())
	}
	if err != nil {
		one.t.Fatal(err)
	}
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
	cmd.Env = append(append(os.Environ(), gitEnv...), one.env...)
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

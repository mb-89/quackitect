// The tree a branch verb test runs over: an origin and a clone of it, both
// FakeRepo, the clone's work tree on a FakeDisk, and a FakeRunner taught no
// git, so every case runs in memory and a reach for the real git answers
// NotStarted. [[spec/tickets/branch-verbs-meet-fake-git]]
package branches

import (
	"bytes"
	"sort"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/modules/files"
	"quackitect/src/modules/git"
	"quackitect/src/proc"
)

// The moment every test clock reads. [[spec/tickets/work-verbs-port-to-go]]
var testNow = time.Date(2026, 1, 2, 3, 4, 5, 0, time.UTC)

// The work root the doors name: a path no disk holds, since every file stands on the fake disk. [[spec/tickets/branch-verbs-meet-fake-git]]
const testRoot = "/fake/work"

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

// A tree over an origin: the clone, its work tree, the origin, the runner, the clock commits stamp, and the doors over the clone. [[spec/tickets/branch-verbs-meet-fake-git]]
type tree struct {
	t         *testing.T
	root      string
	out, errs bytes.Buffer
	d         *Doors
	disk      *files.FakeDisk
	repo      *git.FakeRepo
	origin    *git.FakeRepo
	run       *proc.FakeRunner
	clock     *atomic.Int64
}

// A program that answers the exit code named and says nothing. [[spec/design_output/doors#the-process-door]]
func exits(code int) proc.Program {
	return func(proc.Command) proc.Said { return proc.Said{Code: code} }
}

// A program that prints its words, as echo does. [[spec/design_output/doors#the-process-door]]
func echoes(ran proc.Command) proc.Said {
	return proc.Said{Out: strings.Join(ran.Argv[1:], " ") + "\n"}
}

// A tree with main carrying the files, pushed to origin, on a cloud box. [[spec/tickets/work-verbs-port-to-go]]
func newTree(t *testing.T, files map[string]string) *tree {
	t.Helper()
	one := &tree{t: t, root: testRoot, disk: newFakeDisk(), clock: &atomic.Int64{}}
	one.clock.Store(testNow.Unix())
	now := func() time.Time { return time.Unix(one.clock.Load(), 0) }
	one.origin = git.NewFakeRepo(newFakeDisk(), now)
	one.repo = one.origin.Clone(one.disk)
	one.repo.Set("user.name", "tester")
	one.repo.Set("user.email", "tester@example.com")
	if files == nil {
		files = map[string]string{}
	}
	files[".gitignore"] = ".se/\n"
	one.land("main opens", files)
	if pushed := one.repo.Push(trunk, true); !pushed.OK {
		t.Fatal(pushed.Err)
	}
	one.run = &proc.FakeRunner{Programs: map[string]proc.Program{"false": exits(1), "true": exits(0), "sh": exits(0), "echo": echoes, "go": one.pfGo, "node": one.pfNode}}
	one.d = &Doors{
		Root:  testRoot,
		Repo:  one.repo,
		Run:   one.run.Run,
		Disk:  one.disk,
		Env:   map[string]string{"CLAUDE_CODE_REMOTE": "true", "SE_CLOUD": "", "CLAUDECODE": ""},
		Now:   func() time.Time { return testNow },
		Out:   &one.out,
		Errs:  &one.errs,
		Runme: []string{"false"},
	}
	return one
}

func newFakeDisk() *files.FakeDisk { return files.NewFakeDisk() }

// The same tree on a desk: no harness and no cloud. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) desk() *tree {
	one.d.Env["CLAUDE_CODE_REMOTE"] = ""
	return one
}

// Teaches the runner a program. [[spec/design_output/doors#the-process-door]]
func (one *tree) teach(name string, program proc.Program) { one.run.Programs[name] = program }

// Fails the test where a fixture's move answers a fault. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) must(err error) {
	one.t.Helper()
	if err != nil {
		one.t.Fatal(err)
	}
}

// Writes files into the clone. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) write(files map[string]string) {
	one.t.Helper()
	for rel, text := range files {
		one.must(one.disk.Write(rel, text))
	}
}

// Removes a file from the clone's work tree. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) erase(rel string) { one.must(one.disk.Remove(rel)) }

// Writes files and commits them on the branch HEAD stands on, an empty commit where nothing moves. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) land(message string, files map[string]string) string {
	one.t.Helper()
	one.write(files)
	one.must(one.repo.AddAll())
	if staged, _ := one.repo.Staged(nil); len(staged) == 0 {
		if _, born := one.repo.Resolve("HEAD"); born {
			made, err := one.repo.CommitTree("HEAD", "HEAD", message)
			one.must(err)
			one.must(one.repo.UpdateRef("HEAD", made))
			return made
		}
	}
	made, err := one.repo.Commit(message, nil)
	one.must(err)
	return made
}

// Lands files at a second of its own, so a case reads a tip's age. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) landAt(at time.Time, message string, files map[string]string) string {
	one.t.Helper()
	was := one.clock.Swap(at.Unix())
	defer one.clock.Store(was)
	return one.land(message, files)
}

// Pushes a branch to origin. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) push(branch string) {
	one.t.Helper()
	if pushed := one.repo.Push(branch, false); !pushed.OK {
		one.t.Fatalf("the push of %s answers %s", branch, pushed.Err)
	}
}

// Sets a ref on origin to a commit the clone names, a branch through a push and any other ref by its name. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) pushAt(ref, to string) {
	one.t.Helper()
	commit := one.rev(ref)
	if branch, ok := strings.CutPrefix(to, "refs/heads/"); ok {
		if pushed := one.repo.PushTo(commit, branch); !pushed.OK {
			one.t.Fatalf("the push of %s to %s answers %s", ref, to, pushed.Err)
		}
		return
	}
	one.must(one.origin.UpdateRef(to, commit))
}

// Takes every branch origin holds. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) fetch() { one.must(one.repo.FetchAll()) }

// Moves HEAD onto a branch, a tracked one of origin's among them. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) switchTo(branch string) {
	one.t.Helper()
	one.must(one.repo.Switch(branch, false))
}

// Cuts a branch at a ref, or at HEAD for none, and moves onto it. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) cut(branch, at string) {
	one.t.Helper()
	if at == "" {
		one.must(one.repo.Switch(branch, true))
		return
	}
	one.must(one.repo.Branch(branch, at))
	one.must(one.repo.Switch(branch, false))
}

// Merges a ref into HEAD with a merge commit, under the message named or git's own. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) mergeIn(ref, message string) {
	one.t.Helper()
	_, err := one.repo.Merge(ref, message, true)
	one.must(err)
}

// Deletes a local branch. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) drop(branch string) { one.must(one.repo.DeleteRef("refs/heads/" + branch)) }

// Pushes a work branch off main carrying the files, and comes back to main. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) branch(name string, files map[string]string) {
	one.t.Helper()
	one.branchAt(name, files, time.Unix(one.clock.Load(), 0))
}

// Pushes a work branch off main whose one commit stands at a second of its own, and comes back to main. [[spec/tickets/dispatch-verbs-port-to-go]]
func (one *tree) branchAt(name string, files map[string]string, at time.Time) {
	one.t.Helper()
	one.cut(workBranch+name, trunk)
	one.landAt(at, name+" lands", files)
	one.push(workBranch + name)
	one.switchTo(trunk)
	one.drop(workBranch + name)
	one.fetch()
}

// The commit a ref names, or nothing. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) rev(ref string) string {
	said, _ := one.repo.Resolve(ref)
	return said
}

// The branch HEAD stands on. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) here() string {
	said, _ := one.repo.Head()
	return said
}

// A file at a ref, trimmed as git show prints it, or nothing. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) show(ref, rel string) string {
	said, _ := one.repo.Show(ref, rel)
	return strings.TrimSpace(said)
}

// The subject of the commit a ref names. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) subject(ref string) string {
	one.t.Helper()
	log, err := one.repo.Log("", ref, false)
	if err != nil || len(log) == 0 {
		one.t.Fatalf("the log of %s reads %v, %v", ref, log, err)
	}
	return log[0].Subject
}

// The subjects of every commit a ref holds, newest first. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) subjects(ref string) string {
	log, _ := one.repo.Log("", ref, false)
	var out []string
	for _, each := range log {
		out = append(out, each.Subject)
	}
	return strings.Join(out, "\n")
}

// How many parents the commit a ref names stands on. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) parents(ref string) int {
	count := 0
	for ; ; count++ {
		if _, ok := one.repo.Resolve(ref + "^" + string(rune('1'+count))); !ok {
			return count
		}
	}
}

// Every file a ref holds with its text, in path order, so two refs holding one tree read alike. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) treeOf(ref string) string {
	paths, _ := one.repo.Files(ref, "")
	sort.Strings(paths)
	var out strings.Builder
	for _, path := range paths {
		text, _ := one.repo.Show(ref, path)
		out.WriteString(path + "\x00" + text + "\x00")
	}
	return out.String()
}

// The paths the clone's status names, each with its status. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) status() []git.Change {
	said, _ := one.repo.Status(true)
	return said
}

// The paths the index stages against HEAD, one a line. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) staged() string {
	said, _ := one.repo.Staged(nil)
	var out []string
	for _, each := range said {
		out = append(out, each.Path)
	}
	return strings.Join(out, "\n")
}

// The paths a merge leaves unmerged, one a line. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) unmerged() string {
	said, _ := one.repo.Unmerged()
	return strings.Join(said, "\n")
}

// Whether origin holds a branch. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) originHas(branch string) bool {
	_, ok := one.origin.Resolve("refs/heads/" + branch)
	return ok
}

// The commit origin holds a branch at, or nothing. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) originAt(branch string) string {
	said, _ := one.origin.Resolve("refs/heads/" + branch)
	return said
}

// The subject of the commit origin holds a branch at. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) originSubject(branch string) string {
	log, _ := one.origin.Log("", "refs/heads/"+branch, false)
	if len(log) == 0 {
		return ""
	}
	return log[0].Subject
}

// A file origin holds on a branch, trimmed as git show prints it, or nothing. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) originShows(branch, rel string) string {
	said, _ := one.origin.Show("refs/heads/"+branch, rel)
	return strings.TrimSpace(said)
}

// Runs a branch verb, and answers its code. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) branchSays(argv ...string) int {
	one.out.Reset()
	one.errs.Reset()
	return Branch(one.d, argv)
}

// A file in the clone, or nothing. [[spec/tickets/work-verbs-port-to-go]]
func (one *tree) read(rel string) string {
	said, _, _ := one.disk.Read(rel)
	return said
}

// Whether a file stands in the clone. [[spec/tickets/branch-verbs-meet-fake-git]]
func (one *tree) stands(rel string) bool {
	_, ok, _ := one.disk.Read(rel)
	return ok
}

// Fails where the text holds no line. [[spec/tickets/work-verbs-port-to-go]]
func holds(t *testing.T, text, line string) {
	t.Helper()
	if !strings.Contains(text, line) {
		t.Fatalf("%q holds no %q", text, line)
	}
}

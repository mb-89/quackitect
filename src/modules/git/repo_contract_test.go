// The git door's contract: each case runs against FakeRepo and a real
// repository with a bare origin under a temporary folder, the one door test of
// git's writes. [[spec/design_output/doors#the-git-door-carries-writes]]
package git // level0: InPackageTest - the contract suite drives the unexported hooks preCommit and preReceive, the Repo's origin and shallow, and the in-package trees folderTree and newMemoryTree

import (
	"errors"
	"os"
	"path/filepath"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"quackitect/src/proc"
)

const (
	seedSecond = 1000
	hashLength = 40
	hand       = "the-hand"
	handMail   = "hand@box.invalid"
	seedText   = "seed\n"
)

// One clone: its door, and the hands a case moves its work tree and its history with. [[spec/design_output/doors#the-git-door-carries-writes]]
type side struct {
	Repo
	write  func(path, text string)
	read   func(path string) (string, bool)
	remove func(path string)
	commit func(message string) string
	push   func(branch string)
	fetch  func(branch string)
	cut    func(branch string)
}

// An origin, two clones of it on main, the seed commit both hold, the clock commits read, a lone repository on main holding no commit and no origin, its identity set on ask, a shallow clone, a hook refusing a commit on here or a push on origin, and an orphan branch on here. [[spec/design_output/doors#the-git-door-carries-writes]]
type world struct {
	name        string
	origin      Repo
	here, there side
	seed        string
	at          func(second int64)
	lone        func(identity bool) side
	shallow     func() Repo
	hook        func(onOrigin bool, refuse string)
	orphan      func(name string)
}

func worlds(t *testing.T) []world {
	t.Helper()
	return []world{
		realWorld(t),
		fakeWorld(t, "fake", func() Tree { return newMemoryTree() }),
		fakeWorld(t, "fake over a folder", func() Tree { return folderTree{t.TempDir()} }), // level0: FixtureOutsideHome - each case writes into a folder of its own
	}
}

func realWorld(t *testing.T) world {
	t.Helper()
	var clock atomic.Int64
	clock.Store(seedSecond)
	runs := func(one proc.Command) proc.Said {
		stamp := "@" + strconv.FormatInt(clock.Load(), 10) + " +0000"
		one.Env = append(one.Env, "GIT_CONFIG_GLOBAL="+os.DevNull, "GIT_CONFIG_NOSYSTEM=1", "GIT_AUTHOR_DATE="+stamp, "GIT_COMMITTER_DATE="+stamp)
		return proc.Real(one)
	}
	raw := func(dir string, args ...string) string {
		t.Helper()
		said := runs(proc.Command{Argv: append([]string{"git"}, args...), Dir: dir})
		if said.Code != 0 {
			t.Fatalf("git %v answers %d: %s", args, said.Code, said.Err)
		}
		return strings.TrimSpace(said.Out)
	}
	open := func(root string) side {
		at := func(path string) string { return filepath.Join(root, filepath.FromSlash(path)) }
		return side{
			Repo: NewRepo(root, runs),
			write: func(path, text string) {
				if err := os.MkdirAll(filepath.Dir(at(path)), 0o755); err != nil {
					t.Fatal(err)
				}
				if err := os.WriteFile(at(path), []byte(text), 0o644); err != nil {
					t.Fatal(err)
				}
			},
			read: func(path string) (string, bool) {
				said, err := os.ReadFile(at(path))
				return string(said), err == nil
			},
			remove: func(path string) {
				if err := os.Remove(at(path)); err != nil {
					t.Fatal(err)
				}
			},
			commit: func(message string) string {
				raw(root, "add", "-A")
				raw(root, "commit", "--quiet", "-m", message)
				return raw(root, "rev-parse", "HEAD")
			},
			push:  func(branch string) { raw(root, "push", "--quiet", "origin", branch) },
			fetch: func(branch string) { raw(root, "fetch", "--quiet", "origin", branch) },
			cut:   func(branch string) { raw(root, "branch", branch) },
		}
	}
	clone := func(root string) side {
		raw(root, "config", "user.name", hand)
		raw(root, "config", "user.email", handMail)
		return open(root)
	}
	origin, here, there := t.TempDir(), t.TempDir(), t.TempDir() // level0: FixtureOutsideHome - each case commits into real repositories of its own
	raw(origin, "init", "--quiet", "--bare", "--initial-branch=main")
	raw(here, "init", "--quiet", "--initial-branch=main")
	raw(here, "remote", "add", "origin", origin)
	w := world{name: "real", origin: NewRepo(origin, runs), here: clone(here), at: clock.Store}
	w.here.write("README.md", seedText)
	w.seed = w.here.commit("seed")
	raw(here, "push", "--quiet", "-u", "origin", "main")
	raw(there, "clone", "--quiet", origin, ".")
	w.there = clone(there)
	w.hook = func(onOrigin bool, refuse string) {
		at := filepath.Join(here, ".git", "hooks", "pre-commit")
		if onOrigin {
			at = filepath.Join(origin, "hooks", "pre-receive")
		}
		if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(at, []byte("#!/bin/sh\necho '"+refuse+"' >&2\nexit 1\n"), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	w.orphan = func(name string) { raw(here, "switch", "--quiet", "--orphan", name) }
	w.shallow = func() Repo {
		root := t.TempDir() // level0: FixtureOutsideHome - the case clones a real repository of its own
		raw(root, "clone", "--quiet", "--depth", "1", "--no-single-branch", "file://"+origin, ".")
		return NewRepo(root, runs)
	}
	w.lone = func(identity bool) side {
		root := t.TempDir() // level0: FixtureOutsideHome - the case writes into a real repository of its own
		raw(root, "init", "--quiet", "--initial-branch=main")
		raw(root, "config", "user.useConfigOnly", "true")
		if identity {
			return clone(root)
		}
		return open(root)
	}
	return w
}

func fakeWorld(t *testing.T, name string, disk func() Tree) world {
	t.Helper()
	var clock atomic.Int64
	clock.Store(seedSecond)
	now := func() time.Time { return time.Unix(clock.Load(), 0) }
	origin := NewFakeRepo(disk(), now)
	open := func(repo *FakeRepo, tree Tree) side {
		return side{
			Repo: repo,
			write: func(path, text string) {
				if err := tree.Write(path, text); err != nil {
					t.Fatal(err)
				}
			},
			read: func(path string) (string, bool) {
				text, ok, _ := tree.Read(path)
				return text, ok
			},
			remove: func(path string) {
				if err := tree.Remove(path); err != nil {
					t.Fatal(err)
				}
			},
			commit: func(message string) string {
				if err := repo.AddAll(); err != nil {
					t.Fatal(err)
				}
				hash, err := repo.Commit(message, nil)
				if err != nil {
					t.Fatal(err)
				}
				return hash
			},
			push: func(branch string) {
				if pushed := repo.Push(branch, false); pushed.Err != "" {
					t.Fatal(pushed.Err)
				}
			},
			fetch: func(branch string) {
				if err := repo.Fetch(branch); err != nil {
					t.Fatal(err)
				}
			},
			cut: func(branch string) {
				if err := repo.Branch(branch, "HEAD"); err != nil {
					t.Fatal(err)
				}
			},
		}
	}
	var first *FakeRepo
	clone := func() side {
		tree := disk()
		repo := origin.Clone(tree)
		repo.Set("user.name", hand)
		repo.Set("user.email", handMail)
		if first == nil {
			first = repo
		}
		return open(repo, tree)
	}
	w := world{name: name, origin: origin, here: clone(), at: clock.Store}
	w.hook = func(onOrigin bool, refuse string) {
		if onOrigin {
			origin.Hook(preReceive, func(string, string) error { return errors.New(refuse) })
			return
		}
		first.Hook(preCommit, func(string, string) error { return errors.New(refuse) })
	}
	w.orphan = func(name string) {
		if err := first.Orphan(name); err != nil {
			t.Fatal(err)
		}
	}
	w.shallow = func() Repo { return origin.CloneShallow(disk()) }
	w.lone = func(identity bool) side {
		tree := disk()
		repo := NewFakeRepo(tree, now)
		repo.Set("user.useConfigOnly", "true")
		if identity {
			repo.Set("user.name", hand)
			repo.Set("user.email", handMail)
		}
		return open(repo, tree)
	}
	w.here.write("README.md", seedText)
	w.seed = w.here.commit("seed")
	if pushed := w.here.Push("main", true); pushed.Err != "" {
		t.Fatal(pushed.Err)
	}
	w.there = clone()
	return w
}

func byPath(changes []Change) []Change {
	out := append([]Change{}, changes...)
	sort.Slice(out, func(a, b int) bool { return out[a].Path < out[b].Path })
	return out
}

func status(t *testing.T, one Repo, untracked bool) []Change {
	t.Helper()
	said, err := one.Status(untracked)
	if err != nil {
		t.Fatal(err)
	}
	return byPath(said)
}

func subjects(commits []Commit) []string {
	out := []string{}
	for _, one := range commits {
		out = append(out, one.Subject)
	}
	return out
}

func TestRepoNamesTheBranchHeadStandsOn(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if head, err := w.here.Head(); err != nil || head != "main" {
			t.Errorf("the %s repo names %q, %v", w.name, head, err)
		}
	}
}

func TestRepoResolvesARefAndAnswersNoneForAMissingOne(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		head, ok := w.here.Resolve("HEAD")
		if !ok || len(head) != hashLength || head != w.seed {
			t.Errorf("the %s repo resolves HEAD to %q, %v, and the seed stands at %q", w.name, head, ok, w.seed)
		}
		for _, ref := range []string{"main", "refs/heads/main", "origin/main"} {
			if said, ok := w.here.Resolve(ref); !ok || said != w.seed {
				t.Errorf("the %s repo resolves %s to %q, %v", w.name, ref, said, ok)
			}
		}
		if said, ok := w.here.Resolve("no-such-ref"); ok || said != "" {
			t.Errorf("the %s repo resolves a missing ref to %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoReadsAFileAtARefAndNothingForAMissingPath(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "next\n")
		w.here.commit("next")
		if said, ok := w.here.Show(w.seed, "README.md"); !ok || said != seedText {
			t.Errorf("the %s repo reads the seed's README.md as %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Show("HEAD", "README.md"); !ok || said != "next\n" {
			t.Errorf("the %s repo reads HEAD's README.md as %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Show("HEAD", "missing.md"); ok || said != "" {
			t.Errorf("the %s repo reads a missing path as %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Show("no-such-ref", "README.md"); ok || said != "" {
			t.Errorf("the %s repo reads a path at a missing ref as %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoAddStagesThePathsAndAddAllSkipsIgnoredOnes(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("a.txt", "a\n")
		w.here.write("b.txt", "b\n")
		if err := w.here.Add([]string{"a.txt"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		if said, want := status(t, w.here, true), []Change{{Status: "A ", Path: "a.txt"}, {Status: "??", Path: "b.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the add, and wants %+v", w.name, said, want)
		}
		w.here.write(".gitignore", "build/\n*.log\n")
		w.here.write("build/out.txt", "built\n")
		w.here.write("x.log", "logged\n")
		if err := w.here.AddAll(); err != nil {
			t.Errorf("the %s repo's add of everything answers %v", w.name, err)
		}
		want := []Change{{Status: "A ", Path: ".gitignore"}, {Status: "A ", Path: "a.txt"}, {Status: "A ", Path: "b.txt"}}
		if said := status(t, w.here, true); !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the add of everything, and wants %+v", w.name, said, want)
		}
	}
}

func TestRepoResetUnstagesThePathsAndLeavesTheWorkTree(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "changed\n")
		w.here.write("a.txt", "a\n")
		if err := w.here.Add([]string{"README.md", "a.txt"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		if err := w.here.Reset([]string{"README.md"}); err != nil {
			t.Errorf("the %s repo's reset answers %v", w.name, err)
		}
		if said, want := status(t, w.here, true), []Change{{Status: " M", Path: "README.md"}, {Status: "A ", Path: "a.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the reset of a path, and wants %+v", w.name, said, want)
		}
		if err := w.here.Reset(nil); err != nil {
			t.Errorf("the %s repo's reset of everything answers %v", w.name, err)
		}
		if said, want := status(t, w.here, true), []Change{{Status: " M", Path: "README.md"}, {Status: "??", Path: "a.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the reset of everything, and wants %+v", w.name, said, want)
		}
		if said, ok := w.here.read("README.md"); !ok || said != "changed\n" {
			t.Errorf("the %s repo's work tree holds README.md as %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoCommitOfNamedPathsTakesTheirWorkTreeTextAlone(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "staged\n")
		w.here.write("other.txt", "other\n")
		if err := w.here.Add([]string{"README.md", "other.txt"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		w.here.write("README.md", "worked\n")
		hash, err := w.here.Commit("only the readme", []string{"README.md"})
		if head, _ := w.here.Resolve("HEAD"); err != nil || hash == "" || hash != head {
			t.Errorf("the %s repo's commit answers %q, %v, and HEAD stands at %q", w.name, hash, err, head)
		}
		if said, ok := w.here.Show("HEAD", "README.md"); !ok || said != "worked\n" {
			t.Errorf("the %s repo's commit holds README.md as %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Show("HEAD", "other.txt"); ok {
			t.Errorf("the %s repo's commit holds other.txt as %q", w.name, said)
		}
		if said, want := status(t, w.here, false), []Change{{Status: "A ", Path: "other.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the commit, and wants %+v", w.name, said, want)
		}
		if said, err := w.here.Log(w.seed, "HEAD", false); err != nil || !reflect.DeepEqual(said, []Commit{{Hash: hash, Subject: "only the readme"}}) {
			t.Errorf("the %s repo logs %+v, %v past the seed", w.name, said, err)
		}
	}
}

func TestRepoCommitWithNothingStagedRefuses(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if hash, err := w.here.Commit("nothing", nil); err == nil {
			t.Errorf("the %s repo commits nothing staged as %q", w.name, hash)
		}
		if head, ok := w.here.Resolve("HEAD"); !ok || head != w.seed {
			t.Errorf("the %s repo's HEAD moves to %q, %v", w.name, head, ok)
		}
	}
}

func TestRepoStatusNamesStagedChangedAndUntrackedPathsAndSkipsIgnoredOnes(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write(".gitignore", "*.log\n")
		w.here.write("tracked.txt", "one\n")
		w.here.commit("tracked")
		w.here.write("tracked.txt", "two\n")
		w.here.write("staged.txt", "staged\n")
		if err := w.here.Add([]string{"staged.txt"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		w.here.write("new.txt", "new\n")
		w.here.write("deep/x.txt", "deep\n")
		w.here.write("junk.log", "junk\n")
		staged := []Change{{Status: "A ", Path: "staged.txt"}, {Status: " M", Path: "tracked.txt"}}
		want := append([]Change{{Status: "??", Path: "deep/x.txt"}, {Status: "??", Path: "new.txt"}}, staged...)
		if said := status(t, w.here, true); !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo's status with untracked paths answers %+v, and wants %+v", w.name, said, want)
		}
		if said := status(t, w.here, false); !reflect.DeepEqual(said, staged) {
			t.Errorf("the %s repo's status without untracked paths answers %+v, and wants %+v", w.name, said, staged)
		}
	}
}

func TestRepoIgnoredNamesThePathsTheIgnoreFileHoldsOut(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write(".gitignore", "build/\nlogs/*.log\nsecret.txt\n")
		w.here.commit("ignore")
		asked := []string{"a.txt", "build/out.txt", "logs/x.log", "logs/keep.txt", "secret.txt"}
		for _, path := range asked {
			w.here.write(path, "x\n")
		}
		if said, want := w.here.Ignored(asked), []string{"build/out.txt", "logs/x.log", "secret.txt"}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo ignores %v, and wants %v", w.name, said, want)
		}
	}
}

func TestRepoTrackedAnswersWhetherTheIndexHoldsAPath(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("staged.txt", "s\n")
		w.here.write("loose.txt", "l\n")
		if err := w.here.Add([]string{"staged.txt"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		for path, want := range map[string]bool{"README.md": true, "staged.txt": true, "loose.txt": false, "missing.txt": false} {
			if said := w.here.Tracked(path); said != want {
				t.Errorf("the %s repo answers %v on whether its index holds %s", w.name, said, path)
			}
		}
	}
}

func TestRepoUnmergedNamesNoPathOnACleanIndex(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if !w.here.Tracked("README.md") {
			t.Errorf("the %s repo's index holds no README.md, so no index stands to read", w.name)
		}
		if said, err := w.here.Unmerged(); err != nil || len(said) != 0 {
			t.Errorf("the %s repo's clean index names %v, %v unmerged", w.name, said, err)
		}
	}
}

func TestRepoStagedAddsNameEachAddedLineByFileAndLine(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("code.txt", "one\ntwo\n")
		w.here.commit("code")
		w.here.write("code.txt", "one\nTWO\nthree\n")
		w.here.write("new.txt", "fresh\n")
		w.here.write("bin.dat", "\x00\x01\x02")
		if err := w.here.Add([]string{"code.txt", "new.txt", "bin.dat"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		want := []Line{{File: "code.txt", Line: 2, Text: "TWO"}, {File: "code.txt", Line: 3, Text: "three"}, {File: "new.txt", Line: 1, Text: "fresh"}}
		if said, err := w.here.StagedAdds(nil); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo's staged adds answer %+v, %v, and want %+v", w.name, said, err, want)
		}
		if said, err := w.here.StagedAdds([]string{"new.txt"}); err != nil || !reflect.DeepEqual(said, want[2:]) {
			t.Errorf("the %s repo's staged adds of new.txt answer %+v, %v", w.name, said, err)
		}
	}
}

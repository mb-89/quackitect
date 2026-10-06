// The git door's contract: each case runs against FakeRepo and a real
// repository with a bare origin under a temporary folder, the one door test of
// git's writes. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
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

// An origin, two clones of it on main, the seed commit both hold, the clock commits read, and a lone repository on main holding no commit and no origin, its identity set on ask. [[spec/design_output/doors#the-git-door-carries-writes]]
type world struct {
	name        string
	origin      Repo
	here, there side
	seed        string
	at          func(second int64)
	lone        func(identity bool) side
}

func worlds(t *testing.T) []world {
	t.Helper()
	return []world{
		realWorld(t),
		fakeWorld(t, "fake", func() Tree { return newMemoryTree() }),
		fakeWorld(t, "fake over a folder", func() Tree { return folderTree{t.TempDir()} }),
	}
}

func realWorld(t *testing.T) world {
	t.Helper()
	var clock atomic.Int64
	clock.Store(seedSecond)
	run := func(one proc.Command) proc.Said {
		stamp := "@" + strconv.FormatInt(clock.Load(), 10) + " +0000"
		one.Env = append(one.Env, "GIT_CONFIG_GLOBAL="+os.DevNull, "GIT_CONFIG_NOSYSTEM=1", "GIT_AUTHOR_DATE="+stamp, "GIT_COMMITTER_DATE="+stamp)
		return proc.Real(one)
	}
	raw := func(dir string, args ...string) string {
		t.Helper()
		said := run(proc.Command{Argv: append([]string{"git"}, args...), Dir: dir})
		if said.Code != 0 {
			t.Fatalf("git %v answers %d: %s", args, said.Code, said.Err)
		}
		return strings.TrimSpace(said.Out)
	}
	open := func(root string) side {
		at := func(path string) string { return filepath.Join(root, filepath.FromSlash(path)) }
		return side{
			Repo: NewRepo(root, run),
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
	origin, here, there := t.TempDir(), t.TempDir(), t.TempDir()
	raw(origin, "init", "--quiet", "--bare", "--initial-branch=main")
	raw(here, "init", "--quiet", "--initial-branch=main")
	raw(here, "remote", "add", "origin", origin)
	w := world{name: "real", origin: NewRepo(origin, run), here: clone(here), at: clock.Store}
	w.here.write("README.md", seedText)
	w.seed = w.here.commit("seed")
	raw(here, "push", "--quiet", "-u", "origin", "main")
	raw(there, "clone", "--quiet", origin, ".")
	w.there = clone(there)
	w.lone = func(identity bool) side {
		root := t.TempDir()
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
	clone := func() side {
		tree := disk()
		repo := origin.Clone(tree)
		repo.Set("user.name", hand)
		repo.Set("user.email", handMail)
		return open(repo, tree)
	}
	w := world{name: name, origin: origin, here: clone(), at: clock.Store}
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

func TestRepoCountsTheCommitsOneRefStandsAheadOfAnother(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("c.txt", "1\n")
		w.here.commit("c1")
		w.here.write("c.txt", "2\n")
		w.here.commit("c2")
		if said, ok := w.here.Count("origin/main", "main"); !ok || said != 2 {
			t.Errorf("the %s repo counts main %d, %v ahead of origin/main", w.name, said, ok)
		}
		if said, ok := w.here.Count("main", "origin/main"); !ok || said != 0 {
			t.Errorf("the %s repo counts origin/main %d, %v ahead of main", w.name, said, ok)
		}
		if said, ok := w.here.Count("no-such-ref", "main"); ok {
			t.Errorf("the %s repo counts %d from a missing ref", w.name, said)
		}
	}
}

func TestRepoMergeBaseNamesTheCommonCommit(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if err := w.here.Branch("side", "HEAD"); err != nil {
			t.Errorf("the %s repo's branch answers %v", w.name, err)
		}
		w.here.write("c.txt", "1\n")
		w.here.commit("c1")
		if said, ok := w.here.MergeBase("main", "side"); !ok || said != w.seed {
			t.Errorf("the %s repo names %q, %v as the merge base, and the seed stands at %q", w.name, said, ok, w.seed)
		}
		if said, ok := w.here.MergeBase("main", "no-such-ref"); ok {
			t.Errorf("the %s repo names %q as the merge base with a missing ref", w.name, said)
		}
	}
}

func TestRepoIsAncestorAnswersWhetherOneCommitLeadsToAnother(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("c.txt", "1\n")
		next := w.here.commit("c1")
		if !w.here.IsAncestor(w.seed, next) || !w.here.IsAncestor(w.seed, w.seed) {
			t.Errorf("the %s repo reads the seed as no ancestor of the commit after it or of itself", w.name)
		}
		if w.here.IsAncestor(next, w.seed) {
			t.Errorf("the %s repo reads a commit as an ancestor of its parent", w.name)
		}
	}
}

func TestRepoLogListsTheCommitsOverARangeAlongTheAncestryPath(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("h.txt", "1\n")
		first := w.here.commit("h1")
		w.here.write("h.txt", "2\n")
		second := w.here.commit("h2")
		w.there.write("x.txt", "x\n")
		w.there.commit("x1")
		w.there.push("main")
		w.here.fetch("main")
		ours := []Commit{{Hash: second, Subject: "h2"}, {Hash: first, Subject: "h1"}}
		if said, err := w.here.Log("origin/main", "HEAD", false); err != nil || !reflect.DeepEqual(said, ours) {
			t.Errorf("the %s repo logs %+v, %v over the range, and wants %+v", w.name, said, err, ours)
		}
		if said, err := w.here.Log("origin/main", "HEAD", true); err != nil || len(said) != 0 {
			t.Errorf("the %s repo logs %+v, %v along an ancestry path from a commit off it", w.name, said, err)
		}
		if said, err := w.here.Log(w.seed, "HEAD", true); err != nil || !reflect.DeepEqual(said, ours) {
			t.Errorf("the %s repo logs %+v, %v along the ancestry path from the seed", w.name, said, err)
		}
	}
}

func TestRepoChangedNamesThePathsOneCommitChangesWithTheirStatus(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("old.txt", "old\n")
		w.here.commit("old")
		w.here.write("README.md", "changed\n")
		w.here.write("new.txt", "new\n")
		w.here.remove("old.txt")
		commit := w.here.commit("change")
		want := []Change{{Status: "M", Path: "README.md"}, {Status: "A", Path: "new.txt"}, {Status: "D", Path: "old.txt"}}
		if said, err := w.here.Changed(commit); err != nil || !reflect.DeepEqual(byPath(said), want) {
			t.Errorf("the %s repo names %+v, %v changed, and wants %+v", w.name, said, err, want)
		}
	}
}

func TestRepoDiffNamesThePathsTwoRefsDifferInAndReadsAMoveAsAMove(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("keep.txt", "a line nobody else holds\n")
		w.here.write("gone.txt", "gone\n")
		base := w.here.commit("base")
		w.here.remove("keep.txt")
		w.here.write("moved.txt", "a line nobody else holds\n")
		w.here.remove("gone.txt")
		w.here.write("README.md", "changed\n")
		w.here.write("new.txt", "new\n")
		w.here.commit("moves")
		want := []Change{{Status: "M", Path: "README.md"}, {Status: "D", Path: "gone.txt"}, {Status: "R", Path: "moved.txt", From: "keep.txt"}, {Status: "A", Path: "new.txt"}}
		if said, err := w.here.Diff(base, "HEAD"); err != nil || !reflect.DeepEqual(byPath(said), want) {
			t.Errorf("the %s repo's diff answers %+v, %v, and wants %+v", w.name, said, err, want)
		}
	}
}

func TestRepoAddedNamesTheSecondEachPathUnderAFolderCameIn(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.at(2000)
		w.here.write("spec/tickets/a.md", "a\n")
		w.here.commit("a")
		w.at(3000)
		w.here.write("spec/tickets/b.md", "b\n")
		w.here.write("notes/c.md", "c\n")
		w.here.commit("b")
		w.at(4000)
		w.here.write("spec/tickets/a.md", "a again\n")
		w.here.commit("a again")
		want := map[string]int64{"spec/tickets/a.md": 2000, "spec/tickets/b.md": 3000}
		if said, err := w.here.Added("spec/tickets"); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo answers %v, %v, and wants %v", w.name, said, err, want)
		}
	}
}

func TestRepoSignatureReadsNoSignatureOnAnUnsignedCommit(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		for _, ref := range []string{"HEAD", w.seed} {
			if said := w.here.Signature(ref); said != "N" {
				t.Errorf("the %s repo reads the signature of %s as %q", w.name, ref, said)
			}
		}
	}
}

func TestRepoConfigReadsAKeySetAndNothingForOneUnset(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if said, ok := w.here.Config("user.name"); !ok || said != hand {
			t.Errorf("the %s repo reads user.name as %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Config("quack.unset"); ok || said != "" {
			t.Errorf("the %s repo reads an unset key as %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoBranchCutsABranchAtARefAndRefusesOneStanding(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if err := w.here.Branch("side", "main"); err != nil {
			t.Errorf("the %s repo's branch answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("side"); !ok || said != w.seed {
			t.Errorf("the %s repo cuts side at %q, %v", w.name, said, ok)
		}
		if err := w.here.Branch("side", "main"); err == nil {
			t.Errorf("the %s repo cuts a branch standing already", w.name)
		}
		if head, err := w.here.Head(); err != nil || head != "main" {
			t.Errorf("the %s repo's head moves to %q, %v", w.name, head, err)
		}
	}
}

func TestRepoPushMovesTheBranchOnOriginAndItsTrackingRef(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("h.txt", "1\n")
		commit := w.here.commit("h1")
		if pushed := w.here.Push("main", false); !pushed.OK || pushed.Moved {
			t.Errorf("the %s repo's push answers %+v", w.name, pushed)
		}
		if said, ok := w.origin.Resolve("refs/heads/main"); !ok || said != commit {
			t.Errorf("the %s origin holds main at %q, %v, and the push names %q", w.name, said, ok, commit)
		}
		if said, ok := w.here.Resolve("refs/remotes/origin/main"); !ok || said != commit {
			t.Errorf("the %s repo tracks origin/main at %q, %v", w.name, said, ok)
		}
		if err := w.here.Branch("work/g", "HEAD"); err != nil {
			t.Errorf("the %s repo's branch answers %v", w.name, err)
		}
		if pushed := w.here.Push("work/g", true); !pushed.OK {
			t.Errorf("the %s repo's push of a new branch answers %+v", w.name, pushed)
		}
		if said, ok := w.origin.Resolve("refs/heads/work/g"); !ok || said != commit {
			t.Errorf("the %s origin holds work/g at %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Config("branch.work/g.remote"); !ok || said != "origin" {
			t.Errorf("the %s repo sets work/g's upstream to %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoPushRefusesABranchOriginMovedAndSaysItMoved(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("x.txt", "x\n")
		theirs := w.there.commit("x1")
		w.there.push("main")
		w.here.write("h.txt", "h\n")
		w.here.commit("h1")
		if pushed := w.here.Push("main", false); pushed.OK || !pushed.Moved || pushed.Err == "" {
			t.Errorf("the %s repo's push past a moved origin answers %+v", w.name, pushed)
		}
		if said, ok := w.origin.Resolve("refs/heads/main"); !ok || said != theirs {
			t.Errorf("the %s origin holds main at %q, %v, and the other clone pushed %q", w.name, said, ok, theirs)
		}
	}
}

func TestRepoFetchMovesTheTrackingRefAndLeavesTheBranch(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("x.txt", "x\n")
		theirs := w.there.commit("x1")
		w.there.push("main")
		if err := w.here.Fetch("main"); err != nil {
			t.Errorf("the %s repo's fetch answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("origin/main"); !ok || said != theirs {
			t.Errorf("the %s repo tracks origin/main at %q, %v, and origin holds %q", w.name, said, ok, theirs)
		}
		if said, ok := w.here.Resolve("main"); !ok || said != w.seed {
			t.Errorf("the %s repo's main moves to %q, %v on a fetch", w.name, said, ok)
		}
	}
}

func TestRepoFastForwardMovesTheBranchAndRefusesADivergence(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("README.md", "theirs\n")
		theirs := w.there.commit("x1")
		w.there.push("main")
		w.here.fetch("main")
		if err := w.here.FastForward("origin/main"); err != nil {
			t.Errorf("the %s repo's fast-forward answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("main"); !ok || said != theirs {
			t.Errorf("the %s repo's main stands at %q, %v after the fast-forward", w.name, said, ok)
		}
		if said, ok := w.here.read("README.md"); !ok || said != "theirs\n" {
			t.Errorf("the %s repo's work tree holds README.md as %q, %v", w.name, said, ok)
		}
		w.here.write("h.txt", "h\n")
		ours := w.here.commit("h1")
		w.there.write("x.txt", "x\n")
		w.there.commit("x2")
		w.there.push("main")
		w.here.fetch("main")
		if err := w.here.FastForward("origin/main"); err == nil {
			t.Errorf("the %s repo fast-forwards over a divergence", w.name)
		}
		if said, ok := w.here.Resolve("main"); !ok || said != ours {
			t.Errorf("the %s repo's main moves to %q, %v on a refused fast-forward", w.name, said, ok)
		}
	}
}

func TestRepoRebaseReplaysLocalCommitsOntoARef(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("a.txt", "theirs\n")
		theirs := w.there.commit("theirs")
		w.there.push("main")
		w.here.write("b.txt", "ours\n")
		w.here.commit("ours")
		w.here.fetch("main")
		if err := w.here.Rebase("origin/main"); err != nil {
			t.Errorf("the %s repo's rebase answers %v", w.name, err)
		}
		if !w.here.IsAncestor(theirs, "HEAD") {
			t.Errorf("the %s repo's HEAD stands off origin's commit after the rebase", w.name)
		}
		if said, err := w.here.Log(theirs, "HEAD", false); err != nil || !reflect.DeepEqual(subjects(said), []string{"ours"}) {
			t.Errorf("the %s repo replays %+v, %v onto origin's commit", w.name, said, err)
		}
		for path, want := range map[string]string{"a.txt": "theirs\n", "b.txt": "ours\n"} {
			if said, ok := w.here.read(path); !ok || said != want {
				t.Errorf("the %s repo's work tree holds %s as %q, %v", w.name, path, said, ok)
			}
		}
		if head, err := w.here.Head(); err != nil || head != "main" {
			t.Errorf("the %s repo's head stands on %q, %v after the rebase", w.name, head, err)
		}
	}
}

func TestRepoRebaseThatConflictsLeavesTheBranchAsItStood(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("README.md", "theirs\n")
		w.there.commit("theirs")
		w.there.push("main")
		w.here.write("README.md", "ours\n")
		ours := w.here.commit("ours")
		w.here.fetch("main")
		if err := w.here.Rebase("origin/main"); err == nil {
			t.Errorf("the %s repo rebases a conflict clean", w.name)
		}
		if said, ok := w.here.Resolve("HEAD"); !ok || said != ours {
			t.Errorf("the %s repo's HEAD moves to %q, %v", w.name, said, ok)
		}
		if head, err := w.here.Head(); err != nil || head != "main" {
			t.Errorf("the %s repo's head stands on %q, %v after the abort", w.name, head, err)
		}
		if said, ok := w.here.read("README.md"); !ok || said != "ours\n" {
			t.Errorf("the %s repo's work tree holds README.md as %q, %v", w.name, said, ok)
		}
		if said := status(t, w.here, false); len(said) != 0 {
			t.Errorf("the %s repo stands at %+v after the abort", w.name, said)
		}
		if said, err := w.here.Unmerged(); err != nil || len(said) != 0 {
			t.Errorf("the %s repo names %v, %v unmerged after the abort", w.name, said, err)
		}
	}
}

func TestRepoRemoteHeadsListsTheBranchesOriginHoldsUnderAPrefix(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		for _, branch := range []string{"work/b", "work/a", "other"} {
			w.here.cut(branch)
			w.here.push(branch)
		}
		if said, err := w.here.RemoteHeads("work/"); err != nil || !reflect.DeepEqual(said, []string{"work/a", "work/b"}) {
			t.Errorf("the %s repo lists %v, %v on origin under work/", w.name, said, err)
		}
	}
}

func TestRepoRefsListsTheTrackingRefsUnderAPrefixWithTheirCommits(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.cut("work/a")
		w.here.write("c.txt", "c\n")
		next := w.here.commit("c1")
		w.here.cut("work/b")
		w.here.push("work/a")
		w.here.push("work/b")
		want := []Ref{{Name: "refs/remotes/origin/work/a", Hash: w.seed}, {Name: "refs/remotes/origin/work/b", Hash: next}}
		if said, err := w.here.Refs("refs/remotes/origin/work/"); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo lists %+v, %v, and wants %+v", w.name, said, err, want)
		}
	}
}

// A merge of side into main, both changing README.md: the commit main holds, the commit side holds, and what the merge answers. [[spec/design_output/doors#the-git-door-carries-writes]]
func merging(t *testing.T, w world) (ours, theirs string, conflicts []string, err error) {
	t.Helper()
	if err := w.here.Switch("side", true); err != nil {
		t.Errorf("the %s repo's switch to a new side answers %v", w.name, err)
	}
	w.here.write("README.md", "side\n")
	theirs = w.here.commit("side")
	if err := w.here.Switch("main", false); err != nil {
		t.Errorf("the %s repo's switch to main answers %v", w.name, err)
	}
	w.here.write("README.md", "main\n")
	ours = w.here.commit("main")
	conflicts, err = w.here.Merge("side")
	return ours, theirs, conflicts, err
}

func TestRepoStagedNamesTheIndexChangesAgainstHeadAndReadsAStagedMoveAsAMove(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("keep.txt", "a line nobody else holds\n")
		w.here.write("gone.txt", "gone\n")
		w.here.commit("base")
		w.here.remove("keep.txt")
		w.here.write("moved.txt", "a line nobody else holds\n")
		w.here.remove("gone.txt")
		w.here.write("README.md", "changed\n")
		w.here.write("new.txt", "new\n")
		if err := w.here.AddAll(); err != nil {
			t.Errorf("the %s repo's add of everything answers %v", w.name, err)
		}
		w.here.write("loose.txt", "loose\n")
		want := []Change{{Status: "M", Path: "README.md"}, {Status: "D", Path: "gone.txt"}, {Status: "R", Path: "moved.txt", From: "keep.txt"}, {Status: "A", Path: "new.txt"}}
		if said, err := w.here.Staged(nil); err != nil || !reflect.DeepEqual(byPath(said), want) {
			t.Errorf("the %s repo stages %+v, %v, and wants %+v", w.name, said, err, want)
		}
		only := []Change{{Status: "M", Path: "README.md"}, {Status: "A", Path: "new.txt"}}
		if said, err := w.here.Staged([]string{"README.md", "new.txt"}); err != nil || !reflect.DeepEqual(byPath(said), only) {
			t.Errorf("the %s repo stages %+v, %v under the paths named, and wants %+v", w.name, said, err, only)
		}
	}
}

func TestRepoAddOfARemovedPathStagesItsDeletionAndAMovedFolderStagesBothSides(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("dir/a.txt", "a\n")
		w.here.write("dir/b.txt", "b\n")
		w.here.commit("dir")
		w.here.remove("README.md")
		w.here.remove("dir/a.txt")
		w.here.remove("dir/b.txt")
		w.here.write("moved/a.txt", "a\n")
		w.here.write("moved/b.txt", "b\n")
		if err := w.here.Add([]string{"README.md"}); err != nil {
			t.Errorf("the %s repo's add of a removed path answers %v", w.name, err)
		}
		if err := w.here.Add([]string{"dir", "moved"}); err != nil {
			t.Errorf("the %s repo's add of a moved folder answers %v", w.name, err)
		}
		for path, want := range map[string]bool{"README.md": false, "dir/a.txt": false, "dir/b.txt": false, "moved/a.txt": true, "moved/b.txt": true} {
			if said := w.here.Tracked(path); said != want {
				t.Errorf("the %s repo answers %v on whether its index holds %s after the add", w.name, said, path)
			}
		}
		if _, err := w.here.Commit("moves", nil); err != nil {
			t.Errorf("the %s repo's commit answers %v", w.name, err)
		}
		for _, path := range []string{"README.md", "dir/a.txt"} {
			if said, ok := w.here.Show("HEAD", path); ok {
				t.Errorf("the %s repo's commit holds %s as %q", w.name, path, said)
			}
		}
		if said, ok := w.here.Show("HEAD", "moved/a.txt"); !ok || said != "a\n" {
			t.Errorf("the %s repo's commit holds moved/a.txt as %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoAddOfAPathStandingNowhereRefusesAndNamesThePath(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("a.txt", "a\n")
		if err := w.here.Add([]string{"a.txt", "nowhere.txt"}); err == nil || !strings.Contains(err.Error(), "nowhere.txt") {
			t.Errorf("the %s repo's add of a path standing nowhere answers %v", w.name, err)
		}
	}
}

func TestRepoTrackedAnswersTrueForAFolderHoldingATrackedPath(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("dir/deep/a.txt", "a\n")
		w.here.commit("dir")
		w.here.write("loose/b.txt", "b\n")
		for path, want := range map[string]bool{"dir": true, "dir/deep": true, "loose": false, "nowhere": false} {
			if said := w.here.Tracked(path); said != want {
				t.Errorf("the %s repo answers %v on whether its index holds the folder %s", w.name, said, path)
			}
		}
	}
}

func TestRepoResolvesAParentByItsSuffixAndNoSecondParentOnAPlainCommit(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("c.txt", "1\n")
		next := w.here.commit("c1")
		for _, ref := range []string{"HEAD~1", "HEAD^", "HEAD^1", next + "~1"} {
			if said, ok := w.here.Resolve(ref); !ok || said != w.seed {
				t.Errorf("the %s repo resolves %s to %q, %v, and the seed stands at %q", w.name, ref, said, ok, w.seed)
			}
		}
		if said, ok := w.here.Resolve("HEAD^2"); ok || said != "" {
			t.Errorf("the %s repo resolves a plain commit's second parent to %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoSwitchMovesHeadAndTheWorkTreeAndCutsABranchOnAsk(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if err := w.here.Switch("side", true); err != nil {
			t.Errorf("the %s repo's switch to a new side answers %v", w.name, err)
		}
		if head, err := w.here.Head(); err != nil || head != "side" {
			t.Errorf("the %s repo's head stands on %q, %v after the switch to a new side", w.name, head, err)
		}
		w.here.write("side.txt", "side\n")
		w.here.commit("side")
		if err := w.here.Switch("main", false); err != nil {
			t.Errorf("the %s repo's switch to main answers %v", w.name, err)
		}
		if head, err := w.here.Head(); err != nil || head != "main" {
			t.Errorf("the %s repo's head stands on %q, %v after the switch to main", w.name, head, err)
		}
		if said, ok := w.here.read("side.txt"); ok {
			t.Errorf("the %s repo's work tree on main holds side.txt as %q", w.name, said)
		}
		if err := w.here.Switch("side", false); err != nil {
			t.Errorf("the %s repo's switch back to side answers %v", w.name, err)
		}
		if said, ok := w.here.read("side.txt"); !ok || said != "side\n" {
			t.Errorf("the %s repo's work tree on side holds side.txt as %q, %v", w.name, said, ok)
		}
		if err := w.here.Switch("no-such-branch", false); err == nil {
			t.Errorf("the %s repo switches to a branch standing nowhere", w.name)
		}
		if err := w.here.Switch("main", true); err == nil {
			t.Errorf("the %s repo cuts a branch standing already", w.name)
		}
	}
}

func TestRepoMergeOfAPathOneSideAloneChangesLandsClean(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if err := w.here.Switch("side", true); err != nil {
			t.Errorf("the %s repo's switch to a new side answers %v", w.name, err)
		}
		w.here.write("README.md", "side\n")
		theirs := w.here.commit("side")
		if err := w.here.Switch("main", false); err != nil {
			t.Errorf("the %s repo's switch to main answers %v", w.name, err)
		}
		w.here.write("b.txt", "b\n")
		ours := w.here.commit("main")
		if said, err := w.here.Merge("side"); err != nil || len(said) != 0 {
			t.Errorf("the %s repo's merge answers %v, %v", w.name, said, err)
		}
		for path, want := range map[string]string{"README.md": "side\n", "b.txt": "b\n"} {
			if said, ok := w.here.read(path); !ok || said != want {
				t.Errorf("the %s repo's work tree holds %s as %q, %v after the merge", w.name, path, said, ok)
			}
		}
		for ref, want := range map[string]string{"HEAD^1": ours, "HEAD^2": theirs} {
			if said, ok := w.here.Resolve(ref); !ok || said != want {
				t.Errorf("the %s repo's merge commit holds %s at %q, %v, and wants %q", w.name, ref, said, ok, want)
			}
		}
		if said, err := w.here.Unmerged(); err != nil || len(said) != 0 {
			t.Errorf("the %s repo names %v, %v unmerged after a clean merge", w.name, said, err)
		}
	}
}

func TestRepoMergeThatConflictsNamesThePathLeavesItUnmergedAndMarksTheWorkTree(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		_, _, conflicts, err := merging(t, w)
		if err == nil || !reflect.DeepEqual(conflicts, []string{"README.md"}) {
			t.Errorf("the %s repo's merge answers %v, %v, and wants a conflict on README.md", w.name, conflicts, err)
		}
		if said, err := w.here.Unmerged(); err != nil || !reflect.DeepEqual(said, []string{"README.md"}) {
			t.Errorf("the %s repo names %v, %v unmerged", w.name, said, err)
		}
		said, _ := w.here.read("README.md")
		for _, mark := range []string{"<<<<<<<", "main\n", "=======", "side\n", ">>>>>>>"} {
			if !strings.Contains(said, mark) {
				t.Errorf("the %s repo's work tree holds README.md as %q, with no %q", w.name, said, mark)
			}
		}
	}
}

func TestRepoResetOfPathsMidMergeLeavesTheMergeStanding(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		_, theirs, _, _ := merging(t, w)
		w.here.write("README.md", "merged\n")
		for _, paths := range [][]string{{"README.md"}, {"."}} {
			if err := w.here.Add([]string{"README.md"}); err != nil {
				t.Errorf("the %s repo's add answers %v", w.name, err)
			}
			if err := w.here.Reset(paths); err != nil {
				t.Errorf("the %s repo's reset of %v answers %v", w.name, paths, err)
			}
			if said, ok := w.here.Resolve("MERGE_HEAD"); !ok || said != theirs {
				t.Errorf("the %s repo holds MERGE_HEAD at %q, %v after the reset of %v, and the side stands at %q", w.name, said, ok, paths, theirs)
			}
		}
	}
}

func TestRepoCommitMidMergeConcludesItWithTwoParents(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		ours, theirs, _, _ := merging(t, w)
		w.here.write("README.md", "merged\n")
		if err := w.here.Add([]string{"README.md"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		if _, err := w.here.Commit("merged", nil); err != nil {
			t.Errorf("the %s repo's commit mid-merge answers %v", w.name, err)
		}
		for ref, want := range map[string]string{"HEAD^1": ours, "HEAD^2": theirs} {
			if said, ok := w.here.Resolve(ref); !ok || said != want {
				t.Errorf("the %s repo's commit holds %s at %q, %v, and wants %q", w.name, ref, said, ok, want)
			}
		}
		if said, ok := w.here.Resolve("MERGE_HEAD"); ok {
			t.Errorf("the %s repo still holds MERGE_HEAD at %q after the commit", w.name, said)
		}
		if said, ok := w.here.Show("HEAD", "README.md"); !ok || said != "merged\n" {
			t.Errorf("the %s repo's merge commit holds README.md as %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoSoftResetMovesHeadBackAndKeepsTheChangeStaged(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("a.txt", "a\n")
		w.here.commit("a")
		if err := w.here.SoftReset("HEAD~1"); err != nil {
			t.Errorf("the %s repo's soft reset answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("HEAD"); !ok || said != w.seed {
			t.Errorf("the %s repo's HEAD stands at %q, %v after the soft reset, and the seed stands at %q", w.name, said, ok, w.seed)
		}
		if said, want := status(t, w.here, false), []Change{{Status: "A ", Path: "a.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the soft reset, and wants %+v", w.name, said, want)
		}
		if said, ok := w.here.read("a.txt"); !ok || said != "a\n" {
			t.Errorf("the %s repo's work tree holds a.txt as %q, %v", w.name, said, ok)
		}
	}
}

func TestRepoUpdateRefOfMergeHeadOpensTheMergeAgain(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		ours, theirs, _, _ := merging(t, w)
		w.here.write("README.md", "merged\n")
		if err := w.here.Add([]string{"README.md"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		if _, err := w.here.Commit("merged", nil); err != nil {
			t.Errorf("the %s repo's commit mid-merge answers %v", w.name, err)
		}
		if err := w.here.SoftReset("HEAD~1"); err != nil {
			t.Errorf("the %s repo's soft reset answers %v", w.name, err)
		}
		if err := w.here.UpdateRef("MERGE_HEAD", theirs); err != nil {
			t.Errorf("the %s repo's update of MERGE_HEAD answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("MERGE_HEAD"); !ok || said != theirs {
			t.Errorf("the %s repo holds MERGE_HEAD at %q, %v, and the side stands at %q", w.name, said, ok, theirs)
		}
		if _, err := w.here.Commit("merged again", nil); err != nil {
			t.Errorf("the %s repo's commit of the merge opened again answers %v", w.name, err)
		}
		for ref, want := range map[string]string{"HEAD^1": ours, "HEAD^2": theirs} {
			if said, ok := w.here.Resolve(ref); !ok || said != want {
				t.Errorf("the %s repo's commit holds %s at %q, %v, and wants %q", w.name, ref, said, ok, want)
			}
		}
	}
}

func TestRepoCommitWhereNoIdentityStandsRefusesAndLeavesTheIndex(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		lone := w.lone(false)
		lone.write("a.txt", "a\n")
		if err := lone.Add([]string{"a.txt"}); err != nil {
			t.Errorf("the %s repo's add answers %v", w.name, err)
		}
		if hash, err := lone.Commit("no hand", nil); err == nil {
			t.Errorf("the %s repo commits with no identity as %q", w.name, hash)
		}
		if said, want := status(t, lone, false), []Change{{Status: "A ", Path: "a.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the refused commit, and wants %+v", w.name, said, want)
		}
	}
}

func TestRepoPushWithNoOriginRefusesAndSaysWhy(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		lone := w.lone(true)
		lone.write("a.txt", "a\n")
		lone.commit("a")
		if pushed := lone.Push("main", false); pushed.OK || !strings.Contains(pushed.Err, "origin") {
			t.Errorf("the %s repo's push with no origin answers %+v", w.name, pushed)
		}
	}
}

func TestRepoHeadBeforeTheFirstCommitAnswersAFault(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if head, err := w.lone(true).Head(); err == nil {
			t.Errorf("the %s repo names %q before its first commit", w.name, head)
		}
	}
}

func TestRepoHistoryListsTheCommitsTouchingAPathNewestFirst(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("a.txt", "1\n")
		first := w.here.commit("a1")
		w.here.write("b.txt", "b\n")
		w.here.commit("b1")
		w.here.write("a.txt", "2\n")
		second := w.here.commit("a2")
		want := []Commit{{Hash: second, Subject: "a2"}, {Hash: first, Subject: "a1"}}
		if said, err := w.here.History("a.txt"); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo's history of a.txt answers %+v, %v, and wants %+v", w.name, said, err, want)
		}
		if said, err := w.here.History("missing.txt"); err != nil || len(said) != 0 {
			t.Errorf("the %s repo's history of a path no commit touches answers %+v, %v", w.name, said, err)
		}
	}
}

// The commit a branch opens on, off trunk's tree, as take.go's markOff cuts it. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestRepoCommitsATreeOntoAParentAndMovesNoRef(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "next\n")
		next := w.here.commit("next")
		hash, err := w.here.CommitTree("HEAD", w.seed, "opens")
		if err != nil || len(hash) != hashLength || hash == next {
			t.Errorf("the %s repo's commit of a tree answers %q, %v", w.name, hash, err)
		}
		if head, ok := w.here.Resolve("HEAD"); !ok || head != next {
			t.Errorf("the %s repo's HEAD moves to %q, %v, and stood at %q", w.name, head, ok, next)
		}
		if said, ok := w.here.Show(hash, "README.md"); !ok || said != "next\n" {
			t.Errorf("the %s repo's new commit holds README.md as %q, %v", w.name, said, ok)
		}
		if parent, ok := w.here.Resolve(hash + "^"); !ok || parent != w.seed {
			t.Errorf("the %s repo's new commit stands on %q, %v, and wants the seed %q", w.name, parent, ok, w.seed)
		}
		if said, err := w.here.Log(w.seed, hash, false); err != nil || !reflect.DeepEqual(said, []Commit{{Hash: hash, Subject: "opens"}}) {
			t.Errorf("the %s repo logs %+v, %v past the seed to the new commit", w.name, said, err)
		}
	}
}

// A trunk carrying a branch's commit by its patch, as merge.go's mergeCloud counts what stays to take. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestRepoNamesTheCommitsATrunkCarriesByPatch(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("a.txt", "a\n")
		w.there.commit("a")
		w.there.write("b.txt", "b\n")
		b := w.there.commit("b")
		w.there.push("main")
		w.at(2000)
		w.here.write("a.txt", "a\n")
		w.here.commit("a again")
		w.here.fetch("main")
		if said, err := w.here.Cherry("HEAD", "origin/main"); err != nil || !reflect.DeepEqual(said, []string{b}) {
			t.Errorf("the %s repo names %v, %v as the commits HEAD lacks by patch, and wants [%s]", w.name, said, err, b)
		}
		if said, err := w.here.Cherry("origin/main", "origin/main"); err != nil || len(said) != 0 {
			t.Errorf("the %s repo names %v, %v as the commits a ref lacks of itself", w.name, said, err)
		}
	}
}

// The refs origin holds past its branches, as merge.go's pullCarrying reads the pull requests' heads. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestRepoListsTheRefsOriginHoldsUnderAPrefix(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("c.txt", "c\n")
		next := w.here.commit("c1")
		w.here.cut("work/a")
		w.here.push("work/a")
		for name, hash := range map[string]string{"refs/pull/7/head": next, "refs/pull/3/head": w.seed} {
			if err := w.origin.UpdateRef(name, hash); err != nil {
				t.Fatalf("the %s origin's update of %s answers %v", w.name, name, err)
			}
		}
		want := []Ref{{Name: "refs/pull/3/head", Hash: w.seed}, {Name: "refs/pull/7/head", Hash: next}}
		if said, err := w.here.RemoteRefs("refs/pull/"); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo lists %+v, %v on origin under refs/pull/, and wants %+v", w.name, said, err, want)
		}
		if said, err := w.here.RemoteRefs("refs/heads/work/"); err != nil || !reflect.DeepEqual(said, []Ref{{Name: "refs/heads/work/a", Hash: next}}) {
			t.Errorf("the %s repo lists %+v, %v on origin under refs/heads/work/", w.name, said, err)
		}
	}
}

// A parked note's path put back as HEAD holds it, as take.go's onBranch clears the way to a switch. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestRepoRestoresAPathFromHead(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "changed\n")
		w.here.write("loose.txt", "loose\n")
		if err := w.here.Restore("README.md"); err != nil {
			t.Errorf("the %s repo's restore answers %v", w.name, err)
		}
		if said, ok := w.here.read("README.md"); !ok || said != seedText {
			t.Errorf("the %s repo's work tree holds README.md as %q, %v after the restore", w.name, said, ok)
		}
		if said, want := status(t, w.here, true), []Change{{Status: "??", Path: "loose.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the restore, and wants %+v", w.name, said, want)
		}
		if err := w.here.Restore("missing.md"); err == nil {
			t.Errorf("the %s repo restores a path HEAD never held", w.name)
		}
	}
}

// The listing's tickets at every ref in one ask, as doors.go's batch reads them. [[spec/tickets/branch-verbs-meet-fake-git]]
func TestRepoReadsManyFilesAtRefsInOneAsk(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "next\n")
		w.here.write("notes/a.md", "a\n")
		w.here.commit("next")
		asks := []string{w.seed + ":README.md", "HEAD:README.md", "HEAD:notes/a.md", "HEAD:missing.md", "no-such-ref:README.md"}
		want := map[string]string{w.seed + ":README.md": seedText, "HEAD:README.md": "next\n", "HEAD:notes/a.md": "a\n"}
		if said, err := w.here.ShowMany(asks); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo reads %v, %v, and wants %v", w.name, said, err, want)
		}
		if said, err := w.here.ShowMany(nil); err != nil || len(said) != 0 {
			t.Errorf("the %s repo reads %v, %v off no ask", w.name, said, err)
		}
	}
}

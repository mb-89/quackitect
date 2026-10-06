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

	"quackitect/src/modules/files"
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

// An origin, two clones of it on main, the seed commit both hold, and the clock commits read. [[spec/design_output/doors#the-git-door-carries-writes]]
type world struct {
	name        string
	origin      Repo
	here, there side
	seed        string
	at          func(second int64)
}

func worlds(t *testing.T) []world {
	t.Helper()
	return []world{realWorld(t), fakeWorld(t)}
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
	clone := func(root string) side {
		raw(root, "config", "user.name", hand)
		raw(root, "config", "user.email", handMail)
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
	return w
}

func fakeWorld(t *testing.T) world {
	t.Helper()
	var clock atomic.Int64
	clock.Store(seedSecond)
	origin := NewFakeRepo(files.NewFakeDisk(), func() time.Time { return time.Unix(clock.Load(), 0) })
	clone := func() side {
		tree := files.NewFakeDisk()
		repo := origin.Clone(tree)
		repo.Set("user.name", hand)
		repo.Set("user.email", handMail)
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
	w := world{name: "fake", origin: origin, here: clone(), at: clock.Store}
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

// The git door's contract on amends, hard and keeping resets, the files and
// patches a ref holds, worktrees, shallow clones and hooks, each case run in
// the worlds repo_contract_test.go builds. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"reflect"
	"strings"
	"testing"
)

// The index folded into HEAD's commit, its parent and its subject kept, as the merge lands the freed children. [[spec/design_output/work#the-merge-frees-the-tickets]]
func TestRepoAmendFoldsTheIndexIntoHeadsCommit(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("a.txt", "a\n")
		first := w.here.commit("a")
		w.here.write("b.txt", "b\n")
		if err := w.here.Add([]string{"b.txt"}); err != nil {
			t.Fatal(err)
		}
		if err := w.here.Amend(); err != nil {
			t.Errorf("the %s repo's amend answers %v", w.name, err)
		}
		head, _ := w.here.Resolve("HEAD")
		if head == first {
			t.Errorf("the %s repo's amend leaves HEAD at %q", w.name, head)
		}
		if said, ok := w.here.Resolve("HEAD^"); !ok || said != w.seed {
			t.Errorf("the %s repo's amended commit stands on %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Show("HEAD", "b.txt"); !ok || said != "b\n" {
			t.Errorf("the %s repo's amended commit holds b.txt as %q, %v", w.name, said, ok)
		}
		if said, err := w.here.Log(w.seed, "HEAD", false); err != nil || !reflect.DeepEqual(subjects(said), []string{"a"}) {
			t.Errorf("the %s repo logs %+v, %v past the seed", w.name, said, err)
		}
	}
}

// A hard reset drops a local change, and a keeping one refuses to lose one, as the merge and the take put a branch back. [[spec/design_output/work#the-take-writes-the-record]]
func TestRepoResetToMovesTheBranchAndAKeepingOneRefusesToLoseAChange(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("x.txt", "x\n")
		w.here.commit("x")
		w.here.write("README.md", "dirty\n")
		w.here.write("loose.txt", "loose\n")
		if err := w.here.ResetTo(w.seed, true); err != nil {
			t.Errorf("the %s repo's hard reset answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("HEAD"); !ok || said != w.seed {
			t.Errorf("the %s repo's HEAD stands at %q, %v after the hard reset", w.name, said, ok)
		}
		if said, want := status(t, w.here, true), []Change{{Status: "??", Path: "loose.txt"}}; !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo stands at %+v after the hard reset, and wants %+v", w.name, said, want)
		}
		w.here.write("y.txt", "y\n")
		y := w.here.commit("y")
		w.here.write("y.txt", "dirty\n")
		if err := w.here.ResetTo(w.seed, false); err == nil {
			t.Errorf("the %s repo's keeping reset drops a local change", w.name)
		}
		if said, ok := w.here.Resolve("HEAD"); !ok || said != y {
			t.Errorf("the %s repo's HEAD moves to %q, %v on a refused reset", w.name, said, ok)
		}
		if err := w.here.Restore("y.txt"); err != nil {
			t.Fatal(err)
		}
		w.here.write("README.md", "kept\n")
		if err := w.here.ResetTo(w.seed, false); err != nil {
			t.Errorf("the %s repo's keeping reset answers %v", w.name, err)
		}
		if said, ok := w.here.read("README.md"); !ok || said != "kept\n" {
			t.Errorf("the %s repo's keeping reset leaves README.md as %q, %v", w.name, said, ok)
		}
		if _, ok := w.here.read("y.txt"); ok {
			t.Errorf("the %s repo's keeping reset leaves y.txt standing", w.name)
		}
	}
}

// A merge with a message of its own, then the first-parent line through it, as the close reads trunk's own line. [[spec/design_output/work#a-merged-branch-closes]]
func TestRepoMergeTakesAMessageAndTheFirstParentsWalkTheLine(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if err := w.here.Switch("side", true); err != nil {
			t.Fatal(err)
		}
		w.here.write("s.txt", "s\n")
		side := w.here.commit("side")
		if err := w.here.Switch("main", false); err != nil {
			t.Fatal(err)
		}
		w.here.write("m.txt", "m\n")
		mine := w.here.commit("main")
		if said, err := w.here.Merge("side", "takes side in", false); err != nil || len(said) != 0 {
			t.Errorf("the %s repo's merge answers %v, %v", w.name, said, err)
		}
		merge, _ := w.here.Resolve("HEAD")
		if said, err := w.here.Log(mine, "HEAD", true); err != nil || !reflect.DeepEqual(subjects(said), []string{"takes side in"}) {
			t.Errorf("the %s repo logs %+v, %v past main", w.name, said, err)
		}
		if said, err := w.here.FirstParents("HEAD"); err != nil || !reflect.DeepEqual(said, []string{merge, mine, w.seed}) {
			t.Errorf("the %s repo's first parents read %v, %v, and want %v", w.name, said, err, []string{merge, mine, w.seed})
		}
		if said, ok := w.here.Resolve("HEAD^2"); !ok || said != side {
			t.Errorf("the %s repo's merge stands on %q, %v second", w.name, said, ok)
		}
	}
}

// A merge refused a fast-forward lands a commit of two parents, as branch merge lands a group. [[spec/design_output/work#the-merge-lands-the-truth]]
func TestRepoMergeWithNoFastForwardLandsAMergeCommit(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		if err := w.here.Switch("side", true); err != nil {
			t.Fatal(err)
		}
		w.here.write("README.md", "side\n")
		side := w.here.commit("side")
		if err := w.here.Switch("main", false); err != nil {
			t.Fatal(err)
		}
		if said, err := w.here.Merge("side", "joins side", true); err != nil || len(said) != 0 {
			t.Errorf("the %s repo's merge answers %v, %v", w.name, said, err)
		}
		for ref, want := range map[string]string{"HEAD^1": w.seed, "HEAD^2": side} {
			if said, ok := w.here.Resolve(ref); !ok || said != want {
				t.Errorf("the %s repo's merge holds %s at %q, %v, and wants %q", w.name, ref, said, ok, want)
			}
		}
		if said, ok := w.here.read("README.md"); !ok || said != "side\n" {
			t.Errorf("the %s repo's work tree holds README.md as %q, %v", w.name, said, ok)
		}
		if said, err := w.here.Log(w.seed, "HEAD", false); err != nil || len(said) != 2 || said[0].Subject != "joins side" {
			t.Errorf("the %s repo logs %+v, %v past the seed", w.name, said, err)
		}
	}
}

// Each side of a path a merge leaves unmerged, read by its stage, as the sync settles a ticket's front. [[spec/design_output/work#a-conflicted-front-resolves-itself]]
func TestRepoShowReadsTheStagesOfAnUnmergedPath(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		merging(t, w)
		for stage, want := range map[string]string{":1": seedText, ":2": "main\n", ":3": "side\n"} {
			if said, ok := w.here.Show(stage, "README.md"); !ok || said != want {
				t.Errorf("the %s repo reads stage %s as %q, %v, and wants %q", w.name, stage, said, ok, want)
			}
		}
		if said, ok := w.here.Show(":2", "missing.md"); ok {
			t.Errorf("the %s repo reads a stage of a path no merge holds as %q", w.name, said)
		}
	}
}

// The files a ref holds under a folder, as the merge reads every ticket a ref carries. [[spec/design_output/work#the-merge-frees-the-tickets]]
func TestRepoFilesListsWhatARefHoldsUnderAFolder(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		for path, text := range map[string]string{"notes/a.md": "a\n", "notes/deep/b.md": "b\n", "notesy.md": "c\n"} {
			w.here.write(path, text)
		}
		w.here.commit("notes")
		if said, err := w.here.Files("HEAD", "notes"); err != nil || !reflect.DeepEqual(said, []string{"notes/a.md", "notes/deep/b.md"}) {
			t.Errorf("the %s repo lists %v, %v under notes", w.name, said, err)
		}
		if said, err := w.here.Files("HEAD", ""); err != nil || !reflect.DeepEqual(said, []string{"README.md", "notes/a.md", "notes/deep/b.md", "notesy.md"}) {
			t.Errorf("the %s repo lists %v, %v at its root", w.name, said, err)
		}
		if said, err := w.here.Files(w.seed, "notes"); err != nil || len(said) != 0 {
			t.Errorf("the %s repo lists %v, %v under notes at the seed", w.name, said, err)
		}
		if _, err := w.here.Files("no-such-ref", ""); err == nil {
			t.Errorf("the %s repo lists the files of a missing ref", w.name)
		}
	}
}

// The patch and the stat between two refs, over a path or all of them, as the review gathers and the merge reads what trunk moved. [[spec/design_output/review#what-the-verb-gathers]]
func TestRepoPatchNamesTheLinesTwoRefsDifferIn(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("README.md", "seed\nnext\n")
		w.here.write("b.txt", "one\ntwo\n")
		w.here.commit("next")
		said, err := w.here.Patch(w.seed, "HEAD", false, "README.md")
		if err != nil || !strings.Contains(said, "diff --git a/README.md b/README.md\n") || !strings.Contains(said, "\n+next\n") || strings.Contains(said, "-seed") || strings.Contains(said, "b.txt") {
			t.Errorf("the %s repo's patch of README.md reads %q, %v", w.name, said, err)
		}
		said, err = w.here.Patch(w.seed, "HEAD", false)
		if err != nil || !strings.Contains(said, "+++ b/b.txt\n") || !strings.Contains(said, "\n+one\n+two\n") {
			t.Errorf("the %s repo's whole patch reads %q, %v", w.name, said, err)
		}
		said, err = w.here.Patch(w.seed, "HEAD", true)
		if err != nil || !strings.Contains(said, " README.md | 1 +\n") || !strings.HasSuffix(said, " 2 files changed, 3 insertions(+)\n") {
			t.Errorf("the %s repo's stat reads %q, %v", w.name, said, err)
		}
		if said, err := w.here.Patch("HEAD", "HEAD", false); err != nil || said != "" {
			t.Errorf("the %s repo's patch of a ref against itself reads %q, %v", w.name, said, err)
		}
	}
}

// A commit off a parent with files written over its tree, moving no ref and touching no work tree, as the dispatch lands its writes. [[spec/design_input/the-cloud-runs-itself#the-writes-ride-a-branch]]
func TestRepoCommitFilesWritesOverAParentsTreeAndMovesNoRef(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		hash, err := w.here.CommitFiles("HEAD", map[string]string{"notes/deep/x.md": "x\n", "README.md": "over\n"}, "writes")
		if err != nil || len(hash) != hashLength {
			t.Errorf("the %s repo's commit of files answers %q, %v", w.name, hash, err)
		}
		for path, want := range map[string]string{"notes/deep/x.md": "x\n", "README.md": "over\n"} {
			if said, ok := w.here.Show(hash, path); !ok || said != want {
				t.Errorf("the %s repo's new commit holds %s as %q, %v", w.name, path, said, ok)
			}
		}
		if said, ok := w.here.Resolve(hash + "^"); !ok || said != w.seed {
			t.Errorf("the %s repo's new commit stands on %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.Resolve("HEAD"); !ok || said != w.seed {
			t.Errorf("the %s repo's HEAD moves to %q, %v", w.name, said, ok)
		}
		if said, ok := w.here.read("README.md"); !ok || said != seedText {
			t.Errorf("the %s repo's work tree holds README.md as %q, %v", w.name, said, ok)
		}
		if said := status(t, w.here, true); len(said) != 0 {
			t.Errorf("the %s repo stands at %+v after the commit of files", w.name, said)
		}
	}
}

// A worktree at a ref under an ignored folder, and its removal, as the review runs the check in one. [[spec/design_output/review#a-worktree-runs-the-check]]
func TestRepoAddsAWorktreeAtARefAndRemovesIt(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write(".gitignore", ".se/\n")
		w.here.write("README.md", "next\n")
		w.here.commit("ignores .se")
		if err := w.here.AddWorktree(".se/wt", w.seed); err != nil {
			t.Errorf("the %s repo's worktree answers %v", w.name, err)
		}
		if said, ok := w.here.read(".se/wt/README.md"); !ok || said != seedText {
			t.Errorf("the %s worktree holds README.md as %q, %v", w.name, said, ok)
		}
		if said := status(t, w.here, true); len(said) != 0 {
			t.Errorf("the %s repo stands at %+v with a worktree open", w.name, said)
		}
		if err := w.here.AddWorktree(".se/wt", w.seed); err == nil {
			t.Errorf("the %s repo opens a second worktree where one stands", w.name)
		}
		w.here.write(".se/wt/built.txt", "built\n")
		if err := w.here.RemoveWorktree(".se/wt"); err != nil {
			t.Errorf("the %s repo's removal answers %v", w.name, err)
		}
		for _, path := range []string{".se/wt/README.md", ".se/wt/built.txt"} {
			if _, ok := w.here.read(path); ok {
				t.Errorf("the %s repo leaves %s once the worktree leaves", w.name, path)
			}
		}
		if err := w.here.RemoveWorktree(".se/wt"); err == nil {
			t.Errorf("the %s repo removes a worktree twice", w.name)
		}
	}
}

// A shallow clone finds no base for a branch cut before trunk moved, and finds it once it stands whole, as the listing marks an orphan. [[spec/design_output/work#the-listing-reads-git-once]]
func TestRepoUnshallowFetchesTheHistoryAShallowCloneLacks(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.cut("work/old")
		w.here.push("work/old")
		for _, step := range []string{"one", "two"} {
			w.here.write("README.md", step+"\n")
			w.here.commit(step)
		}
		w.here.push("main")
		cut := w.shallow()
		if said, ok := cut.MergeBase("origin/main", "origin/work/old"); ok {
			t.Errorf("the %s shallow clone finds the base %q", w.name, said)
		}
		if !cut.Unshallow() {
			t.Errorf("the %s shallow clone answers it stood whole", w.name)
		}
		if said, ok := cut.MergeBase("origin/main", "origin/work/old"); !ok || said != w.seed {
			t.Errorf("the %s clone finds the base %q, %v once whole, and wants the seed %q", w.name, said, ok, w.seed)
		}
		if cut.Unshallow() {
			t.Errorf("the %s whole clone answers it stood shallow", w.name)
		}
	}
}

// The refs under a prefix a ref holds, as the close reads the branches trunk carries. [[spec/design_output/work#a-merged-branch-closes]]
func TestRepoMergedNamesTheRefsARefHolds(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.cut("work/a")
		w.here.write("b.txt", "b\n")
		next := w.here.commit("b")
		w.here.cut("work/b")
		if said, err := w.here.Merged("refs/heads/work/", w.seed); err != nil || !reflect.DeepEqual(said, []Ref{{Name: "refs/heads/work/a", Hash: w.seed}}) {
			t.Errorf("the %s repo names %+v, %v under work/ inside the seed", w.name, said, err)
		}
		want := []Ref{{Name: "refs/heads/main", Hash: next}, {Name: "refs/heads/work/a", Hash: w.seed}, {Name: "refs/heads/work/b", Hash: next}}
		if said, err := w.here.Merged("refs/heads/", "HEAD"); err != nil || !reflect.DeepEqual(said, want) {
			t.Errorf("the %s repo names %+v, %v inside HEAD, and wants %+v", w.name, said, err, want)
		}
	}
}

// The second a commit was made, as the listing ages a branch. [[spec/design_output/work#the-listing-reads-git-once]]
func TestRepoWhenReadsTheSecondACommitWasMade(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.at(3000)
		w.here.write("b.txt", "b\n")
		w.here.commit("b")
		if said, ok := w.here.When("HEAD"); !ok || said != 3000 {
			t.Errorf("the %s repo reads HEAD's second as %d, %v", w.name, said, ok)
		}
		if said, ok := w.here.When(w.seed); !ok || said != seedSecond {
			t.Errorf("the %s repo reads the seed's second as %d, %v", w.name, said, ok)
		}
		if _, ok := w.here.When("no-such-ref"); ok {
			t.Errorf("the %s repo reads a second off a missing ref", w.name)
		}
	}
}

// A hook refusing a commit and one refusing a push, each saying its line, as a take meets a door turning it away. [[spec/design_output/work#the-take-writes-the-record]]
func TestRepoAHookRefusesACommitOrAPushAndSaysWhy(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.hook(false, "the hook refuses")
		w.here.write("a.txt", "a\n")
		if err := w.here.AddAll(); err != nil {
			t.Fatal(err)
		}
		if _, err := w.here.Commit("a", nil); err == nil || !strings.Contains(err.Error(), "the hook refuses") {
			t.Errorf("the %s repo's commit past a refusing hook answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("HEAD"); !ok || said != w.seed {
			t.Errorf("the %s repo's HEAD moves to %q, %v past the hook", w.name, said, ok)
		}
		w.hook(true, "origin refuses")
		if pushed := w.there.PushTo(w.seed, "work/x"); pushed.OK || pushed.Moved || !strings.Contains(pushed.Err, "origin refuses") {
			t.Errorf("the %s repo's push past a refusing origin answers %+v", w.name, pushed)
		}
		if said, ok := w.origin.Resolve("refs/heads/work/x"); ok {
			t.Errorf("the %s origin takes work/x at %q past its hook", w.name, said)
		}
	}
}

// A branch holding no commit and an empty index, as a case cuts a branch sharing nothing with trunk. [[spec/design_output/work#the-listing-reads-git-once]]
func TestRepoAnOrphanBranchHoldsNoCommitUntilOneLands(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.orphan("lone")
		if said, err := w.here.Head(); err == nil {
			t.Errorf("the %s repo's head on an orphan reads %q", w.name, said)
		}
		if _, ok := w.here.read("README.md"); ok {
			t.Errorf("the %s repo's orphan keeps README.md in its work tree", w.name)
		}
		w.here.write("o.txt", "o\n")
		w.here.commit("lone")
		if said, ok := w.here.MergeBase("HEAD", "main"); ok {
			t.Errorf("the %s orphan shares %q with main", w.name, said)
		}
		if said, err := w.here.Files("HEAD", ""); err != nil || !reflect.DeepEqual(said, []string{"o.txt"}) {
			t.Errorf("the %s orphan holds %v, %v", w.name, said, err)
		}
	}
}

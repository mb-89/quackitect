// The git door's contract on history, refs, pushes, rebases and branches,
// each case run in the worlds repo_contract_test.go builds.
// [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"reflect"
	"strings"
	"testing"
)

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
	conflicts, err = w.here.Merge("side", "", false)
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

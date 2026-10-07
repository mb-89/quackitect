// The git door's contract on merges, resets, commits off the work tree and
// the moves a branch makes on origin, each case run in the worlds
// repo_contract_test.go builds. [[spec/design_output/doors#the-git-door-carries-writes]]
package git

import (
	"reflect"
	"strings"
	"testing"
)

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
		if said, err := w.here.Merge("side", "", false); err != nil || len(said) != 0 {
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

// Every branch origin holds comes in, and a branch gone from origin leaves its tracking ref, as the listing reads the refs. [[spec/design_output/work#the-listing-reads-git-once]]
func TestRepoFetchAllTakesEveryBranchAndPrunesTheGoneOnes(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.there.write("a.txt", "a\n")
		next := w.there.commit("a")
		w.there.cut("work/a")
		w.there.push("work/a")
		if err := w.here.FetchAll(); err != nil {
			t.Errorf("the %s repo's fetch of every branch answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("origin/work/a"); !ok || said != next {
			t.Errorf("the %s repo tracks origin/work/a at %q, %v, and origin holds %q", w.name, said, ok, next)
		}
		if err := w.there.DeleteRemote("work/a"); err != nil {
			t.Errorf("the %s repo's delete of origin's work/a answers %v", w.name, err)
		}
		if err := w.here.FetchAll(); err != nil {
			t.Errorf("the %s repo's second fetch answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("origin/work/a"); ok {
			t.Errorf("the %s repo still tracks origin/work/a at %q once origin drops it", w.name, said)
		}
	}
}

// A beat: a parentless commit on the empty tree, pushed by force over the branch's last beat, whose commit shares no history with it. [[spec/tickets/the-doors-pr-goes-green]]
func TestRepoForcePushesAnEmptyCommitOverTheLastOne(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		first, err := w.here.EmptyCommit("box beats")
		if err != nil {
			t.Fatalf("the %s repo's empty commit answers %v", w.name, err)
		}
		if log, err := w.here.Log("", first, false); err != nil || len(log) != 1 || log[0].Subject != "box beats" {
			t.Errorf("the %s repo's empty commit logs %+v, %v, and wants one commit under its message", w.name, log, err)
		}
		if files, err := w.here.Files(first, ""); err != nil || len(files) != 0 {
			t.Errorf("the %s repo's empty commit holds %v, %v", w.name, files, err)
		}
		if pushed := w.here.ForcePushTo(first, "beats/g"); !pushed.OK {
			t.Errorf("the %s repo's first beat answers %+v", w.name, pushed)
		}
		second, err := w.here.EmptyCommit("box ends")
		if err != nil {
			t.Fatalf("the %s repo's second empty commit answers %v", w.name, err)
		}
		if pushed := w.here.PushTo(second, "beats/g"); pushed.OK {
			t.Errorf("the %s repo's plain push over an unrelated beat passes", w.name)
		}
		if pushed := w.here.ForcePushTo(second, "beats/g"); !pushed.OK {
			t.Errorf("the %s repo's forced beat answers %+v", w.name, pushed)
		}
		if said, ok := w.origin.Resolve("refs/heads/beats/g"); !ok || said != second {
			t.Errorf("the %s origin holds beats/g at %q, %v, and the forced push names %q", w.name, said, ok, second)
		}
	}
}

// A commit pushed under a branch name of its own, then the branch deleted on origin, as the open and the close move them. [[spec/design_output/work#a-merged-branch-closes]]
func TestRepoPushesACommitToABranchAndDeletesTheBranchOnOrigin(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.write("b.txt", "b\n")
		next := w.here.commit("b")
		if pushed := w.here.PushTo(next, "work/b"); !pushed.OK {
			t.Errorf("the %s repo's push of a commit answers %+v", w.name, pushed)
		}
		if said, ok := w.origin.Resolve("refs/heads/work/b"); !ok || said != next {
			t.Errorf("the %s origin holds work/b at %q, %v, and the push names %q", w.name, said, ok, next)
		}
		if said, ok := w.origin.Resolve("refs/heads/main"); !ok || said != w.seed {
			t.Errorf("the %s origin's main moves to %q, %v", w.name, said, ok)
		}
		if err := w.here.DeleteRemote("work/b"); err != nil {
			t.Errorf("the %s repo's delete answers %v", w.name, err)
		}
		if said, ok := w.origin.Resolve("refs/heads/work/b"); ok {
			t.Errorf("the %s origin still holds work/b at %q", w.name, said)
		}
		if said, ok := w.here.Resolve("origin/work/b"); ok {
			t.Errorf("the %s repo still tracks origin/work/b at %q", w.name, said)
		}
		if err := w.here.DeleteRemote("work/b"); err == nil {
			t.Errorf("the %s repo deletes a branch origin never held", w.name)
		}
	}
}

// A local branch deleted by its ref, as the close drops it. [[spec/design_output/work#a-merged-branch-closes]]
func TestRepoDeletesARefByItsName(t *testing.T) {
	t.Parallel()
	for _, w := range worlds(t) {
		w.here.cut("work/c")
		if err := w.here.DeleteRef("refs/heads/work/c"); err != nil {
			t.Errorf("the %s repo's delete of a ref answers %v", w.name, err)
		}
		if said, ok := w.here.Resolve("work/c"); ok {
			t.Errorf("the %s repo still holds work/c at %q", w.name, said)
		}
		if said, ok := w.here.Resolve("main"); !ok || said != w.seed {
			t.Errorf("the %s repo's main stands at %q, %v", w.name, said, ok)
		}
	}
}

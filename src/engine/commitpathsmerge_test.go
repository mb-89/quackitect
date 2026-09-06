package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A MERGE IS THE ONE COMMIT THAT CANNOT NAME A PATH.
//
// The guard refuses a commit naming no path, because the index is shared and a
// pathless commit carries whatever another hand staged. A merge commit is the
// index on purpose, and git offers no way to name paths on one.
//
// MEASURED in September 2026 on v4. A merge of origin/v4 conflicted in
// doc/work/archive.jsonl. With the conflict resolved and staged, git commit
// --no-edit was refused. Naming the paths would have made an ordinary commit,
// left the branch diverged, and made the next push worse.
//
// THE WAY THROUGH EXISTED AND NOTHING SAID SO. git merge --continue is not read
// as a commit by the guard. A hand that does not find it force-pushes, abandons
// the merge, or names the paths and deepens the divergence.
func TestAMergeCommitNamesNoPath(t *testing.T) {
	t.Parallel()
	r := guidanceTree(t)
	aRepository(t, r)

	// WITH NO MERGE IN PROGRESS THE REFUSAL STANDS, and it names the route.
	why, refuse := ACommitCarriesStrangers(r, `git commit -m "everything"`)
	if !refuse {
		t.Fatal("a pathless commit went through with no merge in progress")
	}
	if !strings.Contains(why, "merge --continue") {
		t.Errorf("the refusal does not name how a merge is concluded:\n%s", why)
	}

	// AND MIDWAY THROUGH A MERGE THE SAME COMMAND GOES THROUGH.
	merging := filepath.Join(r.Work, ".git", "MERGE_HEAD")
	if err := os.WriteFile(merging, []byte("0000000000000000000000000000000000000000\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	if why, refuse := ACommitCarriesStrangers(r, "git commit --no-edit"); refuse {
		t.Errorf("a merge could not be concluded:\n%s", why)
	}

	// THE INDEX FLAGS ARE STILL REFUSED MID-MERGE. A merge commits the index it
	// was handed, and -a adds every tracked change on the box to it.
	if _, refuse := ACommitCarriesStrangers(r, `git commit -am "everything"`); !refuse {
		t.Error("git commit -a went through during a merge, and that is every hand's work")
	}

	// AND THE MERGE ENDS WHERE MERGE_HEAD DOES.
	if err := os.Remove(merging); err != nil {
		t.Fatal(err)
	}
	if _, refuse := ACommitCarriesStrangers(r, "git commit --no-edit"); !refuse {
		t.Error("a pathless commit went through after the merge was over")
	}
}

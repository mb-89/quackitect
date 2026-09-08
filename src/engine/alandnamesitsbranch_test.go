package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// A LAND GOES TO THE BRANCH THE TREE IS ON, AND NOWHERE ELSE.
//
// land.sh named one branch in its fetch and in its push, and read the branch
// nowhere. A box cut for a group branch landed its work on trunk, answered
// PUSHED, and the group branch never moved. Nothing said so, and the work was
// found by a stop hook reporting a dirty tree.
//
// NO BRANCH NAME IS WRITTEN IN THE SCRIPT. It is copied into other trees, whose
// trunk is called something else, so a name written down is wrong in all of
// them. The fixture below invents a branch the script cannot know.
func TestALandGoesToTheBranchTheTreeIsOn(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	trunkWas := theRemoteRef(t, clone, "v4")
	mustGit(t, clone, "checkout", "-q", "-b", "group/scratch")
	writeIn(t, clone, "landed.txt", "as it is now\n")

	out := runLand(t, clone, "the file lands", "landed.txt")

	at := theRemoteRef(t, clone, "group/scratch")
	if at == "" {
		t.Fatalf("origin carries no group/scratch, and land said:\n%s", out)
	}
	if head := mustGit(t, clone, "rev-parse", "HEAD"); at != head {
		t.Fatalf("origin holds %s on the branch and HEAD is %s", at, head)
	}
	if now := theRemoteRef(t, clone, "v4"); now != trunkWas {
		t.Fatalf("trunk went from %s to %s, and the land was on group/scratch", trunkWas, now)
	}
	if !strings.Contains(out, "group/scratch") {
		t.Fatalf("the land never named the branch it pushed to:\n%s", out)
	}
}

// THE SECOND LAND STARTS FROM WHAT ORIGIN HOLDS. The first push creates the
// branch there, and every land after it fetches that branch rather than the one
// the script used to name.
func TestASecondLandStartsFromTheBranchItMade(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	mustGit(t, clone, "checkout", "-q", "-b", "group/scratch")
	writeIn(t, clone, "landed.txt", "the first\n")
	runLand(t, clone, "the first lands", "landed.txt")
	first := theRemoteRef(t, clone, "group/scratch")

	writeIn(t, clone, "landed.txt", "the second\n")
	out := runLand(t, clone, "the second lands", "landed.txt")

	second := theRemoteRef(t, clone, "group/scratch")
	if second == first {
		t.Fatalf("the branch stayed at %q, and land said:\n%s", first, out)
	}
	if parent := mustGit(t, clone, "rev-parse", second+"^"); parent != first {
		t.Fatalf("the second land sits on %s rather than on %s", parent, first)
	}
}

// A DETACHED HEAD NAMES NO BRANCH, so a land has nowhere to go and says so. A
// default guessed here is the same defect wearing another name: it lands the
// work somewhere nobody asked for and answers as though it worked.
func TestALandFromADetachedHeadRefuses(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	trunkWas := theRemoteRef(t, clone, "v4")
	mustGit(t, clone, "checkout", "-q", "--detach")
	writeIn(t, clone, "landed.txt", "as it is now\n")

	out := aLandThatRefuses(t, clone, "the file lands", "landed.txt")

	if !strings.Contains(out, "NO BRANCH") {
		t.Fatalf("the refusal says nothing about the branch:\n%s", out)
	}
	if now := theRemoteRef(t, clone, "v4"); now != trunkWas {
		t.Fatalf("trunk went from %s to %s under a land that had no branch", trunkWas, now)
	}
}

// THE OTHER DOOR CARRIED THE SAME NAME. cherrypush.sh fetched one branch and
// pushed to it whatever branch the tree was on, so a commit made on a group
// branch went to trunk exactly as a land did. It is fixed with land.sh, and
// watched here, because a door nothing drives is where the name comes back.
func TestACherryPushGoesToTheBranchTheTreeIsOn(t *testing.T) {
	clone := aCloneWithABareOrigin(t)
	trunkWas := theRemoteRef(t, clone, "v4")
	mustGit(t, clone, "checkout", "-q", "-b", "group/scratch")
	mustGit(t, clone, "push", "-q", "origin", "group/scratch")
	writeIn(t, clone, "landed.txt", "as it is now\n")
	mustGit(t, clone, "commit", "-q", "--only", "-m", "the change", "landed.txt")

	out := runCherryPush(t, clone, mustGit(t, clone, "rev-parse", "HEAD"))

	at := theRemoteRef(t, clone, "group/scratch")
	if at == "" || at == trunkWas {
		t.Fatalf("origin holds %q on the branch, and the push said:\n%s", at, out)
	}
	if carried := mustGit(t, clone, "show", at+":landed.txt"); carried != "as it is now" {
		t.Fatalf("the branch carries landed.txt as %q", carried)
	}
	if now := theRemoteRef(t, clone, "v4"); now != trunkWas {
		t.Fatalf("trunk went from %s to %s under a push on group/scratch", trunkWas, now)
	}
}

// theRemoteRef answers what origin holds on one branch, and the empty string
// where origin has never heard of it.
func theRemoteRef(t *testing.T, clone, branch string) string {
	t.Helper()
	if fields := strings.Fields(mustGit(t, clone, "ls-remote", "origin", branch)); len(fields) > 0 {
		return fields[0]
	}
	return ""
}

// runCherryPush runs the other door the box pushes through, from inside the
// clone, and answers what it printed.
func runCherryPush(t *testing.T, clone, commit string) string {
	t.Helper()
	script, err := filepath.Abs(filepath.Join("..", "..", "util", "git", "cherrypush.sh"))
	if err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command("sh", script, commit)
	cmd.Dir = clone
	cmd.Env = append(os.Environ(),
		"GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t",
		"GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t",
		"GIT_TERMINAL_PROMPT=0")
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("cherrypush.sh %s: %v\n%s", commit, err, out)
	}
	return string(out)
}

// aLandThatRefuses runs the same script the box lands through and requires it to
// fail. runLand ends the test on a failing land, which is right everywhere else
// and is the thing under test here.
func aLandThatRefuses(t *testing.T, clone, msg string, paths ...string) string {
	t.Helper()
	script, err := filepath.Abs(filepath.Join("..", "..", "util", "git", "land.sh"))
	if err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command("sh", append([]string{script, msg}, paths...)...)
	cmd.Dir = clone
	cmd.Env = append(os.Environ(), "GIT_TERMINAL_PROMPT=0")
	out, err := cmd.CombinedOutput()
	if err == nil {
		t.Fatalf("the land was to refuse, and it answered:\n%s", out)
	}
	return string(out)
}

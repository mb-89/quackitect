package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// A hash of the right shape that names nothing in this clone.
const nowhereHash = "c2682c671c7ab75306367de55d36104c0ec51b96"

// A SNAPSHOT THIS BOX NEVER HAD IS NOT AN ERROR.
//
// A began hash is a commit under refs/se/steps, and no push carries those. A
// token taken up on one box and worked on another names a snapshot this clone
// does not hold. git diff against it says fatal: bad object, and deltaSince
// read four other wordings of the same thing and not that one. So se test on
// such a token answered an error and ran nothing.
//
// MEASURED on wk-40abb881a7 on a cloud box, while every other tracked token
// tested.
func TestADeltaAgainstAHashThisBoxDoesNotHold(t *testing.T) {
	t.Parallel()
	r, _ := aTreeWithTests(t)
	db := openTheIndex(t, r)
	if _, err := deltaSince(r, db, nowhereHash); err != nil {
		t.Fatalf("a snapshot this box does not hold was an error rather than a delta: %v", err)
	}
}

// AND THE ANSWER SAYS WHICH SNAPSHOT IT FELL BACK TO.
//
// A token carries every take-up, so a hash this box does hold usually sits
// behind the one it does not. That older snapshot is the delta worth reading,
// and a reader who is not told which was used cannot tell a narrow delta from
// a stale one.
func TestTheSinceFallsBackToASnapshotThisBoxHolds(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	here := theHeadCommit(t, dir)

	// THE SECOND TAKE-UP WAS ON ANOTHER BOX, so its snapshot is nowhere here.
	aTokenBegunAtThese(t, r, "wk-far", []string{here, nowhereHash})

	got, err := TestTheDelta(r, db, "wk-far", nil, false, "worker-far")
	if err != nil {
		t.Fatalf("a token taken up on another box answered an error: %v", err)
	}
	if got.Since != here {
		t.Fatalf("the delta was read against %q, and the newest snapshot this box holds is %s", got.Since, here)
	}
}

// theHeadCommit answers what the fixture tree has committed.
func theHeadCommit(t *testing.T, dir string) string {
	t.Helper()
	cmd := exec.Command("git", "rev-parse", "HEAD")
	cmd.Dir = dir
	out, err := cmd.Output()
	if err != nil {
		t.Fatal(err)
	}
	return strings.TrimSpace(string(out))
}

// aTokenBegunAtThese writes a token taken up at each of these snapshots,
// oldest first, which is the order the engine writes them in.
func aTokenBegunAtThese(t *testing.T, r Roots, id string, began []string) {
	t.Helper()
	if err := os.MkdirAll(TrackedDir(r), 0o755); err != nil {
		t.Fatal(err)
	}
	note := "---\nkind: [[work-token]]\nprocess: [[trivial]]\ntitle: a fixture token\nstatus: open\nbegan:\n"
	for _, b := range began {
		note += "  - " + b + "\n"
	}
	note += "---\n\n## detail\n\nA token taken up on two boxes.\n"
	if err := os.WriteFile(filepath.Join(TrackedDir(r), id+".md"), []byte(note), 0o644); err != nil {
		t.Fatal(err)
	}
}

package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A BOX THAT IS BEHIND IS THE ORDINARY CASE, not the exception. A cloud box
// clones the tip as it stood when the session was made, and anybody who pushed
// after that leaves it behind and confident.

const thePull = "mcp__quackitect__se_pull"

// NOTHING IS HANDED OUT UNTIL THE BOX IS ON THE TIP, and the refusal names both
// commits so a reader can check rather than believe the box.
func TestAPullOnAStaleGroupIsRefused(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "group/archive")
	why, refuse := TheGroupHasNotLanded(box, thePull, "")
	if !refuse {
		t.Fatal("a stale group box was handed work, and it would hand out finished tokens")
	}
	at, _ := gitHere(box, "rev-parse", "HEAD")
	tip, _ := gitHere(box, "rev-parse", "@{upstream}")
	for _, want := range []string{aShortCommit(at), aShortCommit(tip)} {
		if !strings.Contains(why, want) {
			t.Errorf("the refusal does not name %s, so nobody can check it: %s", want, why)
		}
	}
}

// A CALL THAT IS NOT A PULL IS NOT HELD. The landing is about handing work out,
// and holding a read would leave a box that cannot even look at what is wrong.
func TestOnlyAPullIsHeldByTheLanding(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "group/archive")
	for _, tool := range []string{"Read", "mcp__quackitect__se_apply", "mcp__quackitect__se_stop"} {
		if _, refuse := TheGroupHasNotLanded(box, tool, ""); refuse {
			t.Errorf("%s was held by the landing, and it takes nothing from the queue", tool)
		}
	}
}

// AN ORDINARY BRANCH IS NOT A GROUP, so a stale trunk is somebody's own affair.
func TestAnOrdinaryBranchIsNotHeldByTheLanding(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "main")
	if _, refuse := TheGroupHasNotLanded(box, thePull, ""); refuse {
		t.Error("a box on main was held, and only a group branch lands first")
	}
}

// AT THE BEGINNING THERE IS NOTHING TO LOSE, so the tip is taken rather than
// argued about. And the demand stops firing afterwards, because the condition
// is the world rather than a flag somebody has to set.
func TestACleanTreeIsPutOnTheTip(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "group/archive")
	stood := LandOnTheTip(box)
	if !stood.Moved {
		t.Fatalf("a clean tree was not landed: %s", stood.Says)
	}
	if stood.Behind != 1 {
		t.Errorf("it read %d behind, and origin moved on by one", stood.Behind)
	}
	at, _ := gitHere(box, "rev-parse", "HEAD")
	if strings.TrimSpace(at) != strings.TrimSpace(stood.Tip) {
		t.Errorf("the tree stands on %s and the tip is %s", aShortCommit(at), aShortCommit(stood.Tip))
	}
	if _, refuse := TheGroupHasNotLanded(box, thePull, ""); refuse {
		t.Error("the demand still fires after landing, so it reads a flag rather than the world")
	}
}

// A TREE CARRYING SOMETHING OF ITS OWN IS NO LONGER AT THE BEGINNING, so the
// force is off and the box is told what it is standing on.
func TestATreeWithItsOwnWorkIsNotForced(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "group/archive")
	if err := os.WriteFile(filepath.Join(box.Work, "mine.txt"), []byte("not pushed\n"), 0o644); err != nil {
		t.Fatalf("the file could not be written: %v", err)
	}
	stood := LandOnTheTip(box)
	if stood.Moved {
		t.Fatal("a tree with an uncommitted file was forced, and that file is gone")
	}
	if !strings.Contains(stood.Says, "work of its own") {
		t.Errorf("it said %q, and a reader has to be told why nothing happened", stood.Says)
	}
	if _, err := os.Stat(filepath.Join(box.Work, "mine.txt")); err != nil {
		t.Errorf("the file is gone: %v", err)
	}
}

// AND THE DISTANCE IS COUNTED, NOT NOTICED.
//
// Every other test here puts the box one commit behind, and one is the number a
// boolean answers too: a mechanism that only knew behind or not behind would
// pass all of them. The shared tree this token is about stood 134 commits
// behind, and an agent reading it needs the distance rather than the fact.
//
// So this one moves origin on twice and asks for two. Measured by inverting
// aheadBehind to answer a flat 1: this test failed on the number and the
// one-behind tests above stayed green, which is what makes it worth having.
func TestTheDistanceBehindIsCounted(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "group/archive")
	said, err := gitHere(box, "remote", "get-url", "origin")
	if err != nil {
		t.Fatalf("the box does not name its origin: %v", err)
	}
	origin := Roots{Method: box.Method, Work: strings.TrimSpace(said)}
	if _, err := gitHere(origin, "commit", "--allow-empty", "-m", "three"); err != nil {
		t.Fatalf("origin could not move on a second time: %v", err)
	}
	if _, err := gitHere(box, "fetch", "--quiet"); err != nil {
		t.Fatalf("the box could not fetch: %v", err)
	}

	stood := LandOnTheTip(box)
	if stood.Behind != 2 {
		t.Fatalf("it read %d behind, and origin moved on by two", stood.Behind)
	}
	if !stood.Moved {
		t.Errorf("a clean tree two behind was not landed: %s", stood.Says)
	}
}

// A COMMIT AHEAD IS WORK NOTHING ELSE CARRIES, and a reset would drop it.
func TestATreeAheadOfOriginIsNotForced(t *testing.T) {
	box := aBoxBehindItsOrigin(t, "group/archive")
	if _, err := gitHere(box, "commit", "--allow-empty", "-m", "mine"); err != nil {
		t.Fatalf("the box could not commit: %v", err)
	}
	mine, _ := gitHere(box, "rev-parse", "HEAD")
	stood := LandOnTheTip(box)
	if stood.Moved {
		t.Fatal("a tree ahead of origin was forced, and its commit is gone")
	}
	if stood.Ahead != 1 {
		t.Errorf("it read %d ahead, and the box made one commit", stood.Ahead)
	}
	at, _ := gitHere(box, "rev-parse", "HEAD")
	if strings.TrimSpace(at) != strings.TrimSpace(mine) {
		t.Errorf("the tree moved off its own commit, to %s", aShortCommit(at))
	}
}

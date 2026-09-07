package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE READING IS DRIVEN OVER NAMES, and the deriving over a real checkout.
//
// Splitting the two is what lets the rule be stated once and checked cheaply. A
// name is a string and needs no repository, and only the part that asks git
// needs one.

func TestAGroupBranchNamesTheBucket(t *testing.T) {
	for branch, want := range map[string]string{
		"group/cloud":    "cloud",
		"group/archive":  "archive",
		"group/a-b-c":    "a-b-c",
		"group/cloud\n":  "cloud",
		"v4":             "",
		"main":           "",
		"grouped/thing":  "",
		"group/":         "",
		"feature/group/x": "",
		"":               "",
	} {
		if got := theGroupInAName(branch); got != want {
			t.Errorf("%q names the group %q, and it should name %q", branch, got, want)
		}
	}
}

func TestTheGroupFilterIsTheBucket(t *testing.T) {
	if got := theGroupFilter("archive"); got != "bucket: archive" {
		t.Errorf("the group archive filters by %q", got)
	}
}

// aBoxOnBranch is a work root that is a repository standing on one branch.
func aBoxOnBranch(t *testing.T, branch string) Roots {
	t.Helper()
	r := Roots{Method: filepath.Join("..", ".."), Work: t.TempDir()}
	for _, args := range [][]string{
		{"init", "--initial-branch", "main"},
		{"config", "user.email", "a@b.c"},
		{"config", "user.name", "a box"},
		{"commit", "--allow-empty", "-m", "one"},
		{"checkout", "-b", branch},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}
	return r
}

// NAMING A BUCKET IS THE WHOLE OF CUTTING A GROUP. Nobody types a checkout,
// which is the manual step the design exists to remove.
func TestNamingABucketTakesItsBranch(t *testing.T) {
	r := aBoxOnBranch(t, "v4")
	took := TakeTheGroupBranch(r, "archive")
	if !took.Moved || took.On != "group/archive" {
		t.Fatalf("the tree stands on %q and it was asked for group/archive: %s", took.On, took.Says)
	}
	if took.Was != "v4" {
		t.Errorf("it came off %q, and it stood on v4", took.Was)
	}
	// AND THE QUEUE IS NARROWED STRAIGHT AFTER, with nothing typed. This is what
	// the whole act is for, so it is read here rather than assumed.
	if said, from := theFilterInForce(r); said != "bucket: archive" {
		t.Errorf("the queue is narrowed by %q and %q, straight after taking the branch", said, from)
	}
}

// A GROUP ALREADY CUT IS TAKEN RATHER THAN REMADE. A second box on the same
// group would otherwise fail on a branch that is already there.
func TestAGroupAlreadyCutIsTakenAgain(t *testing.T) {
	r := aBoxOnBranch(t, "v4")
	if took := TakeTheGroupBranch(r, "archive"); !took.Moved {
		t.Fatalf("the first take did not move: %s", took.Says)
	}
	if _, err := gitHere(r, "checkout", "--quiet", "v4"); err != nil {
		t.Fatalf("the tree could not be put back on v4: %v", err)
	}
	took := TakeTheGroupBranch(r, "archive")
	if !took.Moved || took.On != "group/archive" {
		t.Errorf("the second take answered %q: %s", took.On, took.Says)
	}
}

// ASKING FOR THE GROUP YOU ARE ON MOVES NOTHING, and says so.
func TestTheGroupYouAreOnIsNotTakenTwice(t *testing.T) {
	r := aBoxOnBranch(t, "group/archive")
	took := TakeTheGroupBranch(r, "archive")
	if took.Moved {
		t.Errorf("it moved a tree that already stood there: %s", took.Says)
	}
	if took.On != "group/archive" {
		t.Errorf("it answered %q for a tree standing on group/archive", took.On)
	}
}

// A DETACHED HEAD IS LEFT WHERE IT STANDS. It is somebody's bisect, and taking
// a branch off it would strand what they are doing.
func TestADetachedHeadIsLeftAlone(t *testing.T) {
	r := aBoxOnBranch(t, "v4")
	at, err := gitHere(r, "rev-parse", "HEAD")
	if err != nil {
		t.Fatalf("the commit could not be read: %v", err)
	}
	if _, err := gitHere(r, "checkout", "--quiet", "--detach", at); err != nil {
		t.Fatalf("the head could not be detached: %v", err)
	}
	took := TakeTheGroupBranch(r, "archive")
	if took.Moved {
		t.Errorf("it moved a detached head: %s", took.Says)
	}
	if !strings.Contains(took.Says, "on no branch") {
		t.Errorf("it said %q, and a reader has to be told why nothing happened", took.Says)
	}
}

// NAMING NOTHING TAKES NOTHING. An empty bucket would otherwise cut a branch
// called group/ and narrow the queue to a bucket nobody has.
func TestNamingNoBucketTakesNothing(t *testing.T) {
	r := aBoxOnBranch(t, "v4")
	took := TakeTheGroupBranch(r, "  ")
	if took.Moved {
		t.Errorf("it cut a branch for no bucket: %s", took.Says)
	}
}

// A BOX NOBODY TOLD IS NARROWED BY ITS BRANCH. This is the whole point: no
// keyword is typed and no panel is pressed.
func TestTheBranchNarrowsABoxNobodyTold(t *testing.T) {
	r := aBoxOnBranch(t, "group/archive")
	said, from := theFilterInForce(r)
	if said != "bucket: archive" {
		t.Errorf("the queue is narrowed by %q, and the branch says bucket: archive", said)
	}
	if !strings.Contains(from, "group/archive") {
		t.Errorf("the reason is %q, and it should name the branch", from)
	}
	if notice := theFilterNotice(r); !strings.Contains(notice, "group/archive") {
		t.Errorf("a pull says %q, and a reader cannot check a branch it is not told", notice)
	}
}

// TRUNK IS THE WHOLE QUEUE. A branch that is not a group derives nothing, so
// the ordinary case is untouched.
func TestABranchThatIsNotAGroupNarrowsNothing(t *testing.T) {
	r := aBoxOnBranch(t, "v4")
	if said, _ := theFilterInForce(r); said != "" {
		t.Errorf("the queue is narrowed by %q on an ordinary branch", said)
	}
	if notice := theFilterNotice(r); notice != "" {
		t.Errorf("a pull says %q about a queue nothing narrowed", notice)
	}
}

// A PERSON WHO TYPED ONE GETS WHAT THEY TYPED. The branch is the default and
// never the ruling, so a desk that asked for something else is not overruled.
func TestAPersonsFilterOutranksTheBranch(t *testing.T) {
	r := aBoxOnBranch(t, "group/archive")
	store := valuesPath(r)
	if err := os.MkdirAll(filepath.Dir(store), 0o755); err != nil {
		t.Fatalf("the store folder could not be made: %v", err)
	}
	if err := os.WriteFile(store, []byte(`{"work.queue_filter":"process: trivial"}`), 0o644); err != nil {
		t.Fatalf("the store could not be written: %v", err)
	}
	said, from := theFilterInForce(r)
	if said != "process: trivial" {
		t.Errorf("the queue is narrowed by %q, and a person set process: trivial", said)
	}
	if strings.Contains(from, aGroupBranch) {
		t.Errorf("the reason is %q, and the branch did not set this one", from)
	}
}

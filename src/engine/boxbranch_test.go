package main

import "testing"

// A START TAKES THE BOX'S OWN BRANCH, AND A SECOND START MOVES NOTHING.
//
// The engine restarts many times in one session: a swap, a crash and a wake all
// bring one up. A start that took a branch every time would leave a hand on a
// different branch from the one its earlier commits are on, so the take is
// idempotent and the second answer says it moved nothing.
func TestAStartTakesTheBoxBranch(t *testing.T) {
	t.Parallel()
	r := aTreeOnTrunk(t)
	want := boxBranch(r)
	if want == "box/" {
		t.Fatalf("the box has no id, so %q names every box", want)
	}

	got := TakeTheBoxBranch(r)
	if !got.Moved {
		t.Fatalf("the start took no branch: %s", got.Says)
	}
	if got.On != want || got.Was != "trunk" {
		t.Errorf("the start answers on %q was %q, and it stood on trunk and wanted %q", got.On, got.Was, want)
	}
	if on := gitAt(t, r.Work, "rev-parse", "--abbrev-ref", "HEAD"); on != want {
		t.Fatalf("the tree is on %q, and this box's branch is %q", on, want)
	}

	// A SECOND START MOVES NOTHING.
	again := TakeTheBoxBranch(r)
	if again.Moved {
		t.Errorf("a second start moved the tree again: %s", again.Says)
	}
	if on := gitAt(t, r.Work, "rev-parse", "--abbrev-ref", "HEAD"); on != want {
		t.Errorf("a second start left the tree on %q, and this box's branch is %q", on, want)
	}
}

// A TREE ON NO BRANCH IS LEFT WHERE IT IS.
//
// A detached HEAD is somebody's bisect or somebody's checkout of an old commit.
// Taking a branch off it would strand what they are doing, and the answer says
// so rather than failing the start.
func TestADetachedTreeKeepsItsHead(t *testing.T) {
	t.Parallel()
	r := aTreeOnTrunk(t)
	at := gitAt(t, r.Work, "rev-parse", "HEAD")
	gitAt(t, r.Work, "checkout", "--quiet", "--detach", at)

	got := TakeTheBoxBranch(r)
	if got.Moved {
		t.Fatalf("a detached tree was moved onto a branch: %s", got.Says)
	}
	if now := gitAt(t, r.Work, "rev-parse", "HEAD"); now != at {
		t.Errorf("the tree stood at %s and now stands at %s", at, now)
	}
	if got.Says == "" {
		t.Error("the start says nothing about why it took no branch")
	}
}

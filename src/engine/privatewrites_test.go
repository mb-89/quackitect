package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A WRITE NO DELTA CAN CARRY PROVES NOTHING.
//
// WhatThisTokenWrote counted every journalled path towards proven, and
// deltaSince drops private material from the delta. The two disagreed, so a
// token whose applies were all under .se answered a delta of nothing with whole
// false: the narrowing kept only what the record proved, the record proved a
// path no delta carries, and se test then ran nothing over a tree that had
// changed and called it ok.
//
// THE ENGINE ASKS FOR EXACTLY THIS CASE. An agent with nothing in hand is told
// to put its command file and its manifest under .se/scratchpad and apply them
// there, so a token whose only apply is private is the ordinary case rather
// than a corner.
//
// THE EMPTY-RECORD DOOR IS THE ONE THIS FALLS THROUGH. tokenwrote.go already
// refuses to narrow on a record that says nothing, for this reason in those
// words. A record that says only what no delta carries says nothing.
func TestAPrivateApplyProvesNothing(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	on := aTokenTaking(t, r, head)
	// THE ONLY APPLY IS THE ONE THE ENGINE ASKED FOR, under .se/scratchpad.
	wrote(t, r, on, ".se/scratchpad/cmd.sh", "ls\n")
	// AND THE TREE CHANGES BESIDE IT, by a write no journal holds.
	if err := os.WriteFile(filepath.Join(dir, "byshell.md"), []byte("# by shell\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	got, err := TestTheDelta(r, db, on, nil, false, "worker-"+on)
	if err != nil {
		t.Fatal(err)
	}
	if len(got.Delta) == 0 && !got.Whole {
		t.Fatal("a token whose only apply is private answered an empty delta and whole false, " +
			"so the suite runs nothing over a tree that changed and calls it ok")
	}
	// AND IT FALLS THROUGH THE DOOR THE EMPTY RECORD USES, naming the token.
	if !got.Whole || !strings.Contains(got.WhyWhole, "nothing in the record") ||
		!strings.Contains(got.WhyWhole, on) {
		t.Errorf("a private apply proved a write: whole %v, %q", got.Whole, got.WhyWhole)
	}
	// AND THE WRITE THAT DID LAND IN THE TREE IS IN THE DELTA.
	var carried bool
	for _, ch := range got.Delta {
		if ch.Path == "byshell.md" {
			carried = true
		}
	}
	if !carried {
		t.Errorf("the delta carries no change at all for the tree's own write: %+v", got.Delta)
	}
	// AND THE PRIVATE PATH IS IN NO DELTA, which is the half that never moved.
	for _, ch := range got.Delta {
		if strings.HasPrefix(ch.Path, ".se/") {
			t.Errorf("the delta carries private material: %s", ch.Path)
		}
	}
}

// AND A TOKEN WITH ONE SHAREABLE APPLY STILL NARROWS TO IT, private applies
// beside it or not. The fix drops private paths from what is proven, and this
// is the row that would go red if it dropped the shareable ones too.
func TestAPrivateApplyDoesNotSpoilAShareableOne(t *testing.T) {
	t.Parallel()
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)
	writeWorkableProcess(t, dir, "queued")
	head := theCommit(t, dir)

	on := aTokenTaking(t, r, head)
	wrote(t, r, on, ".se/scratchpad/cmd.sh", "ls\n")
	wrote(t, r, on, "one.md", "# one\n")

	got, err := TestTheDelta(r, db, on, nil, false, "worker-"+on)
	if err != nil {
		t.Fatal(err)
	}
	if got.Whole {
		t.Errorf("a token with a shareable apply on record was not narrowed: %q", got.WhyWhole)
	}
	var paths []string
	for _, ch := range got.Delta {
		paths = appendOnce(paths, ch.Path)
	}
	if strings.Join(paths, ",") != "one.md" {
		t.Errorf("the delta is not the token's own shareable write: %v", paths)
	}
}

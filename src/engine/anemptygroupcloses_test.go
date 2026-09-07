package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE LADDER IS DRIVEN RUNG BY RUNG, because the value of the closing is the
// order. A box told to merge before its notes are in loses them, and a box told
// to retro after it has merged is told it too late.

// aGroupBoxWithWork is a tree the queue understands, standing on a group branch.
func aGroupBoxWithWork(t *testing.T) Roots {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	for _, args := range [][]string{
		{"init", "--initial-branch", "main"},
		{"config", "user.email", "a@b.c"},
		{"config", "user.name", "a box"},
		{"commit", "--allow-empty", "-m", "one"},
		{"checkout", "-b", "group/archive"},
	} {
		if _, err := gitHere(r, args...); err != nil {
			t.Fatalf("git %v: %v", args, err)
		}
	}
	if got := theGroupOnTheBranch(r); got != "archive" {
		t.Fatalf("the tree stands on group %q, and this needs archive", got)
	}
	return r
}

// aRetroFolder is what a retro leaves behind, which is how the closing knows
// one has run.
func aRetroFolder(t *testing.T, r Roots) {
	t.Helper()
	if err := os.MkdirAll(filepath.Join(RetroDir(r), "20260907-120000"), 0o755); err != nil {
		t.Fatalf("the retro folder could not be made: %v", err)
	}
}

// theMarker is what a box writes to say its group is finished.
func theMarker(t *testing.T, r Roots) {
	t.Helper()
	path := theMarkerPath(r, "archive")
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		t.Fatalf("the marker folder could not be made: %v", err)
	}
	if err := os.WriteFile(path, []byte("closed\n"), 0o644); err != nil {
		t.Fatalf("the marker could not be written: %v", err)
	}
}

// inBucket files a token, which is what the branch narrows the queue by.
func inBucket(t *testing.T, r Roots, id, bucket string) {
	t.Helper()
	for _, dir := range []string{filepath.Join(r.Work, "spec", "work"), r.Private("work")} {
		path := filepath.Join(dir, id+".md")
		b, err := os.ReadFile(path)
		if err != nil {
			continue
		}
		text := strings.Replace(string(b), "\nstatus:", "\nbucket: "+bucket+"\nstatus:", 1)
		if text == string(b) {
			t.Fatalf("%s carries no status line, so the bucket could not be filed", id)
		}
		if err := os.WriteFile(path, []byte(text), 0o644); err != nil {
			t.Fatalf("%s could not be written: %v", id, err)
		}
		return
	}
	t.Fatalf("%s is in no work folder this test can find", id)
}

// AN EMPTY GROUP IS FINISHED RATHER THAN QUIET, and the first thing it owes is
// the retro.
func TestAnEmptyGroupAsksForTheRetro(t *testing.T) {
	r := aGroupBoxWithWork(t)
	c := TheClosing(r)
	if c.Step != closingRetro {
		t.Fatalf("an empty group answered %q: %s", c.Step, c.Says)
	}
	if !strings.Contains(c.Says, "retro") {
		t.Errorf("the answer does not name the retro: %s", c.Says)
	}
	if !strings.Contains(c.Says, "widen") {
		t.Errorf("the answer does not say the box never widens its filter: %s", c.Says)
	}
}

// A TOKEN IN THIS BUCKET SENDS THE CLOSING BACK TO WORK. A retro may mint one,
// and a box that merged away from it would leave work nobody asked for again.
func TestATokenInTheBucketSendsTheClosingBackToWork(t *testing.T) {
	r := aGroupBoxWithWork(t)
	aRetroFolder(t, r)
	theMarker(t, r)
	if c := TheClosing(r); c.Step != closingDone {
		t.Fatalf("the closing stands at %q before the token is filed: %s", c.Step, c.Says)
	}
	tok := mintStandard(t, r, "the group can fix")
	inBucket(t, r, tok.ID, "archive")
	c := TheClosing(r)
	if c.Step != closingWork {
		t.Fatalf("a token in the bucket left the closing at %q: %s", c.Step, c.Says)
	}
	if !strings.Contains(c.Says, "archive") {
		t.Errorf("the answer does not name the group: %s", c.Says)
	}
}

// NOTES ARE NAMED BEFORE THE MERGE, because private does not leave this box.
func TestNotesAreOwedBeforeTheMarker(t *testing.T) {
	r := aGroupBoxWithWork(t)
	aRetroFolder(t, r)
	note := mintNote(t, r, "nobody decided this yet")
	c := TheClosing(r)
	if c.Step != closingNotes {
		t.Fatalf("an open note left the closing at %q: %s", c.Step, c.Says)
	}
	if !strings.Contains(c.Says, note.ID) {
		t.Errorf("the answer does not name the note: %s", c.Says)
	}
	if strings.Contains(c.Says, "Merge") {
		t.Errorf("it asked for the merge with a note still private: %s", c.Says)
	}
}

// WITH THE NOTES IN, THE BRANCH HAS TO SAY IT IS FINISHED.
func TestWithTheNotesInTheMarkerIsAskedFor(t *testing.T) {
	r := aGroupBoxWithWork(t)
	aRetroFolder(t, r)
	c := TheClosing(r)
	if c.Step != closingMarker {
		t.Fatalf("the closing answered %q: %s", c.Step, c.Says)
	}
	if !strings.Contains(c.Says, "spec/work/groups/archive.done") {
		t.Errorf("the answer does not name the marker to write: %s", c.Says)
	}
}

// AND ONCE IT SAYS SO, THE ANSWER IS THE MERGE AND THE SWEEP.
func TestOnceTheMarkerIsThereTheAnswerIsTheMerge(t *testing.T) {
	r := aGroupBoxWithWork(t)
	aRetroFolder(t, r)
	theMarker(t, r)
	c := TheClosing(r)
	if c.Step != closingDone {
		t.Fatalf("the closing answered %q: %s", c.Step, c.Says)
	}
	for _, want := range []string{"Merge", "sweep", "403"} {
		if !strings.Contains(c.Says, want) {
			t.Errorf("the answer does not name %q: %s", want, c.Says)
		}
	}
}

// THE PULL IS HELD WHILE A STEP IS OWED, AND LET GO WHEN NONE IS.
func TestThePullIsHeldWhileTheClosingIsOwed(t *testing.T) {
	r := aGroupBoxWithWork(t)
	if _, refuse := TheGroupIsNotClosed(r, thePull, ""); !refuse {
		t.Fatal("a pull went through with the retro owed")
	}
	aRetroFolder(t, r)
	if _, refuse := TheGroupIsNotClosed(r, thePull, ""); !refuse {
		t.Error("a pull went through with the marker owed")
	}
	theMarker(t, r)
	if why, refuse := TheGroupIsNotClosed(r, thePull, ""); refuse {
		t.Errorf("a pull was held with nothing owed: %s", why)
	}
	if _, refuse := TheGroupIsNotClosed(r, "Read", ""); refuse {
		t.Error("a read was held, and the closing holds the pull alone")
	}
}

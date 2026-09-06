package main

import (
	"strings"
	"testing"
)

// A TOKEN HANDED OVER SAYS WHICH OF ITS SNAPSHOTS THIS BOX DOES NOT HOLD.
//
// A snapshot is a commit under refs/se/steps, and no push carries that ref. A
// tracked token carries its began and ended hashes across boxes and the objects
// they name stay behind. So the second box is handed a pair of hashes it has
// never seen.
//
// THE TEST DOOR ALREADY FALLS BACK. theSnapshotToDiff answers the newest began
// this box holds, or HEAD, and Since names it. The reviewer has no such door:
// the checklist asks for every hunk of git diff began..ended, and that answers
// "fatal: bad object" with nothing said about why or what to do instead.
//
// SO THE HAND-OVER SAYS IT. The notice names the hashes that are not here, says
// the ref travels with no push, and names what can be read instead. A worker
// taking a travelled token hears the same sentence, because it hits the same
// wall for the same reason.
func TestAHandOverSaysWhichSnapshotsAreGone(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a travelled change")

	// THE WORK STEP IS DONE, so a verdict is owed and a reviewer is next.
	if got := Pull(r, "worker-1", RoleWorker, Payload{}); got.Pull != AnswerWork {
		t.Fatalf("the worker was not handed the token: %s %s", got.Pull, got.Notice)
	}
	ticked(t, r, tok.ID)
	if got := Pull(r, "worker-1", RoleWorker, Payload{ID: tok.ID}); got.Pull == AnswerRefused {
		t.Fatalf("the work step was refused: %+v", got.Findings)
	}

	// AND ITS SNAPSHOTS ARE FROM THE BOX THAT DID THE WORK. Both are well
	// formed and neither is an object here, which is what a travelled pair
	// looks like to the box that reviews it.
	const tookUp = "c2682c671c7ab75306367de55d36104c0ec51b96"
	const putDown = "05adfb8a10366d136a5f5c1967b76bc2c7fc2c06"
	done, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}
	done.Began, done.Finished = []string{tookUp}, []string{putDown}
	if err := SaveToken(r, done); err != nil {
		t.Fatal(err)
	}

	got := Pull(r, "reviewer-1", RoleReviewer, Payload{})
	if got.Pull != AnswerWork || got.Token == nil || got.Token.ID != tok.ID {
		t.Fatalf("the reviewer was not handed the token: %s %s", got.Pull, got.Notice)
	}
	for _, hash := range []string{tookUp, putDown} {
		if !strings.Contains(got.Notice, hash) {
			t.Errorf("the notice does not name %s, so the reviewer meets it at git diff: %s", hash, got.Notice)
		}
	}
	if !strings.Contains(got.Notice, "no object here") {
		t.Errorf("the notice does not say the snapshots are missing: %s", got.Notice)
	}
	if !strings.Contains(got.Notice, "refs/se/steps") {
		t.Errorf("the notice does not say why they are missing: %s", got.Notice)
	}

	// AND A TOKEN WHOSE SNAPSHOTS ARE ALL HERE SAYS NOTHING ABOUT TRAVEL. A
	// notice that arrives every time is one nobody reads.
	home := mintStandard(t, r, "a change made here")
	if got := Pull(r, "worker-2", RoleWorker, Payload{}); got.Pull != AnswerWork || got.Token.ID != home.ID {
		t.Fatalf("the worker was not handed the second token: %s %s", got.Pull, got.Notice)
	} else if strings.Contains(got.Notice, "no object here") {
		t.Errorf("a token whose snapshots are all here was told they are not: %s", got.Notice)
	}
}

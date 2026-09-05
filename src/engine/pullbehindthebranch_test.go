package main

import (
	"strings"
	"testing"
)

// A CLONE BEHIND THE BRANCH HANDED OUT WORK THE BRANCH HAD CLOSED.
//
// The queue reads doc/work in the tree it runs over. A box three hours behind
// origin carried a note as it stood before its close, so the token read open
// there whatever the branch said, and the pull handed it out to be done again.
// The claim on refs/heads/se/claims says who holds a token and nothing about
// whether it has ended, so it could not help.
//
// THE FETCHED BRANCH IS ALREADY HERE. Every box fetches before it works, the
// archive list travels on the branch, and the ids the branch has archived are
// one git show away with no network on the pull path.

// A PULL OVER A CLONE BEHIND THE BRANCH DOES NOT HAND OUT WHAT THE BRANCH
// ARCHIVED, and the token stays where it is on the disk: bringing the tree into
// step is the person's, and the pull only declines to hand out ended work.
func TestAPullDoesNotHandOutWhatTheBranchArchived(t *testing.T) {
	t.Parallel()
	behind, tok := aCloneBehindTheClose(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})
	if got.Pull == AnswerWork && got.Token != nil && got.Token.ID == tok.ID {
		t.Fatalf("the pull handed out %s, which the branch archived: %s", tok.ID, got.Notice)
	}
	if got.Pull != AnswerWait {
		t.Fatalf("with the one token archived on the branch the pull answered %s: %s", got.Pull, got.Notice)
	}
	back, err := LoadToken(behind, tok.ID)
	if err != nil {
		t.Fatalf("the pull took %s off the clone's disk, which is the person's to do: %v", tok.ID, err)
	}
	if back.Holder != "" {
		t.Fatalf("%s is in %s's hands after the pull declined it", tok.ID, back.Holder)
	}
}

// THE PASS-OVER NAMES THE TOKEN AND THE BRANCH, so an agent that sees a shorter
// queue is told why and what to bring into step, rather than left to guess.
func TestAPassOverNamesTheBranchThatArchivedIt(t *testing.T) {
	t.Parallel()
	behind, tok := aCloneBehindTheClose(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})
	if !strings.Contains(got.Notice, tok.ID) {
		t.Fatalf("the answer does not name %s as passed over: %s", tok.ID, got.Notice)
	}
	if !strings.Contains(got.Notice, "origin/") || !strings.Contains(got.Notice, "archived") {
		t.Fatalf("the answer does not say which branch archived it: %s", got.Notice)
	}
}

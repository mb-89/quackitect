package main

import (
	"context"
	"fmt"
	"path/filepath"
	"strings"
	"testing"
)

// THE REREAD LANDS ON THE FAR COMMIT.
//
// Publish recovers from a refused push by reading what the remote holds and
// writing again on top of it. The fetch named the local ref on both sides, and
// git refuses that as a non-fast-forward the moment this box has written a
// commit of its own, which is always by the time the recovery runs. So the
// recovery never ran, the loser of a race kept its claim to itself, and the
// answer named no reason.
//
// The far ref has a name of its own now. This asks the question that decides
// it: the commit that goes out is the far commit's child, and what this box
// had written before it is no longer on the ref.
func TestTheRereadLandsOnTheFarCommit(t *testing.T) {
	ctx := context.Background()
	r := aTreeWithTheProcesses(t)
	bare := aBareOrigin(t, r)

	// BOTH BOXES START FROM ONE COMMIT.
	zero := aClaimNote(t, r, "wk-reread-zero", "another-box/worker")
	index := filepath.Join(t.TempDir(), "seed.index")
	if _, err := writeTheClaims(ctx, r, index, []string{zero}, "the shared start"); err != nil {
		t.Fatal(err)
	}
	mustGit(t, r.Work, "push", bare, claimsRef+":"+claimsBranch)
	start := mustGit(t, r.Work, "rev-parse", claimsRef)

	// THIS BOX WRITES ONE OF ITS OWN AND DOES NOT PUSH IT, so the two refs
	// have parted.
	mine := aClaimNote(t, r, "wk-reread-mine", "this-box/worker")
	if _, err := writeTheClaims(ctx, r, index, []string{mine}, "this box, unpushed"); err != nil {
		t.Fatal(err)
	}
	unpushed := mustGit(t, r.Work, "rev-parse", claimsRef)
	if unpushed == start {
		t.Fatal("this proves nothing: the local ref did not move")
	}

	// AND THE REMOTE MOVES SOMEWHERE ELSE. The same tree under a different
	// message is a different commit, which is what another box writing its own
	// claim looks like from here.
	far := mustGit(t, r.Work, "-c", "user.name=another", "-c", "user.email=another@box",
		"commit-tree", start+"^{tree}", "-p", start, "-m", "another box's claim")
	mustGit(t, r.Work, "push", "--force", bare, far+":"+claimsBranch)

	// THE FIRST PUSH IS REFUSED, WHICH IS WHAT THE RECOVERY IS FOR.
	once := true
	was := gitRuns
	gitRuns = func(ctx context.Context, r Roots, index string, args ...string) (string, error) {
		if len(args) > 0 && args[0] == "push" && once {
			once = false
			return "", fmt.Errorf("git push: ! [rejected] (fetch first)")
		}
		return was(ctx, r, index, args...)
	}
	t.Cleanup(func() { gitRuns = was })

	next := aClaimNote(t, r, "wk-reread-next", "this-box/worker")
	got := Publish(ctx, r, []string{next}, "this box, after the race")
	if !got.Pushed {
		t.Fatalf("the recovery never reached the remote: %s", got.Says)
	}
	if !got.Rebased {
		t.Fatalf("the recovery path did not run: %s", got.Says)
	}

	if parent := mustGit(t, r.Work, "rev-parse", claimsRef+"^"); parent != far {
		t.Errorf("the claim was written on %s, and the remote held %s", parent, far)
	}
	// AND WHAT THIS BOX HAD WRITTEN BEFORE IT IS OFF THE REF, which is the
	// difference between reading the far ref and ignoring it.
	if _, err := runGit(t, r.Work, "merge-base", "--is-ancestor", unpushed, claimsRef); err == nil {
		t.Error("the ref still descends from this box's own commit, so the far ref was never read")
	}
}

// AND A FETCH THAT FAILS SAYS WHY. The refspec carried --quiet, so a rejection
// reached the answer as an empty reason and a reader had nothing to act on.
func TestAFetchThatFailsLeavesItsReason(t *testing.T) {
	ctx := context.Background()
	r := aTreeWithTheProcesses(t)
	_ = aBareOrigin(t, r)

	// EVERY PUSH IS REFUSED, and so is every fetch, so the recovery cannot read
	// the far ref and has to say so.
	was := gitRuns
	gitRuns = func(ctx context.Context, r Roots, index string, args ...string) (string, error) {
		if len(args) > 0 && (args[0] == "push" || args[0] == "fetch") {
			return "", fmt.Errorf("git %s: could not read from remote repository", args[0])
		}
		return was(ctx, r, index, args...)
	}
	t.Cleanup(func() { gitRuns = was })

	note := aClaimNote(t, r, "wk-reread-said", "this-box/worker")
	got := Publish(ctx, r, []string{note}, "a claim nobody can push")
	if got.Pushed {
		t.Fatal("the push was meant to be refused")
	}
	if !strings.Contains(got.Says, "could not read from remote repository") {
		t.Errorf("the answer names no reason the fetch failed: %q", got.Says)
	}
}

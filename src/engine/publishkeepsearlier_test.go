package main

import (
	"fmt"
	"path/filepath"
	"strings"
	"testing"
)

// A PUSH THAT KEEPS FAILING MUST NOT EAT THE CLAIMS BEFORE IT.
//
// Publish recovers from a refused push by moving the local ref to the remote's
// head and writing the claim again on top. That is right for one claim and
// wrong for the second: the box's earlier claim was on the local ref and
// nowhere else, and the move throws it away. A box that claims A, then B, then
// C publishes only C, and A and B are held here where nobody can see them,
// which is the one thing claims exist to prevent.
//
// The state is not rare. This box's proxy answered HTTP 403 on every push for
// an afternoon, so every claim after the first went through this path.
func TestPublishKeepsEarlierClaimsWhenThePushKeepsFailing(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	bare := aBareOrigin(t, r)

	// ANOTHER BOX PUBLISHED FIRST, so the recovery fetch has something to find.
	// Without that the fetch fails and Publish returns before the move.
	zero := aClaimNote(t, r, "wk-earlier-zero", "another-box/worker")
	index := filepath.Join(t.TempDir(), "seed.index")
	if _, err := writeTheClaims(r, index, []string{zero}, "another box's claim"); err != nil {
		t.Fatal(err)
	}
	mustGit(t, r.Work, "push", bare, claimsRef+":"+claimsBranch)

	a := aClaimNote(t, r, "wk-earlier-a", "this-box/worker")
	b := aClaimNote(t, r, "wk-earlier-b", "this-box/worker")
	c := aClaimNote(t, r, "wk-earlier-c", "this-box/worker")

	// EVERY PUSH IS REFUSED WHILE THIS STANDS, and everything else is the real
	// git, so the ref and its trees are the ones git actually writes.
	refused := true
	was := gitRuns
	gitRuns = func(r Roots, index string, args ...string) (string, error) {
		if len(args) > 0 && args[0] == "push" && refused {
			return "", fmt.Errorf("git push: HTTP 403 curl 22")
		}
		return was(r, index, args...)
	}
	t.Cleanup(func() { gitRuns = was })

	if got := Publish(r, []string{a}, "claim a"); got.Pushed {
		t.Fatalf("the first push was meant to be refused: %s", got.Says)
	}
	if got := Publish(r, []string{b}, "claim b"); got.Pushed {
		t.Fatalf("the second push was meant to be refused: %s", got.Says)
	}

	// AND THEN THE NETWORK COMES BACK.
	refused = false
	got := Publish(r, []string{c}, "claim c")
	if !got.Pushed {
		t.Fatalf("the third claim never reached the remote: %s", got.Says)
	}

	listed := mustGit(t, r.Work, "ls-tree", "-r", "--name-only", claimsRef)
	for _, want := range []string{zero, a, b, c} {
		if !strings.Contains(listed, want) {
			t.Errorf("the claims ref does not carry %s, so a claim this box made is published nowhere: %q", want, listed)
		}
	}
	// AND THE REMOTE HAS THEM, which is the whole point of publishing.
	mustGit(t, r.Work, "fetch", "-q", bare, "+"+claimsBranch+":refs/se/published")
	far := mustGit(t, r.Work, "ls-tree", "-r", "--name-only", "refs/se/published")
	for _, want := range []string{zero, a, b, c} {
		if !strings.Contains(far, want) {
			t.Errorf("the remote does not carry %s, so no other box can see that claim: %q", want, far)
		}
	}
}

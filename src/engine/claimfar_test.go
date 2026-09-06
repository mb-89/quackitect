package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// TWO BOXES, ONE REMOTE, AND THE LOSER WRITES ON THE WINNER'S COMMIT.
//
// Every other test of this path feeds git and reads the calls the engine made.
// This one drives the real git over two work trees and a bare remote, because
// what a call cannot say is whether git accepted it. A fetch over the local ref
// is refused the moment this box holds a claim it has not pushed, which is the
// state of every box that has just claimed anything, and under --quiet the
// refusal says nothing at all.
//
// SO THE PROOF IS THE PARENT. The commit the second box pushes has the first
// box's commit as its parent, and the claims file it carries names both boxes.
//
// IT NAMES NO REMOTE REF. Which name the far side carries is the push's
// business and has changed once already, so the assertion is that the remote
// holds the commit this box wrote, whatever it is filed under.

// aRemoteForClaims is a bare repository both boxes push their claims to.
func aRemoteForClaims(t *testing.T) string {
	t.Helper()
	at := filepath.Join(t.TempDir(), "remote.git")
	gitAt(t, t.TempDir(), "init", "--bare", "--quiet", at)
	return at
}

// aBoxHolding is a work tree with git in it, a remote, and one note that says
// it is claimed. The note is written by hand, so this stands up without the
// processes and the schemas a mint would want.
func aBoxHolding(t *testing.T, remote, id, by string) Roots {
	t.Helper()
	root := t.TempDir()
	r := Roots{Method: root, Work: root}
	gitAt(t, root, "init", "--quiet")
	if remote != "" {
		gitAt(t, root, "remote", "add", "origin", remote)
	}
	at := filepath.Join(root, "doc", "work", id+".md")
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	// THE STAMP IS NOW, because a claim past its hours is dropped from the file
	// on the next write, which is a different rule from the one under test.
	note := "---\nkind: [[work-token]]\ntitle: " + id + "\nstatus: open\nclaimed_by: " + by +
		"\nclaimed_at: \"" + time.Now().UTC().Format(time.RFC3339) + "\"\n---\n\n## detail\n\na claim.\n"
	if err := os.WriteFile(at, []byte(note), 0o644); err != nil {
		t.Fatal(err)
	}
	return r
}

func TestAClaimIsWrittenOnTheFarCommit(t *testing.T) {
	t.Parallel()
	remote := aRemoteForClaims(t)
	one := aBoxHolding(t, remote, "wk-1111111111", "box-one/worker-one")
	two := aBoxHolding(t, remote, "wk-2222222222", "box-two/worker-two")

	// THE FIRST BOX WINS THE RACE, and its commit is what the remote holds.
	if got := Publish(t.Context(), one, []string{"doc/work/wk-1111111111.md"}, "one claims"); !got.Pushed {
		t.Fatalf("the first claim never reached the remote: %s", got.Says)
	}
	far := gitAt(t, one.Work, "rev-parse", claimsRef)

	// THE SECOND BOX IS BEHIND THE REMOTE AND AHEAD OF ITS OWN REF, so its
	// first push is refused and the recovery is the whole of this test.
	got := Publish(t.Context(), two, []string{"doc/work/wk-2222222222.md"}, "two claims")
	if !got.Rebased {
		t.Fatalf("the far claims were never read: %s", got.Says)
	}
	if !got.Pushed {
		t.Fatalf("the second push never landed, so a box that loses one race never publishes: %s", got.Says)
	}

	if parent := gitAt(t, two.Work, "rev-parse", claimsRef+"^"); parent != far {
		t.Errorf("the pushed commit's parent is %s, and the far commit is %s", parent, far)
	}
	carried := gitAt(t, two.Work, "show", claimsRef+":"+claimsFile)
	for _, want := range []string{"wk-1111111111", "wk-2222222222"} {
		if !strings.Contains(carried, want) {
			t.Errorf("the claims file carries %q, and %s belongs in it", carried, want)
		}
	}
	mine := gitAt(t, two.Work, "rev-parse", claimsRef)
	if said := gitAt(t, two.Work, "ls-remote", "origin"); !strings.Contains(said, mine) {
		t.Errorf("the remote holds %q, and this box wrote %s", said, mine)
	}
}

// A FETCH TO A REMOTE THAT IS NOT THERE SAYS WHY.
//
// The seam-driven twin of this lives in claimrereadlands_test.go under the
// plain name. This one uses a real git and a path nobody made, so it proves
// the same sentence over words git itself wrote.
//
// The recovery's fetch carried --quiet, so git's reason was suppressed and the
// answer read "The push did not run: " with nothing after the colon, on every
// claim a box made while it could not reach the remote.
func TestAFetchToARemoteThatIsNotThereLeavesItsReason(t *testing.T) {
	t.Parallel()
	nowhere := filepath.Join(t.TempDir(), "no-such-remote.git")
	r := aBoxHolding(t, nowhere, "wk-3333333333", "box-three/worker-alone")

	got := Publish(t.Context(), r, []string{"doc/work/wk-3333333333.md"}, "a claim nobody receives")
	if got.Pushed {
		t.Fatalf("a push to a remote that is not there answered pushed: %s", got.Says)
	}
	if !got.Committed {
		t.Fatalf("the claim was not committed here either: %s", got.Says)
	}
	if !strings.Contains(got.Says, "git fetch:") {
		t.Fatalf("the answer does not name the fetch that failed: %q", got.Says)
	}
	if _, why, _ := strings.Cut(got.Says, "git fetch:"); strings.TrimSpace(why) == "" {
		t.Errorf("the answer stops at the colon, so git's reason reached nobody: %q", got.Says)
	}
}

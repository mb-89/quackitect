package main

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

// A REAL GIT AND A REAL REMOTE, because what is under test is which ref name a
// remote accepts, and a fed git would answer whatever it was told.
type gitTestError struct{ what, why string }

func (e *gitTestError) Error() string { return "git " + e.what + ": " + e.why }

func runGit(t *testing.T, dir string, args ...string) (string, error) {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = dir
	cmd.Env = append(os.Environ(),
		"GIT_AUTHOR_NAME=t", "GIT_AUTHOR_EMAIL=t@t",
		"GIT_COMMITTER_NAME=t", "GIT_COMMITTER_EMAIL=t@t",
		"GIT_TERMINAL_PROMPT=0")
	out, err := cmd.Output()
	if ee, ok := err.(*exec.ExitError); ok {
		return "", &gitTestError{what: strings.Join(args, " "), why: strings.TrimSpace(string(ee.Stderr))}
	}
	return strings.TrimSpace(string(out)), err
}

func mustGit(t *testing.T, dir string, args ...string) string {
	t.Helper()
	out, err := runGit(t, dir, args...)
	if err != nil {
		t.Fatal(err)
	}
	return out
}

// aBareOrigin gives this tree a remote of its own, so a push is a real push.
func aBareOrigin(t *testing.T, r Roots) string {
	t.Helper()
	bare := filepath.Join(t.TempDir(), "origin.git")
	mustGit(t, "", "init", "--bare", "--initial-branch=main", bare)
	mustGit(t, r.Work, "init", "--initial-branch=main")
	_, _ = runGit(t, r.Work, "remote", "remove", "origin")
	mustGit(t, r.Work, "remote", "add", "origin", bare)
	return bare
}

func aClaimNote(t *testing.T, r Roots, id, by string) string {
	t.Helper()
	rel := filepath.Join("doc", "work", id+".md")
	at := filepath.Join(r.Work, rel)
	if err := os.MkdirAll(filepath.Dir(at), 0o755); err != nil {
		t.Fatal(err)
	}
	body := "---\nkind: [[work-token]]\ntitle: " + id + "\nstatus: open\nclaimed_by: " + by +
		"\nclaimed_at: \"2026-09-05T00:00:00Z\"\n---\n\n## detail\n\na claim.\n"
	if err := os.WriteFile(at, []byte(body), 0o644); err != nil {
		t.Fatal(err)
	}
	return filepath.ToSlash(rel)
}

// EVERY REMOTE SIDE THE ENGINE NAMES FOR CLAIMS IS THE BRANCH.
//
// A push to refs/se/* answers HTTP 403 in the sandbox, so a box there published
// nothing and every other box went on offering the token it had taken. This is
// the whole fix, and it is one name: the far side of the push and of the fetch.
func TestClaimsRideABranch(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["write-tree"] = "aaaa"
	fed.says["commit-tree"] = "bbbb"

	Publish(r, []string{"doc/work/wk-1.md"}, "a claim")
	SyncClaims(r)

	if !fed.asked("push", "origin", claimsRef+":"+claimsBranch) {
		t.Error("the push does not name the branch on the remote side, so a box in the sandbox still publishes nothing")
	}
	if !fed.asked("fetch", "origin", "+"+claimsBranch+":"+remoteClaimsRef) {
		t.Error("the fetch does not ask for the branch, so this box reads nobody's claims")
	}
	// AND NOTHING PUSHES THE OLD REF ANY MORE, which is the ref that is refused.
	if fed.asked("push", ":"+claimsRef) {
		t.Error("a push still names refs/se/claims on the remote side, which the proxy refuses")
	}
	// THE LOCAL REF DID NOT MOVE. A claim stays off every branch listing here.
	if !fed.asked("update-ref", claimsRef) {
		t.Error("the claim was not written to the local claims ref")
	}
}

// AND IT ARRIVES. The name is only right if a remote takes it.
func TestClaimReachesTheBareBranch(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	bare := aBareOrigin(t, r)
	note := aClaimNote(t, r, "wk-branch", "box-one/worker")

	got := Publish(r, []string{note}, "a claim")
	if !got.Pushed {
		t.Fatalf("the claim did not reach the remote: %s", got.Says)
	}
	if listed := mustGit(t, r.Work, "ls-remote", bare, claimsBranch); listed == "" {
		t.Errorf("git ls-remote %s %s answers nothing, so the claim is on no branch", bare, claimsBranch)
	}
}

// WHAT WAS PUBLISHED BEFORE THE BRANCH IS STILL READ.
//
// Origin carries claims on the old refs/se/claims from every box that ran before
// this change. A reader that only asked for the branch would call those tokens
// nobody's and hand out work that is held. So the old ref is read as a fallback,
// and never written.
func TestOldClaimsRefIsStillRead(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	bare := aBareOrigin(t, r)
	note := aClaimNote(t, r, "wk-old", "an-older-box/worker")

	// A REMOTE FROM BEFORE THE BRANCH: its claims sit on refs/se/claims and it
	// carries no branch of them at all.
	index := filepath.Join(t.TempDir(), "claim.index")
	if _, err := writeTheClaims(r, index, []string{note}, "an older box's claim"); err != nil {
		t.Fatal(err)
	}
	mustGit(t, r.Work, "push", bare, claimsRef+":"+claimsRef)
	if listed := mustGit(t, r.Work, "ls-remote", bare, claimsBranch); listed != "" {
		t.Fatalf("the remote already carries the branch, so this is not the case under test: %s", listed)
	}
	// THE ONLY COPY IS THE REMOTE'S NOW, so what is read had to be fetched.
	mustGit(t, r.Work, "update-ref", "-d", claimsRef)

	got := SyncClaims(r)
	if _, ok := got.Claims["wk-old"]; !ok {
		t.Errorf("a claim on the old ref was not read, so every claim published before the branch is lost: %q %+v", got.Says, got.Claims)
	}
}

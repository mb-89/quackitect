package main

import (
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

// THE CLAIMS REF CARRIES ONE FILE, ONE LINE PER LIVE CLAIM.
//
// It carried the whole markdown of every token ever claimed, and the sync read
// each one to parse two frontmatter fields. Nothing ever left the tree, so at
// tens of thousands of tokens every sync would list tens of thousands of
// entries to learn two values each. What happened is the record's job. The ref
// holds what is live: the id, who, and when.

// gitOver runs one git command in the work tree and answers what it printed.
func gitOver(t *testing.T, r Roots, args ...string) string {
	t.Helper()
	cmd := exec.Command("git", args...)
	cmd.Dir = r.Work
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("git %s: %v\n%s", strings.Join(args, " "), err, out)
	}
	return strings.TrimSpace(string(out))
}

// THE REAL GIT, ONCE. A claim is published and the ref is listed.
func TestTheClaimsRefHoldsOneFileAndNoNote(t *testing.T) {
	t.Parallel()
	r := aTreeWithHistory(t)
	tok, err := Mint(r, Token{Process: "standard", Title: "a token to claim", Status: "first",
		Tracked: tracked(), Detail: "claimed so the ref has something to carry"})
	if err != nil {
		t.Fatal(err)
	}
	me := Claimant(r, "main")
	res, err := Claim(r, me, []string{tok.ID}, time.Now().UTC())
	if err != nil || len(res.Taken) != 1 {
		t.Fatalf("the claim did not land: %+v %v", res, err)
	}
	// THERE IS NO REMOTE, so the push fails and the commit stands.
	if p := Publish(t.Context(), r, res.Files, "a claim"); !p.Committed {
		t.Fatalf("the claim was not committed: %s", p.Says)
	}

	listed := gitOver(t, r, "ls-tree", "-r", "--name-only", claimsRef)
	if listed != claimsFile {
		t.Fatalf("the ref holds %q, and it should hold %s alone", listed, claimsFile)
	}
	text := gitOver(t, r, "show", claimsRef+":"+claimsFile)
	if !strings.Contains(text, tok.ID+" "+me+" ") {
		t.Fatalf("the file does not carry the claim as one line: %q", text)
	}

	// AND A RELEASE TAKES THE LINE OUT.
	freed, err := Release(r, me, []string{tok.ID}, time.Now().UTC())
	if err != nil || len(freed.Freed) != 1 {
		t.Fatalf("the release did not land: %+v %v", freed, err)
	}
	if p := Publish(t.Context(), r, freed.Files, "a release"); !p.Committed {
		t.Fatalf("the release was not committed: %s", p.Says)
	}
	if text := gitOver(t, r, "show", claimsRef+":"+claimsFile); strings.Contains(text, tok.ID) {
		t.Fatalf("the released token is still in the file: %q", text)
	}
}

// A LAPSED CLAIM IS ABSENT FROM THE FILE THE NEXT WRITE PRODUCES. The engine
// already ignores it, and carrying it would be carrying what has ever happened.
func TestALapsedClaimLeavesTheFileOnTheNextWrite(t *testing.T) {
	t.Parallel()
	r := aTreeWithTheProcesses(t)
	now := time.Now().UTC()
	live := now.Add(-time.Minute).Format(ClaimStamp)
	have := map[string]FarClaim{
		"wk-old0000": {By: "0badc0de/worker-far", At: "2020-01-01T00:00:00Z"},
		"wk-live000": {By: "0badc0de/worker-far", At: live},
	}
	tok := mintStandard(t, r, "claimed on this box")
	back, err := LoadToken(r, tok.ID)
	if err != nil {
		t.Fatal(err)
	}

	text := nextClaimsFile(r, have, []string{filepath.Join(dirFor(r, back), back.ID+".md")}, now)
	if strings.Contains(text, "wk-old0000") {
		t.Fatalf("a claim older than the window was carried into the next file:\n%s", text)
	}
	if !strings.Contains(text, "wk-live000 0badc0de/worker-far "+live) {
		t.Fatalf("a live claim from another box was dropped:\n%s", text)
	}
	if !strings.Contains(text, back.ID+" "+back.ClaimedBy+" "+back.ClaimedAt) {
		t.Fatalf("this box's claim is not in the file:\n%s", text)
	}
}

// THE SYNC READS OTHER BOXES' CLAIMS OFF THE ONE FILE, with no tree to list.
func TestSyncClaimsReadsTheOneFile(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	fed := aFedGit(t)
	fed.says["rev-parse"] = "cafe1234"
	fed.says["show cafe1234:"+claimsFile] = "wk-far 0badc0de/worker-far 2026-09-04T06:00:00Z\n"

	got := SyncClaims(t.Context(), r)
	if got.Says != "" {
		t.Fatalf("the sync did not read the ref: %s", got.Says)
	}
	if len(got.Claims) != 1 || got.Claims["wk-far"].By != "0badc0de/worker-far" || got.Claims["wk-far"].At != "2026-09-04T06:00:00Z" {
		t.Fatalf("the sync read %+v", got.Claims)
	}
	if fed.asked("ls-tree") {
		t.Error("the sync listed the tree, which the one file makes needless")
	}
}

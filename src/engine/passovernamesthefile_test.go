package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A REMEDY NAMING A FOLDER THE STALE COPY IS NOT IN CANNOT BE FOLLOWED.
//
// The pass-over tells the reader to bring doc/work into step with the branch.
// That is the right remedy for a note under doc/work and no remedy at all for
// one under .se/work, which git carries nowhere. No fetch, no merge and no
// reset moves it.
//
// MEASURED, September 2026. Three ids were named on every pull of a session
// under that instruction, and doc/work held none of the three. All three sat
// under .se/work. The queue stayed blocked and each hand was sent to a folder
// with nothing in it.
//
// SO THE NOTICE NAMES THE FILE. Both kinds ride in one tree here, because the
// engine has to tell them apart rather than pick one wording for both.
func TestThePassOverNamesTheFileItMeans(t *testing.T) {
	behind, onTheBranch, private := aCloneWithBothKindsOfPassOver(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})

	trackedAt := "doc/work/" + onTheBranch.ID + ".md"
	privateAt := ".se/work/" + private.ID + ".md"
	if !strings.Contains(got.Notice, trackedAt) {
		t.Errorf("the notice does not name %s, so the reader is told a folder and not a file:\n%s", trackedAt, got.Notice)
	}
	if !strings.Contains(got.Notice, privateAt) {
		t.Errorf("the notice does not name %s, which is the file that has to go:\n%s", privateAt, got.Notice)
	}

	// THE PRIVATE HALF IS READ ALONE. The tracked half may ask for a fetch and
	// this one may not, so one paragraph carrying both could satisfy neither.
	said := ""
	for _, part := range strings.Split(got.Notice, "\n\nPassed over") {
		if strings.Contains(part, private.ID) {
			said = part
		}
	}
	if said == "" {
		t.Fatalf("no paragraph of the notice names %s:\n%s", private.ID, got.Notice)
	}
	if strings.Contains(said, onTheBranch.ID) {
		t.Fatalf("both kinds are in one paragraph, so neither can carry its own remedy:\n%s", said)
	}
	if strings.Contains(said, "fetch") {
		t.Errorf("the private copy is told to fetch, and no fetch reaches .se/work:\n%s", said)
	}
	if strings.Contains(said, "Bring doc/work into step") {
		t.Errorf("the private copy is sent to doc/work, which does not hold it:\n%s", said)
	}
}

// aCloneWithBothKindsOfPassOver hands back a clone carrying two tokens the
// branch has archived. One is a note under doc/work that the branch has moved
// on from, so a fetch really would bring it into step. The other is a private
// note under .se/work, which no fetch reaches at all.
func aCloneWithBothKindsOfPassOver(t *testing.T) (Roots, Token, Token) {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	tok := mintUnclaimed(t, r, "behind the branch")
	gitAt(t, r.Work, "add", "--", "doc", "src")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")
	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)
	behind := Roots{Method: clone, Work: clone}

	// THE PRIVATE COPY IS MINTED IN THE CLONE, so it is under .se/work there
	// and the branch has never carried it.
	private, err := Mint(behind, Token{Tracked: local(), Process: "trivial", Title: "a private copy",
		Detail:   "a copy of work the branch has already archived",
		Criteria: []Criterion{{Says: "the notice names the file it means"}}})
	if err != nil {
		t.Fatalf("minting the private copy: %v", err)
	}

	// THE BRANCH CLOSES THE TRACKED ONE AND ARCHIVES BOTH IDS.
	tok.Disposition, tok.Status = Done, "closed"
	if err := SaveToken(r, tok); err != nil {
		t.Fatalf("closing %s: %v", tok.ID, err)
	}
	list := filepath.Join(r.Work, "doc", "work", "archive.jsonl")
	was, _ := os.ReadFile(list)
	rows := string(was) +
		`{"id":"` + tok.ID + `","title":"behind the branch","disposition":"done"}` + "\n" +
		`{"id":"` + private.ID + `","title":"a private copy","disposition":"done"}` + "\n"
	if err := os.WriteFile(list, []byte(rows), 0o644); err != nil {
		t.Fatal(err)
	}
	gitAt(t, r.Work, "add", "--all", "--", "doc/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the close and the rows")

	gitAt(t, clone, "fetch", "--quiet", "origin")
	if at := noteAt(behind, tok.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so it is not behind the branch", tok.ID)
	}
	if at := noteAt(behind, private.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so there is no private copy to name", private.ID)
	}
	return behind, tok, private
}

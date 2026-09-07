package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A NOTICE THAT BLAMES A LAG THERE IS NONE OF IS AN INSTRUCTION NOBODY CAN ACT ON.
//
// The queue declines to hand out what the fetched branch has archived, and says
// the clone is behind and to bring doc/work into step. That reading is right
// when the branch dropped the note. It is wrong when the branch carries the
// note and an archive row for it at once.
//
// MEASURED, September 2026. Three ids were named on every pull of a session,
// each with that instruction. Two stood on the branch byte for byte as they
// stood here, so no fetch and no checkout could have changed anything. Three
// hands read the notice and none of them could satisfy it.
//
// SO THE NOTICE ONLY BLAMES A LAG IT CANNOT RULE OUT. Where the note here is
// the branch's own note, the record disagrees with itself, and that is what the
// answer says.
func TestTheNoticeDoesNotBlameALagItCanRuleOut(t *testing.T) {
	t.Parallel()
	behind, tok := aCloneWhoseBranchDisagrees(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})
	if !strings.Contains(got.Notice, tok.ID) {
		t.Fatalf("the pass-over does not name %s: %s", tok.ID, got.Notice)
	}
	if strings.Contains(got.Notice, "this clone is behind it") {
		t.Errorf("the notice blames a lag over a note the branch carries unchanged: %s", got.Notice)
	}
	if strings.Contains(got.Notice, "Bring doc/work into step") {
		t.Errorf("the notice asks for a fetch that would change nothing: %s", got.Notice)
	}
	if !strings.Contains(got.Notice, "disagrees with itself") {
		t.Errorf("the notice does not say the two halves of the record disagree: %s", got.Notice)
	}
}

// AND A BRANCH THAT REALLY DID MOVE ON IS STILL READ AS A LAG, so the rule
// above narrowed the notice rather than removing it.
func TestARealLagIsStillNamedALag(t *testing.T) {
	t.Parallel()
	behind, tok := aCloneBehindTheClose(t)

	got := Pull(behind, "worker-1", RoleWorker, Payload{})
	if !strings.Contains(got.Notice, tok.ID) {
		t.Fatalf("the pass-over does not name %s: %s", tok.ID, got.Notice)
	}
	if !strings.Contains(got.Notice, "this clone is behind it") {
		t.Errorf("a clone whose branch moved the note on is no longer told it is behind: %s", got.Notice)
	}
}

// aCloneWhoseBranchDisagrees hands back a clone whose note is on the fetched
// branch byte for byte as it is here, while that same branch archives the id.
//
// THE ARCHIVE ROW IS WRITTEN AND THE NOTE IS NOT TOUCHED, which is the shape
// the record was actually found in: a close that wrote its row and left the
// note standing.
func aCloneWhoseBranchDisagrees(t *testing.T) (Roots, Token) {
	t.Helper()
	r := aTreeWithTheProcesses(t)
	tok := mintUnclaimed(t, r, "the record disagrees")
	gitAt(t, r.Work, "add", "--", "doc", "src")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the token")
	clone := filepath.Join(t.TempDir(), "clone")
	gitAt(t, r.Work, "clone", "--quiet", "--no-tags", "file://"+filepath.ToSlash(r.Work), clone)

	// THE BRANCH ARCHIVES THE ID AND LEAVES THE NOTE ALONE.
	list := filepath.Join(r.Work, "doc", "work", "archive.jsonl")
	was, _ := os.ReadFile(list)
	row := string(was) + `{"id":"` + tok.ID + `","title":"` + tok.Title + `","disposition":"done"}` + "\n"
	if err := os.WriteFile(list, []byte(row), 0o644); err != nil {
		t.Fatal(err)
	}
	gitAt(t, r.Work, "add", "--all", "--", "doc/work")
	gitAt(t, r.Work, "commit", "--quiet", "-m", "the row and not the note")

	gitAt(t, clone, "fetch", "--quiet", "origin")
	behind := Roots{Method: clone, Work: clone}
	if at := noteAt(behind, tok.ID); at == "" {
		t.Fatalf("the clone does not carry %s, so there is nothing to disagree about", tok.ID)
	}
	return behind, tok
}

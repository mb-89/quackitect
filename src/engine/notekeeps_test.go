package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// THE NOTE IS THE AUTHOR'S ANSWER SHEET, AND A SUBMISSION MUST NOT EAT IT.
//
// MEASURED on a live token. The author wrote three evidence tables into
// its note under doc/work, the gate read them off it and let the move
// through, and then submit assigned t.Submission = p.Evidence over the top.
// That payload carried no evidence, so the map went nil and SaveToken rebuilt
// the file from the struct with every table gone, while the frontmatter came
// out current. The author's answers survived only in the ended commit, and no
// reviewer could rule on the token afterwards, because the checklist a verdict
// reads is the checklist that had just been deleted.
//
// Two smaller traps sit beside it, and both make the engine lie about why. A
// note that has lost a section reads as a row somebody forgot to tick, and a
// criterion the process renamed after the mint reads the same way, when in
// both cases there is no row on the note to tick at all.

// The author's own answers, written the way a person writes them into the note.
const (
	askTable = "| done | criterion | evidence | receipt |\n" +
		"|---|---|---|---|\n" +
		"| [x] | the ask is small enough to review whole | it is one function | se_run 1 |"
	doTable = "| done | criterion | evidence | receipt |\n" +
		"|---|---|---|---|\n" +
		"| [x] | one test was seen red and then green | red at 09:02, green at 09:31 | se_test 4 |"
	doSays = "one test was seen red and then green"
)

func mintWithChecklist(t *testing.T, r Roots, sub map[string]string) Token {
	t.Helper()
	tok, err := Mint(r, Token{Tracked: tracked(), Process: "task", Title: "a token that answers",
		Status: "open", Detail: "minted by the test", Submission: sub})
	if err != nil {
		t.Fatal(err)
	}
	return tok
}

// noteText answers what the note holds, wherever it is.
//
// A token that closes comes off the disk, so a test reading one after it
// closed reads the archive. That is the same door a person gets.
func noteText(t *testing.T, r Roots, id string) string {
	t.Helper()
	for _, dir := range workDirs(r) {
		if b, err := os.ReadFile(filepath.Join(dir, id+".md")); err == nil {
			return string(b)
		}
	}
	said, err := ReadArchived(r, id)
	if err != nil {
		t.Fatalf("%s is on neither disk nor in the archive: %v", id, err)
	}
	return said
}

// A SUBMISSION SAYS WHAT IT BRINGS. IT DOES NOT SAY WHAT THE NOTE NO LONGER
// HOLDS. The move rewrites the frontmatter, and every section it did not
// author has to come out the other side byte for byte.
func TestASubmissionKeepsEvidenceItDidNotSend(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, doSays)
	tok := mintWithChecklist(t, r, map[string]string{
		"step 1. ask": askTable, "step 2. do": doTable})

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull == AnswerRefused {
		t.Fatalf("the answers are on the note and the submission was refused: %+v", got.Findings)
	}
	text := noteText(t, r, tok.ID)
	for _, want := range []string{
		"## evidence: step 1. ask", askTable,
		"## evidence: step 2. do", doTable,
	} {
		if !strings.Contains(text, want) {
			t.Fatalf("the save ate what the author wrote. This is gone from the note:\n%s\n\n"+
				"and the note now reads:\n%s", want, text)
		}
	}
}

// A SECTION THAT IS GONE IS SAID TO BE GONE. Told a row is unticked, a worker
// goes and ticks a row that is not there, and a reviewer cannot honestly tick
// somebody else's answers at all.
func TestAMissingEvidenceSectionIsNamed(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, doSays)
	tok := mintWithChecklist(t, r, nil)

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull != AnswerRefused {
		t.Fatal("a note carrying no checklist at all was accepted")
	}
	f := got.Findings[0]
	if !strings.Contains(f.Wrong, "evidence: step 1. ask") {
		t.Fatalf("the refusal does not name the section the note has lost: %+v", f)
	}
	if strings.Contains(f.Wrong, "is not ticked") {
		t.Fatalf("a section that is gone was reported as a row somebody forgot to tick: %+v", f)
	}
}

// THE NOTE FREEZES THE WORDING AT MINT AND THE GATE LOADS THE PROCESS FRESH,
// so a criterion renamed since is a criterion no row can ever match. It read
// as an unticked row, which is a lie: there is nothing on the note to tick.
func TestACriterionRenamedSinceMintIsNamed(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, doSays)
	tok := mintWithChecklist(t, r, map[string]string{
		"step 1. ask": askTable, "step 2. do": doTable})

	// The process is edited after the token was minted. That is the whole trap.
	const renamed = "one test was written first, seen red, and seen green after"
	aChecklistOver(t, r, renamed)

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done"})
	if got.Pull != AnswerRefused {
		t.Fatal("a criterion with no row on the note passed for a ticked one")
	}
	f := got.Findings[0]
	if !strings.Contains(f.Wrong, renamed) {
		t.Fatalf("the refusal does not name the criterion it could not find: %+v", f)
	}
	if !strings.Contains(f.Wrong, "no row") {
		t.Fatalf("the refusal does not say the row is absent rather than unticked: %+v", f)
	}
	if strings.Contains(f.Wrong, "is not ticked") {
		t.Fatalf("a criterion with no row was reported as an unticked row: %+v", f)
	}
}

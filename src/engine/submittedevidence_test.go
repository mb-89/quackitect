package main

import (
	"strings"
	"testing"
)

// THE GATE READS THE EVIDENCE A SUBMISSION BRINGS.
//
// se pull takes an evidence map, one chapter per step, and the notice on a
// handed token says to answer every line and then submit. So an agent answers
// the lines in the submission itself. The gate read only the tables the note
// already held, so a first submission whose answers were in the payload alone
// was refused naming the first blank line, and, since the refusal came before
// the merge, the answers it carried were dropped with it.
//
// MEASURED on a live token. A submission carrying both step tables, every line
// answered, was refused: step 1, ask: this is not answered. The same answers
// written onto the note with se apply, and the same submission sent with no
// evidence at all, closed the token. So the only way in was to edit the note
// first, and the evidence argument on the door was decoration.
//
// So the gate reads the note and the submission together, the submission's
// chapter standing in for the note's wherever both have one.

// The ask row as the mint leaves it, not looked at.
const askNotLookedAt = "| done | criterion | evidence | receipt |\n" +
	"|---|---|---|---|\n" +
	"| [ ] | the ask is small enough to review whole |  |  |"

func TestASubmissionsOwnEvidenceClosesTheToken(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, doSays)
	tok := mintWithChecklist(t, r, map[string]string{
		"step 1. ask": askNotLookedAt, "step 2. do": notLookedAt})

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done",
		Evidence: map[string]string{"step 1. ask": askTable, "step 2. do": doTable}})
	if got.Pull == AnswerRefused {
		t.Fatalf("every line was answered in the submission and the gate refused it, "+
			"so the evidence on the door is decoration: %+v", got.Findings)
	}
	// AND THE NOTE CARRIES WHAT THE SUBMISSION BROUGHT.
	text := noteText(t, r, tok.ID)
	for _, want := range []string{askTable, doTable} {
		if !strings.Contains(text, want) {
			t.Fatalf("the answers the submission brought are not on the note:\n%s\n\nthe note reads:\n%s", want, text)
		}
	}
}

// AND A LINE BLANK ON BOTH IS STILL REFUSED, NAMING THAT LINE.
func TestALineBlankInBothNoteAndSubmissionIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithAChecklist(t, doSays)
	tok := mintWithChecklist(t, r, map[string]string{
		"step 1. ask": askNotLookedAt, "step 2. do": notLookedAt})

	got := Pull(r, "worker-a", RoleWorker, Payload{ID: tok.ID, Disposition: "done",
		Evidence: map[string]string{"step 1. ask": askTable, "step 2. do": notLookedAt}})
	if got.Pull != AnswerRefused {
		t.Fatal("a line answered on neither the note nor the submission closed the token, " +
			"so the guard was removed rather than widened")
	}
	f := got.Findings[0]
	if !strings.Contains(f.Wrong, doSays) || !strings.Contains(f.Wrong, "not answered") {
		t.Fatalf("the refusal does not name the blank line: %+v", f)
	}
}

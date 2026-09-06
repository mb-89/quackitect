package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A ROW THE PROCESS ADDED AFTER A STEP WAS ANSWERED IS NOT THAT STEP'S TO
// ANSWER NOW.
//
// The note freezes its checklist at the mint and the gate loads the process
// fresh, so a criterion added to an early step since is a criterion no row on
// the note can match. The gate refused the whole submission for it, whichever
// step was being submitted. On a verdict that means the reviewer is told to
// write a row into the author's own step, which is not the reviewer's to give,
// and the word cap on a section makes it worse still: both notes it was seen on
// were already at the two hundred word bound, so the row only went in after the
// author's evidence had been cut down to fit.
//
// So a step behind the one being submitted answers for the rows it had. The
// step being submitted still answers for every row the process names now,
// because that is the step whose answers are being given.
//
// THE LIVE WALK CANNOT ASK THIS. The two-step process has no step behind the
// one in hand, so the question exists only where there are three.
func TestARowAddedToAnEarlierStepDoesNotBlock(t *testing.T) {
	t.Parallel()
	r := aTreeWithThreeSteps(t)

	p, err := LoadProcess(r.Method, "three")
	if err != nil {
		t.Fatalf("loading the process: %v", err)
	}
	// STANDING AT THE SECOND STATE, THE STEP BEING SUBMITTED IS THE THIRD, so
	// steps one and two are behind it and were answered by somebody else.
	tok := Token{
		Process: "three", Tracked: local(), Title: "a ruled token",
		Status: "second", Detail: "walked by the test", Submission: Checklists(p),
	}
	tok, err = Mint(r, tok)
	if err != nil {
		t.Fatalf("minting: %v", err)
	}
	for _, step := range []string{"step 1. one", "step 2. two", "step 3. three"} {
		tok.Submission[step] = strings.ReplaceAll(tok.Submission[step], "| [ ] |", "| [x] |")
	}
	if f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"}); f != nil {
		t.Fatalf("the submission was refused before the process moved at all: %s", f.Wrong)
	}

	// THE PROCESS GAINS A CRITERION IN THE FIRST STEP, after that step was
	// answered. That is the whole trap.
	const added = "what breaks if it is never done"
	addCriterion(t, r, "the first thing was done", added)

	if f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"}); f != nil {
		t.Fatalf("a row added to a step that is already behind blocked the later step, "+
			"so whoever submits it has to write into somebody else's answers: %s", f.Wrong)
	}

	// AND THE STEP BEING SUBMITTED STILL ANSWERS FOR ITS OWN ROWS, so this is a
	// step boundary rather than the guard being taken off.
	const alsoAdded = "every hunk was read"
	addCriterion(t, r, "the third thing was done", alsoAdded)
	f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"})
	if f == nil {
		t.Fatal("a row the process names for the step being submitted passed for an answered one")
	}
	if !strings.Contains(f.Wrong, alsoAdded) {
		t.Fatalf("the refusal does not name the row the step being submitted lacks: %s", f.Wrong)
	}
}

// addCriterion writes another criterion into the process beside the one named,
// which is how a test moves the process after a token was minted against it.
func addCriterion(t *testing.T, r Roots, beside, says string) {
	t.Helper()
	path := filepath.Join(ProcessesDir(r.Method), "three.process.yaml")
	b, err := os.ReadFile(path)
	if err != nil {
		t.Fatalf("reading the process: %v", err)
	}
	was := "      - says: " + beside + "\n"
	if !strings.Contains(string(b), was) {
		t.Fatalf("the process carries no criterion %q, so nothing was added beside it", beside)
	}
	now := was + "      - says: " + says + "\n"
	if err := os.WriteFile(path, []byte(strings.Replace(string(b), was, now, 1)), 0o644); err != nil {
		t.Fatalf("writing the process: %v", err)
	}
}

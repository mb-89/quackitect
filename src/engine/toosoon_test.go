package main

import (
	"strings"
	"testing"
)

// A STEP TICKED BEFORE THE TOKEN GETS THERE IS REFUSED.
//
// THE OWNER ASKED FOR IT BY NAME: every step goes in the note from the
// beginning, so a reader sees the whole process rather than the part that has
// happened, and the engine refuses if somebody checks boxes too early.
//
// THE LIVE WALK CANNOT ASK THIS. The note process has two steps and a token
// standing at its one middle state is doing the second, so there is no step
// after the one in hand to tick. A fixture with three steps is where the
// question exists.
func TestAStepTickedTooEarlyIsRefused(t *testing.T) {
	t.Parallel()
	r := aTreeWithThreeSteps(t)

	tok := Token{
		Process: "three", Tracked: local(), Title: "a token to walk", Status: "first",
		Detail: "walked by the test", Submission: map[string]string{},
	}
	p, err := LoadProcess(r.Method, "three")
	if err != nil {
		t.Fatalf("loading the process: %v", err)
	}
	tok.Submission = Checklists(p)
	tok, err = Mint(r, tok)
	if err != nil {
		t.Fatalf("minting: %v", err)
	}

	// STEP ONE IS ANSWERED, WHICH IS THE STEP THIS TOKEN IS ON. Standing at
	// first, the step that leaves that state is the second, so steps one and
	// two are reached and the third is not.
	tick := func(step string) {
		tok.Submission[step] = strings.ReplaceAll(tok.Submission[step], "| [ ] |", "| [x] |")
	}
	tick("step 1. one")
	tick("step 2. two")
	tick("step 3. three")

	if f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"}); f == nil {
		t.Fatal("a third step ticked while the token stands at the second was taken")
	} else if !strings.Contains(f.Wrong, "step 3") {
		t.Fatalf("it was refused for something else: %s", f.Wrong)
	}

	// AND WITH THE THIRD LEFT ALONE IT IS TAKEN, so the refusal is about the
	// step being early and not about ticking at all.
	tok.Submission["step 3. three"] = Checklists(p)["step 3. three"]
	if f := checkEvidence(r, tok, Payload{ID: tok.ID, Disposition: "done"}); f != nil {
		t.Fatalf("the same submission without the early tick was refused: %s", f.Wrong)
	}
}

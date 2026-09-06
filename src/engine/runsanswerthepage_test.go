package main

import (
	"strings"
	"testing"
)

// A PAGE OF REDS IS NOT ANSWERED BY ONE EDIT.
//
// THE OWNER'S WORDS, September 2026: we need the engine to reject tests if the
// number of changes is not as big as the number of errors.
//
// MEASURED that month. A run came back with six reds. The agent read one,
// changed one thing, and ran the whole set again. Two of four runs in that
// sequence taught it nothing, and each one rebuilds the engine.
//
// THE ENGINE ALREADY HELD BOTH HALVES. It writes what a run said against the
// token, and it writes the delta that run was over. So how many were left
// unanswered and how many places have moved since are both on the record.
func TestARunThatAnswersTooLittleIsRefused(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a token of mine")

	was := []change{{Path: "src/engine/a.go", Start: 1, Finish: 2}}
	red := func(id string) ran { return ran{ID: id, Kind: "go", Said: "--- FAIL: " + id} }

	// A FIRST RUN IS NEVER REFUSED, because nothing was left unanswered.
	if why := ARunThatAnswersTooLittle(r, tok.ID, was); why != "" {
		t.Fatalf("the first run on a token was refused: %s", why)
	}

	RecordTheRun(r, tok.ID, Tested{Delta: was, Ran: []ran{red("A"), red("B"), red("C")}})

	// ONE PLACE MOVED AGAINST THREE REDS IS REFUSED, and the refusal counts both.
	one := []change{was[0], {Path: "src/engine/a.go", Start: 9, Finish: 9}}
	why := ARunThatAnswersTooLittle(r, tok.ID, one)
	if why == "" {
		t.Fatal("one edit against three reds went through")
	}
	if !strings.Contains(why, "3 RED") || !strings.Contains(why, "1 PLACE") {
		t.Errorf("the refusal does not count both: %s", why)
	}

	// AND THREE PLACES GO THROUGH, whatever the change did in them.
	three := []change{was[0],
		{Path: "src/engine/a.go", Start: 9, Finish: 9},
		{Path: "src/engine/b.go", Whole: true},
		{Path: "src/engine/c.go", Start: 4, Finish: 5}}
	if why := ARunThatAnswersTooLittle(r, tok.ID, three); why != "" {
		t.Errorf("a change as wide as the page was refused: %s", why)
	}

	// A BUILD FAILURE IS ONE ERROR, whatever it listed, because the compiler
	// stops at the first wall and every test behind it is unrun.
	build := func(id string) ran { return ran{ID: id, Kind: "build", Said: "THE PACKAGE DID NOT COMPILE"} }
	RecordTheRun(r, tok.ID, Tested{Delta: was, Ran: []ran{build("A"), build("B"), build("C")}})
	if why := ARunThatAnswersTooLittle(r, tok.ID, one); why != "" {
		t.Errorf("a run after a build failure was refused: %s", why)
	}

	// AND ZERO TURNS THE RULE OFF, because the suite is somebody's scratchpad
	// on a day they say so.
	RecordTheRun(r, tok.ID, Tested{Delta: was, Ran: []ran{red("A"), red("B"), red("C")}})
	theParametersSay(t, r, "limits.reds_before_a_change_is_needed", 0)
	if why := ARunThatAnswersTooLittle(r, tok.ID, one); why != "" {
		t.Errorf("the rule was turned off and it still refused: %s", why)
	}
}

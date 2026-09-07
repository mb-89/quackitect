package main

import "testing"

// A PAGE OF REDS WITH ONE CAUSE IS ONE THING TO FIX.
//
// The gate counts failures against places moved, so three tests waiting on one
// missing function demand three edits. The right answer is one.
//
// MEASURED, September 2026. Four tests were written against one function, a
// stub was added so they would redden on their assertions rather than on a
// build, and three went red. All three said the same thing: the function
// answers nothing. The fix was one function in one file, and the gate refused
// it. Two more edits were made to get the count up, both real and neither what
// the reds asked for, which is the gate teaching padding.
//
// THE OWNER'S RULE IS RIGHT AND ITS PROXY IS WRONG. A page of failures answered
// by one edit is a guess. A page with one cause answered by one edit is the fix.
// Places moved cannot tell those apart, and the names the failures print can.
func TestRedsWithOneCauseAreOneThingToAnswer(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a token of mine")

	was := []change{{Path: "src/engine/a.go", Start: 1, Finish: 2}}
	one := []change{was[0], {Path: "src/engine/a.go", Start: 9, Finish: 9}}

	// THREE REDS, ONE NAME BETWEEN THEM. Each asserts its own thing and each
	// says the same function answered nothing.
	stub := func(name, said string) ran {
		return ran{ID: "src/engine/" + name, Kind: "go", Said: "--- FAIL: " + name + "\n    " + said}
	}
	RecordTheRun(r, tok.ID, Tested{Delta: was, Ran: []ran{
		stub("TestAReadIsCounted", "enginereads_test.go:20: AReadThroughTheEngine answered false over a cat"),
		stub("TestAHeadIsCounted", "enginereads_test.go:31: AReadThroughTheEngine answered false over a head"),
		stub("TestASedIsCounted", "enginereads_test.go:42: AReadThroughTheEngine answered false over a sed"),
	}})
	if why := ARunThatAnswersTooLittle(r, tok.ID, one); why != "" {
		t.Errorf("three reds naming one function refused one edit, which is the fix they asked for: %s", why)
	}

	// AND REDS WITH NOTHING BETWEEN THEM ARE STILL A PAGE. Different tests over
	// different files, each with its own cause, still want a change as wide as
	// they are.
	apart := func(name, file, said string) ran {
		return ran{ID: "src/engine/" + name, Kind: "go", Said: "--- FAIL: " + name + "\n    " + file + ":9: " + said}
	}
	RecordTheRun(r, tok.ID, Tested{Delta: was, Ran: []ran{
		apart("TestTheFirstThing", "first_test.go", "theFirstThing answered nothing"),
		apart("TestTheSecondThing", "second_test.go", "theSecondThing answered nothing"),
		apart("TestTheThirdThing", "third_test.go", "theThirdThing answered nothing"),
	}})
	if why := ARunThatAnswersTooLittle(r, tok.ID, one); why == "" {
		t.Error("three reds with no name between them let one edit through")
	}

	// A RED THAT PRINTED NOTHING SAYS NOTHING ABOUT WHAT IT SHARES, so the
	// count stays where it was. The rule only loosens where the answer is clear.
	RecordTheRun(r, tok.ID, Tested{Delta: was, Ran: []ran{
		stub("TestAReadIsCounted", "enginereads_test.go:20: AReadThroughTheEngine answered false over a cat"),
		stub("TestAHeadIsCounted", "enginereads_test.go:31: AReadThroughTheEngine answered false over a head"),
		{ID: "src/engine/TestSomethingElse", Kind: "go"},
	}})
	if why := ARunThatAnswersTooLittle(r, tok.ID, one); why == "" {
		t.Error("a red that printed nothing was counted as sharing a cause with the others")
	}
}

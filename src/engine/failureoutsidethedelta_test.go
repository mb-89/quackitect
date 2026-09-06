package main

import "testing"

// A CHECK THAT FAILS ON WHAT THIS TOKEN DID NOT TOUCH IS THE PROJECT'S RED.
//
// A check reads what it declares, and some of them read a whole folder. So one
// hand's defective note is chosen by every token whose delta touches that
// folder, and every one of those runs answers not ok.
//
// MEASURED in September 2026. open-tokens-carry-their-sections failed on twelve
// older tokens, none of them in any delta, and three submissions were refused
// for it. Two tokens stayed open on that alone.
//
// A GO TEST IS NEVER EXCUSED. Its output names no changed path in the ordinary
// case, so excusing it would wave through the reds this gate exists for.
func TestAFailureOutsideTheDeltaDoesNotRefuseTheClose(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a token of mine")
	mine := []change{{Path: "src/engine/mine.go"}}

	elsewhere := ran{ID: "util/checks/open-tokens-carry-their-sections", Kind: "check",
		Said: "FAIL doc/work/wk-older.md is open under the standard process and " +
			"carries no \"## approach\", which that process requires\n" +
			"217 open token(s) read. 1 failed.\n"}
	RecordTheRun(r, tok.ID, Tested{Delta: mine, Ran: []ran{elsewhere}})
	if why := TestsRefuseTheClose(r, tok); why != "" {
		t.Errorf("a check failing outside the delta refused the close: %s", why)
	}

	// AND A CHECK THAT NAMES A FILE IN THE DELTA STILL REFUSES.
	here := ran{ID: "util/checks/open-tokens-carry-their-sections", Kind: "check",
		Said: "FAIL src/engine/mine.go is open under the standard process and " +
			"carries no \"## approach\", which that process requires\n"}
	RecordTheRun(r, tok.ID, Tested{Delta: mine, Ran: []ran{here}})
	if TestsRefuseTheClose(r, tok) == "" {
		t.Error("a check failing on a file in the delta let the close through")
	}

	// A CHECK THAT NAMES NOTHING IS NOT EXCUSED EITHER, because nothing says
	// whose red it is, and the safe reading is that it is this one's.
	quiet := ran{ID: "util/checks/liveness", Kind: "check", Said: "the engine did not answer\n"}
	RecordTheRun(r, tok.ID, Tested{Delta: mine, Ran: []ran{quiet}})
	if TestsRefuseTheClose(r, tok) == "" {
		t.Error("a check naming no path let the close through")
	}

	// AND A GO TEST IS NEVER EXCUSED, whatever it printed.
	gone := ran{ID: "src/engine/TestSomethingElse", Kind: "go",
		Said: "--- FAIL: TestSomethingElse\n    doc/work/wk-older.md:1: nothing here is the delta\n"}
	RecordTheRun(r, tok.ID, Tested{Delta: mine, Ran: []ran{gone}})
	if TestsRefuseTheClose(r, tok) == "" {
		t.Error("a failing go test was excused for naming a file outside the delta")
	}
}

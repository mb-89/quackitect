package main

import (
	"os"
	"path/filepath"
	"strings"
	"testing"
)

// A BATTERY IS A PAGE OF ANSWERS, AND IT CAME BACK AS ONE.
//
// A token whose delta reaches a whole-battery trigger runs every check the
// project has, so it inherited every red the project had. The close scopes a
// check's failure to the delta, and a battery named no file for that scoping
// to read. See testedgate.go.
//
// MEASURED, September 2026. wk-8fb3314926 was green on its own twenty tests and
// its close was refused by golangci-lint being older than the target, a panel
// column rule, and thirteen older tokens carrying no approach section.
func TestABatteryAnswersStepByStep(t *testing.T) {
	r := aTreeWithTheProcesses(t)
	tok := mintStandard(t, r, "a token of mine")
	mine := []change{{Path: "src/engine/mine.go"}}

	const page = "go build         ok    16s  \n" +
		"go test engine   ok    40s  ok  \tquackitect/engine\t9.100s\n" +
		"open-tokens-carry-their-sections FAIL   0s  FAIL doc/work/wk-older.md is open under the standard process\n" +
		"1 failed, 228s wall clock\n"

	steps := theBatterysSteps(page)
	if len(steps) != 3 {
		t.Fatalf("a page of three steps read as %d: %+v", len(steps), steps)
	}

	// EACH STEP IS NAMED BY ITS OWN NAME, so a refusal says which one failed.
	for at, want := range map[int]string{0: "go build", 1: "go test engine", 2: "open-tokens-carry-their-sections"} {
		if steps[at].ID != want {
			t.Errorf("step %d is named %q and the page called it %q", at, steps[at].ID, want)
		}
	}
	if steps[1].Kind != "go" || steps[2].Kind != "check" {
		t.Errorf("the kinds are %q and %q, and a go step is judged as go", steps[1].Kind, steps[2].Kind)
	}
	if !steps[0].OK || !steps[1].OK || steps[2].OK {
		t.Errorf("the page says two passed and one failed, and the steps say otherwise: %+v", steps)
	}

	// A CHECK FAILING OUTSIDE THE DELTA DOES NOT REFUSE THE CLOSE.
	RecordTheRun(r, tok.ID, Tested{Delta: mine, Ran: steps})
	if why := TestsRefuseTheClose(r, tok); why != "" {
		t.Errorf("a battery whose only red was another token's refused the close: %s", why)
	}

	// AND A GO STEP IS NEVER EXCUSED, whatever paths it printed.
	const red = "go build         ok    16s  \n" +
		"go test engine   FAIL  40s  --- FAIL: TestSomethingElse (0.01s)\n" +
		"    battery_test.go:28: nothing here is the delta\n" +
		"1 failed, 228s wall clock\n"
	gone := theBatterysSteps(red)
	RecordTheRun(r, tok.ID, Tested{Delta: mine, Ran: gone})
	if TestsRefuseTheClose(r, tok) == "" {
		t.Error("a red go step in the battery let the close through")
	}

	// WHAT A STEP SAID BELOW ITS OWN LINE IS STILL WHAT IT SAID.
	if !strings.Contains(gone[1].Said, "battery_test.go:28") {
		t.Errorf("the step lost the line under it: %q", gone[1].Said)
	}
}

// A TRIGGER OWES A BATTERY, IT DOES NOT FORCE ONE.
//
// THE OWNER'S RULING, September 2026, in their words: the smaller scope wins.
// If the agent wants only a few files and you want the whole battery, then the
// few files win.
//
// MEASURED that month. One number added to util/parameters.json ran 228 seconds
// of battery over a change of five lines, and handed the token eight reds, six
// of them no hand on that box had caused.
func TestATriggerOwesTheBatteryRatherThanForcingIt(t *testing.T) {
	r, dir := aTreeWithTests(t)
	db := openTheIndex(t, r)

	// A TRIGGER BESIDE A CHANGE THE MAP CAN SEE. The parameters file is one of
	// the triggers, and lib.go reaches TestA.
	if err := os.MkdirAll(filepath.Join(dir, "util"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(dir, "util", "parameters.json"), []byte("{}\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	changeA(t, dir)

	got, err := TestTheDelta(t.Context(), r, db, "", nil, false, "worker-one")
	if err != nil {
		t.Fatal(err)
	}
	if got.Whole {
		t.Errorf("a trigger forced the whole battery over a selection of %d: %s", len(got.Chosen), got.WhyWhole)
	}
	if !strings.Contains(got.Owes, "util/parameters.json") {
		t.Errorf("the battery is owed and the answer does not say so: %q", got.Owes)
	}
	if len(got.Chosen) == 0 {
		t.Error("nothing was selected, so the smaller scope was no scope at all")
	}
}

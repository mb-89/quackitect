package main

import (
	"path/filepath"
	"strings"
	"testing"
)

// A CRITERION MAY NAME THE CHECK THAT DECIDES IT.
//
// ATestRunByHand refused any command holding a word under the checks folder,
// whatever the command was. A se work mint whose done-when named node and a
// check under that folder was refused twice as a test run by hand, and the
// refusal quoted the mint back as what was run. The work-token guidance asks
// for exactly that spelling, so the guard refused what the guidance asked for,
// and a session with no tool lane had no way to mint the token at all.
//
// THE ENGINE RUNS NO TEST. A part whose first word is the engine is a call on
// the engine, and what it carries in its arguments is prose. A part whose first
// word is an interpreter or the check itself does run it, and stays refused.
func TestNamingACheckIsNotRunningIt(t *testing.T) {
	method := t.TempDir()
	elsewhere := t.TempDir()
	for _, c := range []struct {
		name    string
		command string
		refuse  bool
	}{
		{"a mint whose done-when names a check",
			`se work --title "the guard" --done-when "node util/checks/liveness.mjs is green" --tracked`, false},
		{"the same mint through RUNME",
			`./RUNME.sh work --title "the guard" --detail "decided by node util/checks/liveness.mjs"`, false},
		{"the engine by its full path, named in a mint",
			`"` + filepath.Join(method, ".bin", "se.exe") + `" work --detail "util/checks/liveness.mjs decides it"`, false},
		{"node running that check", "node util/checks/liveness.mjs", true},
		{"the check run as the program", "util/checks/battery.sh", true},
		{"sh running the battery", "sh util/checks/battery.sh", true},
		{"a mint, and then the check behind it",
			`se work --title "the guard" && node util/checks/liveness.mjs`, true},
		{"go test, which is the same door", "go test ./...", true},
		{"a check in somebody else's tree",
			"node " + filepath.Join(elsewhere, "util", "checks", "liveness.mjs"), false},

		// AND A PROGRAM THAT RUNS NO FILE IS NOT RUNNING A CHECK.
		//
		// MEASURED. A commit of a change to a check was refused as a test run
		// by hand, so the one change nobody can land is a change to the checks.
		// The scan read every word of the line, and a path is an argument to
		// most of the commands that carry one.
		{"committing a change to a check",
			`git commit -m "the battery gains a lane" -- util/checks/battery.sh`, false},
		{"staging a check", "git add util/checks/battery.sh", false},
		{"reading a check", "cat util/checks/battery.sh", false},
		{"copying a check out of the tree", "cp util/checks/battery.sh /tmp/x.sh", false},
		{"a diff naming a check", "git diff HEAD -- util/checks/battery.sh", false},

		// AND NEITHER IS THE DOOR A CHANGE LEAVES THE BOX BY.
		//
		// util/git/land.sh copies the files it is named onto the branch tip and
		// pushes them. It runs nothing. But it is run with sh, and this arm read
		// every word after an interpreter, so naming a check as the file to land
		// was refused as a test run. A cloud box is reclaimed when its session
		// ends, so the one change nobody could land was again a change to the
		// checks: made, right, and with no door out.
		//
		// AN INTERPRETER RUNS THE FIRST FILE IT IS HANDED, and everything after
		// that belongs to that program. The last two hold the other half, because
		// a rule that read the first word alone would let a check run behind any
		// interpreter that takes a command.
		{"landing a change to a check",
			`sh util/git/land.sh "the battery gains a lane" util/checks/battery.sh`, false},
		{"landing several at once",
			`sh util/git/land.sh "two checks" util/checks/liveness.mjs util/checks/burndown`, false},
		{"a shell told to run the check", `sh -c "util/checks/battery.sh"`, true},
		{"a shell told to run node over it", `sh -c "node util/checks/liveness.mjs"`, true},

		// AND A MEASURING SCRIPT BESIDE THE CHECKS IS NOT A CHECK.
		//
		// count-standing.py and count-voice-breaks.py sit in that folder and the
		// battery runs neither. checks-live-in-the-method reads the battery's
		// list and counts only the .mjs, so a .py was already outside that rule.
		//
		// Each carries in its own docstring the command that runs it, and the
		// guard refused that command. So a script written to be run by hand
		// could not be run from the tree at all, and the measurement it exists
		// for was taken with a copy made outside. count-voice-breaks.py says as
		// much in its own words: VOICE_RULES names that file for a copy running
		// outside the tree, which is how the guard lets a check be run at all.
		{"the command count-voice-breaks names",
			"python util/checks/count-voice-breaks.py doc/glossary.md", false},
		{"a measuring script under python3",
			"python3 util/checks/count-standing.py .", false},
		{"the command count-standing names",
			"uvx --from tiktoken python util/checks/count-standing.py .", false},

		// AND WHAT THE BATTERY DOES RUN IS STILL REFUSED, whatever runs it, so
		// this is a narrowing by what the file is and not by which program was
		// reached for.
		{"python told to run a check", "python util/checks/liveness.mjs", true},
		{"python told to run the battery", "python util/checks/battery.sh", true},
	} {
		t.Run(c.name, func(t *testing.T) {
			why, refused := ATestRunByHand(c.command, method)
			if refused != c.refuse {
				t.Fatalf("refused=%v, wanted %v, for %q", refused, c.refuse, c.command)
			}
			if refused && !strings.Contains(why, "THE ENGINE OWNS THE TESTS") {
				t.Fatalf("the refusal does not say whose the tests are, so it says no without saying where to go: %s", why)
			}
		})
	}
}

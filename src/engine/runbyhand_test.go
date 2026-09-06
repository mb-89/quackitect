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

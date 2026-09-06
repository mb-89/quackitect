package main

import (
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

// BLOCKING WORK GOES FIRST, AND THE ENGINE WORKS OUT WHICH IT IS.
//
// The queue hands work out oldest first, and urgent is a flag a person sets. It
// is set on no open tracked token, because what comes first is said by whoever
// watches the queue and nobody is watching. A second flag set by hand would go
// the same way.
//
// SO THE RANK IS DERIVED. A red standing check stops every hand in the tree,
// and a token whose done-when line names that check is the one that clears it.
// Both halves are already written down: the check on the token, and the
// battery's answer in its output. Nothing is run to find the order.
//
// URGENT STAYS ABOVE IT, because a person still needs a way to say what comes
// first for a reason no check can see.

// aCheckAnswer reads one line of a battery's output: the name, then ok or FAIL,
// then the seconds it took. A finding's own lines are indented under it, so a
// line that starts with a space is not a check's.
//
// ONE SPACE IS ENOUGH BETWEEN THE TWO. battery.sh pads the name into a column
// sixteen wide, so a longer name is followed by the separator and nothing else.
// Wanting two spaces read only the short lane names: over one run of the
// battery here it saw twenty-five of fifty-three checks and four of the nine
// red ones, and the-branch-head-builds, which is the case this rank was
// written for, was among the ones it could not see.
var aCheckAnswer = regexp.MustCompile(`^(\S.*?)\s+(ok|FAIL)\s+\d+s`)

// TheRedChecks answers the checks the last battery said were red.
//
// IT READS AND RUNS NOTHING. The battery replaces the engine while it runs, so
// a rank that started one would be a queue waiting on the process it killed.
// The last run's output is the record of what is red, and where no run has
// happened the answer is nothing and the queue is the one it always was.
func TheRedChecks(r Roots) []string {
	said, err := os.ReadFile(theLastBatteryOutput(r))
	if err != nil {
		return nil
	}
	var red []string
	for _, line := range strings.Split(strings.ReplaceAll(string(said), "\r\n", "\n"), "\n") {
		if got := aCheckAnswer.FindStringSubmatch(line); got != nil && got[2] == "FAIL" {
			red = append(red, strings.TrimSpace(got[1]))
		}
	}
	return red
}

// theLastBatteryOutput is the newest run's output file, or an empty path where
// no battery has run here. The name carries the stamp, so the newest is the
// last by name.
func theLastBatteryOutput(r Roots) string {
	entries, err := os.ReadDir(batteryDir(r))
	if err != nil {
		return ""
	}
	last := ""
	for _, e := range entries {
		name := e.Name()
		if e.IsDir() || !strings.HasPrefix(name, "battery-") || !strings.HasSuffix(name, ".out") {
			continue
		}
		if name > last {
			last = name
		}
	}
	if last == "" {
		return ""
	}
	return filepath.Join(batteryDir(r), last)
}

// namesARedCheck answers whether one of this token's done-when lines names a
// check that is red now.
//
// THE LINE IS THE TIE. A criterion names the command where it is decided, so
// the name of the check is already in the sentence, and no second field on the
// token has to be kept in step with the battery.
func namesARedCheck(t Token, red []string) bool {
	for _, c := range t.Criteria {
		for _, check := range red {
			if check != "" && strings.Contains(c.Says, check) {
				return true
			}
		}
	}
	return false
}

// blockingFirst puts the tokens that would turn a red check green at the head
// of the list, and leaves everything else in the order it came in.
//
// IT IS STABLE, so among the blocking and among the rest the order is still the
// one the queue already had. urgentFirst runs after it and is stable too, which
// is what keeps a person's flag above a derived rank.
func blockingFirst(r Roots, all []Token) []Token {
	red := TheRedChecks(r)
	if len(red) == 0 {
		return all
	}
	sort.SliceStable(all, func(i, j int) bool {
		return namesARedCheck(all[i], red) && !namesARedCheck(all[j], red)
	})
	return all
}

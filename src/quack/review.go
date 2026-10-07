// What the hooks door's review reads off this box: the material the branch
// verb gathers for a branch, as reviewsBranch in src/bridge/review.js runs it.
// [[spec/tickets/review-spawns-off-the-door]]
package main

import (
	"encoding/json"
	"os"
	"regexp"
	"strings"
	"time"

	"quackitect/src/modules/hooks/review"
	"quackitect/src/proc"
)

// The span the verb gathers in, and the why a verb printing nothing answers. [[spec/tickets/review-spawns-off-the-door]]
const (
	reviewGathering = 300 * time.Second
	saidNothing     = "the verb printed nothing"
)

var printedLines = regexp.MustCompile(`\r?\n`)

// The branch verb off the method root, run in the work root, and its material or why it gathered none. [[spec/tickets/review-spawns-off-the-door]] [[spec/tickets/work-verbs-port-to-go]]
func reviewOver(method string) func(root, branch string) (review.Material, string) {
	return reviewRunOver(proc.Real, os.Executable, method)
}

// The branch verb off the method root, run in the work root through the process door under the binary the self answers, and its material or why it gathered none. [[spec/tickets/quack-spawns-all-take-the-runner]]
func reviewRunOver(run proc.Runner, self func() (string, error), method string) func(root, branch string) (review.Material, string) {
	return func(root, branch string) (review.Material, string) {
		road := append(selfRoadOver(self, method), "branch", "review", branch, "--json")
		said := run(proc.Command{Argv: road, Dir: root, Env: []string{"QUACKITECT_ROOT=" + method, workRootVar + "=" + root}, Wait: reviewGathering})
		return gatheredOf(said.Out, said.Err)
	}
}

// The newest printed line reading as material, or why none does: what the verb said on stderr, else on stdout. [[spec/tickets/review-spawns-off-the-door]]
func gatheredOf(stdout, stderr string) (review.Material, string) {
	lines := printedLines.Split(stdout, -1)
	for at := len(lines) - 1; at >= 0; at-- {
		if !strings.HasPrefix(lines[at], "{") {
			continue
		}
		var material review.Material
		if json.Unmarshal([]byte(lines[at]), &material) == nil && material.Branch != "" {
			return material, ""
		}
	}
	for _, why := range []string{stderr, stdout} {
		if said := strings.TrimSpace(why); said != "" {
			return review.Material{}, said
		}
	}
	return review.Material{}, saidNothing
}

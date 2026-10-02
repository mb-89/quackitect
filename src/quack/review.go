// What the hooks door's review reads off this box: the material the branch
// verb gathers for a branch, as reviewsBranch in src/bridge/review.js runs it.
// [[spec/tickets/review-spawns-off-the-door]]
package main

import (
	"bytes"
	"context"
	"encoding/json"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"time"

	"quackitect/src/modules/hooks/review"
)

// The span the verb gathers in, the verb under the method root, and the why a verb printing nothing answers. [[spec/tickets/review-spawns-off-the-door]]
const (
	reviewGathering = 300 * time.Second
	reviewVerb      = "src/scripts/verbs/branch.js"
	saidNothing     = "the verb printed nothing"
)

var printedLines = regexp.MustCompile(`\r?\n`)

// The verb under the method root, run in the work root, and its material or why it gathered none. [[spec/tickets/review-spawns-off-the-door]]
func reviewOver(method string) func(root, branch string) (review.Material, string) {
	return func(root, branch string) (review.Material, string) {
		span, stop := context.WithTimeout(context.Background(), reviewGathering)
		defer stop()
		run := exec.CommandContext(span, "node", filepath.Join(method, filepath.FromSlash(reviewVerb)), "review", branch, "--json")
		run.Dir = root
		var out, errs bytes.Buffer
		run.Stdout, run.Stderr = &out, &errs
		_ = run.Run()
		return gatheredOf(out.String(), errs.String())
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

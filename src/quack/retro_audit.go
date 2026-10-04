// The retro's hold on an open trial: an experiment ends on a decision, so a
// retro closing over one leaves the tree carrying it.
// [[spec/design_output/work#an-experiment-decides]]
package main

import (
	"fmt"
	"io"
)

// The process a trial runs, which the audit reads off each ticket, as EXPERIMENT in src/scripts/retro.js names it. [[spec/design_output/work#an-experiment-decides]]
const retroAuditExperiment = "spec/processes/experiment"

func init() { register("retro audit", retroAuditVerb(retroRoot)) }

// Every trial standing open under the root, by name. [[spec/design_output/work#an-experiment-decides]]
func retroAuditOpenTrials(root string) []string {
	open := []string{}
	for _, one := range retroScoreNotes(root) {
		if retroScoreField(one.text, "process") == retroAuditExperiment && retroScoreField(one.text, "state") != closedRow {
			open = append(open, one.name)
		}
	}
	return open
}

// The verb: 0 once every experiment stands decided, and 1 naming each one still open. [[spec/design_output/work#an-experiment-decides]]
func retroAuditVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		open := retroAuditOpenTrials(root())
		if len(open) == 0 {
			fmt.Fprintln(out, "Every experiment stands decided, so the retro closes.")
			return 0
		}
		fmt.Fprintf(out, "%d experiment(s) stand open. Take each one to its decide step, then run this again:\n", len(open))
		for _, name := range open {
			fmt.Fprintf(out, "  %s\n", name)
		}
		return exitFailed
	}
}

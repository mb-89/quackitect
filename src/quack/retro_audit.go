// The retro's hold on an open trial: an experiment ends on a decision, so a
// retro closing over one leaves the tree carrying it.
// [[spec/design_output/work#an-experiment-decides]]
package main

import (
	"fmt"
	"io"

	"quackitect/src/pull"
)

// The process a trial runs, which the audit reads off each ticket. [[spec/design_output/work#an-experiment-decides]]
const retroAuditExperiment = "spec/processes/experiment"

func init() { register("retro audit", retroAuditVerb(quietBox)) }

// Every trial standing open under the root, by name. [[spec/design_output/work#an-experiment-decides]]
func retroAuditOpenTrials(disk diskDoors, root string) []string {
	open := []string{}
	for _, one := range retroScoreNotes(disk, root) {
		if retroScoreField(one.text, "process") == retroAuditExperiment && retroScoreField(one.text, "state") != closedRow {
			open = append(open, one.name)
		}
	}
	return open
}

// Every trial standing closed with no decision and no successor, by name. [[spec/design_output/work#an-experiment-decides]]
func retroAuditUndecided(disk diskDoors, root string) []string {
	silent := []string{}
	for _, one := range retroScoreNotes(disk, root) {
		if retroScoreField(one.text, "process") == retroAuditExperiment && retroScoreField(one.text, "state") == closedRow && !retroAuditKept(one.text) {
			silent = append(silent, one.name)
		}
	}
	return silent
}

// A trial keeps what it found where its decide step holds a decision, or its front names a successor. [[spec/design_output/work#an-experiment-decides]]
func retroAuditKept(text string) bool {
	if len(pull.ChapterOf(text, "decide").Fields["decision"]) > 0 {
		return true
	}
	successors, _ := pull.FrontOf(text).Get("successors").([]any)
	return len(successors) > 0
}

// The verb: 0 once every experiment stands decided, and 1 naming each one still open or closed silent. [[spec/design_output/work#an-experiment-decides]]
func retroAuditVerb(box func() boxDoors) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		d := box()
		open := retroAuditOpenTrials(d.disk, retroRootOf(d))
		silent := retroAuditUndecided(d.disk, retroRootOf(d))
		if len(open) == 0 && len(silent) == 0 {
			fmt.Fprintln(out, "Every experiment stands decided, so the retro closes.")
			return 0
		}
		if len(open) > 0 {
			fmt.Fprintf(out, "%d experiment(s) stand open. Take each one to its decide step, then run this again:\n", len(open))
			for _, name := range open {
				fmt.Fprintf(out, "  %s\n", name)
			}
		}
		if len(silent) > 0 {
			fmt.Fprintf(out, "%d experiment(s) stand closed with no decision and no successor. Write the decision under each one's decide step, then run this again:\n", len(silent))
			for _, name := range silent {
				fmt.Fprintf(out, "  %s\n", name)
			}
		}
		return exitFailed
	}
}

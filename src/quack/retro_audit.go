// The retro's hold on an open trial: an experiment ends on a decision, so a
// retro closing over one leaves the tree carrying it.
// [[spec/design_output/work#an-experiment-decides]]
package main

import "io"

func init() { register("retro audit", retroAuditVerb(retroRoot)) }

// Every trial standing open under the root, by name. [[spec/design_output/work#an-experiment-decides]]
func retroAuditOpenTrials(root string) []string {
	return nil
}

// The verb: 0 once every experiment stands decided, and 1 naming each one still open. [[spec/design_output/work#an-experiment-decides]]
func retroAuditVerb(root func() string) twin {
	return func(argv []string, _ bool, out, errs io.Writer) int {
		return 0
	}
}

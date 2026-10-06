// The retro's hold on an open trial: the audit names each experiment standing
// open, and passes once each stands decided.
// [[spec/design_output/work#an-experiment-decides]]
package main // level0: InPackageTest - a main package admits no outside test package

import "testing"

// A ticket on the experiment process, at the state the case names. [[spec/tickets/an-experiment-ends-decided]]
func retroAuditTrial(name, state string) string {
	return "---\nkind: [[ticket]]\nstate: " + state + "\nprocess: [[spec/processes/experiment]]\nsteps:\n  - name: decide\n---\n\n# Ask\n\n" + name + ".\n"
}

// The audit holds while a trial stands open, and names each one: a closed trial and a plain ticket stand nowhere. [[spec/tickets/an-experiment-ends-decided]]
func TestRetroAuditHoldsWhileATrialStandsOpenAndNamesEachOne(t *testing.T) {
	t.Parallel()
	root := t.TempDir()
	retroMintWrite(t, root, "spec/tickets/a-trial.md", retroAuditTrial("a trial", "open"))
	retroMintWrite(t, root, "spec/tickets/a-closed-trial.md", retroAuditTrial("a closed trial", "closed"))
	retroMintWrite(t, root, "spec/tickets/a-plain-one.md", "---\nkind: [[ticket]]\nstate: open\nprocess: [[spec/processes/standard]]\n---\n\n# Ask\n\nA thing.\n")
	if got := retroAuditOpenTrials(root); len(got) != 1 || got[0] != "a-trial" {
		t.Fatalf("the open trials read %v", got)
	}
}

// The audit step answers a wait over an open trial, naming it, and passes over none. [[spec/tickets/an-experiment-ends-decided]]
func TestRetroAuditAnswersAWaitOverAnOpenTrialAndPassesOverNone(t *testing.T) {
	t.Parallel()
	held := t.TempDir()
	retroMintWrite(t, held, "spec/tickets/a-trial.md", retroAuditTrial("a trial", "open"))
	code, out, _ := retroMintHeard(retroAuditVerb(func() string { return held }), "retro", "audit")
	want := "1 experiment(s) stand open. Take each one to its decide step, then run this again:\n  a-trial\n"
	if code != 1 || out != want {
		t.Fatalf("the audit answers %d and prints %q", code, out)
	}
	clear := t.TempDir()
	retroMintWrite(t, clear, "spec/tickets/a-trial.md", retroAuditTrial("a trial", "closed"))
	code, out, _ = retroMintHeard(retroAuditVerb(func() string { return clear }), "retro", "audit")
	if code != 0 || out != "Every experiment stands decided, so the retro closes.\n" {
		t.Fatalf("the audit answers %d and prints %q", code, out)
	}
}

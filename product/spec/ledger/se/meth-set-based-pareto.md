---
id: se.meth-set-based-pareto
kind: method
statement: "Set-based design with a Pareto front: keep the non-dominated set alive, eliminate dominated candidates with recorded reasons, converge at the last responsible moment."
provenance:
  iteration: i2g-tutorial-machine
  ai_involvement: agent-drafted
---

## Situation
M4's evaluate_set and its gate: the candidates gate blesses the FRONT, never a winner. Convergence to one happens at M5 - controlled, not premature.

## Procedure
- Score every composed candidate on the weighted criteria AND the structure metrics from its matrices - multi-objective, no early collapsing into one number.
- A candidate is dominated when another is at least as good on every objective and better on one. Eliminate dominated candidates - each elimination recorded with its reason (they are history, not embarrassments).
- The survivors are the Pareto front. Keep them ALL alive into M5; narrowing before the evidence exists is the failure mode this method prevents.
- All-options-equal is a signal with two readings: the decision does not matter, or a discriminating criterion is missing. Ask which, out loud.

## Sources
Toyota set-based concurrent engineering; multi-objective optimization practice; design-space exploration.

---
form: decision-matrix
instance: decision.md
---

# Decision matrix — the accepted shape

A decision is accepted only in this shape (v1's field-tested M4 card,
ported). The method rides in [[meth-pugh-convergence]] and
[[meth-eight-step-decision]]; this form is what DONE looks like: fill it
and the method is done.

The datum law: the datum is the STRONGEST viable rival, named honestly.
A decision without a named loser is not a decision.

## Fields

- tldr | The chosen candidate in one sentence: what it beat, and whether the reverse run flipped anything. | required
- decision_cards | One card per axis, carrying the decision with its ADR link. It also names the criterion behind it and the loser with its killing reason. | required
- pugh_table | The matrix itself: criteria with weights against datum and chosen. Recorded runs with their datum choices. | required
- sensitivity | Flip the weights - does the winner hold? Say what moved. | required
- reverse_argumentation | The first credible combination of weight changes and rival variants where the winner LOSES. Credible means a recorded tripwire with its fallback. | required

---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: vp-systematic-engineering
type: "[[value-prop]]"
statement: As an engineer driving agents, I need the machine to ENFORCE the engineering order rather than remind me of it.
audience: stk-engineer-driving-agents
outcome: input and architecture are earned before any output exists, and every test is red before its code is written
priority: must
---

## Success criteria

- No output state is reachable while a gate behind it stands unsigned.
  Metric: output states entered with an unsigned upstream gate. Target: zero.
- Every mechanized test is observed failing before it first passes.
  Metric: the share of mechanized tests with a recorded RED observation before their first pass. Target: all of them.

## Unlike

Spec-to-code tools plus review discipline. Those generate FROM a spec and never force the spec's own quality. The difference is that the discipline here is mechanical rather than aspirational — the engine refuses instead of reminding.

The ENGINE beneath this machine is its own proposition ([[vp-the-engine]]): this one promises the flagship SE machine, not the platform. Neither swallows the other.

## Notes (not load-bearing)

Merges three earlier candidates: forced design input, walking an iteration, and test-first by structure. They are one proposition because they are one mechanism — the walk refuses to advance, and the refusal is what makes all three true.

The cost-of-change curve and the 2024 DORA finding on AI-assisted delivery are the evidence behind it. They are named here rather than in `source_refs`, because reference notes are not a trace type yet and a reference that resolves to nothing is worse than a sentence.

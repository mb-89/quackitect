---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-explicit-disposition-on-every-candidate
type: "[[option]]"
statement: surface every ranked candidate to a person and require an explicit verdict on each one before any is recorded
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: prior-art
source: this engine's own judge-a-claim function (fn-run-a-governed-walk.judge-a-claim, cluster-the-walk), which already builds a form, checks what comes back, and carries a person's verdict on it — our own predecessor mechanism, one cluster over
---

## Mechanism

No threshold, no auto-classified band. Every candidate rank-candidate-couplings
returns gets one disposition, given by a person, the same shape judge-a-claim
already uses for gate claims: build the thing to review, show it, carry
back a verdict.

Simpler to reason about — nothing is ever silently disposed on the engine's
own say-so — but the cost scales linearly with how many candidates come
back per query, which is exactly the number opt-probabilistic-threshold
-classification exists to shrink.

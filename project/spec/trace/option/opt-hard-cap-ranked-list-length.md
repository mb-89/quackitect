---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-hard-cap-ranked-list-length
type: "[[option]]"
statement: cap the number of candidates rank-candidate-couplings ever returns at a fixed N, dropping the rest rather than grouping them
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: heuristic
source: "meth-heuristics-catalog: \"Make the common case cheap; make the rare case possible.\""
---

## Mechanism

The common case is a normal-sized candidate list a person can review
directly. The rare case is a change that is central enough to touch many
plausible candidates at once. A hard cap keeps the common case cheap by
construction — the review queue never exceeds N regardless of the corpus.

Distinct from opt-block-candidates-before-individual-review: a cap DROPS
candidates past the Nth rank, where blocking keeps every real candidate but
groups them for review. The cap is cheaper to implement and can silently
lose a real coupling ranked N+1; blocking costs more to build and loses
nothing, only review granularity.

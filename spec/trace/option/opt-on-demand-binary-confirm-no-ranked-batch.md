---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-on-demand-binary-confirm-no-ranked-batch
type: "[[option]]"
statement: instead of a ranked batch handed to a person, the person names one candidate at a time and the system answers coupled or not against a fixed threshold
cluster: cluster-the-disposition
question: how does a ranked candidate coupling get its disposition
found_by: transform
source: SCAMPER Reverse, held against the rank-then-review direction
---

## Mechanism

Invert the flow: no ranked list is ever produced. A person (or another
function) asks about one candidate and gets a yes/no against a fixed
threshold, pull-based rather than a push of a batch to review.

Cheaper per call and needs no review queue at all, but it only works if the
caller already has a candidate in mind to ask about — it cannot answer "what
else resembles this change", which is the question rank-candidate-couplings
exists to answer in the first place. Likely a poor fit for this cluster's
own motivating use case, recorded rather than silently skipped.

---
minted_in: i38-the-machine-sizes-its-own-driver-every-s
id: opt-audit-a-sample-rather-than-reconcile-everything
type: "[[option]]"
cluster: the-sizing
question: how over-driving is measured
statement: "a small random sample of walked states is audited against what the work actually needed, and the sample alone is what moves the mapping, so the cost of checking does not scale with the amount of work"
found_by: analogy
source: "freight and postal class declaration, where a shipper declares a size-and-weight class and carriers spot-check a fraction at the depot, re-rating and surcharging the mis-declared ones rather than measuring every parcel"
---

## Mechanism

RECONCILIATION IS A NON-GOAL BECAUSE IT LOOKS EXPENSIVE, and this is what makes
it cheap. Nothing needs a per-call comparison across every state of every walk.
A sample does the same job for the purpose the sample is for.

WHAT AN AUDIT WOULD BE: take a walked state, look at what it produced and what
it cost, and judge whether the rung it declared was the rung it needed. That is
a reader's judgment, done occasionally, not a mechanism running always.

WHY THE SAMPLE IS ENOUGH. The question is not "was THIS state mis-rated" — it
is "is the table drifting". A drifting table shows up in a sample long before
anybody could afford to check everything.

AND IT NEEDS LESS THAN THE ATTRIBUTION WORK ALREADY IN SCOPE. Auditing a sample
needs the state and the model on the sampled calls, which is exactly what this
iteration is already adding, and nothing more.

THE CARRIER'S SECOND HALF IS WHAT MAKES IT BITE: a mis-declared parcel is
re-rated AND surcharged, so the declaration has a consequence. The software
equivalent is that a mis-rated state gets its rung moved rather than merely
noted, and the audit that found it says so on the row.

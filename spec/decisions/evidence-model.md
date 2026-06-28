---
id: evidence-model
statement: Executed checks store re-runnable cached results (disposable); judgment and review checks store signed, dated attestations (durable, not a cache).
depends_on: [fill-adjudicate]
adjudicated_by: human
killer: true
---

## Rationale (not load-bearing)

You cannot content-address a non-deterministic verifier; only executed results are a true cache. Judgment is a stored decision, lost if deleted.

---
id: req-selftest-gate
type: requirement
statement: When the agent channel calls selftest outside a milestone review, the engine shall refuse the run and name the verify lane.
class: review
killer: false
---
## Statements
1. When the agent channel calls the full selftest battery while no milestone gate of the active version is ready or suspect, the engine shall refuse the run.
2. The refusal shall name the lawful lanes. One check re-runs through quack verify or a single-test selftest. The battery belongs to the gate review.

## Rationale (not load-bearing)
The owner's M6 complaint: selftest after every edit is nervous over-checking
(NOTE-20260714-152053). This is the trust-the-process law, engine-enforced.

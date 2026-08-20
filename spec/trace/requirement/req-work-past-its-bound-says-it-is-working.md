---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: req-work-past-its-bound-says-it-is-working
type: "[[requirement]]"
weighs_with:
  - req-call-answers-in-one-second ! — one measures what happens WHEN the bound is exceeded, the other measures the bound itself; they are complements, and a design can meet either alone
  - req-surface-answers-in-one-second ! — the same complement at the other boundary: a signal during slowness against a render latency
  - req-a-clear-jump-is-one-call ! — one is a signal emitted during a long wait, the other is how many calls a jump costs; different quantities entirely
statement: While an admitted call or a surface render is still running past the bound named for it, the product shall show that it is working, without taking the surface over.
kind: quality
characteristic: performance-efficiency
measure: the signal appears within 1 second of the bound being passed, on every operation that passes it
verify_method: test
breaks_if_removed: A slow operation and a hung one look identical, so the person spends the wait deciding whether to keep waiting instead of doing anything else.
breaks_how_badly: corrosive
priority: must
refines:
  - uc-quality-performance-efficiency
source_refs:
  - sty-the-slow-call-that-says-it-is-working
  - req-call-answers-in-one-second
  - vp-rigor-without-toil
---

## Scenario

SOURCE: a person or an agent driving the product.

STIMULUS: an operation is admitted and does not finish within the bound named
for it.

ENVIRONMENT: normal running, at whatever size the record has reached. Measured
on 2026-08-17 this is not an edge case — 184 of 730 pulls passed five seconds
and 15 passed thirty.

ARTIFACT: the surface or the call that is waiting.

RESPONSE: the product shows that the operation is running, and keeps showing it
until the operation ends.

RESPONSE MEASURE: the signal appears within 1 second of the bound being passed,
on every operation that passes it. Zero operations pass the bound in silence.

## Detail

WHAT THIS ROW IS NOT. It is not a relaxation of req-call-answers-in-one-second.
That row still demands the answer inside the bound. This one governs what
happens when that row is BROKEN, and a product that satisfies this one while
failing that one has not met the demand — it has only stopped hiding.

WITHOUT TAKING THE SURFACE OVER is binding, not decorative. The owner's framing
is that anything over a second must be non-intrusive. A modal, a blocking
spinner over the whole view, or anything that prevents the person doing
something else fails this row while appearing to satisfy it.

THE AGENT SIDE. An agent waiting on a call needs the same fact and not the same
rendering. It arrives on the result, and it is what lets an agent tell a slow
call from a dead lane without polling.

WHY THE MEASURE IS A COUNT AND NOT A PERCENTILE. The prior art at this
iteration's kickoff argues for percentiles on the SPEED demand, and that is
right there. Here the demand is that nothing passes in silence, and a percentile
would licence a share of silent breaches, which is the exact failure this row
exists to end.

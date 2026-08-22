---
minted_in: i51-work-running-out-of-sight-reports-itself
id: raid-asm-the-callers-limit-is-longer-than-a-second
type: "[[raid]]"
kind: assumption
statement: The caller gives up on a call after longer than one second, so answering inside a second is enough to stay within a limit this product cannot read.
owner: the driving agent
trigger: the first call answered inside a second that the caller still reports as failed
status: probed
probed: "2026-08-21, and it HOLDS on this harness. A call answered at 2275 ms was received. Only one harness was measured, so the entry stays open for the others."
probe: "Answer a call deliberately at just under a second on each supported harness and check the caller receives it. Where a harness reports a failure anyway, its limit is shorter than assumed and the measure needs rewriting."
impact: "The whole design of the deferred verdict rests on one second being a safe answer. If any caller's limit is shorter, the product satisfies its own measure and still loses the answer, which is the failure it was built to end."
breaks_how_badly: crippling
how_likely: conceivable
source_refs:
  - req-a-leaving-check-does-not-hold-the-call
  - nbr-agent-harness
  - i51
---

## Why it is open

`req-a-leaving-check-does-not-hold-the-call` sets its measure at under one
second. That number is not derived from anything measured on the caller's side.

The limit belongs to the harness. `nbr-agent-harness` lists cancellation among
the things the harness controls outside this server, and the product cannot
read that number or detect that it expired.

## Why it is an assumption and not a decision

We do not own it. A harness may change its limit between versions, and a new
harness may arrive with a shorter one.

## Why it is graded conceivable rather than plausible

Every harness seen so far waits far longer than a second — the measured failure
happened at sixty-eight seconds, not at two. A limit under a second would have
to be an unusual choice by a harness we have not met.

## Probe

Answer a call deliberately at just under a second, on each supported harness,
and check the caller receives it.

Two outcomes, both useful.

- Every harness receives it, and the measure stands with evidence behind its
  number rather than a guess.
- One does not, and the measure is wrong for that harness. The number then has
  to come from the harness profile rather than from a constant.

## PROBED 2026-08-21 — IT HOLDS ON THE ONE HARNESS MEASURED

No deliberate delay was needed. This session's own log already carried calls
far past a second, and the caller received all of them.

WHAT THE LOG SHOWS over 290 calls with a recorded duration: p99 at 1712 ms and
a maximum of 2275 ms, all delivered.

SO A SECOND IS A SAFE ANSWER HERE, with more than twice the margin actually
exercised.

WHAT THIS DOES NOT SETTLE. One harness was measured, and the entry names every
supported harness. It stays OPEN for the others rather than being closed on a
single observation.

AND IT SAYS NOTHING ABOUT THE FAILURE THAT STARTED THIS. The measured
sixty-eight-second freeze expired at this same boundary, so the limit sits
somewhere between 2275 ms and sixty-eight seconds on this harness. That number
is still unknown and still not ours to read.

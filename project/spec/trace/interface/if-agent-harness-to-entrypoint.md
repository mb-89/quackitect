---
minted_in: i33-every-interface-a-person-or-an-agent-tou
id: if-agent-harness-to-entrypoint
type: "[[interface]]"
statement: Every act a driving agent takes crosses here as one call, and the answer it gets back is the only thing it has to work from.
source: nbr-agent-harness
destination: el-entrypoint
carries:
  - flow-dispatched-call
  - flow-instruction
  - flow-refusal
  - flow-evidence-form
form: MCP over stdio
bound: 1 second
source_refs:
  - "i33 model-the-boundaries: the outside edges the element matrix never drew"
  - "i33 gate-kickoff round_0_verify: 8424 calls, 1834 over a second"
---

THE BUSIEST OUTSIDE EDGE IN THE PRODUCT, and the one every other agent-facing
claim rests on. The lane is the only door, so an agent's whole session is the
sum of what crosses here.

## What crosses

- every lane call the agent makes
- the instruction that comes back, with the state's guidance and its form
- a refusal, with its clause and its executable remedy
- the evidence form the machine built for the state

## Why this one is still UNMEASURED in aggregate, 2026-08-17

EVERY CALL'S OWN COST IS VISIBLE. The lane returns a duration on every
result, so any single crossing can be read exactly.

THE TOTAL CANNOT BE. Aggregating them needs the call log, and the log
undercounts silently — the same filter returned seven records without the two
that mattered and ten with them once a window was added, reporting `older: 0`
both times
(raid-iss-the-call-log-query-omits-matching-records-and-says-it-did-not).

SO EVERY COUNT QUOTED FOR THIS BOUNDARY IS A FLOOR, including the ones this
iteration's own gates carry. The direction never flips, because omissions can
only hide breaches. The word MEASURED is what is not earned.

THE OTHER BOUNDARIES DID NOT NEED THE LOG. git, the vault and the battery were
timed directly today. This one is the busiest edge in the product and the only
one whose instrument is the broken part.

## The bound, and what it measures against

ONE SECOND, and it is currently missed. Measured 2026-08-17 across the standing
call log: 1834 of 8424 calls over a second. The worst single answer took
33,461 ms.

THE HONESTY HALF APPLIES HERE TOO, and it is the harder half at this edge. An
agent that waits thirty seconds is not inconvenienced, it is idle — and unlike
a person it cannot look at the screen to see whether anything is happening.
Whatever this edge does when it cannot be fast has to be a fact in the answer,
not a rendering.

## Why it is one interface and not several

THE FORM IS ONE, and the bound is a property of the crossing rather than of any
verb behind it. Splitting per lane verb would give forty interfaces that share
a transport, a bound and a failure mode, and would hide that the cost lives in
what the answer is assembled FROM rather than in which verb asked.

---
minted_in: i37-training-iterations-a-disposable-iterati
id: if-entrypoint-to-walk-engine
type: "[[interface]]"
statement: "The entrypoint measures the host it started under and hands the walk engine that profile with the live lane, so the engine serves steps sized for the harness it is actually talking to."
source: el-entrypoint
destination: el-walk-engine
carries:
  - flow-harness-profile
  - flow-live-lane
form: process spawn
bound: 1 second
source_refs:
  - el-entrypoint
  - el-walk-engine
  - if-agent-harness-to-entrypoint
  - fn-arrive-on-a-machine.identify-the-harness
  - req-supported-harness-serves-one-lane-contract
  - if-arrival-to-walk-engine
---

MINTED FROM i37 RATHER THAN FROM ITS OWN ITERATION, and that is why this note
opens by saying so.

`el-entrypoint` arrived with i28 and `el-walk-engine` has stood since i1. The
crossing between them was never drawn. i37's `decompose-structure` refused to
stand because the element matrix now names it as an owed crossing, so it is
drawn here.

## What crosses

One direction only, and only once per machine.

- A ROOT, so the engine knows which tree it serves.
- AN AUTONOMY RUNG, which is the person's dial and travels as `--autonomy` or
  `SE_AUTONOMY`.
- A HEADLESS FLAG and a mirror port.

WHAT COMES BACK IS NOT A VALUE. It is a lane that answers on a port, or a
process that exited non-zero naming the single step that failed.

## The bound, and why it is a second

It inherits the standing convention rather than inventing a figure. The
crossing happens once per machine, not once per call, so the tight per-call
reasoning that applies inside a bound run does not apply here.

MEASURED ON BOTH PLATFORMS, and recorded in cloud-runner.md: the entrypoint's
`start` step spawns the lane and returns in about 74 milliseconds while the
lane keeps running.

## The fault this crossing already carries

THE AUTONOMY RUNG DOES NOT SURVIVE A RESTART OF THE DESTINATION. Measured
twice on 2026-08-19 during i37: the lane restarted, came back at `tactical`,
and the grant the person had given was gone with no notice. The walk's
position survived because it lives in the record; the dial does not live
anywhere.

SO THE CROSSING IS WRITE-ONCE AND THE STATE IS HELD ONLY IN THE PROCESS. That
is the whole of `note-ef85e0c86b5e` and `note-a02771bee06a`, and drawing the
interface is what makes it a property of a modelled edge rather than a pair of
loose observations.

## What it actually carries, corrected

THE FIRST DRAFT OF THIS NODE SAID `flow-dispatched-call`, then `flow-live-lane`.
Both were guesses at what an entrypoint hands an engine.

THE ELEMENT MATRIX ANSWERS IT WITHOUT GUESSING. Computed over the corpus: the
only flow this pair owes is `flow-harness-profile`, produced by the
entrypoint's measuring of the host and consumed by
`fn-run-a-governed-walk.serve-a-step`.

THAT IS i36'S FINDING GIVEN AN EDGE. The harness is not Claude, so a step is
served differently depending on what the host truncates, offloads or hides.
The profile is how the engine learns which host it is on, and it can only come
from the process that started under it.

`flow-live-lane` IS KEPT BESIDE IT because the pair genuinely exchanges it, and
because a reader looking for how the lane comes up should find it here.

## The owed crossing i38 also drew

i38 minted this same node independently, and its reasoning is kept because it
names the allocation question this node leaves open.

`fn-arrive-on-a-machine.identify-the-harness` is allocated to el-entrypoint. The
element named for that work, el-arrival, implements nothing at all and shows in
the matrix as idle, and the interface minted for it — if-arrival-to-walk-engine —
shows as undemanded. So one flow has an interface nobody sends across and a
crossing nobody had an interface for.

BOTH PREDATE BOTH ITERATIONS and neither is in either cone; the element matrix
simply did not surface them until a new element made it recompute. This node
clears the owed side. The idle element and its undemanded interface are left
standing, because deciding whether identifying the harness belongs to arrival or
to the entrypoint is an allocation question that belongs to whoever owns that
cone.

---
minted_in: i36
id: fn-run-a-governed-walk.route-a-failure-shape
type: "[[function]]"
cluster: the-walk
statement: classify a recurring non-misuse failure shape and give it a durable home
satisfies:
  - req-repeated-failure-shape-becomes-durable-work
inputs:
  - flow-dispatched-call
outputs:
  - flow-failure-disposition
---

## Rationale

A refusal or an error that keeps recurring is either the caller's own
misuse, or a gap in a tool contract, a harness, or the engine. Left alone
each occurrence is local recovery noise: the agent follows the remedy and
moves on, and the shape itself is never looked at across the window.

THIS CLASSIFIES; IT DOES NOT PERSIST. `keep-the-record` already records
every act and derives views over them — this function decides WHAT KIND a
recurring shape is and hands that verdict to the record, rather than
duplicating the recording it already does.

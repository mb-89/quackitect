---
minted_in: i35-the-cloud-run-s-findings-land-the-fix-fi
id: flow-arrival-request
type: "[[flow]]"
statement: "a session starting on a clone that has no lane"
kind: signal
crosses: in
source_refs:
  - req-one-command-takes-a-fresh-clone-to-a-live-lane
---

## Why it crosses in

NOTHING INSIDE THE SYSTEM PRODUCES IT, and nothing should. A session starting
on a clone that has no lane is an act of a person or a harness, and it is the
event the whole arrival cluster exists to answer.

THREE FUNCTIONS CONSUME IT and none produces it: placing the cage, judging the
runtime, and resolving the cited refs. That shape is what a crossing-in flow
looks like.

MARKED 2026-08-18, when a re-walk of i16 ran the flow-closure check from the
start and found this flow with one end. It was minted in i35 without the key.

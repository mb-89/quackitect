---
kind: matrix-row
name: build-steps
statement: "Build steps: the placeholder the seeded chunk machine fills - the real steps run here, in parallel where independent."
state_kind: work
filled_by: agent
depends_on: [observe-red]
seeds: build-chunks-run
---

## Guidance

The placeholder between the red observation and verification: plan-build seeds the iteration's chunk drawing, and entering this state runs it - one state per chunk, parallel builders on independent chunks, every fill recorded with its actor. Without an iteration drawing the state serves plain, but a build without visible steps is a defect: seed the drawing at plan-build, always.

## Evidence form

- build_record | the chunk machine's run: chunks filled, actors, the sub-record file | required

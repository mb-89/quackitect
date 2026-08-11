---
id: dsp-narration
type: "[[design-spec]]"
statement: the decision graph riding every changing call, carried by typed ops with a toll that keeps the story gapless
realizes:
  - "el-walk-engine"
files:
  - "project/deliverable/engine/decisions.ts"
  - "project/deliverable/engine/toll.ts"
  - "project/deliverable/engine/bin/render-decisions.ts"
---

## Responsibility

Narration is data: plan, fork, update, done, obsolete, revert and defer
land as nodes and resolutions in the decision graph. The toll enforces
the floor — a changing call without an update, past the person's
notch, refuses. Malformed briefs are corrected into plans where the
correction is mechanical.

## Rationale

The graph replaces prose status: a reader sees what was opened, what
closed and what stalled, without trusting anybody's summary.

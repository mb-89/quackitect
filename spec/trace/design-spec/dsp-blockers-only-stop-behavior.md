---
minted_in: i61-everything-served-to-an-agent-gets-short
template: item-design-spec
artifact: node
type: "[[design-spec]]"
id: dsp-blockers-only-stop-behavior
statement: The blockers-only stop hook yields only after the walk reports a real blocker and otherwise keeps runnable work active.
realizes:
  - el-walk-engine
files:
  - deliverable/engine/bin/se-hook-stop.ts
  - deliverable/tests/stophook.test.ts
---

# Blockers-only stop behavior

## Responsibility

Keep the session running while the newest pull reports runnable work.

Yield control only when the latest pull reports a blocker or wait that prevents the walk from continuing.

## Interface

The stop hook consumes the newest lane call result and the selected stop-at notch.

It returns a stop decision for the harness.

## Behavior and constraints

A successful pull is not a blocker under blockers-only.

A refused pull is a blocker and permits the harness stop.

The decision uses the newest pull result so stale stopped states cannot end current runnable work.

## Rationale

Blockers-only is for unattended continuation. Its decision must follow the machine's latest ability to progress.

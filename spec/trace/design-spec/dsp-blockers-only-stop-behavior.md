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

### The front desk outranks every notch

The front desk with nothing routed is a sanctioned stop at every notch, blockers-only included.

After a boot the walk lands at the desk and stops there. It does not pick up work that happens to be lying around.

A routed target outranks the desk. Standing at the desk with a target set still blocks, because a target is the person's standing instruction.

An idle wait anywhere other than the desk still blocks under blockers-only. A wait mid-machine is the absence of a blocker rather than one.

### An empty target is never printed as a set one

The refusal has three wordings, and the difference is what the reader can act on.

A wait with a target names it and points at the door leading toward it.

A wait with no target says the target is empty. There is no door to point at, so pointing at one would be advice nobody can follow.

Anything else is mid-work, and the answer is to pull again.

## Rationale

Blockers-only is for unattended continuation. Its decision must follow the machine's latest ability to progress.

The notch was first made to outrank the desk. That fixed a real defect, where four stops in a row passed while the agent had work in hand, and it overshot onto a session that had genuinely finished. The owner ruled the desk back out.

The empty-target wording was one condition too coarse. Any wait counted as aimed, so a blank target rendered as a set one and the reader was sent looking for a door that did not exist.

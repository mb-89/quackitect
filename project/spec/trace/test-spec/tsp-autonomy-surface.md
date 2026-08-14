---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: tsp-autonomy-surface
type: "[[test-spec]]"
statement: The autonomy surface arms, disarms and shuts down exactly as the dial and its toggles say, verified by test over the control machinery.
method: "test"
verifies:
  - "req-emergency-sits-above-full"
  - "req-drumroll-arms-deliberately"
  - "req-controls-draw-from-their-spec"
  - "req-shutdown-fires-only-idle-or-end"
files:
  - tests/emergency.test.ts
  - tests/drumroll.test.ts
  - tests/power.test.ts
  - tests/params.test.ts
  - tests/scale.test.ts
---

## Scope

The person's hand on the machine: emergency mode's arming laws, the
drumroll, the spec-drawn control bar, and the shutdown triggers.

## Approach

Component level, state-based over the arming lifecycle: fresh, armed,
reloaded, revoked. Boundary design on the drumroll's window and count.
The shutdown requirement is DEFINED test-first against the ruled
countdown design: power.test.ts pins today's mechanism, and the
countdown, the cancel-on-release, the own-clock idleness check and the
end trigger land as named cases WITH that build — the 2026-08-10 field
failure (a machine that never shut down overnight) is the red those
cases must reproduce first.

## Steps

Every case in the referenced files is one step; the case name states its
claim. The load-bearing steps: emergency survives the reload it was
granted through — and a lowered dial revokes it for good; five presses
arm it from a LOCKED rung; exactly one place shuts the machine down, and
it is inside checkIdle; a walk that is not at idle is never idle,
however long the silence.

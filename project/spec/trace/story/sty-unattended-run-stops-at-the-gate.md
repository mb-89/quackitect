---
id: sty-unattended-run-stops-at-the-gate
type: "[[story]]"
statement: When I leave the machine running while I do something else, I want it to walk everything it may and stop exactly at what is mine, so I come back to a decision rather than a mess or an idle terminal.
actor: stk-engineer-driving-agents
refines:
  - vp-autonomy-range
killer: true
---

## Deck

An unattended agent stops at everything, which wastes the absence, or at nothing, which is worse. Neither is a machine you can leave alone.
|||

---

The slider sits at 1.0. The walk stands early in M2, with several states below that rung and one gate above it.
|||

---

The agent pulls once. The machine walks every hop whose weight fits the slider — the happy path, in one call — and lands at the next branching point.
|||

---

It reaches the gate, which outweighs the slider. The pull answers `wait`, names the step that waits, and stops. The agent stops with it.
|||

---

The engineer returns to the work done up to the decision, and one decision waiting with its evidence beside it. The slider alone does not restart the walk; their message does.
|||

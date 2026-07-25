---
id: se.decision-refine-mode
kind: decision
statement: A design-reuse iteration (one that realizes an already-ruled design or extends a shipped feature) reduces the DESIGN-INPUT milestones; DELIVERY never shrinks; any genuinely-new decision still takes its gate.
provenance:
  iteration: i8b-phone-connect
  ai_involvement: agent-drafted
  adjudicated_by: owner
  channel: chat
breaks_if_removed: Every iteration pays the full M1-M6 design-input cost even when the design is already decided - the slow tax i8 and i8b exposed.
---

## Ruling

Owner, in chat, 2026-07-24: reduce the design-input phase for an iteration that literally iterates on an existing design - M1 can be very short or absent; we profit immediately (i8b is exactly such an iteration).

## The reduction (design input shrinks, delivery never does)

- M0 Retro: ALWAYS FULL (the owner's, blameless, note-draining).
- M1 Frame: reduced to CONFIRMING THE DELTA against the inherited vision; where the vision is unchanged it is a pointer + the delta statement; gate_motivation passes on the delta alone, never re-litigating the axiom.
- M2 Understand: INHERITED (pointer); only genuinely-new stories/use-cases are added.
- M3 Specify: only the NEW requirements (the delta register), not a full re-derivation.
- M4 Explore / M5 Decide: SKIPPED when there is no new design choice; a genuinely-new decision (e.g. i8b's config-write amendment) re-enters the decide path for THAT decision only - the gate has little to chew, not nothing.
- M6 Prove: spike only genuinely-new unknowns (e.g. i8b's zero-dep QR encoder).
- M7 Build / M8 Validate / M9 Ship: ALWAYS FULL - delivery never shrinks.

Rule of thumb: design input shrinks with reuse; delivery never does; every new decision still gets its gate.

## Mechanism

Realized durably as a diffable 'refine' strike-list over systematic - the same mechanism as the planned lean strike-list (req-lean-strike). Until that lands, an iteration locked to systematic (like i8b) achieves the same effect by walking M1-M6 LIGHT: inheriting where possible and carrying real content only in the new-decision gate and the new-unknown spike.

## Composes with

The mechanical-vs-judgment split ([[se.guidance-retro-independence]]): a design-reuse realization is usually mechanical, so a refine iteration is a strong delegation/parallel candidate.

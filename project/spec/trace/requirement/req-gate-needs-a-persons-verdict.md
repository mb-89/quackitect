---
minted_in: i1-prove-a-bases-equivalent-live-table-can-
id: req-gate-needs-a-persons-verdict
type: "[[requirement]]"
statement: When the walk reaches a gate, the engine shall hold the walk until a verdict is recorded, and shall accept that verdict from the agent only where the session autonomy allows it.
kind: functional
verify_method: test
breaks_if_removed: A gate passes with no verdict at all, and adjudication disappears instead of moving to whoever the slider put in charge.
breaks_how_badly: fatal
refines:
  - uc-adjudicate-a-gate
  - uc-land-work-on-trunk
source_refs:
  - uc-adjudicate-a-gate step 1
  - uc-adjudicate-a-gate step 6
  - uc-adjudicate-a-gate step 5
  - ".se/req-mine-v1.md: gates, blesses, and the person's hand"
  - ".se/req-mine-v2.md: gates, offers and grants"
  - uc-adjudicate-a-gate ext 5a
  - uc-land-work-on-trunk step 2
  - uc-land-work-on-trunk step 5
priority: must
---

## Detail

Every moment the rule binds:

- When the walk reaches a gate, the engine shall halt the walk until a verdict is recorded.
- The engine shall weigh a gate against the session autonomy like any other step.
- Where the gate outweighs the slider, the engine shall accept its verdict only from a channel a person holds.
- Where the slider covers the gate, the engine shall accept the verdict from the agent.
- When a gate verdict is a rejection, the engine shall hold the walk at the gate with the evidence form open for refill.
- The engine shall advance the walk past the land gate only on a person's bless.

## THE VERDICT IS OWED; THE CHANNEL IS THE SLIDER'S (owner ruling 2026-08-09)

This requirement used to read "a person's verdict" everywhere, and it was
wrong. The owner ruled it strictly untrue: at high autonomy the agent blesses
its own gates when the person has said so, and it has always worked that way.

WHAT THE GATE ACTUALLY PROTECTS is that a verdict is RECORDED — that somebody
looked, said pass or fail, and put a reason on it. Not who held the pen.

WHY THE OLD WORDING COST SOMETHING. It was cited twice on 2026-08-09 to refuse
a bless the owner had already authorised, and the walk stopped at a gate it
was allowed to pass. A requirement that overstates its own rule does not make
the system safer; it makes the agent refuse work it was told to do.

THE LAND GATE KEEPS ITS EXCEPTION. Reaching trunk is the one bless that stays
the person's whatever the slider says, because it is the act that leaves the
record.

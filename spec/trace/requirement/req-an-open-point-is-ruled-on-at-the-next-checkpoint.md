---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: req-an-open-point-is-ruled-on-at-the-next-checkpoint
type: "[[requirement]]"
statement: If a piece of work placed on an earlier state is still open when the next checkpoint is reached, then that checkpoint shall record whether it accepts the work and continues or sends that earlier state back.
kind: functional
verify_method: test
breaks_if_removed: Work pushed backwards passes a checkpoint in silence, so a gate signs over an open point nobody looked at.
breaks_how_badly: corrosive
refines:
  - uc-route-outstanding-work-to-where-it-is-done
source_refs:
  - uc-route-outstanding-work-to-where-it-is-done extension 7a
priority: must
weighs_with:
  - none
weighs_against:
  - none
---

## Detail

TWO OUTCOMES AND NO THIRD. The checkpoint accepts the open point and carries
on, or it refuses and sends the earlier state back. What it never does is
pass without saying which.

THE RECORD IS THE POINT. A verdict given in conversation is not a verdict
the next reader can find.

ONE HALF OF THIS WAITS ON THE ORCHESTRATOR ROUND, and the story that
generalises it says so in its own deck. What is owed here is the checkpoint
ruling; who drives the state that goes back is i64's.

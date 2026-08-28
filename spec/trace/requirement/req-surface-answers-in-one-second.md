---
minted_in: i12
id: req-surface-answers-in-one-second
type: "[[requirement]]"
statement: When a person opens a surface, the mirror shall answer within 1 second, or within that same bound say what it is doing and finish in the background, for every surface request.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: every surface request answers within 1000 ms, or within 1000 ms shows what it is doing and completes in the background
breaks_if_removed: The person pays a wait on every look, and the wait is invisible because nothing counts a render as cost.
breaks_how_badly: corrosive
refines:
  - uc-quality-performance-efficiency
source_refs:
  - req-responsiveness, the register this budget is drawn from
  - vp-rigor-without-toil
  - req-call-answers-in-one-second
  - i12
priority: should
weighs_with:
  - req-a-clear-jump-is-one-call ! — one measures a person's render latency at the mirror's HTTP boundary, the other measures call count for the walk; different boundaries
  - req-call-answers-in-one-second ! — one times a person's surface render at the mirror's HTTP boundary, the other a driver's lane call at dispatch; different verify boundaries, per this row's own "sibling rather than a widening" section
weighs_against:
  - req-only-a-file-with-its-own-door-is-withheld > — a slow surface is paid on every look; a file served through its own verb instead of directly is paid once, by somebody who wanted to read it raw
---

## Scenario

- Source: a person at the mirror.
- Stimulus: opening a surface, such as the state machine or an evidence
  form.
- Artifact: the serving mirror.
- Environment: normal operation on the reference machine.
- Response: the rendered surface, or feedback naming the work and a
  background completion.
- Response measure: the answer arrives within 1000 ms for every surface
  request. Where it cannot, feedback naming the work arrives within the
  same 1000 ms and the work completes in the background.

## Past a second the person is told, never left waiting

A SURFACE MAY TAKE LONGER THAN A SECOND. What it may not do is go silent,
and it may not hold the loop that draws the interface.

TWO THINGS ARE OWED TOGETHER, and one without the other fails this row.

- IT SAYS WHAT IT IS DOING, inside the same 1000 ms. Real progress where
  progress exists, an indeterminate bar otherwise. `guidance/craft/ux.md`
  carries the shape under "Nothing ever hangs".
- IT FINISHES IN THE BACKGROUND. Anything past a second leaves the drawing
  loop, because a rule about showing feedback is worth nothing when the
  loop that would render it is frozen.

THE LANE ROW ALREADY SAID THIS and this one did not. `req-call-answers-in-one-second`
has carried "or return a background handle whose completion the driver
observes" since i1, so the agent's side has been covered and the person's
side has not.

## Why it is a sibling rather than a widening

`req-call-answers-in-one-second` covers a DRIVER'S CALL. This covers a
PERSON'S LOOK.

They verify differently, which is the split rule. A lane call is timed by
the engine around its own dispatch. A surface request is timed at the
mirror's HTTP boundary, and it includes work the lane never does:
compiling the machine, building the drawing, rendering.

One node carries one verify_method and one pass line, so two pass lines
measured at two boundaries are two nodes.

## What the gap already costs

The lane row has stood since i1 and the surface has never been covered.
That is how both measured breaches got past every guard.

Recorded in one twelve-minute window on 2026-08-15:

| surface | slowest | requests over 1000 ms |
| --- | --- | --- |
| /widget/details | 3468 ms | 7 of 7 |
| /widget/machine | 3966 ms | 1 of 1 |
| / | 4026 ms | 1 of 1 |

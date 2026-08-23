---
minted_in: i12
id: req-surface-answers-in-one-second
type: "[[requirement]]"
statement: When a person opens a surface, the mirror shall answer within 1 second, for every surface request.
kind: quality
characteristic: performance-efficiency
verify_method: test
measure: every surface request answers within 1000 ms
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
weighs_against:
  - req-only-a-file-with-its-own-door-is-withheld > — a slow surface is paid on every look; a file served through its own verb instead of directly is paid once, by somebody who wanted to read it raw
weighs_with:
  - req-a-clear-jump-is-one-call ! — one measures a person's render latency at the mirror's HTTP boundary, the other measures call count for the walk; different boundaries
  - req-call-answers-in-one-second ! — one times a person's surface render at the mirror's HTTP boundary, the other a driver's lane call at dispatch; different verify boundaries, per this row's own "sibling rather than a widening" section
---

## Scenario

- Source: a person at the mirror.
- Stimulus: opening a surface, such as the state machine or an evidence
  form.
- Artifact: the serving mirror.
- Environment: normal operation on the reference machine.
- Response: the rendered surface.
- Response measure: the answer arrives within 1000 ms for every surface
  request.

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

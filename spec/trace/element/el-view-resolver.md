---
minted_in: i4-the-panel-round-the-archived-iteration-b
id: el-view-resolver
type: "[[element]]"
statement: Resolves the whole view a person sees — every label, every colour, every greyness and its reason — so the surface draws it and derives nothing.
kind: new
realization: make
group: the-account
implements:
  - fn-run-a-governed-walk.resolve-the-view
satisfies:
  - req-panel-shows-the-machine
  - req-controls-draw-from-their-spec
  - req-filter-draws-only-what-serves
source_refs:
  - raid-the-surface-repeats-a-computed-view-behind-a-guard
  - opt-the-surface-is-a-dumb-repeater
---

WHAT CROSSES ITS BOUNDARY IS RESOLVED, NEVER RAW. A colour, not a condition. A
label, not an identifier to look up. A row already marked as the selected one.

INPUT CROSSES BACK AS AN INTENT. The surface reports which control was
pressed; this element decides what that means.

Boundary: one view model, and the intents that come back against it.

Realization: engine-side resolution, built from what the pull already computes
about position, greyness and conditions. It lives at
`deliverable/engine/viewmodel.ts` and answers `view(state, intent)`.

## What was actually built, and what is still the surface's

THE MODEL AND THE DRAWING ARE TWO PASSES NOW. Nine functions moved out of the
renderer: the paint decider, the machine resolver, the state details, the
drawing sets, the route marks, the route overlay, its shape and two completion
helpers. The renderer went from 1279 lines to 990.

THE DEPENDENCY RUNS ONE WAY AT RUNTIME. The renderer imports the resolver; the
resolver imports only the renderer's TYPES, which are erased.

THE PAINT CLASS CROSSES THE BOUNDARY, and that is deliberate rather than a
leak. It is a DECISION about what a green means, not a rendering, and one place
deciding it is why both surfaces agree.

THE PAGE STILL DERIVES. The renderclient files each work out answers of their
own in the browser, and the unregistered emitters are where that lives — 21 of
them on 2026-08-23. Deciding them is the last chunk of this round, not this
element's first.

## What it forbids

A WIDGET MAY NOT REACH AROUND THE MODEL. A widget whose needs the model does
not carry is a gap in the model, and the answer is to widen the model rather
than to derive on the surface.

THAT IS THE ELEMENT'S WHOLE DISCIPLINE, and it is the thing most likely to
decay. One reach turns the surface back into a deriver.

---
form: the-view-model
by: agent
signed_off: 2026-08-23T19:09:20.403Z
authors: agent
files: null
---

# Evidence form / the-view-model

## current_situation

THE MODEL AND THE DRAWING WERE ONE PASS, and they are two now.

`deliverable/engine/render.ts` went from 1279 lines to 990. Nine functions moved out: the paint decider, the machine resolver, the state details, the drawing sets, the route marks, the route overlay, its shape, and two completion helpers.

`deliverable/engine/viewmodel.ts` HOLDS THEM, plus the one call that ties them together.

THE RENDERER ASKS AND DRAWS. `renderMirror` now opens with one call to the resolver and never works out an answer of its own below that line.

## built

`view(m, intent)` ANSWERS THE WHOLE MODEL. The intent says which widget and which machine; what comes back is data.

WHAT IT CARRIES: the target, the machine the walk is in, the session description, the packet, the last packet, the state details, the canvas comment, whether the view is the walk's own, the viewed machine, the last twenty history entries, the rungs, the checked documents, the panel values, the declaration, the canvas, and the drawing sets.

IT EMITS NOTHING. No markup, no class name, no colour. The one thing it hands over that looks like drawing is the paint class per state, and that is a decision rather than a rendering — one place decides what a green means, and both surfaces read it from there.

THE PHASE TIMINGS SURVIVED THE MOVE. The resolver takes the caller's own phase callback and reports `session`, `machine.sets`, `machine.states`, `packet` and `checked_docs` under their old names, measuring the same work. Their ORDER changed: `machine.states` now comes before `machine.svg`, because the model is built before it is drawn.

THE DEPENDENCY RUNS ONE WAY AT RUNTIME. The renderer imports the resolver; the resolver imports only the renderer's TYPES, which are erased. `statePaint`, `routeOverlay` and `RouteMarks` keep their old door in `render.ts` as re-exports, so two standing tests that ask that module for them still find them.

THE BREADCRUMBS SAY THE PATH ONCE (owner ruling 2026-08-23). They printed the qualified position again beside themselves. That repeated the crumbs exactly, and the only thing it added — the state leaf — is on the position button two elements to the right. Removed.

### What the run found

THE BATTERY WENT FROM 24 FAILURES TO 25, and one of the 25 is this round's own red. The other 24 were already standing before this session touched anything, all in `deliverable/tests/claimops.test.ts`, all in the same setup helper.

ONE REAL BREAK CAME OUT OF THE MOVE, and it is fixed. `deliverable/tests/archive.test.ts` pinned the expedition-list fetch to exactly one call site in `render.ts`. The call moved to the resolver, so the count read zero.

THE INVARIANT WAS NEVER ABOUT THE FILE. It says the list is fetched once for the whole render, because a second call site is a quadratic bug that once hung the server. The test now counts across both files, so a second call site reappearing in either one still fails it.

NOTHING IN THE DRAWING, THE ROUTE OR THE PANEL FAILED. No render, route, panel, machine or trace case is in the roll call.

## follow_up

THREE CHUNKS OPEN FROM HERE, and they are independent of each other:

- the set-building call, which is 1163.6 ms of a 1190.2 ms render
- the redraw route, which six sites currently decide for themselves
- the target chip and the blue route line

THE RESOLVER IS NOT YET THE ONLY SOURCE. The renderclient files still derive their own answers on the page side, and deciding each one is `the-eighteen-are-decided`.

THE PHASE ORDER CHANGE IS WORTH ONE LINE IN A RETRO. A reader comparing a profile from before the move against one from after will see the same names in a different order.

## anything_else


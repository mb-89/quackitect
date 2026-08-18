---
minted_in: i1
id: dsp-mirror-render
type: "[[design-spec]]"
statement: the one surface a person looks at, carried by a loopback server rendering the machine, the forms, the feed and the tour
realizes:
  - "el-mirror"
  - "if-account-to-mirror"
  - "if-front-desk-to-mirror"
  - "if-holding-pen-to-mirror"
  - "if-method-compiler-to-mirror"
  - "if-record-store-to-mirror"
  - "if-walk-engine-to-mirror"
files:
  - "project/deliverable/engine/render.ts"
  - "project/deliverable/engine/mirror.ts"
  - "project/deliverable/engine/panel.ts"
  - "project/deliverable/engine/brand.ts"
  - "project/deliverable/engine/card-parts.ts"
  - "project/deliverable/engine/cards.ts"
  - "project/deliverable/engine/traceui.ts"
  - "project/deliverable/engine/gitgraph.ts"
  - "project/deliverable/engine/shoot.ts"
  - "project/deliverable/engine/bin/brand.ts"
  - "project/deliverable/engine/bin/mermaid-check.ts"
  - "project/deliverable/engine/bin/place-prompt-layer.ts"
---

## Responsibility

The mirror serves what the engine holds — the machine drawing, the
evidence forms, the trace graph, the feed, the archive, the tour — to
one machine over loopback, and never advances the walk. Every seam into
it is a derived view; controls post back through the lane.

## Behavior and constraints

- Colors are configuration, read from the palette file.
- Every update reaches the render; the reader keeps their place.
- The screenshot verb captures the mirror for evidence, on request.

## Pushed, never polled

THE WALK WAKES EVERY HELD HAND and the event stream forwards that wake to the
surface, so a change lands at once instead of up to a poll late.

THE STREAM RECONNECTS BY ITSELF. A reconnect after silence is how an engine
swap arrives without a manual refresh, and a silence that never ends is death.

## The reader keeps their pane

A PANE THE READER SIZED KEEPS THAT SIZE.

Walking into a sub-state is a full page load, and a width set by dragging is an
inline style, which no page load survives. So every entry into a sub-machine
snapped the whole layout back to its defaults — the machine drawing included,
because it takes whatever the two columns leave it.

A PANE SIZE IS A PREFERENCE, NOT A VIEW OF SOMETHING. It is about how the
reader likes to work, not about which machine is on screen. So it outlives the
tab, while the per-machine viewBox belongs to the session, where a view of one
drawing belongs.

## The loading bar owns its lifetime

ANYTHING THAT CAN TAKE LONGER THAN A SECOND SHOWS FEEDBACK AT ONCE.

THE BAR USED TO RELY ON THE NAVIGATION THAT FOLLOWED to replace the whole page.
Morphing then replaced navigation, and a bar nobody hid simply stayed up.

A BAR THAT OUTLIVES ITS LOAD IS WORSE THAN NONE: the reader learns to ignore
it, and it can no longer warn them when something really is slow. So every load
carries a token, settles exactly once, and cannot outlive its deadline.

## The terminal flicker was a 2-cycle

THE FIRST FIX REFUSED A RESIZE THAT CHANGED NOTHING, which only ever catches a
fixed point. The real loop alternated between two sizes, so every step differed
from the one before it and the guard never fired.

WHAT DROVE IT: the client width INCLUDES the pane's padding, so the grid was
computed about three columns too wide. The terminal laid out wider than its
content box, the pane grew a scrollbar, the client width shrank, the grid
narrowed, the scrollbar went away, and it started again.

THREE GUARDS, EACH KILLING ONE LINK. The pane no longer scrolls, so a child
cannot change the parent's client box. The grid is measured against the CONTENT
box, so the terminal fits what it was given. And after our own resize the
observer is ignored until the relayout has landed, with one trailing look so a
drag ending inside that window is not lost.

## The native skin

DOCKED INSIDE A HOST, THIS IS NOT OUR OWN WINDOW ANY MORE, so it stops looking
like one: square corners, the host's fonts, the host's palette. Our own look
belongs to the standalone mirror. Semantic colours stay ours everywhere.

A SOLO CARD DROPS ITS HEAD AND ITS FRAME. The host already draws a titled,
bordered pane around it, and two frames read as a bug.

THE HOST OWNS THE WALK'S CONTROLS WHEN EMBEDDED. The dials and the escape steer
the whole walk and a card may be closed, so they belong to the host's sidebar
rather than to any one card.

THE CRUMBS ARE NOT CONTROLS. They navigate the DRAWING — which machine is on
screen — so they stay with the drawing. Escape stays with the drawing too, and
lives only there: it acts on the walk the drawing shows, and repeating it in
the host's sidebar would be the same control in two places.

## A walked sub-machine must not look unstarted

A CONTAINER AND AN END CARRY NO CLAIM OF THEIR OWN, and the live run that used
to colour them dies with the engine. Read from trunk, a finished record showed
"not done" though every claim under its last gate stood signed. So their green
is DERIVED.

A CONTAINER'S GREEN IS THE SESSION'S, NOT THE RENDERER'S. The session already
answers for it, and it answers with the ripple applied — so a container whose
own inputs are grey stays grey. Painting it here from its interior alone was a
second rule, and it drew one machine green above a grey dependency.

---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-a-drag-that-crosses-two-panels-may-not-be-buildable-here
type: "[[raid]]"
kind: risk
statement: "The design wants a token dragged out of the editor panel and dropped on the state machine panel, and nobody has established that a drag can cross two panels in this host."
owner: the maintainer
trigger: "the spike's result, and any design work that assumes the gesture before that spike has run"
status: open
impact: "The gesture is how work reaches a state at all in the drawn surface. Without it the editor and the machine stop being two halves of one tool, and the whole surface has to be redesigned after the design is otherwise finished."
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - i63-work-tokens-become-the-unit-of-work-and-
---

## PROBED, 2026-08-26 — there are TWO drags and only one of them is at risk

### The drag the design actually needs is inside one editor

[[raid-dec-one-editor-is-widened-rather-than-a-second-written]] lists what has no
precedent, and two of its four items are the panes and the drag between them:

> - Two panes side by side.
> - Dragging a row from one pane to the other.

BOTH SIT INSIDE THE WIDENED EDITOR. Two panes of one editor are one document in
one webview, so a row moving between them is ordinary drag and drop within a
single page. Nothing crosses a boundary.

SO THE BUCKET EDITOR'S OWN DRAG IS NOT THE RISKY ONE. It is unbuilt, which is
why the decision lists it, but unbuilt is not the same as unbuildable.

### The drag that IS at risk crosses two webviews

THE EXTENSION REGISTERS SEPARATE WEBVIEWS, and they are separate by
construction: `deliverable/vscode/src/extension.ts` line 2069 onward registers
`tools`, `controls` and `details` as three view providers, and lines 872, 977
and 1018 create `seForm` and `snapshot` as their own panels.

EACH IS ITS OWN DOCUMENT. A gesture beginning in one and ending in another is
not one page's drag; it is two pages that share nothing but the extension host
between them.

THE DECISION SAW THIS COMING, at its own line 62: the cross-surface drag "will
force" a shared widget "anyway, since a gesture spanning two surfaces cannot
live inside either".

### And no goal asks for it

THE TWELVE KICKOFF GOALS DO NOT NAME IT. Goal eleven says a position shows a
count per slot and CLICKING one opens the editor. Clicking, not dragging.

SO THE SPIKE THAT WAS HELD AS ABLE TO REVERSE THE DESIGN IS ABOUT A GESTURE
NOTHING IN THIS RECORD REQUIRES. That is the finding, and it is the useful one:
the blocker was mis-sized rather than mis-answered.

### What is honestly still unknown

WHETHER TWO VS CODE WEBVIEWS CAN EXCHANGE A DRAG AT ALL. I did not read the
vendor's API documentation, so this entry does NOT assert that they cannot. What
it asserts is what the code shows: they are separate documents.

THAT QUESTION IS NOW CHEAP TO LEAVE OPEN, because nothing this record ships
depends on the answer.

### What this leaves

THE BUCKET EDITOR'S PANE-TO-PANE DRAG proceeds as ordinary work, inside one
webview, with no spike owed.

THE CROSS-SURFACE DRAG is a later record's, and it starts by reading the vendor
documentation rather than by building.

## The hinge

THREE THINGS HAVE TO HOLD and only the first is ordinary. A drag begun in one
panel must be received by another. The payload must carry enough to identify
the token. And the receiving panel must change what it shows while the drag is
still in flight.

THE THIRD IS NOT OPTIONAL. An empty bucket is not displayed, so without the
reveal there is nothing on screen to aim at. The gesture would be impossible
for exactly the case it is most needed in.

## Why it is graded plausible

MEASURED IN THE TREE. Nineteen editors stand and three carry pointer
machinery. All of it resizes or picks inside one grid. Nothing drags a thing
from one container into another, anywhere.

So there is no precedent to copy and no evidence that the host allows it.

## What closes it

A SPIKE, RUN FIRST. That is the owner's own instruction, and the kickoff gate
records it as the first thing to do rather than a fallback.

The spike answers the three questions above. Until it has, no surface work
should assume the gesture exists.

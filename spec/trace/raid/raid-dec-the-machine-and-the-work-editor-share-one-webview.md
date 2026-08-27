---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-dec-the-machine-and-the-work-editor-share-one-webview
type: "[[raid]]"
kind: decision
statement: The state machine and the work editor render in one webview, because the drag between them is required and the platform delivers no drop from one webview to another.
breaks_how_badly: crippling
how_likely: plausible
source_refs:
  - exp-can-a-drag-cross-two-panels
  - sty-steer-a-running-iteration-by-moving-work
  - raid-dec-one-editor-is-widened-rather-than-a-second-written
  - "microsoft/vscode issue 111092 — drag events on WebviewViewProvider and Webview, requested and not built"
  - "owner, 2026-08-26"
---

## What forces it

THE GESTURE IS REQUIRED. [[sty-steer-a-running-iteration-by-moving-work]] shows
a row dragged out of the table and dropped on a state, with the states lighting
up while the row is in the air.

THE PLATFORM REFUSES IT ACROSS WEBVIEWS. Each webview is an isolated frame, and
the vendor's own issue asking for drag events on webviews is open rather than
shipped.

ONE FRAME MAKES IT ORDINARY. Inside a single document the drag is the one
already working in `basesclient.ts` lines 301 to 336.

## Rejected options

STOP MAKING IT A DRAG. Pick in one surface, place in the other, with the host
carrying the selection between them over the message channel that already
exists. REJECTED: it works, and it loses the thing the story is actually about.
The states lighting up while the row is in the air is the affordance, not
decoration — it is how a person sees which buckets will take the item before
committing to one.

MAKE ONE SIDE A NATIVE TREE VIEW. The vendor DOES support drag and drop between
tree views, through `TreeDragAndDropController` and `vscode.DataTransfer`.
REJECTED: the state machine is a drawing, not a list. A tree cannot show a
machine, and turning the machine into a tree throws away the surface this
project is built around.

DRAG FROM A TREE VIEW INTO A WEBVIEW. REJECTED on evidence rather than on taste:
the vendor's issue 182449 reports that dropping into a webview does not work
either, so the boundary is closed in both directions.

HAND-ROLL THE DRAG ACROSS THE BOUNDARY. Track the pointer in one webview, tell
the host when it leaves, have the other guess where it entered. REJECTED: it
reimplements a browser primitive across a boundary the browser deliberately
closed, and nobody has shown it works.

WAIT FOR THE VENDOR. REJECTED: the feature request is open with no ship date,
and a design waiting on somebody else's roadmap is a design with no date of its
own.

## ONE DOCUMENT, TWO EDITORS — owner constraint, 2026-08-26

SHARING A WEBVIEW IS A PLUMBING FACT AND MUST NOT BECOME A UX FACT. To the
person it looks like two editors that happen to open in the same panel.

EACH SURFACE KEEPS ITS OWN VIEWPORT. Zooming the state machine does not zoom the
work editor. Scrolling one does not scroll the other. They are independent
views that share a document, not one view showing two things.

THAT IS ACHIEVABLE AND IT IS NOT FREE. Two independently panned and zoomed
regions in one page is ordinary work; what it forbids is the lazy version, where
one transform is applied to the whole document because the document is one.

THE TEST A PERSON WOULD RUN: zoom the machine right in, and the work list beside
it is untouched. If it moved, the surfaces were merged rather than hosted
together.

## Consequences

THE MERGE IS SMALLER THAN IT SOUNDS. Both surfaces are already client scripts
rendering into a webview — the machine in the panel renderer, the table in the
bases client. Neither is being rewritten; they are being hosted together.

THE REAL COST IS A LAYOUT CHOICE, and it is worth naming because it is the part
a person feels. The two surfaces live in different workbench locations today.
One webview means one location, so either the machine moves to where the editor
is or the editor moves to the machine.

THE BETTER SHAPE IS PROBABLY AN OVERLAY. The machine stays the primary surface
and the work list slides in over it, so a row is dragged from the overlay onto
the machine underneath. Same document, so the drag works, and the machine keeps
the space it needs.

THAT SHAPE IS NOT DECIDED HERE. What is decided is one webview; how the two
surfaces share it is the build's.

## What was predicted before the spike ran

[[raid-dec-one-editor-is-widened-rather-than-a-second-written]] rejected
extracting a shared widget for this round, and said in the same breath that it
"is also what the cross-surface drag will force anyway, since a gesture spanning
two surfaces cannot live inside either".

THAT SENTENCE WAS RIGHT AND NOBODY ACTED ON IT. It sat in a rejected-options
list, which is where a prediction goes to be forgotten.

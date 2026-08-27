---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: dsp-the-bucket-editor
type: "[[design-spec]]"
statement: the machine and the work editor render in one webview and behave as two — independent viewports, with a row dragged from one onto the other
realizes:
  - "el-mirror"
  - "if-mirror-to-work-store"
files:
  - "deliverable/engine/work-card.ts"
  - "deliverable/engine/workclient.ts"
  - "deliverable/views/cards.md"
---

## The file list changed at the build, and the reason is worth keeping

THE DESIGN NAMED THREE FILES IT EXPECTED TO EDIT: the panel client, the bases
client and the editors folder. None of the three turned out to be the home.

WHAT IT ACTUALLY TOOK was two new files and one product declaration. The card's
markup, the client behaviour, and the line that puts the card on the page.

WHY THE GUESS MISSED. The design reasoned from where the DRAG precedent lives,
and the precedent was only ever a shape to copy. The bases client was never
going to host a different card.

THE EDITORS FOLDER WAS THE SHARPER MISS. Those editors render inside an
evidence form; a panel card is a different thing that happens to share the word
editor.

## Responsibility

TWO SURFACES IN ONE DOCUMENT. The state machine and the work editor, rendered
together so a row can be dragged from one onto the other.

## Why one webview, and it is forced rather than chosen

THE DRAG IS REQUIRED. A row leaves the table and lands on a state, and while it
is in the air the states show which of their buckets will take it.

THE PLATFORM DELIVERS NO DROP FROM ONE WEBVIEW TO ANOTHER. Each is an isolated
frame, and the vendor's own request for drag events on webviews is open rather
than shipped.

SO THE SURFACES SHARE A DOCUMENT. Inside one, the drag is the ordinary one
already working in `basesclient.ts`, where a column header carries a payload and
the receiver changes what it shows mid-drag.

## Sharing a document is a plumbing fact and must not become a UX fact

TO THE PERSON IT IS TWO EDITORS that happen to open in the same panel.

EACH SURFACE KEEPS ITS OWN VIEWPORT. Zooming the machine does not zoom the work
list. Scrolling one does not scroll the other.

THE TEST A PERSON WOULD RUN: zoom the machine right in, and the list beside it
is untouched. If it moved, the surfaces were merged rather than hosted together.

WHAT THAT FORBIDS is the lazy version, where one transform applies to the whole
document because the document is one.

## HOW THE TWO SURFACES ACTUALLY SHARE A DOCUMENT, settled at the build

THE PANEL IS ALREADY ONE SERVED DOCUMENT with a card grid, and every card fills
its own body. The machine is a card there, beside the log, the details pane and
the database.

SO THE WORK EDITOR IS A CARD TOO. That is the whole merge: both are cards in
one page, which is what makes a drag between them ordinary rather than
impossible.

THE CARD LIST LIVES IN THE PRODUCT, at `deliverable/views/cards.md`, not in the
engine. Adding a card is an edit to that file.

IT TOOK THE LAST NUMBER. A card added anywhere else renumbers every card after
it, and the numbers are muscle memory.

## The independent viewport was already true, and is now held

THE MACHINE'S ZOOM MOVES ITS OWN SVG VIEWBOX, saved per machine. It was never a
transform on a shared ancestor.

THAT IS NOW A CASE RATHER THAN A PROPERTY NOBODY CHECKS.
`deliverable/tests/surfaces-merged.test.ts` reads the client source and refuses
a zoom applied to the body or to the card grid, which is the lazy version this
spec forbids by name.

## Behavior and constraints

A MOVE IS A REQUEST, NEVER A WRITE. Dragging a row names the move to the work
store, which is the only module that writes a piece of work. A refused move
leaves the row where it was AND says why — a row snapping back with no reason is
the failure this names.

THE COUNT IS CONSUMED, NEVER DERIVED. Two numbers per position arrive from the
offer and the surface draws them.

A DESTINATION HOLDING NOTHING IS REVEALED WHILE A ROW IS IN THE AIR. A bucket
hidden because it was empty appears during the drag, which is the one affordance
with no precedent anywhere in the tree.

## What is genuinely new

FOUR THINGS, and saying otherwise would promise reuse that is not there.

- Grouping rows into buckets, and folding a bucket by its header.
- Two panes side by side.
- Dragging a row from one pane to the other.
- A plus that mints a piece of work from a template.

## What it costs

A CHANGE TO THE WIDENED EDITOR REACHES EVERY SURFACE THAT USES IT, and the blast
radius of a cell-level change grows with each adopter.

THE LAYOUT MOVES. The two surfaces live in different workbench locations today,
and one document means one location. Which one is the build's call; that it
changes is not.

## The four buckets

A position holds four buckets. Three of them hold what is still owed, and one
holds what is done.

- INPUT — what the position takes in. Reading is the whole of it today.
- PENDING — work nobody has placed yet. It does not block, and it is the
  backlog's.
- OUTPUT — what the position produces. Everything that is not reading.
- DONE — what has finished, whichever bucket it finished from.

### Position carries the meaning

The three owed buckets sit ABOVE. Done sits BELOW, under a rule.

An item that finishes leaves a top bucket and appears in the bottom one. The
only thing that changed about it is its status.

That is what makes progress readable at a glance: the numbers above fall as the
number below rises.

### Done is a filter over status, never a place

A finished piece keeps the position it was worked at. Nothing moves it.

So nothing can be added straight into done. The plus refuses it, and the reason
is that work reaches done by finishing.

### One decider, two surfaces

`bucketOf` in `engine/workoffer.ts` is the only thing that says which bucket a
piece of work is in.

The drawing's pills ask it. The editor's columns ask it. Neither has a copy, so
the two cannot drift apart.

The four words — `in`, `pending`, `out`, `done` — are one vocabulary. They are
the pill's `data-detail`, the column's `data-slot`, and the row's `data-slot`.
A click on a pill finds its column by matching that word.

## A pill opens the editor

PRESSING A BUCKET brings the editor into view and lights the bucket that was
pressed. THE TOP BAR CARRIES A CONTROL THAT DOES THE SAME, so the editor is
reachable without a bucket to press.

THE RULING IS THE RECORD'S DESIGN INPUT, section "THE CONFLICT THIS CREATES,
AND IT NEEDS SETTLING": the editor and the machine must be visible AT ONCE,
because a row is dragged out of one and onto the other. Nothing here restates
it.

WHAT THAT FORBIDS, said once because it is the thing a builder reaches for:
opening the editor must not take the machine's place. An editor in front of the
machine leaves nothing to drag onto.

### The bar's control carries a fragment rather than a route

EVERY OTHER BAR CONTROL POSTS SOMEWHERE. Opening a card is nothing the engine
can do, because which card the reader is looking at is not the engine's to
know.

SO THE CONTROL DECLARES `#work` AND THE PAGE ACTS ON IT. The bar stays declared
in `controls.md` like every other control.

## A bucket holding nothing shows nothing

AN EMPTY BUCKET IS NOT DRAWN, and neither is the strip around it. Its rule, its
spacing and its heading all go with it.

HIDING THE COLUMNS WAS NOT ENOUGH. The strip kept its own border and its own
margin, so a position with nothing owed still showed a bordered band with
nothing in it — a bucket with a card of its own and no contents.

### Hollow, never absent

THE STRIP STAYS IN THE DOCUMENT. A row in the air has to be able to land on a
bucket holding nothing, which is why the empty COLUMN already stayed. A strip
that is not there has no destination to reveal.

SO IT IS MARKED HOLLOW AND HIDDEN, and the drag reveals it along with the
buckets inside it. One mechanism, two levels.

### Done does not stretch

THE THREE OWED BUCKETS SHARE THE WIDTH BETWEEN THEM. Done is sized by its
contents and pushed to the right-hand end of its own strip, which is the same
corner it occupies on the drawing.

A DONE COLUMN THAT FILLED THE ROW read as a fourth equal bucket that had simply
lost its neighbours.

## Pending belongs to the backlog

Pending is what the backlog holds. In practice only the front desk has one.

A position takes work IN and produces work OUT. Work nobody has placed is not at
a position at all, so a state's pending bucket reads zero.

### THE MECHANISM IS GENERAL, and that is the point

Nothing special-cases the front desk. Every block draws all four buckets and
every pill is computed the same way.

A state's pending bucket is empty because pending MEANS unplaced, not because
some rule looked at which position was being drawn. An empty bucket then hides
itself, on both surfaces, by the rule that already existed.

A special case would have been a second answer to a question the general rule
already answers, and the two would eventually disagree.

### It is the default home for new work

Work minted with nowhere to go lands in the backlog. That is what makes pending
a real bucket with a real source rather than a stub kept for symmetry.

Adding into the pending column places the work in the backlog, whichever block
the reader was looking at.

### It does not block

A position finishes when everything placed there is settled or moved on.
Backlog work is placed nowhere, so it holds nothing up.

That is the whole difference between pending and the other two owed buckets.

## The editor is the database

THE WORK EDITOR IS TWO DATABASE BLOCKS, side by side, and nothing else. It is
not a surface of its own.

WHAT THE DATABASE ALREADY CARRIES is everything the editor needs: the row
count, the sort control, the properties control, grouping, filtering and the
cell editor.

A second surface would reinvent each one, and the two would eventually
disagree about the same rows.

SO THE BLOCK BUILDER IS EXPORTED and the editor calls it twice. `basesBlock`
is the one builder. The card names two views of one base file, `work.base#left`
and `work.base#right`.

THE CLIENT IS SMALL FOR THE SAME REASON. Sorting, grouping, filtering and the
counts belong to the database's own client.

What is genuinely the editor's own is short: the drag, the bucket controls, the
selection and the seam.

THE GROUPING IS THE BUCKET. A view groups by `if(bucket, bucket, place)`.

A token carrying a bucket groups under that bucket. One carrying none groups
under the position it stands at. Nothing models the grouping twice.

## It never moves the machine

THE EDITOR OPENS TO THE LEFT OF THE DRAWING, and the drawing keeps its place.
Opening it, closing it or resizing it moves nothing on the machine.

THE PAGE LAYS OUT AS A ROW: editor, seam, machine. The seam is upright, and the
reader drags it left and right to set the editor's width.

THE MACHINE PAGE CARRIES THE DATABASE'S OWN STYLESHEET AND SCRIPT. That follows
from the section above: the editor IS two database cards, so the page hosting it
owes their assets.

Without them the rows draw at the wrong height, and the sort and properties
controls open nothing.

ONE PAGE SERVES BOTH SURFACES. A page that drew the buckets while holding no
editor left every bucket press looking up an element that was not there.

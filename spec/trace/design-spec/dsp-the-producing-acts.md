---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: dsp-the-producing-acts
type: "[[design-spec]]"
statement: Making a vehicle and making a driven project are one mechanism seen twice — a bounded write into a tree that did not exist, ending in a file that says what the tree is.
realizes:
  - el-vehicle-producer
  - el-project-producer
  - if-project-producer-to-resolution-seam
  - el-mirror
files:
  - deliverable/engine/actbound.ts
  - deliverable/engine/produce.ts
  - deliverable/engine/paths.ts
  - deliverable/engine/tools.ts
  - deliverable/vscode/src/extension.ts
---

## The bound travels with the act

`actbound.ts` holds it, and it was named by no design spec. The rule is
SE-C-141: every act writes inside one tree and nowhere else, refused at a
single resolver, with WHICH tree asked rather than assumed.

IT IS ITS OWN MODULE TO KEEP THE IMPORTS ACYCLIC, which is why it is easy to
miss: nothing above it names it and `paths.ts` asks it a question.

## Responsibility

TWO ACTS THAT SHARE EVERYTHING EXCEPT WHAT THEY WRITE AT THE END.

Both take a destination somebody named, refuse if it is occupied, write a whole
tree into it, write one small file saying what the tree is, and make one commit.
The difference is the last file and nothing else.

- A VEHICLE gets an upstream file naming the engine it came from.
- A DRIVEN PROJECT gets a record naming which vehicle drives it.

WHAT THIS DESIGN DELIBERATELY DOES NOT DO. It does not decide where a vehicle's
own overlay content lives — raid-risk-the-overlay-location-is-unchosen is open
and this spec must not close it by accident. It does not take updates; that is
[[dsp-the-update-channel]].

## Interface

ONE ENTRY POINT PER ACT, both lane verbs, both taking a destination and a name.

- IN: the engine's own tree, and the caller's intent — where, and under what
  name.
- OUT: a tree at the named place, and a refusal otherwise. Nothing is returned
  that could be used to find the tree again; the caller already knows where they
  put it.

THE PRODUCING ACT WRITES OUTSIDE THE ENGINE'S ROOT, which is the whole reason
this design needs the resolver change. It is bounded to the tree it is producing
for the duration of the act, and that bound is checked at the one seam every
verb goes through rather than by a check written here.

## Behavior and constraints

REFUSE BEFORE WRITING ANYTHING. A destination that is not empty, or a missing
name, stops the act before the first byte. A half-made tree that looks finished
is the shared failure mode of this whole cluster, and it is why
[[cluster-the-bootstrap]] is grouped the way it is.

COPY, NEVER CLONE. [[raid-dec-a-vehicle-is-a-copy-with-a-one-way-upstream-link]]
rules it: the tree is copied, the engine's own expedition and iteration folders
are removed, and a fresh repository is initialised with one commit. No history
of the engine's comes along and no remote is set.

THE FILE THAT NAMES THE TREE CARRIES AN IDENTITY, NEVER A PATH. That is what
makes both files survive a move, a copy or a rename of either tree, and it is the
same rule [[raid-dec-a-driven-tree-names-which-copy-drives-it]] states for the
driven side.

WHERE THE TWO FILES SIT, settled while building the write target because the
source guard has to read them both.

- A TREE'S OWN IDENTITY is `deliverable/brand/brand.json`, key `id`.
  Nothing was invented: that file already exists and already carries one.
- WHAT A VEHICLE CAME FROM is
  `deliverable/vendor/upstream/upstream.json`, key `id`. It follows the
  vendor folder's own convention of one folder per vendored thing, which is
  where the owner put it: "we are vended from something, so put a small file in
  there that tells you where you're from."

THE ENGINE ITSELF HAS NO UPSTREAM FILE and never gets one. It was produced from
nothing, so a guard reading it finds nothing and has nothing to say. Only a
produced tree carries the fact, which is the same asymmetry that makes the link
one-way.

THE THREE ANSWERS A DRIVEN TREE'S RECORD MUST SUPPORT, unchanged from
[[if-project-producer-to-resolution-seam]]: it resolves, it names a vehicle this
machine has never seen, or it is absent and this is not a driven project. A
malformed record is a fourth case and refuses loudly rather than falling through
to the third.

## Rationale

ONE MECHANISM RATHER THAN TWO because the acts differ in one file. Writing them
apart would duplicate the refuse-before-writing rule, and that rule is the one
this cluster exists to solve once.

THE COPY IS THE OWNER'S RULING and it made the design smaller. A clone had to be
filtered — history came along, a remote had to be considered. A copy starts empty
and nothing has to be stripped.

AND THE UPSTREAM FILE FOLLOWS A SHAPE THE PRODUCT ALREADY USES.
`deliverable/vendor/` records every vendored thing with its source, its version
and when it was pulled. This is that record with the direction reversed.

## The surface — two buttons, and the act is reached no other way

[[sty-press-create-vehicle-and-land-in-it]] SPECIFIES THIS SEVEN SLIDES DEEP, and
the owner restated it on 2026-08-18: "I want buttons for those in VS Code. One
button to create a vehicle, one button to create a new project. These buttons
need to ask for whatever they need, and they need to open whatever they created
in a new window."

TWO COMMANDS IN THE EXTENSION, one per producing act.

- EACH ASKS FOR WHAT IT NEEDS and nothing more. The vehicle button asks the
  three things the shipped export asks: where to put it, what to call it, and the
  short name.
- EACH OPENS A NEW WINDOW on what it produced, and leaves the window it was
  launched from exactly as it was.
- NEITHER TAKES A PATH FROM A SETTINGS FILE. The person names the place at the
  moment they press it, which is what makes the act theirs rather than the
  configuration's.

THE FIFTH SLIDE IS THE ONE THIS DESIGN MUST NOT BREAK. Nothing outside the
produced tree changed, and the window the person was in is exactly as they left
it. An act that writes a whole folder from a button has removed every accidental
barrier in front of it, and that slide is what stands in their place.

AND THE SIXTH SLIDE IS A FREE TEST OF THE NAME. The desk in the new window
greets under the vehicle's own name rather than the engine's, which is
[[req-the-product-name-is-one-fact]] observed rather than asserted.

## What this supersedes in the entry document

RUNME.md's EXPORT SECTION GOES, on the owner's ruling of 2026-08-18: "this will
supersede some of the stuff in RUNME.md, so you can delete it from there. RUNME
then doesn't need export anymore."

WHY THE DELETION IS PART OF THIS DESIGN rather than tidying afterwards. The story
opens on somebody who cannot find the export and does not know it exists. Leaving
a second way to do it in the front-door document keeps the problem the story
describes, in the exact place a newcomer reads first.

THE SHIPPED SCRIPT'S TWO HARD-WON GUARDS ARE NOT LOST WITH IT. Refusing unless
every argument is given, and excluding the repository marker as a FILE as well as
a directory, both move into the act. They are recorded on
[[el-vehicle-producer]] so the deletion cannot take them.

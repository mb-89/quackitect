---
minted_in: i9
id: fn-run-a-governed-walk.bring-the-product-up
type: "[[function]]"
cluster: the-bootstrap
statement: bring an installed product up to a lane that answers, each time somebody opens its folder, and only where that folder already carries machine state
satisfies:
  - req-the-editor-is-the-only-entry-point
  - req-a-folder-is-driven-only-with-consent
  - req-the-desk-is-usable-soon-after-the-folder-opens
inputs:
  - flow-scaffolded-product
  - flow-toolchain
outputs:
  - flow-live-lane
controls:
  - whether the folder is a project of this system at all
  - what a running window cannot pick up, which is announced rather than forced
source_refs:
  - uc-install-quackitect
  - raid-iss-the-consent-line-reads-a-clone-as-though-the-opener-had-consented
---

## Rationale

INSTALLING HAPPENS ONCE AND THIS HAPPENS EVERY TIME. That is the whole reason
it is a function of its own rather than a tail of standing a product up.

STANDING A PRODUCT UP STARTS AT A BARE COMPUTER and ends with something that
runs. It consumes a bare computer and produces a toolchain. This function
consumes what that produced and runs on every open afterwards, for the rest of
the product's life.

FOLDING THEM WOULD HIDE THE ONE CLAIM THIS ITERATION IS ABOUT. If the same
function covered both, "the launcher runs once" and "opening the folder is
enough" would be two readings of one node, and the entry document has been
carrying the wrong reading since i1.

## Why consent sits here rather than in a function of its own

THE DECISION AND THE ACT SHARE A MOMENT AND A FAILURE. Whether this folder may
be driven is answered at the instant it is opened, and answering "no" is not a
different piece of work — it is this function producing nothing.

SO IT IS A CONTROL, NOT A CHILD. A control is what decides whether and how the
function runs, which is exactly what consent does here.

THE TWO OUTCOMES ARE ONE FUNCTION'S RANGE. Not a project at all, and it says
so. A project, and it comes up. The folder decides which, and nothing else is
consulted.

## Solution-neutral, checked

COULD TWO HONESTLY DIFFERENT DESIGNS BOTH DO THIS? Yes, and the prior-art
comparison at the M2 gate found more than two in live products.

- The editor activates on something it finds in the folder and starts the
  lane itself.
- A resident service notices the folder being opened and starts one for it.
- The lane is always running and binds to whichever folder is in front of it.

Each satisfies both rows. None is named here, and choosing between them is the
design milestone's work.

THERE IS NO CONSENT RECORD TO PLACE. The row demands none, on the owner's
ruling of 2026-08-19, so no design here has to find a home for one. The folder
answers for itself on every open.

## What this function must never do

IT NEVER SEEDS. A folder that is not a project stays not a project. Seeding is
a deliberate act belonging to standing a product up, and doing it here would
turn every folder somebody opens into a project they did not ask for.

## Behaviour

    installed  -> open:       somebody opens the folder
    open       -> refused:    it carries no machine state, and is told so
    open       -> answering:  it carries machine state
    answering  -> open:       the window closes and is opened again

THE MODEL IS HERE FOR THE TRANSITION THAT WRITES NOTHING. A refusal leaves the
folder exactly as it was, which reads as an ordinary sentence and is the whole
property the consent row holds.

IT HAD SEVEN TRANSITIONS FOR A FEW HOURS ON 2026-08-19 and now has four. Three
of them served a prompt the owner struck the same day.

THE PARTICIPANT TEST PASSES. `installed` is produced by
[[fn-run-a-governed-walk.stand-up-a-product]], and nothing else in the model
appears without a transition that makes it.

## The M3 gate added a clock to this function

`req-the-desk-is-usable-soon-after-the-folder-opens` arrived when the quality
sweep was adjudicated, and it changes what this function has to be rather than
adding a separate concern.

BRINGING A PRODUCT UP WITH NO BOUND IS SATISFIABLE BY COMING UP EVENTUALLY. The
entry-point row says everything appears with no command from the person, and
says nothing about when. A product that took four minutes would satisfy it.

SO THE BOUND BELONGS ON THIS FUNCTION rather than beside it. It is the same
condition and the same response, measured.

AND THE PROBE MADE IT URGENT rather than tidy. Today's activation event is the
editor's own after-everything-else event, chosen when no bound existed to
choose against.

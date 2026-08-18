---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: opt-a-mirror-beside-an-overlay
type: "[[option]]"
statement: what came from upstream lives in a mirror nobody hand-edits, the copy's own work lives in a sibling folder, and an update replaces the first and never touches the second
cluster: the-bootstrap
question: how a copy's own changes are represented
found_by: prior-art
source: "v1's module import planner, product/engine-go/module.go at ref main — the go-module-import-plan design"
---

## Mechanism

TWO FOLDERS, AND ONE RULE ABOUT EACH. The mirror holds upstream's files
exactly as they arrived and is never edited by hand. The overlay beside it
holds everything the copy wrote for itself. An update rewrites the mirror
wholesale and is forbidden to touch the overlay.

v1's PLANNER DOES PRECISELY THIS. Its design note says it mirrors a source
tree into an import folder, records provenance in a manifest, reports deletes
for files no longer present upstream, and "never touches" the overlay
alongside.

WHAT IT BUYS, AND IT IS THE WHOLE REASON THIS OPTION MATTERS HERE. The copy's
own changes are not computed, detected or diffed — they ARE the contents of
the overlay folder. Asking what a copy changed is asking for a directory
listing.

SO DIVERGENCE NEVER ARISES. A mechanism that reports drift is answering "how
far has this wandered from a snapshot", which reads as damage. This answers
"what did you make your own", which reads as an inventory. The second is what
the copy's owner actually wants, and this mechanism produces it for free
rather than approximating it.

WHAT IT COSTS. A person editing a mirrored file directly gets no warning from
the layout itself, and the next update silently discards the edit. The
discipline is a convention, and a convention with no enforcement is where the
mechanism fails.

A SECOND COST, PAID EVERY TIME. Overriding one line of one artifact means
carrying a whole file in the overlay. When upstream later changes an
untouched part of that file, the copy does not receive it and nothing says so.
That is the price of replacement over merge, and it is real.

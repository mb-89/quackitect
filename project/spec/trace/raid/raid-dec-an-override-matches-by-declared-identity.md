---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-dec-an-override-matches-by-declared-identity
type: "[[raid]]"
kind: decision
statement: An override names the artifact it replaces by that artifact's own stable identity, never by where either file sits.
owner: the driving agent
status: decided
breaks_how_badly: crippling
how_likely: plausible
impact: "Resolution is the chain the whole overlay rests on. Keyed by path, a file that moves upstream silently stops being overridden and nothing can report it; keyed by identity, the same event is a match failure the machine can name."
source_refs:
  - req-overlay-resolution
  - req-overlay-drift-reported
  - opt-override-by-declared-identity
  - uc-vendor-and-overlay
  - cand-the-program-route
---

## The choice

THE SELECTOR IS THE TARGET'S OWN ID. The corpus already gives every artifact a
stable id and already resolves references by it, so the namespace this needs is
not new work.

## Why, and the use case settles it rather than taste

STEP 8 OF uc-vendor-and-overlay ASKS THE COPY TO REPORT EVERY IDENTITY ITS
CONTENT CLAIMS THAT THE UPDATE MOVED. A path-keyed override cannot perform that
step at all, because it never knew an identity to report.

AND EXTENSION 8a IS SHARPER STILL: an identity the copy's content claims no
longer exists upstream, reported and never silently defaulted to the source's
own card. Under a path search that failure is not merely unreported. It is
SILENT, which is the exact shape [[req-a-wrong-act-never-passes-silently]] is
about.

PRIOR ART DOES THIS AND IT WAS CHECKED AT SOURCE. Nixpkgs overlays name a target
by attribute rather than by file path. Kustomize selects by group, version,
kind, name and namespace. Neither is novel and neither is ours.

## Rejected options

LAYERED PATH SEARCH, first hit wins. REJECTED, and it is what the predecessor
does and what two of the four candidates kept. It is simpler, it is proven, and
it fails step 8 by construction. Linux OverlayFS states the same rule for the
same reason and has the same blindness.

AND IT IS REJECTED WITH ONE HONEST LOSS RECORDED. Driving a foreign product
whose own tree carries something that LOOKS like method is a collision for
identity matching and a non-event for a path search, which never looks in that
tree at all. The reading calls that the sharpest argument against the route
chosen here, and no criterion asks about it, so the arithmetic never saw it.

## Consequences

AN UPSTREAM RENAME BECOMES A SILENT BREAK UNLESS SOMETHING REPORTS IT. The
selector duplicates the target's identity, so a rename turns the override into a
no-op that still looks correct. The option node names the counter-example worth
copying: an override matching nothing, or two matching one target at equal
precedence, must be an ERROR rather than a shrug.

THAT REPORT IS NOW OWED BY THE BUILD, not optional. It is what buys step 8 and
it is the only thing standing between this decision and the silence it was
chosen to prevent.

AND A DRIVEN PRODUCT'S OWN CONTENT NEEDS A BOUNDARY. A file in the driven tree
claiming a method identity must be treated as that product's WORK. The rule is
about provenance rather than shape, and nothing in this decision supplies it.

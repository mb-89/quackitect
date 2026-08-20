---
minted_in: i16-the-vehicle-overlay-a-vehicle-vendors-th
id: raid-risk-the-overlay-location-is-unchosen
type: "[[raid]]"
kind: risk
statement: Where a host's overlay layer lives is unchosen, and the three candidates differ in what the seal means and in what an engine update replaces.
owner: the driving agent
trigger: decompose-structure, or the first build chunk that writes a resolution layer
status: open
breaks_how_badly: crippling
how_likely: expected
impact: "The whole iteration rests on one chain, and the chain's most-specific layer has no agreed home. Choosing wrong is not a rename: the seal is defined by which side of the boundary the layer sits on, so a wrong choice makes the engine writable by the host or the host's cards invisible to an update. Found only because the owner challenged the change size."
source_refs:
  - req-overlay-resolution
  - req-nothing-a-copy-does-reaches-its-source
  - product/engine-go/resolver.go at ref main — overlayLayers, read 2026-08-18
---

## Why this is a risk rather than a decision

IT LOOKED SETTLED AND IT IS NOT. The kickoff first proposed a minor column on
the argument that v1 already built this chain, so there was one design and
nothing to choose between. Reading v1's resolver at ref main is what made the
gap visible: its most-specific layer is `dataDirFor("overlay")`, a per-workspace
DATA HOME, and this product has no data home at all.

So the chain ports and its top layer does not.

## The three candidates, and what each changes

- THE HOST'S OWN PRODUCT FOLDER, beside what the host builds. Simple, and it
  puts the overlay inside the tree an update never touches.
- A FOLDER NAMED BY A KEY IN THE ENGINE'S COMMITTED CONFIG, which is v1's real
  second layer. It lets a vehicle's method extensions travel in its own
  repository and merge over the vendored layer for every stub it drives.
- A DATA HOME, which this product would have to invent. It is v1's most-specific
  layer and the only one with no equivalent here.

WHAT SEPARATES THEM IS NOT TASTE. Each answers differently what an engine
update replaces and where the seal's boundary runs, and req-engine-folder-is-sealed
is graded crippling.

## What would settle it

THE M4 AND M5 LANES THE MAJOR COLUMN GRANTS, which is why the column moved.
enumerate-space and derive-criteria produce the candidates and the criteria;
converge-pugh and declare-winner choose; record-adrs writes the decision down.

UNTIL THEN NOTHING BELOW SHOULD ASSUME A LOCATION. A requirement or a test
written against one of the three would have to be rewritten if another wins.

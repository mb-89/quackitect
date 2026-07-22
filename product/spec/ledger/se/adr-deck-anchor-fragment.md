---
id: se.adr-deck-anchor-fragment
kind: decision
statement: The deck deep-link mechanism is URL-fragment reflection riding the existing hash rail. Opening a deck writes #deck-<slug> via history.replaceState. Loading with the fragment opens the deck. Per-slide depth reuses the existing slide ids. A router-owned deck route is rejected, since two owners of location.hash would contend, and the fragment mechanism reaches the same depth with a handful of lines.
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_kind: architecture
v1_decided_in: i0019_strangers_book
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
---

## Rationale (not load-bearing)
Pugh winner over the router candidate (M3 fork A); precedented by reveal.js fragment anchors and Quarto hash slugs; rides the rail the M2 probe found already keeping view state in the hash.

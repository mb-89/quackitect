---
id: adr-deck-anchor-fragment
type: adr
kind: architecture
decided_in: i0019_strangers_book
adjudicated_by: user
statement: The deck deep-link mechanism is URL-fragment reflection riding the existing hash rail - opening a deck writes #deck-<slug> via history.replaceState, loading with the fragment opens the deck, per-slide depth reuses the existing slide ids. A router-owned deck route is rejected: two owners of location.hash contend, and the fragment mechanism reaches the same depth with a handful of lines.
class: review
killer: false
---
## Rationale (not load-bearing)
Pugh winner over the router candidate (M3 fork A); precedented by reveal.js fragment anchors and Quarto hash slugs; rides the rail the M2 probe found already keeping view state in the hash.

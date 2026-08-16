---
minted_in: i15-the-database-our-own-reader-over-obsidia
id: opt-precompiled-fast-path-explicit-slow-path-extension
type: "[[option]]"
statement: keep the pinned-subset query shape cheap and precompiled, and make any shape beyond it a deliberate, slower, explicitly-reopened path rather than a seamless fallback
cluster: cluster-the-query
question: how does answer-a-structured-query evaluate a query against the corpus
found_by: heuristic
source: "meth-heuristics-catalog: \"Make the common case cheap; make the rare case possible.\" — generalises the shape adr-query-in-engine already commits to"
---

## Mechanism

The common case is a query inside the 25-file pinned subset — this stays
cheap by construction, whatever internal option wins. The rare case is a
query shape the subset does not cover, which adr-query-in-engine already
requires to re-open the decision rather than silently extend.

Naming this as its own option makes the heuristic's bite explicit: whichever
mechanism cluster-the-query settles on should keep that asymmetry rather
than optimising the rare path at the common path's expense, or vice versa.

---
id: se.q-p3delta-onion-extend
kind: question
statement: "P3 verdict needed for v1 adr-onion-extend: landed in v1 after the P3 cut (i25+ tail)"
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: owner
v1_statement: The onion render extends the existing bus-bar machinery in place. Chosen over a fresh renderer, which scored lower on cost and the one-renderer axis; the M5 spike is the kill-criterion.
status: resolved
verdict: drop — v1 renderer internals (bus-bar machinery); nothing to bind in v2 (owner, 2026-07-23)
---

## Why this is open

landed in v1 after the P3 cut (i25+ tail). Never silently imported — fill proposes, the owner adjudicates.

## v1 statement

The onion render extends the existing bus-bar machinery in place. Chosen over a fresh renderer, which scored lower on cost and the one-renderer axis; the M5 spike is the kill-criterion.

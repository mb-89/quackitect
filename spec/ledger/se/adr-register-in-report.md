---
id: se.adr-register-in-report
kind: decision
statement: "The register renders as a tab of the LIVE REPORT, not a standalone page and not a book chapter. Datum: the standalone page (A2). It loses on one-system unification: the report already owns the shell, filters, live recompute, and the check detail pane, and a second page duplicates all four, realizing raid-register-scope-creep. The book (A3) is the document lane and never a work surface (adr-book-two-stage). Reverse-sensitivity: standalone wins only if register sessions need a layout the report shell cannot host. Watch the M5 spike; if the row-plus-questionnaire cannot live in the report DOM, revisit."
provenance:
  migrated_by: se.set.migrate v1-import
  iteration: bootstrap-b3
  ai_involvement: engine-migrated
  adjudicated_by: user
v1_type: adr
v1_decided_in: i0021_field_ux
v1_adjudicated_by: user
v1_class: review
v1_killer: "false"
v2_amendment: register re-homed in the projection-era report
---

## Rationale (not load-bearing)
Not applicable - the decision body above carries the options and the reasoning; this slot adds nothing.

## v2 amendment (applied at mint)

register re-homed in the projection-era report

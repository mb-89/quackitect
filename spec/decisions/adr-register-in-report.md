---
id: adr-register-in-report
type: adr
decided_in: i0021_field_ux
adjudicated_by: user
statement: The register renders as a tab of the LIVE REPORT, not a standalone page and not a book chapter. Datum: the standalone page (A2). It loses on one-system unification: the report already owns the shell, filters, live recompute, and the check detail pane, and a second page duplicates all four, realizing raid-register-scope-creep. The book (A3) is the document lane and never a work surface (adr-book-two-stage). Reverse-sensitivity: standalone wins only if register sessions need a layout the report shell cannot host. Watch the M5 spike; if the row-plus-questionnaire cannot live in the report DOM, revisit.
class: review
killer: false
---
## Rationale (not load-bearing)
TODO

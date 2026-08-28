---
id: wt-a-prefill-register-names-three-fields-that-no-longer-exist
type: "[[work-token]]"
statement: |-
  A prefill register names three fields that no longer exist

  `spec/evidence-typing-prefill.md` lines 71 to 76 register six prefills touching
  the M5 rows. Three name fields that are gone: `sensitivity_ruled`,
  `evaluation_recorded` and `adrs_traced`, all listed against
  `gate-architecture`, whose evidence list is now empty. Two more rows appear
  under old names.

  THAT DOCUMENT NEEDS A PASS AGAINST THE CURRENT ROWS before anybody uses it as
  a work list.

  HOW THIS WAS FOUND. Four hands read every rigor-matrix row in full on
  2026-08-28 to rate its complexity. Reading a row properly turns up things that
  reading it casually does not, and this is one of them.

  IT IS A DEFECT IN THE ROW, NOT A RATING. A rating says how hard a step is.
  This says the row contradicts itself: a demand with nowhere to record its
  answer, a headline the row's own guidance denies, a promise nothing keeps.

  IT NAMES ITS FILE AND LINE, so a reader checks rather than trusts.

  ONE THING WAS CHECKED AND IS NOT A DEFECT. M7_50_verification's legal_tools is
  a bare comma-separated scalar where every other row uses a YAML block list.
  asList in deliverable/engine/machines/compile.ts line 454 documents and handles
  exactly that form, so it parses correctly. Recorded because it looks wrong and
  is not, so the next reader does not spend the same time.
place: backlog
ready_when: ready when a building milestone pulls hygiene work
---

## Why it stands

A prefill register names three fields that no longer exist

`spec/evidence-typing-prefill.md` lines 71 to 76 register six prefills touching
the M5 rows. Three name fields that are gone: `sensitivity_ruled`,
`evaluation_recorded` and `adrs_traced`, all listed against
`gate-architecture`, whose evidence list is now empty. Two more rows appear
under old names.

THAT DOCUMENT NEEDS A PASS AGAINST THE CURRENT ROWS before anybody uses it as
a work list.

HOW THIS WAS FOUND. Four hands read every rigor-matrix row in full on
2026-08-28 to rate its complexity. Reading a row properly turns up things that
reading it casually does not, and this is one of them.

IT IS A DEFECT IN THE ROW, NOT A RATING. A rating says how hard a step is.
This says the row contradicts itself: a demand with nowhere to record its
answer, a headline the row's own guidance denies, a promise nothing keeps.

IT NAMES ITS FILE AND LINE, so a reader checks rather than trusts.

ONE THING WAS CHECKED AND IS NOT A DEFECT. M7_50_verification's legal_tools is
a bare comma-separated scalar where every other row uses a YAML block list.
asList in deliverable/engine/machines/compile.ts line 454 documents and handles
exactly that form, so it parses correctly. Recorded because it looks wrong and
is not, so the next reader does not spend the same time.

## When it comes back

ready when a building milestone pulls hygiene work

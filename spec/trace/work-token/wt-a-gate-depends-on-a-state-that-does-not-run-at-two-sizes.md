---
id: wt-a-gate-depends-on-a-state-that-does-not-run-at-two-sizes
type: "[[work-token]]"
statement: |-
  A gate depends on a state that does not run at two sizes

  `M8_90_gate-validation` declares `depends_on: run-demos`. `run-demos` is `none`
  at minor and `none` at patch. Its `musts_demonstrated` field cites reports from
  a state that does not run at those sizes.

  THE MINOR NOTE PATCHES IT — resident reports cited as they stand — so this is
  a wrinkle rather than a contradiction. It is here because the dependency and
  the note say different things and only one of them is read mechanically.

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

A gate depends on a state that does not run at two sizes

`M8_90_gate-validation` declares `depends_on: run-demos`. `run-demos` is `none`
at minor and `none` at patch. Its `musts_demonstrated` field cites reports from
a state that does not run at those sizes.

THE MINOR NOTE PATCHES IT — resident reports cited as they stand — so this is
a wrinkle rather than a contradiction. It is here because the dependency and
the note say different things and only one of them is read mechanically.

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

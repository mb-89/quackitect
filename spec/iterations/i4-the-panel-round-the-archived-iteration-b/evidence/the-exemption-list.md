---
form: the-exemption-list
by: agent
signed_off: 2026-08-23T19:11:03.802Z
authors: agent
files: null
---

# Evidence form / the-exemption-list

## current_situation

THE GUARD HAD NO HATCH, and a rule with no declared exception gets one added in code the first time somebody needs it.

THE DESIGN NAMED THREE CASES that emit markup and are not a second surface: a test fixture, a diagnostic page and a vendored component.

## built

`deliverable/machines/widget-exemptions.md` IS THE LIST. It sits with `scale.md` and `stopat.md`, which are the other rules a person edits and the engine reads.

ONE BULLET PER FILE: the root-relative path, an em dash, then the reason.

A BULLET WITH NO REASON IS IGNORED, and the reader enforces that. The reason is what a reviewer reads to decide whether the exemption still holds, so a bare path buys nothing.

`exempted()` IN `deliverable/engine/widgets.ts` READS IT. A missing file means no exemptions rather than a crash, because the guard has to answer even where nobody has written the list yet.

`strays()` NOW SUBTRACTS BOTH LISTS: what the registry names, and what the file declares.

THE LIST IS EMPTY TODAY, and that is the honest state rather than an oversight. The predicate walks `deliverable/engine/` only, so a fixture under `deliverable/tests/` never needed an entry. Of the 38 flagged sources, twenty are registered editors and eighteen are the surface's own parts — which are the collapse's work rather than exceptions to it.

## follow_up

THE GUARD AT THE WRITE IS NEXT, and it was waiting on this. A guard that refuses before the hatch exists refuses on its own first run.

THE FIRST REAL ENTRY WILL TEST THE READER. Nothing has exercised the bullet parser against a real exemption yet, because there is nothing to exempt. The first one added should be checked by eye as well as by the check.

## anything_else


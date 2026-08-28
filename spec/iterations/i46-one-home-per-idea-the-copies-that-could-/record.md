---
id: i46-one-home-per-idea-the-copies-that-could-
status: seeded
opened: 2026-08-20T16:50:15.201Z
goal: "One home per idea: the copies that could diverge merge — qualified ids, served strings, list coercion, regex escape, table cells, wiki refs, the call log's door, bin helpers — and the dead-export check arms in preflight."
vision: |-
  OWNER PRINCIPLE 2026-08-20: copies that diverge are the defect, size is not — single point of truth so the code cannot contradict itself. Item list in spec/overhauls/2026-08-20/plan.md, seed 8a, plus the pattern-checklist run's two additions: the call-log door (se-hook-websearch hand-writes records, se-hook-stop and record-inspect hand-read; export the path and append/tail helpers from calllog.ts) and one settings-shape home for the two bins and session. Also expmachine's internal repeats and the git() copy shared by iterations.ts and records.ts.

  DONE LOOKS LIKE: each named helper has exactly one home and the divergent copies' behaviors are reconciled deliberately — the escaper gains its dollar, the list coercer's comma question is settled in writing; knip or ts-prune runs in preflight with an allowlist for deliberate seams; the duplicate-literal lint holds served strings to one home. The frontmatter-parser unification belongs to i29 and is only prepared here.
inputs:
  - spec/overhauls/2026-08-20/plan.md
  - spec/overhauls/2026-08-20/findings.md
depends_on:
  - i41-green-is-computed-once-and-right-the-dia
---

# i46-one-home-per-idea-the-copies-that-could-

## Goal

One home per idea: the copies that could diverge merge — qualified ids, served strings, list coercion, regex escape, table cells, wiki refs, the call log's door, bin helpers — and the dead-export check arms in preflight.

## Rough vision

OWNER PRINCIPLE 2026-08-20: copies that diverge are the defect, size is not — single point of truth so the code cannot contradict itself. Item list in spec/overhauls/2026-08-20/plan.md, seed 8a, plus the pattern-checklist run's two additions: the call-log door (se-hook-websearch hand-writes records, se-hook-stop and record-inspect hand-read; export the path and append/tail helpers from calllog.ts) and one settings-shape home for the two bins and session. Also expmachine's internal repeats and the git() copy shared by iterations.ts and records.ts.

DONE LOOKS LIKE: each named helper has exactly one home and the divergent copies' behaviors are reconciled deliberately — the escaper gains its dollar, the list coercer's comma question is settled in writing; knip or ts-prune runs in preflight with an allowlist for deliberate seams; the duplicate-literal lint holds served strings to one home. The frontmatter-parser unification belongs to i29 and is only prepared here.

## Inputs

- spec/overhauls/2026-08-20/plan.md
- spec/overhauls/2026-08-20/findings.md

## Carried work tokens

These stood in the options pool referenced by no iteration at all. Assigned
here in a pass over the pool.

- wt-a-step-asking-for-new-ideas-tells-its-author-to-write-one-en

## Carried in by the retro of 2026-08-24

TWO COPIES OF ONE NUMBER, AND A REQUIREMENT THAT WOULD FORBID THEM.

THE NUMBER. How many walkers a record runs with by default is written in two
places, and on 2026-08-24 they disagreed. The retro corrected the wrong one,
which leaves the SHAPE untouched: two homes for one value.

WHAT THE OWNER ASKED FOR, in their own words: a config value holds the number,
and the prose says it in words while pointing at that value.

WHAT DOES NOT EXIST YET. The guard this project owns covers configuration
PATHS, in `deliverable/tests/one-config-path.test.ts`. Nothing covers
configuration VALUES, so there is no home to point at.

THE REQUIREMENT ROW THAT IS OWED. Every fact the system holds shall live in
exactly one place, and every reader of that fact shall resolve to it.

WHY IT IS NOT MERELY TIDINESS. It was broken three separate times in one
session, and a person looking at a screen caught every one. No check this
project owns caught any of them.

## Struck the same day it was written, 2026-08-24

THIS SECTION CLAIMED THE ENGINE HAS TWO CORPUS READERS. It does not, and the
claim was made from a file listing rather than from the code.

WHAT THE CHECK ACTUALLY SHOWED. The reader is defined once, in `notes.ts`, and
twelve modules reach the corpus through it. One of those twelve is `trace.ts`,
which the struck claim had named as the second reader. It imports the door.

AND THE OTHER NAMED FILE IS NOT A CORPUS READER EITHER. `vault.ts` is the warm
index, and its own opening lines say so.

WHAT THE EVIDENCE HAD BEEN. That both files called the filesystem directly. That
is true and it proves nothing, because a module may read a canvas or a JSON file
without reading the corpus.

THE DIRECT READS ARE ALREADY RULED ON. 173 of them stand across 71 files, and
the craft guidance says plainly that banning them would be a lie because most
are legitimate. What is forbidden is the number rising unnoticed, and a ratchet
test holds that line.

NOTHING IS CARRIED HERE. The section is kept rather than deleted so the next
reader sees the correction rather than repeating the check.

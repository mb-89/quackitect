---
unreachable_citations:
  - scratchpad/probe-fold-at-real-size.mjs
  - scratchpad/probe-many-files.mjs
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-asm-the-folds-measured-benefit-arrives-at-a-scale-this-repository-has-not-reached
type: "[[raid]]"
kind: assumption
statement: The fold is justified by figures measured at 20,000 files, and this repository holds 1,312.
owner: the driving agent
trigger: at the build step that writes the fold, and again at any point where the archive is measured
status: closed
impact: If the scale never arrives, the fold is a format nobody needed. The archive half of the decision would still stand on its own, so what is at stake is the fold rather than the choice.
breaks_how_badly: corrosive
how_likely: possible
source_refs:
  - gate-architecture round_2_red_team, 2026-08-26
  - scratchpad/probe-many-files.mjs — git add 26,073 ms at 20,000 files against 97 ms folded
  - scratchpad/measure-archive-cost.mjs — 68 folders, 1,312 files, 9.7 MB of content
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

## CLOSED BY MEASUREMENT, 2026-08-26 — the assumption was wrong

THE PROBE RAN AT THE REAL SIZE AND THE FOLD PAYS TODAY. 68 folders, 19 items
each, 1,292 files, 3.55 MB of varied prose — the shape of the archive as it
actually stands.

| operation | unfolded | folded | saved |
| --- | --- | --- | --- |
| git add | 1,535 ms | 129 ms | 1,406 ms |
| git commit | 151 ms | 46 ms | 105 ms |
| git status | 30 ms | 25 ms | 5 ms |
| git grep | 112 ms | 32 ms | 80 ms |
| .git on disc | 0.91 MB | 0.38 MB | 2.41x |

THE PASS LINE WAS ONE SECOND and the unfolded side crosses it. `git add` at
1,535 ms is a wait a person feels, at the size this repository already is.

SO THE ANSWER IS NOT "WAIT FOR SCALE". The scale is here. The benefit was
understated by arguing it from a 20,000-file probe, because that made it look
like a future problem.

WHAT SURVIVES OF THE CONCERN. Only the bundling: where the archive lives and
what shape it takes there are still two decisions carried as one. They no longer
disagree, because both now have their own measurement.

SCRIPT: `scratchpad/probe-fold-at-real-size.mjs`. Every item carries varied
prose, because identical bodies deduplicate in git and that is what produced a
wrong figure once already.

## What is being assumed

THAT THE TREE GROWS INTO THE MEASUREMENT. Every figure arguing for the fold was
taken on a throwaway repository built at 20,000 files. The real one holds 1,312
across 68 folders.

## The arithmetic nobody has done

SIXTY-EIGHT ITERATIONS HAVE PRODUCED 1,312 FILES, which is roughly nineteen per
iteration. Reaching 20,000 needs about a thousand more.

WHETHER THAT IS FAR OFF DEPENDS ON A RATE NOBODY HAS MEASURED. It is written
here as arithmetic rather than as a conclusion, because the arithmetic is
checkable and the conclusion is not.

## Why this is an assumption and not a defect

THE ARCHIVE HALF DOES NOT DEPEND ON IT. Deleting a closed record from the
working tree and reading it back at a commit is argued on its own grounds, and a
folder taken off the tree has to be read back AS something.

SO THE FOLD IS THE CHEAP HALF OF A DECISION THAT STANDS WITHOUT IT. That is why
this is filed rather than raised as a blocker.

## Probe

RUN THE EXISTING PROBE AT THE REAL SIZE. `scratchpad/probe-many-files.mjs`
builds a throwaway repository at a file count it is given, and it was run at 400
and at 20,000. Run it at 1,312, which is what the archive holds today.

WHAT IT ANSWERS: how long `git add` and `git commit` take on this repository's
actual archive, folded against unfolded, and how much disc each shape takes.

THE PASS LINE: the fold is justified if it saves a figure a person would
notice. It is not justified if both shapes finish in well under a second, which
is what 1,312 files may well do.

A SECOND RUN ANSWERS THE OTHER HALF. Measure the growth: how many files each of
the last ten iterations added, straight from the history. That turns "roughly a
thousand more iterations" from arithmetic into a date.

WHO RUNS IT: the build step that writes the fold, before it writes it.

## What would settle it

MEASURE THE SAME THING AT THE REAL SIZE. The probe script already exists and
takes a file count as its shape, so pointing it at 1,312 rather than 20,000 is
one run.

DO THAT BEFORE THE BUILD WRITES THE FOLD, not after.

## The bundling, said plainly

TWO DECISIONS ARE CARRIED AS ONE. Where the archive lives, and what shape it
takes there. They were argued together and they can fail apart.

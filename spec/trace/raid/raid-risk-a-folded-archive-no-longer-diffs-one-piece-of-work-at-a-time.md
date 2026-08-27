---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: raid-risk-a-folded-archive-no-longer-diffs-one-piece-of-work-at-a-time
type: "[[raid]]"
kind: risk
breaks_how_badly: corrosive
how_likely: expected
statement: A closed iteration folds to one file, so a diff over it no longer shows which piece of work changed.
grade: fatal
against:
  - req-every-artifact-is-readable-text
source_refs:
  - evaluate-architecture, the ATAM walk
  - raid-dec-work-is-a-file-while-open-and-one-folded-file-once-closed
---

## The hinge

THE FOLD IS THE HINGE. While an iteration is open its work is separate files,
and every ordinary tool shows exactly which one moved. At close the whole
iteration becomes one file.

## What still passes and what does not

THE MEASURE PASSES. The row counts binary files under the product root, and a
folded file is text. Nothing here changes that number.

WHAT THE MEASURE PROTECTS IS WEAKER. The row exists so a tool that knows
nothing about this system can read, search and diff the work. Reading and
searching survive the fold. Diffing does not, at the granularity that matters.

## The tradeoff, named

WHAT IS BOUGHT: a smaller tree and a much faster commit. Measured on a
throwaway repository at 20,000 files, `git add` took 26,073 ms unfolded and
97 ms folded.

WHAT IS PAID: per-item diffability on closed records.

## Why it is a risk and not a defect

A CLOSED RECORD IS NOT EDITED. The diff that matters is the one taken while the
work is live, and the fold happens after that. This is graded fatal because the
requirement is, not because the consequence is.

## The trigger

IT FIRES THE FIRST TIME SOMEBODY NEEDS TO SEE WHAT CHANGED INSIDE A CLOSED
ITERATION. The pre-fold files are still reachable at their commit, so the answer
exists; whether it is reachable in practice is what this entry is watching.

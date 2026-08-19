---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-the-reading-verb-consults-no-exclusion-list-at-all
type: "[[raid]]"
kind: issue
statement: "Three separate lists decide which paths a lane verb may see, two of them disagree with each other, and se_file_read consults none of them."
owner: the maintainer of the machine
trigger: any work that needs a path concealed from more than one verb, which this iteration needs for the benchmarks folder
status: open
impact: "A conditional mask cannot be built over three disagreeing lists. Written once per verb it will disagree with itself the same way, and a concealment that leaks through one verb conceals nothing."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - training-iterations
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## What was measured, 2026-08-19, on this build

- `paths.ts` exports `EXCLUDED_DIRS` holding `.git`, `node_modules`, `.se`,
  `.venv` and `__pycache__`. Only `se_file_list` and `se_file_glob` call it.
- `search.ts` carries its own list of two entries as ripgrep globs, `.se` and
  `node_modules`, and never reads `EXCLUDED_DIRS`.
- `se_file_read` applies no exclusion at all. A lane read of `.se/reading.md`
  returned the file and its content hash.

## Why it is expected rather than plausible

THE STANDING CONDITION IS ALREADY HERE. This iteration needs the benchmarks
folder concealed while a run is bound. There is no single place to say so, so
the condition that produces the damage is present now rather than someday.

## Why it is crippling rather than corrosive

ONE NAMED USE CASE CANNOT COMPLETE. A benchmark run cannot conceal its own
history from the agent walking it, which is the fifth goal of this iteration.

## What it is not

IT IS NOT THE REWIND. The rewind removes the original iteration's answers by
going back in time, and needs no list. This issue is only about the
benchmarks folder, which must be hidden during a run and visible outside one.

---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-the-reading-verb-consults-no-exclusion-list-at-all
type: "[[raid]]"
kind: issue
statement: "Three separate lists decide which paths a lane verb may see, two of them disagree with each other, and se_file_read consults none of them."
owner: the maintainer of the machine
trigger: any work that needs a path concealed from more than one verb, which this iteration needs for the benchmarks folder
status: mitigated
impact: "A conditional mask cannot be built over three disagreeing lists. Written once per verb it will disagree with itself the same way, and a concealment that leaks through one verb conceals nothing."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - training-iterations
  - i37-training-iterations-a-disposable-iterati
weighs_with: none
weighs_against: none
---

## Built anyway, 2026-08-20 — and the block was mine to begin with

THE CONCEALMENT IS BUILT AND ITS CASES ARE GREEN. 1633 of 1633.

WHAT I GOT WRONG. I inherited `blocked on the exclusion lists` from
gate-prototype, re-tested it once, found that `search.ts` never reaches the
containment seam, and concluded the block was real for a better reason. That
second conclusion was the same mistake one level down.

THE TOKEN IS ABOUT UNIFYING THE LISTS. The concealment never needed them
unified — it needs ONE PREDICATE asked at the points where an answer is
returned, and every one of those is a single line.

- `search.ts:112` is where every match arrives before it is sliced. The verb
  that consults no list filters its own answer there, so the rule goes there.
- `files.ts` `fileList`, `fileGlob` and `fileRead` are the same shape.

WHAT THE OWNER ASKED, and it is why this got built: whether anything was needed
from them. Going to look at the actual choke points instead of answering from
the inherited estimate took one grep.

## The one design decision inside it

A LISTING OMITS AND A READ REFUSES. `fileList` and `fileGlob` drop the entry,
because omission IS their answer. `fileRead` throws, because a read asks for
one named path and an empty answer is indistinguishable from an empty file.
The refusal names `se_benchmark {stop: true}` as the remedy.

## What is still the token's

THE FOUR LISTS STILL DISAGREE and the reading verb still consults none of them.
That is unchanged and it is real work. What is no longer true is that this
iteration's requirement waited on it.

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

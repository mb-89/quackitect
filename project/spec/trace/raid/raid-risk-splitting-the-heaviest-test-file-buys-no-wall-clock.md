---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-risk-splitting-the-heaviest-test-file-buys-no-wall-clock
type: "[[raid]]"
kind: risk
statement: "Splitting refs.test.ts shortens nothing, because a different file sets the battery's critical path."
owner: the maintainer
trigger: decompose-structure, before the split is designed
status: open
impact: "A file is divided, the diff is real, the review costs what a review costs, and the wait a person actually experiences is unchanged."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## The measurement that already argues against the item

i16's onboard-retro measured `refs.test.ts` at 139,017 ms summed, 14.1 percent
of the battery, at 6,044 ms per case. Its own conclusion, in that evidence:
halving the file would not shorten the wait by one second.

THE MECHANISM. A file is the only unit that reaches a second core here, so the
wall clock is set by the SLOWEST FILE, not by the summed cost. Splitting a
heavy file helps only when that file is the one on the critical path.

## What has to be measured before anything is built

- Which file sets the critical path today, on this machine.
- What the battery's wall clock is, against the sum of its files.
- Whether `refs.test.ts` is that file, or merely the fattest one.

## Why the measurement is not available yet

`.se/test-last-run.json` does not exist on this container, and
`.se/test-timings.jsonl` does not either. Both are gitignored, so a fresh
clone starts with no history.

The first battery this record fires is at verification, which is AFTER the
split would be built. That ordering is the real hazard, and it is recorded as
its own issue.

## What would close it

A measurement naming the critical-path file. If it is not `refs.test.ts`, the
item is struck with that number and the goal is met by measuring rather than
by splitting.

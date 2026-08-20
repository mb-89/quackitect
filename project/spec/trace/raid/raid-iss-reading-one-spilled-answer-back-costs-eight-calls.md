---
minted_in: i37-training-iterations-a-disposable-iterati
id: raid-iss-reading-one-spilled-answer-back-costs-eight-calls
type: "[[raid]]"
kind: issue
statement: Two in every five lane calls in the i37 window were pages of a spilled answer being read back, because the cursor hands out a page half the size the lane is already willing to serve.
owner: the driving agent
trigger: the next change to the answer bound or to the spill cursor
status: open
looked: 2026-08-20
impact: The paging loop is the largest single consumer of lane calls and it produces no work. It also wrecks any attribution that carries a state forward between narration records, because none of the pages narrates.
breaks_how_badly: abrasive
how_likely: certain
source_refs:
  - i37-training-iterations-a-disposable-iterati
---

## The measurement

Across 16,157 records from 2026-08-19 15:28 to 2026-08-20 13:56:

- 9,236 calls were `se_file_read`, which is 57% of everything.
- 6,433 of those read a file under `.se/answers/`. That is 40% of ALL lane
  calls in the window, spent re-assembling answers the lane had already
  computed.

A 22 KB survey costs eight round trips to read back. A caller who wants the
whole answer must make every one of them.

## Why it is this bad

THE CURSOR SUGGESTS 3,000 CHARACTERS while the answer bound is 6,000
(`project/deliverable/engine/bound.ts`). The suggested page is half what the
lane will serve.

THE MARGIN IS NOT ARBITRARY, and that is why this is an entry rather than a
one-line fix. The page comes back inside a JSON envelope and every quote and
newline in it is escaped, so a 3,000-character slice can serialise to near
6,000. Doubling the suggestion without measuring the escape ratio risks the
read itself spilling, which turns one loop into two.

## A second cost, in a different place

THE PAGES NARRATE NOTHING, so any cost attribution that carries the last
known state forward bills all of them to whichever state last spoke. Measured
on this window: 7,536 calls landed under one state's name, spanning twelve
hours and many states, and 6,433 of them were these pages.

That is the failure the walk-position stamp was built to remove
([[raid-iss-the-running-lane-is-not-the-code-the-walk-is-editing]] explains
why the stamp has not yet run).

## What would close it

- MEASURE THE ESCAPE RATIO on real spills, then raise the suggested page to
  the largest size that reliably fits. This is the cheap half.
- OR SERVE THE WHOLE SPILL IN ONE CALL. A read of a path under `.se/answers/`
  is already exempt from the state gate and the narration toll, because the
  lane handed the caller that exact call. A lane that is willing to hand out
  the call could be willing to hand out the answer.

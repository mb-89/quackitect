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
how_likely: expected
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
(`deliverable/engine/bound.ts`). The suggested page is half what the
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

## The escape ratio, measured

MEASURED 2026-08-20, because this entry named it as the cheap half. It is not
a cheap half, and the caution above was right.

ON REAL SPILLS the second escape costs 1.066 — measured over survey-shaped
notes, engine source and log records, taking every page-sized window of each
already-serialised answer. The read's own envelope is 162 characters, against
an `ENVELOPE` allowance of 2,500 in the same file.

BOTH NUMBERS SAY THE PAGE COULD NEARLY DOUBLE, and a test says otherwise. A
page set to 5,420 serialised an escape-dense payload to 6,808, over the bound.

WHY THE TYPICAL RATIO IS THE WRONG NUMBER TO SIZE ON. Every tool payload goes
through `boundAnswer`, so a read whose own answer exceeds the bound spills
AGAIN — the spill of a spill this cursor exists to avoid. A page that usually
fits is not good enough when not fitting costs a loop.

SO THE BOUND IS THE WORST CASE, AND INSIDE A SPILL FILE THAT IS 2. The file
holds JSON text and therefore no raw control characters — those cost six and
are already escaped. What is left is backslash and quote, and each doubles.
The worst-case-safe page is 2,900, so the literal 3,000 was marginally above
it rather than half of what was available.

WHAT CHANGED: the page is now DERIVED from the bound rather than typed
(`SPILL_PAGE_CHARS`), so a host measured tighter lowers the bound and the page
follows.

## What would close it

- A READ THAT SHRINKS TO FIT. This is the fix. `boundAnswer` already measures
  its own serialised length and shrinks until it fits — its comment says
  "MEASURE THE SERIALISED LENGTH, never assume it" — and the read path does
  not use that for choosing its slice. Ask for a large page, get back the
  largest slice that fits, with the cursor advanced to match. The typical
  answer then pages at roughly 5,400 instead of 2,900, close to half the
  calls, and the pathological one still cannot recurse because the shrink
  happens before the answer is served rather than after.
- OR SERVE THE WHOLE SPILL IN ONE CALL. A read of a path under `.se/answers/`
  is already exempt from the state gate and the narration toll, because the
  lane handed the caller that exact call. A lane that is willing to hand out
  the call could be willing to hand out the answer.

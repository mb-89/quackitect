---
minted_in: i63-work-tokens-become-the-unit-of-work-and-
id: tsp-one-table-holds-everything-outstanding
type: "[[test-spec]]"
statement: A person browsing everything outstanding finds it in one table, narrows it to what they could finish today, groups what belongs together and starts a record from it, without leaving the table.
method: demonstration
demonstrates:
  - "sty-browse-the-backlog-and-decide-what-happens-next"
verifies: "none — demonstrates carries the edge; that the served editor lists the work in two database panes and that the entry control mints into the backlog are verified by test in deliverable/tests/work-served.test.ts"
files:
  - none — a demonstration is observed rather than instrumented, and the Procedure below is the whole definition
---

## Scope

THE CLAIM IS THAT DECIDING AND DOING ARE ONE GESTURE. Everything here can be
done today in several places; the question is whether it can be done in one.

IT IS A DEMONSTRATION AND NOT A TEST because the pass is a person reaching a
DECISION they are willing to act on. No fixture decides anything.

THIS IS THE LEAST SERVED OF THIS RECORD'S STORIES, and the procedure is written
so its unmet steps fail loudly rather than quietly. Two of the five steps below
are expected to fail as things stand.

## Approach

THE DESIGN METHOD IS SCENARIO-BASED, and the extreme is volume: the run is made
against the real backlog rather than a small fixture, because the story's first
complaint is about a hundred and fifty items.

THE LEVEL IS ACCEPTANCE. The pass is a record seeded from the table.

DEPTH IS ONE PASS. The claim is whether the chain works end to end at all.

## Procedure

FIVE STEPS, and each names what is WATCHED as the pass.

- ONE. Open the table from the backlog's own count. OBSERVED: every outstanding
  item is a row, from all sources, and nothing has to be opened one at a time.
- TWO. Narrow it to what could be finished today. OBSERVED — AND THIS STEP IS
  EXPECTED TO FAIL AS THINGS STAND. The filter control ships, but a work token
  carries no complexity and no priority, so the narrowing the story describes
  has no column to work on. The honest observation is that the question cannot
  be asked.
- THREE. Group three items that belong together and name the group. OBSERVED:
  a bucket appears holding exactly those three, and naming it moves nothing.
- FOUR. Seed a record from that bucket. OBSERVED — AND THIS STEP IS EXPECTED TO
  FAIL AS THINGS STAND. Seeding takes a goal and a vision; nothing carries a
  bucket's rows into a new record's scope. The step is recorded as unmet rather
  than skipped.
- FIVE. Add something the backlog does not have, from the table. OBSERVED: the
  new row is an item like any other from that moment, indistinguishable from
  one minted any other way.

STEPS TWO AND FOUR ARE THE ONES THE STORY EXISTS FOR. One and three and five
describe a good table. Only two and four make the deciding and the doing one
gesture, and neither is answered today.

## What this demonstration cannot settle

WHETHER THE RIGHT COLUMNS WOULD HELP. Step two fails for want of complexity and
priority on a work token. Adding them would let the filter run; whether the
result is the eleven actionable rows the story promises is a separate question
nobody can answer until somebody tries it.

AND WHETHER ONE TABLE STAYS USABLE AT SEVERAL HUNDRED ROWS. This run meets 154
in the backlog against 395 rows in the pane. Twice that may behave differently.

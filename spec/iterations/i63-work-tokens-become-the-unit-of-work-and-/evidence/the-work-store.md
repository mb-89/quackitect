---
form: the-work-store
by: agent
signed_off: 2026-08-26T15:30:10.817Z
authors: agent
files: null
---

# Evidence form / the-work-store

## current_situation

Nothing wrote a piece of work, because a piece of work did not exist as a thing.

The compiler could say which parts of a card are work. Nothing turned that into items a position owes, and nothing could place, take or settle one.

### The hole the design left open, found on the way in

The design says work is "matched by identity on re-entry" and that a reworded card must orphan nothing. Those two cannot both hold unless something stable carries the identity.

A HEADING IS NOT STABLE. The slug comes off the wording, so rewording the heading changes it. Matching on that either orphans the finished work or mints a duplicate beside it, and both failures are silent.

SO THE CARD HAD TO CARRY THE IDENTITY, and nothing in the design said how. That gap was filled here rather than recorded and walked past.

### What the four test specs ask for

Mint and re-mint, moving with both ends agreeing, settling with a reason where one is owed, and the properties that hold across the whole tree.

None of the four had a test file. `author-tests` wrote specifications into the trace, not code.

## built

ONE MODULE AND FOUR TEST FILES. 42 new cases, all passing.

### The module

`deliverable/engine/workstore.ts`. Five acts, and every write to a piece of work goes through one of them: mint, place, take, settle, break into parts.

A piece of work is one markdown file, frontmatter and prose together, so the file a person edits is the one the engine reads.

PLACE AND STATUS ARE SEPARATE FIELDS, which keeps the case that matters most: work that is finished but still sitting where it was done.

### The identity, which the design named and did not specify

THE CARD CARRIES IT. The mark takes an optional nested part: `#work` while unstamped, `#work/<step>` once minted from.

OBSIDIAN RENDERS A SLASH AS TAG NESTING, so every stamped part still sits under `#work` and one click still lists them all.

THE STAMP IS TAKEN FROM THE WORDING ONCE AND NEVER AGAIN. A case proves it: stamp a heading, reword the heading, and the same item matches through the rewording with its statement following the card.

TWO IDENTITIES, NOT ONE. The step belongs to the card and is shared by every record minting from it. The item belongs to one record at one position. Folding them together loses work in one direction or the other, and the design spec now says which.

### Ids are derived, which makes the merge trivial

An item's id is a hash of its position and its match key, never a random draw.

TWO HANDS MINTING ONE POSITION PRODUCE THE SAME FILE. A case asserts it across two independent temp trees. That is what makes "two hands writing at once do not collide" hold without a locking scheme.

### Three refusals, each its own clause

- `SE-C-149` — a close at anything other than done, with no reason. The reason lands on the item, never in a log.
- `SE-C-150` — an agent settling a person-only item. No override argument exists, on purpose.
- `SE-C-151` — a tree carrying work in two shapes, naming both.

All three have their section in `guidance/refusals.md`, which the pairing rule requires.

### Two things the design did not say and the build had to settle

A MINT IS ALL OR NOTHING. It decides everything, then writes. A throw partway through would leave a partial set, and a partial set reads exactly like a complete one.

A CARD THAT WILL NOT PARSE REFUSES BEFORE ANYTHING IS WRITTEN, which is the same rule one layer up.

### A carrier grouping ends by being derived, not by being deleted

Groupings are computed from what names them. Nothing has to remove one when it empties, because it stops being listed the moment no item names it. A position exists for another reason and is not listed at all.

### The test files

- `tests/mint-on-entry.test.ts` — 11 cases. The state graph at entry, all three sources, and the rewording case.
- `tests/work-moves.test.ts` — 8 cases. Every move asserted at both ends in one case.
- `tests/work-settles.test.ts` — 11 cases. The decision table, with both refusals forced.
- `tests/work-one-model.test.ts` — 8 cases. The two-models fault constructed deliberately, the three closing questions, and the handover order.

### Where the suite stands

1919 tests, 1918 pass, 1 fail.

THREE GUARDS CAUGHT THIS BUILD AND ALL THREE WERE RIGHT. The store was reading and writing around the engine's own door, and a fixture named a real guidance path. Both are fixed rather than exempted.

THE COMMENT RATCHET IS NOW GREEN. It stood 3 above its ceiling at HEAD. Four date stamps came out of comments where the sentence survives without them, taking the tests tree to 203, and the ceiling came down to 203 to match. Lowering it is what a ratchet is for.

### The one red left, and it is measured

`drift.test.ts` line 626. `scratchpad/drift-access-shape.ts` measures the shape.

| fillers | door accesses |
| --- | --- |
| 0 | 298 |
| 50 | 448 |
| 100 | 598 |
| 200 | 898 |
| 400 | 1498 |

THE FIT IS EXACT at 298 + 3 x fillers, and the corpus is asked for exactly once at every row. The law the guard defends is not broken.

TWO FAULTS, AND ONLY ONE IS A REGRESSION. The ceiling is `FILLERS * 4`, which has no constant term and therefore cannot bound a cost that has one. Separately, each node is touched 3.0 times against a recorded baseline of 0.2.

IT IS NOT THIS BUILD'S. It stood red at HEAD before this session's first commit, and `git status deliverable` showed no committed test file changed.

RAISING THE CEILING WOULD BANK THE REGRESSION, so the note records the order: find the per-node cause first, then reshape the ceiling with both terms measured.

## follow_up

The engine strand continues at the work offer. The surface strand can start alongside it.

### Three refusal clauses are new and their guidance is written

`SE-C-149`, `SE-C-150` and `SE-C-151`. The pairing rule says a clause is not done until its section stands in the refusals card, and all three have one.

They are three rather than one because each is a different fault with a different remedy. A reason owed, a person owed, and a tree modelling work twice.

### One probe closed, one assumption closed, one design section rewritten

`exp-what-one-mint-costs` moved from `unsettled` to `holds`, with the whole act timed rather than a fraction of it.

`raid-asm-minting-on-every-entry-stays-inside-the-per-hop-budget` is closed. Its trigger read "the first measured hop after minting is built", the trigger fired, and the reading is on the entry.

The design spec's line saying the cost was unmeasured is replaced by the numbers.

### What the store still does not do

It does not answer what is ready and does not count what is owed beyond one position. That is the work offer, which is the next chunk.

It does not read a record back at a recorded commit. That case is named in the test spec and left unwritten here, because the commit belongs to the record store rather than to this module.

### One red left, down from two

The comment ratchet is green. It stood 3 above its ceiling at HEAD, four date stamps came out, and the ceiling came down to match.

The read-once guard is still red and is now measured rather than described. Its cause is two separate faults and neither is caused by this build.

READY WHEN the walk reaches `fix-findings`. The order matters and the note records it: find what made the per-node access count rise from 0.2 to 3.0 FIRST, then reshape the ceiling with both terms measured. Raising the ceiling on its own would bank the regression, which is what the ratchet exists to stop.

## anything_else


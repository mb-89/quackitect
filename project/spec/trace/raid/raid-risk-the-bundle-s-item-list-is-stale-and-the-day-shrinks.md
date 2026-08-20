---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-risk-the-bundle-s-item-list-is-stale-and-the-day-shrinks
type: "[[raid]]"
kind: risk
statement: "Most of i5's thirteen items are already fixed or retired, so the iteration turns out to be a bookkeeping pass rather than a day of work."
owner: the owner
trigger: frame-delta, where every remaining item is opened against the tree
status: open
impact: "The record spends a full 29-state walk on a scope that no longer exists. The ceremony costs what an iteration costs, and the output is a list of strikes."
breaks_how_badly: abrasive
how_likely: plausible
source_refs:
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## Why it is graded plausible rather than conceivable

IT HAS ALREADY HAPPENED TO 2 OF THE FIRST 3 ITEMS OPENED, at the kickoff gate.

- The version source is landed. `engine/version.ts` reads the manifest, and no
  live engine file carries a `3.0.0-bootstrap` stamp.
- `se_git_sync` no longer exists. i34 retired it with the claim ledger and the
  worktrees, so its duplicate-key sweep has nothing to run in.
- The version FLAG is genuinely missing, which is the one that stood.

THE LIST IS SIX DAYS OLDER THAN THE TREE. It was seeded 2026-08-11 and grew
from the note pool on 2026-08-13. i34, i16 and i17 have all shipped since.

## What is being done about it

FRAME-DELTA OPENS EVERY REMAINING ITEM, one at a time, against the tree as
i16 and i17 left it. An item already landed is struck WITH the evidence, never
silently dropped.

THE HONEST MOVE IF IT BITES, and it is written here so it is not decided under
pressure later: shrink the record to what remains and say so in the evidence.
Never pad the scope back up to a day's work.

## What would close it

Frame-delta's audit, with a count. Fewer than half the items struck closes
this as mitigated. More than that and it becomes an issue, and the record's
size is re-argued at gate-motivation.

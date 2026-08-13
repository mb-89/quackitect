---
minted_in: i3-the-walk-s-feedback-loop-the-reading-cre
id: raid-dep-reading-credit-outlives-se-move
type: "[[raid]]"
kind: dependency
statement: The reading credit's persistence must survive i9 moving the machine-state folder into the product, so it keys to document content rather than to a path.
owner: the driving agent
trigger: i9 opens, or the reading credit's storage shape is chosen
status: open
impact: A credit keyed to a path breaks silently when i9 relocates the folder. The agent then re-owes reading it already holds, which is the exact defect this iteration exists to remove.
breaks_how_badly: corrosive
how_likely: expected
source_refs:
  - "project/spec/version-planning.md § i9 — .se and the corpus"
  - "i3's kickoff gate, round 2 red team, 2026-08-13"
  - "note-61b267004f20 and note-6fc953ffcdc8, which carry the credit's design"
---

## What is depended on

i9 moves `.se` into the product folder, makes it a committed marker, and gives
the engine one corpus reader.

This iteration must persist the reading credit so it survives a reload. Where
that persisted state LIVES is i9's decision, not i3's.

## Why it is a dependency and not a risk

i9 is planned and its content is written down. The move is expected, not
possible. Somebody else owns the destination.

## How i3 discharges it without waiting

Key the credit to DOCUMENT CONTENT HASHES, exactly as note-61b267004f20
specifies, rather than to a file path or a folder location.

A content hash is location-independent. The store can then move under it
without the credit noticing.

That removes the ordering constraint entirely: i3 and i9 need not race, and
neither blocks the other.

## What would falsify the discharge

If the credit ends up keyed by session token to a path under `.se`, the
dependency becomes live and i9 owes it a migration.

The check is one read of the storage shape at the end of this iteration.

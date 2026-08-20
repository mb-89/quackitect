---
minted_in: i5-engine-hygiene-one-version-source-every-
id: raid-iss-a-recorded-act-carries-no-acting-role
type: "[[raid]]"
kind: issue
statement: "A recorded call carries no acting role, so every reader that needs one derives it from the call's tool name."
owner: the maintainer
trigger: any surface that shows who acted, and any new server-side tool added to the lane
status: open
impact: "The accountability trail a standing requirement demands is reconstructed by a string test at render time. A new server-side tool reads as a person until somebody edits a hand-kept list, and nothing on the surface says the column is inferred."
breaks_how_badly: crippling
how_likely: expected
source_refs:
  - req-acts-carry-role-and-channel
  - req-the-actor-is-recorded-where-the-call-is-served
  - i5-engine-hygiene-one-version-source-every-
weighs_with: none
weighs_against: none
---

## What was observed

READ ON THIS CLONE, 2026-08-19. A call-log record carries `ref`, `ts`,
`se_version`, `tool`, `args`, `ok`, `outcome`, `duration_ms` and `response`.
There is no role and no channel on it.

`engine/render.ts` reconstructs the role at render time:

    return tool.startsWith("mirror_") ? "human" : "agent";

with a hand-kept set of three tool names for the third case.

## Why it is an issue and not a risk

It is present tense and it has already bitten. i34's retro measured the
derived actor wrong for 52 records in one window.

## What it is an issue AGAINST

`req-acts-carry-role-and-channel` demands that the engine stamp every recorded
act with the acting role and the arrival channel. Its own removal test says
that without it nobody can say who authorized what, and it is graded
crippling.

THE DEMAND STANDS AND IS NOT MET. That is the whole of this entry, and it is
recorded here rather than in the requirement's body, because verification
status belongs in evidence and never in a row.

## What repair consists of

- The handler that serves a call states the role when it appends the record.
- Readers take the role from the record.
- The derivation survives only as a fallback for records written before the
  stamp existed, which is `req-the-actor-is-recorded-where-the-call-is-served`.

THE CHANNEL HALF IS NOT REPAIRED BY THIS RECORD, and saying so is part of
the entry. i5 takes the role. The arrival channel — lane, board, phone, chat
— is a wider change and nothing here touches it.

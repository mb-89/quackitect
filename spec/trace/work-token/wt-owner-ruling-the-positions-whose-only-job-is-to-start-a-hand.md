---
id: wt-owner-ruling-the-positions-whose-only-job-is-to-start-a-hand
type: "[[work]]"
statement: |-
  OWNER RULING. The positions whose only job is to start a hand are to be taken out.

  i64 is the round that takes them out. It already rebuilds how a fresh worker gets going for each segment, so this belongs to it rather than standing as a job of its own.

  Until that round runs, those positions are walked exactly as they are. Nobody designs around them in the meantime.
place: i64-the-diamond-and-the-orchestrator-handove
ready_when: ready when the speed-up round is seeded, or when i64-the-diamond-and-the-orchestrator-handove is walked — whichever comes first
source: note-0c3bf2db48a9
---

## Why it stands

OWNER RULING. The positions whose only job is to start a hand are to be taken out.

i64 is the round that takes them out. It already rebuilds how a fresh worker gets going for each segment, so this belongs to it rather than standing as a job of its own.

Until that round runs, those positions are walked exactly as they are. Nobody designs around them in the meantime.

## The owner restated it, 2026-08-28, and separated two things

REMOVE THE SPAWN STEPS. Not tune them, not condition them — remove them.

THE DIAMONDS ARE A DIFFERENT THING, and they are not these steps. Where a new
agent gets spawned is a question worth thinking about, later and separately.
The owner's words: "then we think about adding the diamonds at which a new
agent gets spawned, but that's not the spawn steps."

IT BELONGS TO THE SPEED-UP ROUND, which is not seeded yet. It stays placed at
i64 until that record exists, because a place naming a record that does not
exist is worse than no place at all.

## Three defects found while rating them, 2026-08-28

THE RATING PASS READ ALL TEN SPAWN ROWS and none survived intact.

- `M0_05_spawn-the-hands` CHECKS A CEILING THAT DOES NOT EXIST YET. The walker
  ceiling is set at `M0_90_gate-kickoff`, which depends on `onboard-retro`,
  which depends on this row. It runs two states before the number it checks is
  signed.
- `M2_05_spawn-for-inputs` CONTRADICTS ITS OWN FIELD. Its prose asks for three
  hands; its evidence field says blank is the default; the governing gate rules
  that zero is the default and that delegated writing was measured and lost.
- `M6_05_spawn-for-prototype` ASKS FOR A NUMBER THAT DOES NOT EXIST. It wants a
  walker per spike, and `rank-unknowns` seeds the spikes one state later. Its
  checklist holds one box, because a spawn state starts exactly one hand.

ALL TEN RATED AT RUNG 2, the lowest group in the matrix apart from the terminal
state. They are the cheapest steps in the method and three of them are wrong.

## When it comes back

ready when the speed-up round is seeded, or when i64-the-diamond-and-the-orchestrator-handove is walked — whichever comes first

---
steps:
  - id: the-pool-module
    statement: "engine/pool.ts owns everything about an option — where it lives, how one is authored and landed, and how the standing set is read back from the repository"
    depends_on: []
    realization: code
  - id: the-paste-refusal
    statement: "SE-C-140 refuses a statement that shares a run of six or more words with the raw note, quotes the overlap back in the author's own case, and carries its feed-forward section in refusals.md"
    depends_on: [the-pool-module]
    realization: code
  - id: the-drain-mints
    statement: "a backlog disposition MINTS FIRST and marks the note drained second, so a refused crossing leaves the note pending — and se_note_drain carries the statement on both the agent's door and the person's"
    depends_on: [the-pool-module, the-paste-refusal]
    realization: code
  - id: the-offer-reads-the-pool
    statement: "the survey lists standing options from the repository instead of parked notes from the machine-local store, and an undrained capture never enters that list"
    depends_on: [the-pool-module, the-drain-mints]
    realization: code
---

# The build plan

Four chunks, one chain. Nothing fans out, and that is the honest answer rather
than a missing opportunity: forcing width onto a deep chain only adds seams.

## THE LENSES, and both are visible in the order

RISK FIRST DECIDES WHAT COMES SECOND. The riskiest piece is not the mint as a
whole — it is the overlap check, because it is the only mechanical defence
behind the only FATAL row in the delta, and because its six-word threshold is a
judgement nobody has data for. It is chunk two, before anything reads the pool,
so a wrong threshold is found while there is still budget to react.

THE SPINE DECIDES WHAT COMES AFTER. Chunks three and four are the thinnest
end-to-end slice: a drain that mints, and a survey that offers. Until both
exist the seam between them is untested, and that seam is this iteration's own
kill criterion — gate-motivation named "the pool is never READ" as the thing
that would make the whole extension wrong.

## THE ONE EDGE THAT MATTERS

`the-drain-mints` BEFORE `the-offer-reads-the-pool`. Chunk four's cases need
minted options to read, so building the offer first would leave it testable
only against hand-written fixtures — which is exactly the shape that passes
over a wrong source.

## WHAT THE RUN ACTUALLY FOUND, recorded rather than tidied

THE ORDER HELD. All four ran as drawn, and the chain was real rather than
decorative: each chunk's types failed until its predecessor existed.

TWO THINGS CAME OUT OF THE BUILD THAT THE PLAN DID NOT PREDICT.

- The refusal quoted the overlapping run in LOWER CASE, because the comparison
  lowercases. An author cannot find that in what they typed. The product
  changed, not the test: comparing stays case-insensitive, reporting does not.
- Two standing cases in `tests/retro.test.ts` failed, and both were right to.
  They encoded the pre-i17 contract where a backlog disposition wanted only a
  re-entry condition. They now assert the new one, including the distinction
  that is easiest to lose: a condition says WHEN an option comes back and never
  what it IS.

## WHAT THIS DRAWING IS NOT

It is not a record of parallel builders. One agent walked all four in order,
because the dependency edges leave nothing to fan out to.

---
minted_in: i3
id: raid-asm-refusals-recover-a-weak-model
type: "[[raid]]"
kind: assumption
statement: Every typed refusal carries a remedy good enough that a weak model, given only the payload and no other context, recovers in one turn. Nothing tests this.
owner: the owner
trigger: the prepared weak-model session, or the next new SE-C clause
status: open
impact: The refusal contract is doctrine without a check. A clause whose remedy does not actually work costs every agent that meets it a wasted turn, and nobody finds out.
breaks_how_badly: corrosive
how_likely: plausible
probe: "one-sided evidence, i35 on 2026-08-17, and the model was not weak. Every typed refusal hit recovered in one turn: SE-C-040, 105, 110, 112, 120, 125, 129, 137. TWO DID NOT RECOVER CLEANLY: a per-item refusal printed truncated item strings its own matcher would not accept, and a do instruction repeated indefinitely carrying no remedy at all."
probed: 2026-08-20
source_refs:
  - engine/errors.ts lines 2-3, where the contract is written
  - guidance/refusals.md, the feed-forward side of every clause
  - "the owner's ruling 2026-08-12: hand validation, never automation"
---

## A SECOND ONE-SIDED DATA POINT, i38 on 2026-08-20

STILL NOT A WEAK MODEL, so this narrows nothing that matters. Recorded because
the sample is now two sessions rather than one, and because one clause behaved
differently from the rest.

FORTY-FIVE REFUSALS OVER FIVE HUNDRED CALLS. Every typed clause hit —
SE-C-046, SE-C-101, SE-C-110, SE-C-112, SE-C-120, SE-C-125, SE-C-133, SE-C-138
and the EARS check — recovered in one turn from the payload, with one exception
below.

THE EXCEPTION IS WORTH THE ENTRY. SE-C-121 fired sixteen times and SE-C-133
twenty, and both are NARRATION clauses. The 121s were node ids guessed rather
than read, and the open node map rides every result — the remedy was already in
hand and was not taken. THAT IS THE FAILURE MODE THIS ASSUMPTION IS ABOUT,
arriving in a capable model: a remedy that is present, correct, and not used
because the answer looked obvious.

SO THE CLAIM TO TEST IS NARROWER THAN "does the remedy work". It is whether the
remedy is placed where a reader who thinks they already know the answer will
still see it. On this evidence, for the narration clauses, it is not.

## The claim

The contract is written at `project/deliverable/engine/errors.ts`, lines 2 and
3: a weak model given ONLY this payload, cold, must recover in one turn.

It has never been checked against a weak model.

## Why it is an assumption and not a test

That is doctrine without a check, which is the shape this project's own
record names as its failure mode.

v2 measured mandatory rounds degrading into ceremony. A required field
satisfied by agreement prose is worse than no round at all. A refusal
contract nobody tests is the same thing one layer down.

NOT AUTOMATED, DELIBERATELY (owner ruling 2026-08-12). Enforcing it in the
suite needs one of two things, and neither works.

- A live model call, which is slow and non-deterministic.
- A stub, which proves nothing.

v2 recorded it as a discipline rather than a test, and the owner has ruled
the same way here.

## Probe

Prepare one session for a weak model against a scoped set of clauses. Let it
walk, and let it write its own log.

Mine that log for two counts.

- How many refusals it recovered from in one turn.
- Which ones it did not.

A clause it could not recover from is a REMEDY defect, never a model defect.

The remedy test already stands in `project/guidance/refusals.md`: could
somebody act on it without asking a second question.

## Provenance

Ruled at the front desk on 2026-08-12 with no record bound, so there was no
honest `minted_in` at the time. Held as a pending note until a record opened,
and minted here at i3's onboarding retro on 2026-08-13.

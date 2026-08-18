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
probed: "2026-08-17"
source_refs:
  - "engine/errors.ts lines 2-3, where the contract is written"
  - "guidance/refusals.md, the feed-forward side of every clause"
  - "the owner's ruling 2026-08-12: hand validation, never automation"
---

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

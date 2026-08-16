---
minted_in: i34-one-tree-iterations-and-archives-live-on
id: raid-dec-the-machine-locking-specification-is-retired-whole
type: "[[raid]]"
kind: decision
statement: The whole machine-locking specification is retired with its mechanism, so no requirement, use case or story describing the claim ledger survives i34.
owner: the owner
trigger: if machine-to-machine work is ever taken up again, at which point the specification is written fresh rather than revived
status: decided
impact: Eight standing artifacts stop describing anything the product does. If travel returns, its demands are authored from what is then true rather than recovered from what i2 assumed.
breaks_how_badly: corrosive
how_likely: conceivable
source_refs:
  - raid-dec-one-tree-beats-a-record-travelling-between-machines
  - i34-one-tree-iterations-and-archives-live-on
  - uc-claim-an-iteration
weighs_with: none
weighs_against: none
---

## Rejected options

- KEEP THE SIX REQUIREMENTS AS A DORMANT SPECIFICATION. This was i34's own
  gate-requirements ruling, and the owner overturned it the same day: "we don't
  wanna use the claim mechanism anymore. So I don't think you need to keep
  them. What's the point of keeping them?"

  THE ARGUMENT FOR IT WAS NOT NOTHING, and it is recorded so nobody re-runs it:
  the six say what machine locking must do IF it exists, so keeping them would
  preserve a design that took i2 a milestone to get right. What defeats it is
  that a register listing demands nothing serves is a lie in the ledger, and
  this project has a rule against exactly that. A dormant specification is
  indistinguishable from an unimplemented one.

- KEEP THE USE CASE AND DROP THE REQUIREMENTS. Rejected because it breaks the
  coverage law in both directions at once: every use case must be refined by a
  requirement, and every requirement must refine a use case. Six requirements
  refine `uc-claim-an-iteration` and nothing else does.

- RENAME RATHER THAN RETIRE, since "claim" collides with the engine's other
  meaning (note-8f6fa24cc1c3). Rejected as the wrong act at the wrong time:
  renaming a specification nobody will implement spends care on a corpse.

## Consequences

WHAT IS RETIRED, and it is a chain rather than a list:

- SIX REQUIREMENTS: req-claim-is-one-pushed-file, req-claim-race-first-push-wins,
  req-claim-wears-its-age, req-offline-claim-reconciles,
  req-absent-ledger-is-not-offline, req-force-release-recorded.
- ONE USE CASE they all refine: uc-claim-an-iteration.
- ONE STORY behind it: sty-work-on-two-machines.

THE MECHANICAL ACT IS NOT AVAILABLE HERE, and saying so is part of the
decision. A requirement carries no `status` field — only raid nodes do — so
there is no supersession marker to set. And an iteration may create a node and
never remove one, because only an overhaul grants delete
(note-e2637894a3ed). So this node IS the retirement until a vehicle that can
delete carries it out.

WHAT THAT COSTS UNTIL THEN: the coverage law still sees eight artifacts
describing a mechanism i34 removes, and the register still reads as though
machine locking were specified. The gap is named rather than hidden.

TWO WAYS TO CLOSE IT, and the second is smaller:

- An overhaul deletes the eight.
- The requirement template gains a `status` field, which is what raid nodes
  already have and what every other standing artifact will eventually want.

WHAT SURVIVES THIS DECISION: engine/claims.ts's SHAPE, described on
raid-dec-one-tree-beats-a-record-travelling-between-machines — a ledger working
on refs through a temporary index, never touching a working tree. That is a
mechanism worth remembering, and remembering it is not the same as keeping a
specification nothing implements.

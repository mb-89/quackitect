---
minted_in: i17-the-options-pool-triage-a-raw-note-into-
id: raid-asm-a-migrated-pool-does-not-drown-the-corpus
type: "[[raid]]"
kind: assumption
statement: Migrating the parked options into the corpus does not overwhelm the passes that walk it - the sweep, the conformance check and the reference views.
owner: the driving agent
trigger: the migration, wherever it runs
status: open
impact: 205 options against 1304 existing nodes is a sixth of the corpus arriving in one act. If the passes slow past their bounds, the pool becomes the reason every walk is slow, and the fix is a store rather than a tuning.
breaks_how_badly: cosmetic
how_likely: plausible
probed: 2026-08-18
probe: OWED, and it cannot be probed on this machine - the 205 are machine-local on the owner's laptop and this clone holds three notes. The probe is to mint them and time the sweep, the conformance pass and one reference view before and after.
source_refs:
  - i17-the-options-pool-triage-a-raw-note-into-
  - raid-asm-the-pool-is-a-node-kind-under-project-spec
weighs_with: none
weighs_against: none
---

## Where it came from

RAISED BY i17's OWN KICKOFF RED TEAM, not by a later discovery. The gate asked
what the pool costs the passes that walk the corpus and had no number.

WHY IT IS PLAUSIBLE RATHER THAN CONCEIVABLE. The sweep reads 1304 nodes in
about 600 ms, so a sixth more is roughly 100 ms on that pass alone - fine. The
passes that worry are the ones that are not linear in node count: the reference
views and anything that joins nodes to nodes.

## Why it does not block the gate

THE MIGRATION IS ALREADY A SEPARATE ACT with its own measurement, because it
cannot be run from the machine that built the mechanism. That separation is
what makes this an assumption to probe rather than a risk to the scope.

## Probe

OWED, AND IT CANNOT BE TAKEN ON THIS MACHINE. The 205 parked options are
machine-local on the owner's laptop; this clone holds three notes. That is the
same fact the whole iteration exists to fix, and it means the probe runs where
the notes are.

THE PROBE: time the sweep, the conformance pass and one reference view before
the migration and after it, on the machine that holds the 205.

WHAT WOULD FALSIFY IT: any of the three passing its bound after the mint. The
sweep is linear in node count and reads 1304 nodes in about 600 ms, so a sixth
more is roughly 100 ms and is not the worry. The passes that join nodes to
nodes are.

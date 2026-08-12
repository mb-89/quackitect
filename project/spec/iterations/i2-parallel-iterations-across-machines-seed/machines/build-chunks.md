---
steps:
  - id: b1-claim-verb
    statement: "the claim verb as the spike measured it: record claims/<iteration>.md with the minted machine id, announce by push, rebase-and-retry on rejection, force release as a second recorded commit; turns tests/claims.test.ts green including the origin race"
    depends_on: []
    realization: code
  - id: b2-claim-guardrails
    statement: "the machine id mint (eight hex, outside git) and the push scope guard: only seed stubs and claim files leave the machine, agent pushes stay refused; turns the guardrail cases in tests/claims.test.ts green"
    depends_on:
      - b1-claim-verb
    realization: code
  - id: b3-seed-push-and-listing
    statement: "the seed push lands the stub on the remote in the seeding act, and the claimable listing shows claim state, machine id and age; closes req-seed-lands-on-remote and req-claim-wears-its-age"
    depends_on:
      - b1-claim-verb
    realization: code
  - id: b4-claim-gates-entry
    statement: "the record store opens a record only over a standing claim - the if-claim-ledger-to-record-store contract wired into entry"
    depends_on:
      - b1-claim-verb
    realization: code
  - id: b5-boot-to-desk
    statement: "boot always ends at the front desk serving boot's own reading only, and the bench in tests/boot-bench.test.ts records the measured time against the 20 s bound"
    depends_on: []
    realization: code
  - id: b6-tier-cutover
    statement: "the autonomy tiers land beside the numeric scale: the session control, the weighing and the mirror header speak operational, tactical, strategic, emergency; the tier-to-gate mapping is recorded at the owner's call"
    depends_on: []
    realization: code
  - id: b7-numeric-removal
    statement: "the numeric autonomy scale and every slider leave the surfaces, state notes and guidance; the tsp-autonomy-tiers checklist passes; never in the same commit as b6"
    depends_on:
      - b6-tier-cutover
    realization: code
  - id: b8-branch-return
    statement: "a completed leg under a waiting busbar returns the walk to its fork and offers the owed sibling without an escape, and the drawn route follows the same path; turns tests/branch-return.test.ts green"
    depends_on: []
    realization: code
  - id: b9-seeded-scaffolds
    statement: "the kickoff bless writes every seeded sub-machine's placeholder drawing in the same act; turns tests/seed-scaffolds.test.ts green"
    depends_on: []
    realization: code
  - id: b10-node-scoping
    statement: "every trace node carries minted_in, standing nodes backfill, and reference views default to the current iteration's delta with the opt-in toggle; turns tests/node-scoping.test.ts green"
    depends_on: []
    realization: code
---

# The build drawing

Ten chunks, shaped by two lenses (per meth-build-strategies): RISK FIRST
puts the claim verb at the head — b1 realizes the promoted spike
mechanism and runs the owed origin race before anything stands on it.
PARALLEL FLOW fans the rest: b5 through b10 are independent strands, and
only the guardrails, the listing and the entry gating (b2, b3, b4) lean
on b1. The tier work is the one drawn chain: cut over (b6), then remove
(b7), never both in one commit
(raid-risk-autonomy-rework-breaks-walking carries the mitigation).

The promoted spike enters at b1 as a pre-verified starting chunk; the
spike code itself stays throwaway (exp-claim-verb-race, promote line).

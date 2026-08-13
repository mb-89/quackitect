---
minted_in: i2-parallel-iterations-across-machines-seed
id: raid-debt-claim-pool-surfaces
type: "[[raid]]"
kind: debt
statement: The claim pool has no shipped opening act, and the listing and the force release have no product surface - they exist as engine functions only.
owner: the driving agent
trigger: the first real second machine joins, or the next desk surface touch
status: open
impact: The engine claims and refuses correctly, but a person cannot open the pool, see who holds what, or free a dead machine's claim from any shipped surface. The fresh-eyes observer had to create the claims branch by hand to demonstrate the pool.
breaks_how_badly: abrasive
how_likely: certain
source_refs:
  - sty-work-on-two-machines
  - raid-asm-remote-serializes-claims
---

Taken knowingly at the i2 validation gate - the iteration's scope is
the SEED of parallel work, and the wired slice is real:

- the seed push (engine/iterations.ts itSeed)
- the entry gate (engine/session.ts iterationOpen)

The remaining work: an act that opens the pool, the holder listing on
the desk surface, and the force release as a person's act. claimListing,
claimsLedger and forceRelease stand ready in engine/claims.ts, referenced
nowhere outside tests.

Sweep 2026-08-12 (the first retro debt sweep): re-accepted consciously,
minted the same day it was taken. The trigger stands - the first real
second machine, or the next desk surface touch.

THE TRIGGER FIRED on 2026-08-12: a second machine worked i8, and no
claim was recorded for it.

PARTLY CLOSED 2026-08-13, at the owner's word and outside any record.
The opening act shipped - the entry gate now brings the ledger into
being on the first claim, and two requirements carry the demand the spec
had never stated: [[req-pool-opens-on-first-claim]] and
[[req-absent-ledger-is-not-offline]].

WHAT STAYS OPEN is the surfacing alone. The holder listing and the force
release still have no product surface, and no surface shows a held
iteration - not the survey, not the mirror, not the state machine.

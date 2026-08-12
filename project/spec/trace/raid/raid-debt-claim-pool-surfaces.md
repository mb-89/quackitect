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

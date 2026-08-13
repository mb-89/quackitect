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

Sweep 2026-08-13 (second retro debt sweep): the trigger partially fired
- a real second machine (a headless Linux container) joined this period -
but the debt was NOT repaid, because the peer used the new itAdopt path
(see the i8 field-report, section 2.4) rather than the claim lane. The
claim pool's listing and force-release stand exactly as unshipped as
before. Re-accepted consciously; trigger re-affirmed, widened to also
read "or itAdopt sees real multi-machine use without the claim lane ever
being exercised, which would argue adoption is the load-bearing path and
this debt's shipped-surface urgency should be re-weighed by the owner."

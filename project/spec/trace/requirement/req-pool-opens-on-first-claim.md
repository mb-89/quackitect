---
minted_in: front-desk-2026-08-13
id: req-pool-opens-on-first-claim
type: "[[requirement]]"
statement: When a claim is taken and no claim ledger exists, the engine shall create the ledger in the same act.
kind: functional
verify_method: test
breaks_if_removed: The pool never opens. Only a claim creates the ledger, and no claim is recorded without one. Every machine then enters every iteration unclaimed.
breaks_how_badly: crippling
refines:
  - uc-claim-an-iteration
source_refs:
  - uc-claim-an-iteration extension 3b
  - raid-debt-claim-pool-surfaces
  - "the owner's ruling 2026-08-13, after a second machine worked i8 with no claim recorded"
priority: must
---

## Detail

- The demand binds every product seeded from this one. A new product is
  born with no ledger, and nobody remembers to open one.
- No person's act may stand between a fresh product and a working pool.
  An opening act somebody has to remember is the failure this row exists
  to stop.
- The circularity is the whole point. Before this row the spec described
  only what happens to a claim once a ledger exists, and the code read
  that silence as permission to admit entry and record nothing.

## What went wrong without it

The i2 build guarded entry on a standing claim and, finding no ledger,
returned "no pool" and admitted the entry. Every test started from a
ledger created by hand in the fixture, so nothing ever exercised the
first claim of a product's life.

A second machine worked iteration i8 on 2026-08-12 with no claim to show
for it. `raid-debt-claim-pool-surfaces` had recorded the gap as a debt at
the i2 validation gate — as a missing SURFACE, which under-read it. The
gap was a missing demand.

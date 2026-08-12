---
form: b3-seed-push-and-listing
by: agent
signed_off: 2026-08-12T13:04:04.313Z
authors: agent
files:
---

# Evidence form / b3-seed-push-and-listing

## current_situation

The claim verb and its guardrails stand from b1 and b2; this chunk wires the pool's two ends — the seed reaching the remote and the listing a picker reads.

## built

Both halves stand and run green.

- The seed push: itSeed pushes it/<id> to the origin in the seeding act (engine/iterations.ts calling pushSeed in engine/claims.ts); no remote is a recorded seed with announced: false, never a block.
- The claimable listing: claimListing (engine/claims.ts) joins the remote's it/* stubs with the claims ledger — every seed shows unclaimed, claimed or released, with the claiming machine id, the claim time and its age; local branches stand in when the remote is out of reach.

tests/claims.test.ts grew the two cases (a peer lists a pushed seed; the listing carries state, machine and age through claim and release). Scoped run across claims and iterations: 25 of 25 green (job test-msq3mupu-4) — the standing seeding suite holds with the push wired in.

## follow_up

b4 gates record entry on a standing claim over the if-claim-ledger-to-record-store contract.

## anything_else

